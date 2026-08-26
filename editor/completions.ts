import type * as Monaco from "monaco-editor";

// export function registerCompletionProvider(monaco: typeof Monaco) {
//   monaco.languages.registerCompletionItemProvider("bestself", {
//     triggerCharacters: ["\t", "-", "#", "/"],

//     provideCompletionItems(model, position) {
//       const line = model.getLineContent(position.lineNumber);
//       const indent = (line.match(/^\t*/) ?? [""])[0].length;
//       const suggestions: Monaco.languages.CompletionItem[] = [];

//       const range: Monaco.IRange = {
//         startLineNumber: position.lineNumber,
//         endLineNumber:   position.lineNumber,
//         startColumn:     1,
//         endColumn:       position.column,
//       };

//       // ── Indent 0: day header ──────────────────────────────────────────────
//       if (indent === 0) {
//         const now = new Date();
//         const token = `#${now.getMonth() + 1}.${now.getDate()}.${now.getFullYear()}`;
//         suggestions.push({
//           label: token,
//           kind: monaco.languages.CompletionItemKind.Module,
//           insertText: token + "\n",
//           detail: "Today's date header",
//           sortText: "0",
//           range,
//         });
//       }

//       // ── Indent 1: category ────────────────────────────────────────────────
//       if (indent === 1) {
//         ["Personal", "Work", "Urgent", "Health", "House", "Learning"].forEach((cat, i) => {
//           suggestions.push({
//             label: `- ${cat}`,
//             kind: monaco.languages.CompletionItemKind.Class,
//             insertText: `- ${cat}`,
//             detail: "Category",
//             sortText: String(i),
//             range,
//           });
//         });
//       }

//       // ── Indent 2+: task statuses ──────────────────────────────────────────
//       if (indent >= 2) {
//         const statuses = [
//           { label: "OK",          detail: "Completed task",    sort: "0" },
//           { label: "NOK",         detail: "Failed / skipped",  sort: "1" },
//           { label: "IN_PROGRESS", detail: "Currently working", sort: "2" },
//           { label: "TODO",        detail: "Planned",           sort: "3" },
//           { label: "OVERDUE",     detail: "Missed deadline",   sort: "4" },
//           { label: "ON_HOLD",     detail: "Blocked",           sort: "5" },
//         ];
//         statuses.forEach(s => {
//           suggestions.push({
//             label: `- ${s.label}:`,
//             kind: monaco.languages.CompletionItemKind.Enum,
//             insertText: `- ${s.label}: \${1:summary}`,
//             insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
//             detail: s.detail,
//             sortText: s.sort,
//             range,
//           });
//         });
//       }

//       // ── Indent 3+: time annotation and section headers ────────────────────
//       if (indent >= 3) {
//         suggestions.push({
//           label: "> #TIME:",
//           kind: monaco.languages.CompletionItemKind.Property,
//           insertText:
//             "> #TIME: ESTIMATED [\${1:00}:\${2:00}:00] | ACTUAL [\${3:00}:\${4:00}:00]",
//           insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
//           detail: "Time annotation",
//           sortText: "0",
//           range,
//         });

//         ["/Definition", "/Timeline", "/Result"].forEach((section, i) => {
//           suggestions.push({
//             label: section,
//             kind: monaco.languages.CompletionItemKind.Struct,
//             insertText: section,
//             detail: "Section header",
//             sortText: String(i + 1),
//             range,
//           });
//         });
//       }

//       return { suggestions };
//     },
//   });
// }

export function registerCompletionProvider(monaco: typeof Monaco) {
  monaco.languages.registerCompletionItemProvider("bestself", {
    triggerCharacters: ["\t", "-", "#", "/"],

    provideCompletionItems(model, position) {
      const line = model.getLineContent(position.lineNumber);
      const indent = (line.match(/^\t*/) ?? [""])[0].length;
      const lineContentAfterIndent = line.substring(indent);

      // Replace only the non-tab content after indentation
      const range: monaco.IRange = {
        startLineNumber: position.lineNumber,
        endLineNumber:   position.lineNumber,
        startColumn:     indent + 1,
        endColumn:       indent + 1 + lineContentAfterIndent.length,
      };

      const suggestions: monaco.languages.CompletionItem[] = [];

      if (indent === 0) {
        const now = new Date();
        const token = `#${now.getMonth() + 1}.${now.getDate()}.${now.getFullYear()}`;
        suggestions.push({
          label: token,
          kind: monaco.languages.CompletionItemKind.Module,
          insertText: token,
          detail: "Today's date header",
          sortText: "0",
          range,
        });
      }

      if (indent === 1) {
        ["Personal", "Work", "Urgent", "Health", "House", "Learning"].forEach((cat, i) => {
          suggestions.push({
            label: `- ${cat}`,
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: `- ${cat}`,
            detail: "Category",
            sortText: String(i),
            range,
          });
        });
      }

      if (indent >= 2) {
        const statuses = [
          { label: "OK",          detail: "Completed task",    sort: "0" },
          { label: "NOK",         detail: "Failed / skipped",  sort: "1" },
          { label: "IN_PROGRESS", detail: "Currently working", sort: "2" },
          { label: "TODO",        detail: "Planned",           sort: "3" },
          { label: "OVERDUE",     detail: "Missed deadline",   sort: "4" },
          { label: "ON_HOLD",     detail: "Blocked",           sort: "5" },
        ];
        statuses.forEach(s => {
          suggestions.push({
            label: `- ${s.label}:`,
            kind: monaco.languages.CompletionItemKind.Enum,
            insertText: `- ${s.label}: \${1:summary}`,
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: s.detail,
            sortText: s.sort,
            range,
          });
        });
      }

      if (indent >= 3) {
        suggestions.push({
          label: "> #TIME:",
          kind: monaco.languages.CompletionItemKind.Property,
          insertText:
            "> #TIME: ESTIMATED [\${1:00}:\${2:00}:00] | ACTUAL [\${3:00}:\${4:00}:00]",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "Time annotation",
          sortText: "0",
          range,
        });

        ["/Definition", "/Timeline", "/Result"].forEach((section, i) => {
          suggestions.push({
            label: section,
            kind: monaco.languages.CompletionItemKind.Struct,
            insertText: section,
            detail: "Section header",
            sortText: String(i + 1),
            range,
          });
        });
      }

      return { suggestions };
    },
  });
}
