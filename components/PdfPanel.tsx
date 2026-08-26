import { useState, useCallback } from "react";
import { PDFViewer, PDFDownloadLink, BlobProvider } from "@react-pdf/renderer";
import { DailyPdfDocument } from "./DailyPdfDocument";
import type { Daily, DailyScore } from "../parser/types";

interface Props {
  day: Daily | null;
  score: DailyScore | null;
}

export function PdfPanel({ day, score }: Props) {
  const [viewMode, setViewMode] = useState<"preview" | "download">("preview");

  if (!day || !score) {
    return (
      <div className="panel-empty">
        <span className="empty-icon">⬇</span>
        <p>Parse a valid daily log<br />to generate a PDF.</p>
      </div>
    );
  }

  const filename = `daily-${day.date}.pdf`;

  return (
    <div className="pdf-panel">
      <div className="pdf-toolbar">
        <div className="pdf-toolbar-left">
          <span className="pdf-label">PDF Preview</span>
          <span className="pdf-date">{day.rawDateToken}</span>
        </div>
        <div className="pdf-toolbar-right">
          <button
            className={`panel-tab ${viewMode === "preview" ? "active" : ""}`}
            onClick={() => setViewMode("preview")}
          >
            Preview
          </button>
          {/* Download link — renders to blob and triggers download */}
          <PDFDownloadLink
            document={<DailyPdfDocument day={day} score={score} />}
            fileName={filename}
            className="pdf-download-btn"
          >
            {({ loading }) => loading ? "Generating…" : "⬇ Download"}
          </PDFDownloadLink>
        </div>
      </div>

      {/* Live PDF preview iframe — only rendered when tab is active */}
      <div className="pdf-viewer-wrap">
        <PDFViewer
          width="100%"
          height="100%"
          showToolbar={false}
          style={{ border: "none" }}
        >
          <DailyPdfDocument day={day} score={score} />
        </PDFViewer>
      </div>
    </div>
  );
}
