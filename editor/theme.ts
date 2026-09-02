import type * as Monaco from "monaco-editor";

export function registerBestSelfTheme(monaco: typeof Monaco) {
  monaco.editor.defineTheme("bestself-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "bs.date",         foreground: "61AFEF", fontStyle: "bold" },
      { token: "bs.cat.dash",     foreground: "5C6370" },
      { token: "bs.cat.name",     foreground: "C678DD", fontStyle: "bold" },
      { token: "bs.dash",         foreground: "5C6370" },
      { token: "bs.colon",        foreground: "5C6370" },
      { token: "bs.ok",           foreground: "98C379", fontStyle: "bold" },
      { token: "bs.nok",          foreground: "E06C75", fontStyle: "bold" },
      { token: "bs.inprogress",   foreground: "E5C07B", fontStyle: "bold" },
      { token: "bs.todo",         foreground: "ABB2BF", fontStyle: "bold" },
      { token: "bs.overdue",      foreground: "D19A66", fontStyle: "bold" },
      { token: "bs.onhold",       foreground: "56B6C2", fontStyle: "bold" },
      { token: "bs.summary",      foreground: "ABB2BF" },
      { token: "bs.time.kw",      foreground: "61AFEF" },
      { token: "bs.time.label",   foreground: "5C6370" },
      { token: "bs.time.est",     foreground: "D19A66" },
      { token: "bs.time.act",     foreground: "98C379" },
      { token: "bs.time.pipe",    foreground: "5C6370" },
      { token: "bs.section.hdr",  foreground: "C678DD", fontStyle: "italic" },
      { token: "bs.section.body", foreground: "9DA5B4" },
    ],
    colors: {
      // "editor.background":           "#21252B",
      "editor.foreground":           "#ABB2BF",
      "editor.lineHighlightBackground": "#2C313A",
      "editorLineNumber.foreground": "#4B5263",
      "editorLineNumber.activeForeground": "#ABB2BF",
      "editor.selectionBackground":  "#3E4451",
      "editorCursor.foreground":     "#528BFF",
      "editorIndentGuide.background1": "#3B4048",
      "editorIndentGuide.activeBackground1": "#C678DD44",
    },
  });
}
