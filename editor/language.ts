import type * as Monaco from "monaco-editor";

export function registerBestSelfLanguage(monaco: typeof Monaco) {
  if (monaco.languages.getLanguages().some(l => l.id === "bestself")) return;

  monaco.languages.register({ id: "bestself" });

  monaco.languages.setMonarchTokensProvider("bestself", {
    tokenizer: {
      root: [
        // Day header: #10.30.2025
        [/^#\d{1,2}\.\d{1,2}\.\d{4}.*$/, "bs.date"],

        // Category: \t- Name
        [/^(\t)(-)( )(.+)$/, ["white", "bs.cat.dash", "white", "bs.cat.name"]],

        // Task statuses (indent 2+)
        [/^(\t+)(- )(OK)(:)(.*)$/,          ["white","bs.dash","bs.ok",         "bs.colon","bs.summary"]],
        [/^(\t+)(- )(NOK)(:)(.*)$/,         ["white","bs.dash","bs.nok",        "bs.colon","bs.summary"]],
        [/^(\t+)(- )(IN_PROGRESS)(:)(.*)$/, ["white","bs.dash","bs.inprogress", "bs.colon","bs.summary"]],
        [/^(\t+)(- )(TODO)(:)(.*)$/,        ["white","bs.dash","bs.todo",       "bs.colon","bs.summary"]],
        [/^(\t+)(- )(OVERDUE)(:)(.*)$/,     ["white","bs.dash","bs.overdue",    "bs.colon","bs.summary"]],
        [/^(\t+)(- )(ON_HOLD)(:)(.*)$/,     ["white","bs.dash","bs.onhold",     "bs.colon","bs.summary"]],

        // TIME annotation
        [
          /^(\t+)(> #TIME:)(\s*ESTIMATED\s*)(\[\d{2}:\d{2}:\d{2}\])(\s*\|\s*)(\s*ACTUAL\s*)(\[\d{2}:\d{2}:\d{2}\])/,
          ["white","bs.time.kw","bs.time.label","bs.time.est","bs.time.pipe","bs.time.label","bs.time.act"]
        ],

        // Section headers
        [/^(\t+)(\/Definition|\/Timeline|\/Result)/, ["white","bs.section.hdr"]],

        // Section body (4+ tabs)
        [/^\t{4,}.*/, "bs.section.body"],

        // Fallback whitespace
        [/\s+/, "white"],
      ],
    },
  } as Monaco.languages.IMonarchLanguage);
}
