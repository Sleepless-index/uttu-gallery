import { toCanvas } from "html-to-image";

function waitForImages(
  root: HTMLElement,
  timeoutMs: number,
  onProgress?: (loaded: number, total: number) => void
): Promise<void> {
  const images = Array.from(root.querySelectorAll("img"));
  const total = images.length;
  let loaded = 0;

  const reportProgress = () => {
    loaded += 1;
    onProgress?.(loaded, total);
  };

  onProgress?.(0, total);

  const loadPromise = Promise.all(
    images.map((img) => {
      if (img.complete) {
        if (img.naturalWidth === 0) img.removeAttribute("src");
        reportProgress();
        return Promise.resolve();
      }
      return new Promise<void>((resolve) => {
        img.onload = () => {
          reportProgress();
          resolve();
        };
        img.onerror = () => {
          img.removeAttribute("src");
          reportProgress();
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
      // fall through
    }
  }
  return "Export failed for an unknown reason. Please try again, or try with fewer teams.";
}

interface ExportPngToFileOptions {
  node: HTMLElement;
  filename: string;
  pixelRatio?: number;
  quality?: number;
  imageWaitMs?: number;
  onProgress?: (loaded: number, total: number) => void;
  captureTimeoutMs?: number;
}

export async function exportPngToFile({
  node,
  filename,
  pixelRatio = 2,
  quality = 0.88,
  imageWaitMs = 8000,
  onProgress,
  captureTimeoutMs,
}: ExportPngToFileOptions): Promise<void> {
  await waitForImages(node, imageWaitMs, onProgress);

  const backgroundColor =
    getComputedStyle(document.documentElement).getPropertyValue("--color-bg").trim() || "#323031";

  const imageCount = node.querySelectorAll("img").length;
  const scaledTimeout = Math.max(20000, imageCount * 1500 * pixelRatio * pixelRatio);
  const effectiveTimeout = captureTimeoutMs ?? scaledTimeout;

  const canvas = await withTimeout(
    toCanvas(node, { pixelRatio, backgroundColor }),
    effectiveTimeout,
    "Export timed out — this can happen with a lot of teams/characters or a slow connection. Try again, or export in a smaller batch."
  );

  const dataUrl = canvas.toDataURL("image/webp", quality);

  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}