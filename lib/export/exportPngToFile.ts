import { toPng } from "html-to-image";

/** Resolves once every <img> under `root` has either loaded or errored, and
 * strips the `src` from any that errored. toPng() clones the DOM and
 * re-fetches every image inside that clone — if one of those fetches 404s,
 * html-to-image's internal loader rejects with the raw ErrorEvent object
 * (not a normal Error), which surfaces as something like
 * `{"isTrusted":true}` with no useful message. Removing the src here means
 * toPng() sees an empty image slot instead of attempting (and failing) a
 * second fetch of a URL we already know is broken — the export still
 * completes, just missing that one picture, instead of failing outright. */
function waitForImages(root: HTMLElement, timeoutMs: number): Promise<void> {
  const images = Array.from(root.querySelectorAll("img"));
  const loadPromise = Promise.all(
    images.map((img) => {
      if (img.complete) {
        if (img.naturalWidth === 0) img.removeAttribute("src");
        return Promise.resolve();
      }
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => {
          img.removeAttribute("src");
          resolve();
        };
      });
    })
  ).then(() => undefined);

  const timeoutPromise = new Promise<void>((resolve) => setTimeout(resolve, timeoutMs));
  return Promise.race([loadPromise, timeoutPromise]);
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(message)), timeoutMs)),
  ]);
}

/** Normalizes whatever toPng() rejects with into a readable string. Some
 * rendering failures inside html-to-image reject with a plain object, an
 * Event, or a string rather than an Error, which is why a generic catch
 * that only checks `instanceof Error` can end up showing a useless "Export
 * failed. Please try again." with no clue what actually broke. */
export function describeExportError(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string" && err) return err;
  if (err && typeof err === "object") {
    const maybeMessage = (err as { message?: unknown }).message;
    if (typeof maybeMessage === "string" && maybeMessage) return maybeMessage;
    try {
      const serialized = JSON.stringify(err);
      if (serialized && serialized !== "{}") return `Export failed: ${serialized}`;
    } catch {
      // fall through to generic message below
    }
  }
  return "Export failed for an unknown reason. Please try again, or try with fewer teams.";
}

interface ExportPngToFileOptions {
  /** Element to capture. */
  node: HTMLElement;
  /** Filename for the downloaded PNG, including extension. */
  filename: string;
  /** Sharpness multiplier — higher looks better on Discord/social but takes
   * longer and uses more memory. 2-3 is a good range. */
  pixelRatio?: number;
  /** How long to wait for images to finish loading before capture starts.
   * Doesn't fail the export — just stops waiting and captures what's ready. */
  imageWaitMs?: number;
  /** How long to allow the capture itself to run before giving up and
   * reporting a clear timeout error, rather than leaving the button stuck
   * on "Exporting…" indefinitely. Note: the underlying toPng() call isn't
   * actually cancelled when this fires (the browser has no API for that) —
   * it keeps running in the background and its result is just ignored. So
   * this should be generous rather than tight: too short and a genuinely
   * slow-but-successful export gets reported as failed for no reason. */
  captureTimeoutMs?: number;
}

/** Captures `node` as a PNG and triggers a download, with bounded wait times
 * at every stage so a slow/stalled export always resolves or clearly fails
 * within a predictable window — instead of spinning forever with no
 * feedback, which is what made this feel "broken" on large rosters.
 *
 * The capture timeout scales with how much is actually being rendered
 * (more <img> tags under `node` = more canvas work), since a fixed timeout
 * that's fine for a handful of cards can fire on a large export well before
 * toPng() would have finished on its own — which looks exactly like a
 * failure but is really just impatience. */
export async function exportPngToFile({
  node,
  filename,
  pixelRatio = 2,
  imageWaitMs = 8000,
  captureTimeoutMs,
}: ExportPngToFileOptions): Promise<void> {
  await waitForImages(node, imageWaitMs);

  const backgroundColor =
    getComputedStyle(document.documentElement).getPropertyValue("--color-bg").trim() || "#0a0a0f";

  const imageCount = node.querySelectorAll("img").length;
  // ~1.5s per image as a base rate at pixelRatio 1, scaled up for higher
  // pixel ratios (roughly quadratic with pixelRatio, since both dimensions
  // scale), with a floor so small exports still get a reasonable window.
  const scaledTimeout = Math.max(20000, imageCount * 1500 * pixelRatio * pixelRatio);
  const effectiveTimeout = captureTimeoutMs ?? scaledTimeout;

  const dataUrl = await withTimeout(
    toPng(node, { pixelRatio, backgroundColor }),
    effectiveTimeout,
    "Export timed out — this can happen with a lot of teams/characters or a slow connection. Try again, or export in a smaller batch."
  );

  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
