import { toPng } from "html-to-image";

/** Resolves once every <img> under `root` has either loaded or errored.
 * toPng() doesn't wait for image decode on its own, so without this the
 * capture can race ahead and grab blank tiles for anything not yet decoded.
 * Guarded by a timeout — a single stalled request (e.g. a flaky network
 * fetch of a large sprite sheet) should never hang the export forever. */
function waitForImages(root: HTMLElement, timeoutMs: number): Promise<void> {
  const images = Array.from(root.querySelectorAll("img"));
  const loadPromise = Promise.all(
    images.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          })
    )
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
   * on "Exporting…" indefinitely. */
  captureTimeoutMs?: number;
}

/** Captures `node` as a PNG and triggers a download, with bounded wait times
 * at every stage so a slow/stalled export always resolves or clearly fails
 * within a predictable window — instead of spinning forever with no
 * feedback, which is what made this feel "broken" on large rosters. */
export async function exportPngToFile({
  node,
  filename,
  pixelRatio = 2,
  imageWaitMs = 8000,
  captureTimeoutMs = 20000,
}: ExportPngToFileOptions): Promise<void> {
  await waitForImages(node, imageWaitMs);

  const backgroundColor =
    getComputedStyle(document.documentElement).getPropertyValue("--color-bg").trim() || "#0a0a0f";

  const dataUrl = await withTimeout(
    toPng(node, { pixelRatio, backgroundColor }),
    captureTimeoutMs,
    "Export timed out — this can happen with a very large roster or a slow connection. Try again, or export in a smaller batch."
  );

  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
