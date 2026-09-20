interface ExportButtonLabelProps {
  exporting: boolean;
  exportProgress: { loaded: number; total: number } | null;
  byteSizeLabel: string | null;
}

/** Content shown inside the Export/Download button — split out so the
 * file-size readout can sit on its own line under "Download" instead of
 * inline, which was cramped on mobile. */
export function ExportButtonLabel({ exporting, exportProgress, byteSizeLabel }: ExportButtonLabelProps) {
  if (exporting) {
    return (
      <span>
        {exportProgress && exportProgress.total > 0
          ? `Exporting… ${exportProgress.loaded}/${exportProgress.total}`
          : "Exporting…"}
      </span>
    );
  }

  if (byteSizeLabel) {
    return (
      <span className="flex flex-col items-start leading-tight">
        <span>Download</span>
        <code className="rounded bg-black/25 px-1 py-px text-[0.65rem] font-normal text-[var(--color-text-faint)]">
          {byteSizeLabel}
        </code>
      </span>
    );
  }

  return <span>Export</span>;
}
