import type { ParseDiagnostic } from "../parser/types.ts";

interface Props {
  diagnostics: readonly ParseDiagnostic[];
}

export function DiagnosticsPanel({ diagnostics }: Props) {
  if (diagnostics.length === 0) {
    return (
      <div className="panel-empty">
        <span className="empty-icon" style={{ color: "var(--green)" }}>✓</span>
        <p>No issues found.<br />Your log parsed cleanly.</p>
      </div>
    );
  }

  const errors   = diagnostics.filter(d => d.severity === "error");
  const warnings = diagnostics.filter(d => d.severity === "warning");

  return (
    <div className="diagnostics">
      <div className="diag-summary">
        {errors.length > 0 && (
          <span className="diag-count error">{errors.length} error{errors.length > 1 ? "s" : ""}</span>
        )}
        {warnings.length > 0 && (
          <span className="diag-count warn">{warnings.length} warning{warnings.length > 1 ? "s" : ""}</span>
        )}
      </div>

      <div className="diag-list">
        {diagnostics.map((d, i) => (
          <div key={i} className={`diag-item ${d.severity}`}>
            <div className="diag-header">
              <span className={`diag-badge ${d.severity}`}>
                {d.severity === "error" ? "ERR" : "WARN"}
              </span>
              <span className="diag-line">Line {d.lineNumber}</span>
            </div>
            <div className="diag-message">{d.message}</div>
            <div className="diag-source">→ {d.lineContent}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
