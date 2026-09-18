import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { registerBestSelfLanguage } from "./editor/language";
import { registerBestSelfTheme } from "./editor/theme";
import { registerCompletionProvider } from "./editor/completions";
import { parseContent } from "./parser/DailyParser";
import { DailyScoreCalculator } from "./parser/DailyScoreCalculator";
import { DashboardPanel } from "./components/DashboardPanel";
import { DiagnosticsPanel } from "./components/DiagnosticsPanel";
import { DailyScore } from "./parser/types";
import type { Daily, ParseDiagnostic } from "./parser/types.ts";
import * as monaco from "monaco-editor";
import { PdfPanel } from "./components/PdfPanel";
import {StreakMap} from "./components/StreakMap";
import {StreakMapStats} from "./components/StreakMapStats";
import { PastDays } from "./components/PastDays";
import {CalendarPage} from "./components/calendar/CalendarPage";
import { rows, titles, heroTitle } from "./data";
import Grainient from './components/grainient/Grainient';

import './myEditor.css';
import './App.css';
import { DockNav } from "./components/ui/DockNav.tsx";
import { MusicPlayerWidget } from "./components/ui/MusicPlayerWidget.tsx";
import { Title } from "./types.ts";
import {SlicedText} from "./components/SlicedText.tsx";
import { GlowBorder } from "./components/GlowBorder/GlowBorder.tsx";

const STORAGE_KEY = "bestself_content";
const PastDays_STORAGE_KEY = "bestself_past_days";

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

  const [pastDaysContent, setPastDaysContent] = useState(
    () => localStorage.getItem(PastDays_STORAGE_KEY) ?? ""
  );

  const [content, setContent] = useState(
    () => localStorage.getItem(STORAGE_KEY) ?? DEFAULT_CONTENT
  );

  const [pastDays, setPastDays] = useState<Daily[]>([]);

  //const scores = days.length > 0 ? calculator.computeAll(days) : [];
  const [pastScore, setPastScore] = useState<DailyScore[]>([]);

  const [selected, setSelected] = useState<Title | null>(null);

  const handlePastDaysContentChange = useCallback((value: string | undefined) => {
    const text = value ?? "";
    const lines = text.split("\n");
    const result = parseContent(lines);
    const parsedDays = [...result.value];
    setPastDays(parsedDays);

    const scores = parsedDays.length > 0 ? calculator.computeAll(parsedDays) : [];

    setPastScore([...scores]);

    //console.log("result:", result);
    //console.log("scores:", scores);

  },[pastDaysContent]);

  useEffect(() => {
    handlePastDaysContentChange(pastDaysContent);
  }, []);

  const [showDashboard, setShowDashboard] = useState<boolean>(true);
  const [days, setDays] = useState<Daily[]>([]);
  const [diagnostics, setDiagnostics] = useState<ParseDiagnostic[]>([]);
  const [activePanel, setActivePanel] = useState<"dashboard" | "past_days" | "diagnostics" | "pdf" | "calendar">("dashboard");
  const parseTimer = useRef<ReturnType<typeof setTimeout>>();

  const handleShowDashboard = () => {
    setShowDashboard(!showDashboard)
  }

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

      console.table(result.diagnostics);

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

  const [selectedPastDay, setSelectedPastDay] = useState<string | null>(null);

  const onSelectPastDay = useCallback((id: string) => {
    console.log("onSelectPastDay called with id:", id);
    setSelectedPastDay(id);

    let x = pastDays?.filter((day) => day.date === id)
    
    console.log("pastDays:", pastDays);
    console.log("Filtered pastDays for selectedPastDay:", x);
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

//const dockActive = modal ?? (searchResults ? "search" : view === "browse" ? "grid" : "home");
const dockActive = activePanel;

const handleDockSelect = (id: string) => {
  console.log("in handleDockSelect: id = ", id);
  setActivePanel(id as "dashboard" | "past_days" | "diagnostics" | "pdf");
}

useEffect(() => {
  console.log("activePanel changed to: ", activePanel);
}, [activePanel]);

  let streakMapsContent = useMemo(() => (
    <>
    <StreakMapStats days={pastDays} scores={pastScore} statType="steps"/>
    <StreakMapStats days={pastDays} scores={pastScore} statType="phone_time"/>
    <StreakMap days={pastDays} scores={pastScore}/>
    </>
  ),[pastDays, pastScore]);

  return (
    
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">◈</span>
            <span className="logo-text">Cadence</span>
          </div>
          <span className="logo-sub">your daybook</span>
        </div>
        <div className="header-right">
          <SlicedText />
        {/* <button
            className={`panel-tab ${activePanel === "past_days" ? "active" : ""}`}
            onClick={() => setActivePanel("past_days")}
          >
            Past Days
          </button> */}

          {latestDay && (
            <span className="current-date">{latestDay.rawDateToken}</span>
          )}
          {/* <button
            className={`panel-tab ${activePanel === "dashboard" ? "active" : ""}`}
            onClick={() => setActivePanel("dashboard")}
          >
            Dashboard
          </button> */}
           {(errorCount > 0 || warnCount > 0) && (
          <button
            className={`panel-tab ${activePanel === "diagnostics" ? "active" : ""}`}
            onClick={() => setActivePanel("diagnostics")}
          >
            
           
              <>Diagnostics
              <span className={`badge ${errorCount > 0 ? "error" : "warn"}`}>
                {errorCount > 0 ? errorCount : warnCount}
              </span>
              </>
            
          </button>
          )}
          {/* <button
            className={`panel-tab ${activePanel === "pdf" ? "active" : ""}`}
            onClick={() => setActivePanel("pdf")}
          >
            PDF
          </button> */}
        </div>
      </header>

            {/* <div>
              <h1>my editor</h1>
              <div className="Editor" ref={monacoEl}></div>
            </div> */}

      <div className="app-body">
        <div className={`right-pane ${activePanel === "pdf" ? "right-pane--pdf" : ""}`}>
          {activePanel === "dashboard" ? (
            <div className="dashboard-pane">

            {/* 
              painting this components triggers the cursor to be misplaced while typing.
              the profiler shows about 5s for rendering this component
              why does it take so much time ?
              and this becomes really annoying when you are trying to type in the editor and the cursor jumps to the end of the text
            */}
            
            <div>
            <legend>
              <br/>
              &nbsp;&nbsp;
              <input 
                id="showDashboard"
                type="checkbox" 
                checked={showDashboard} 
                onChange={handleShowDashboard}/>
                &nbsp;
              Show dashboard</legend>

              {showDashboard && 
                <DashboardPanel day={latestDay} score={latestScore} days={pastDays} scores={pastScore} /> 
              }
            </div>

            {/* <StreakMapStats days={pastDays} scores={pastScore} statType="steps"/>
            <StreakMapStats days={pastDays} scores={pastScore} statType="phone_time"/>
            
            <StreakMap days={pastDays} scores={pastScore}/>  */}
            
            </div>
          ) : activePanel === "pdf" ? (
            <PdfPanel day={latestDay} score={latestScore} />
          ) : activePanel === "diagnostics" ? (
            <DiagnosticsPanel diagnostics={diagnostics} />
          ) : activePanel === "calendar" ? (
            <CalendarPage titles={titles} onOpenTitle={setSelected} />
          ) : activePanel === "past_days" ? (
            <PastDays pastDays={pastDays} pastScores={pastScore} onSelect={onSelectPastDay}/>
          ) : (
              <GlowBorder className="search-wrapper">
                <input
                  className="search-input"
                  placeholder="Search box"
                />
              </GlowBorder>
          )
        }

        
        </div>

        <div className={"editor-pane"+ (
          ["past_days", "pdf", "calendar"].includes(activePanel) ? " hidden" : "")}>

          <Editor
            
            height="93%"
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
      

        {activePanel === "past_days" && 
          <div className="past-days">
            {streakMapsContent}
          

            <div className="viewer-pane">
              <textarea disabled value={"DAY:" + JSON.stringify(pastDays?.filter((day) => day.date === selectedPastDay).at(0) ?? "Select a day from the list to view its content.", null, 2)}
              style={{width: "150%", height: "45%", fontSize: "14px", fontFamily: "'JetBrains Mono', 'Fira Code', monospace", padding: "10px", boxSizing: "border-box", "marginBottom": "20px"}}
              > </textarea>

              <textarea disabled value={"SCORE:" + JSON.stringify(pastScore?.filter((day) => day.date === selectedPastDay).at(0) ?? "Select a day from the list to view its content.", null, 2)}
              style={{width: "150%", height: "42%", fontSize: "14px", fontFamily: "'JetBrains Mono', 'Fira Code', monospace", padding: "10px", boxSizing: "border-box"}}
              > </textarea>
              
            </div>

          </div>
        }

      </div>

      <DockNav active={dockActive} onSelect={handleDockSelect} />
      {/* <MusicPlayerWidget /> */}

      { false && <div style={{ width: '100%', height: '100%', position: 'fixed' }}>
        <Grainient
          // color1="#898789"
          // color2="#605f65"
          // color3="#a4a4ac"
          color1="#3e5d5f"
          //color1="rgba(120,120,200,1)"
          color2="#3e3d3f"
          color3="#2e2d4f"
          timeSpeed={0.85}
          colorBalance={-0.09}
          warpStrength={1.85}
          warpFrequency={6.2}
          warpSpeed={2.7}
          warpAmplitude={24}
          blendAngle={71}
          blendSoftness={0.05}
          rotationAmount={820}
          noiseScale={2.55}
          grainAmount={0.1}
          grainScale={3.5}
          grainAnimated={false}
          contrast={1.15}
          gamma={1.4}
          saturation={1.45}
          centerX={-0.07}
          centerY={-0.08}
          zoom={0.85}
        />
      </div> }
    </div>
  );
}
