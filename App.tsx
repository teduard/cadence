import { useState, useEffect, useRef, useCallback } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { registerBestSelfLanguage } from "./editor/language";
import { registerBestSelfTheme } from "./editor/theme";
import { registerCompletionProvider } from "./editor/completions";
import { parseContent } from "./parser/DailyParser";
import { DailyScoreCalculator } from "./parser/DailyScoreCalculator";
import { DashboardPanel } from "./components/DashboardPanel";
import { DiagnosticsPanel } from "./components/DiagnosticsPanel";
import type { Daily, ParseDiagnostic } from "./parser/types.ts";
import * as monaco from "monaco-editor";
import { PdfPanel } from "./components/PdfPanel";

import './myEditor.css';
import './App.css';

const STORAGE_KEY = "bestself_content";

const DEFAULT_CONTENT = `#${new Date().getMonth() + 1}.${new Date().getDate()}.${new Date().getFullYear()}
\t- Personal
\t\t- OK: morning routine
\t\t\t> #TIME: ESTIMATED [00:30:00] | ACTUAL [00:25:00]
\t\t- TODO: read 30 pages
\t\t\t> #TIME: ESTIMATED [00:30:00] | ACTUAL [00:00:00]
\t- Work
\t\t- IN_PROGRESS: build taskify editor
\t\t\t> #TIME: ESTIMATED [04:00:00] | ACTUAL [01:30:00]
\t\t\t/Result
\t\t\t\tmonaco integration working
\t- Urgent
\t\t- NOK: is there anything urgent today?
\t\t\t> #TIME: ESTIMATED [00:15:00] | ACTUAL [00:00:00]
`;

const calculator = new DailyScoreCalculator();

export default function App() {
  const monacoInstance = useMonaco();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [content, setContent] = useState(
    () => localStorage.getItem(STORAGE_KEY) ?? DEFAULT_CONTENT
  );
  const [days, setDays] = useState<Daily[]>([]);
  const [diagnostics, setDiagnostics] = useState<ParseDiagnostic[]>([]);
  const [activePanel, setActivePanel] = useState<"dashboard" | "diagnostics" | "pdf">("dashboard");
  const parseTimer = useRef<ReturnType<typeof setTimeout>>();

  // Register language, theme, completions once Monaco is ready
  useEffect(() => {
    if (!monacoInstance) return;
    registerBestSelfLanguage(monacoInstance);
    registerBestSelfTheme(monacoInstance);
    registerCompletionProvider(monacoInstance);
  }, [monacoInstance]);

  // Debounced parse on content change
  const handleChange = useCallback((value: string | undefined) => {
    const text = value ?? "";
    setContent(text);
    localStorage.setItem(STORAGE_KEY, text);

    clearTimeout(parseTimer.current);
    parseTimer.current = setTimeout(() => {
      const lines = text.split("\n");
      const result = parseContent(lines);
      setDiagnostics(result.diagnostics);
      setDays(result.value);

      // Push diagnostics to Monaco as squiggles
      if (editorRef.current && monacoInstance) {
        const model = editorRef.current.getModel();
        if (model) {
          monacoInstance.editor.setModelMarkers(
            model,
            "bestself",
            result.diagnostics.map((d) => ({
              severity:
                d.severity === "error"
                  ? monacoInstance.MarkerSeverity.Error
                  : monacoInstance.MarkerSeverity.Warning,
              startLineNumber: d.lineNumber,
              startColumn: 1,
              endLineNumber: d.lineNumber,
              endColumn: model.getLineLength(d.lineNumber) + 1,
              message: d.message,
            }))
          );
        }
      }
    }, 300);
  }, [monacoInstance]);

  // Initial parse
  useEffect(() => {
    handleChange(content);
  }, []);

  const scores = days.length > 0 ? calculator.computeAll(days) : [];
  const latestScore = scores[0] ?? null;
  const latestDay = days[0] ?? null;

  const errorCount = diagnostics.filter((d) => d.severity === "error").length;
  const warnCount = diagnostics.filter((d) => d.severity === "warning").length;

  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
	// const monacoEl = useRef(null);

  // useEffect(() => {
	// 	if (monacoEl) {
	// 		setEditor((editor) => {
	// 			if (editor) return editor;

	// 			// return monaco.editor.create(monacoEl.current!, {
	// 			// 	value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
	// 			// 	language: 'typescript'
	// 			// });
	// 		});
	// 	}

	// 	return () => editor?.dispose();
	// }, [monacoEl.current]);


  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">◈</span>
            <span className="logo-text">Cadence</span>
          </div>
          <span className="logo-sub">Journal Studio</span>
        </div>
        <div className="header-right">
          {latestDay && (
            <span className="current-date">{latestDay.rawDateToken}</span>
          )}
          <button
            className={`panel-tab ${activePanel === "dashboard" ? "active" : ""}`}
            onClick={() => setActivePanel("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`panel-tab ${activePanel === "diagnostics" ? "active" : ""}`}
            onClick={() => setActivePanel("diagnostics")}
          >
            Diagnostics
            {(errorCount > 0 || warnCount > 0) && (
              <span className={`badge ${errorCount > 0 ? "error" : "warn"}`}>
                {errorCount > 0 ? errorCount : warnCount}
              </span>
            )}
          </button>
          <button
            className={`panel-tab ${activePanel === "pdf" ? "active" : ""}`}
            onClick={() => setActivePanel("pdf")}
          >
            PDF
          </button>
        </div>
      </header>

            {/* <div>
              <h1>my editor</h1>
              <div className="Editor" ref={monacoEl}></div>
            </div> */}

      <div className="app-body">
        <div className={`right-pane ${activePanel === "pdf" ? "right-pane--pdf" : ""}`}>
          {activePanel === "dashboard" ? (
            <DashboardPanel day={latestDay} score={latestScore} days={days} scores={scores} />
          ) : activePanel === "pdf" ? (
            <PdfPanel day={latestDay} score={latestScore} />
          ) : (
            <DiagnosticsPanel diagnostics={diagnostics} />
          )}
        </div>

        <div className="editor-pane">
          <Editor
            
            height="100%"
            language="bestself"
            theme="bestself-dark"
            value={content}
            onChange={handleChange}
            beforeMount={(monaco) => {
              registerBestSelfLanguage(monaco);
              registerBestSelfTheme(monaco);
              registerCompletionProvider(monaco);
            }}
            onMount={(editor) => { editorRef.current = editor; }}
            options={{
              fontSize: 18,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontLigatures: true,
              lineHeight: 22,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              renderWhitespace: "boundary",
              wordWrap: "off",
              tabSize: 4,
              insertSpaces: false,
              padding: { top: 16, bottom: 16 },
              smoothScrolling: true,
              cursorBlinking: "smooth",
              renderLineHighlight: "gutter",
              overviewRulerBorder: false,
              hideCursorInOverviewRuler: true,
              scrollbar: {
                verticalScrollbarSize: 14,
                horizontalScrollbarSize: 14,
              },
            }}
          />
        </div>


      </div>
    </div>
  );
}
