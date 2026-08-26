import type {
  Daily, DailyCategory, DailyItem, DailyItemStatus,
  ParseDiagnostic, ParseResult, ItemSection
} from "./types";

// ── Constants ─────────────────────────────────────────────────────────────────

const ALL_STATUSES: DailyItemStatus[] = [
  "TODO", "IN_PROGRESS", "OK", "NOK", "OVERDUE", "ON_HOLD"
];

const TIME_TOKEN       = "> #TIME:";
const DEFINITION_TOKEN = "/Definition";
const TIMELINE_TOKEN   = "/Timeline";
const RESULT_TOKEN     = "/Result";

// ── Line reader (mirrors C# LineReader) ───────────────────────────────────────

class LineReader {
  private pos = 0;
  constructor(private readonly lines: string[]) {}

  get isAtEnd() { return this.pos >= this.lines.length; }
  get currentLineNumber() { return this.pos + 1; }

  peek(): string { return this.isAtEnd ? "" : this.lines[this.pos]; }
  consume(): string {
    if (this.isAtEnd) throw new Error("Reader past end of input");
    return this.lines[this.pos++];
  }
  skip() { if (!this.isAtEnd) this.pos++; }
  peekIndent(): number { return countTabs(this.peek()); }
}

function countTabs(line: string): number {
  let n = 0;
  while (n < line.length && line[n] === "\t") n++;
  return n;
}

// ── Public API ────────────────────────────────────────────────────────────────

export function parseContent(lines: string[]): ParseResult<Daily[]> {
  const diagnostics: ParseDiagnostic[] = [];
  const reader = new LineReader(lines);
  const days: Daily[] = [];

  while (!reader.isAtEnd) {
    const line = reader.peek();
    if (!line.trim()) { reader.skip(); continue; }

    if (line.startsWith("#")) {
      days.push(parseDay(reader, diagnostics));
    } else {
      diagnostics.push(makeDiagnostic(reader, `Expected day header (#MM.DD.YYYY), got: "${line}"`));
      reader.skip();
    }
  }

  return {
    value: days,
    diagnostics,
    hasErrors: diagnostics.some(d => d.severity === "error"),
    hasWarnings: diagnostics.some(d => d.severity === "warning"),
  };
}

// ── Day ───────────────────────────────────────────────────────────────────────

function parseDay(reader: LineReader, diag: ParseDiagnostic[]): Daily {
  const header = reader.consume();
  const parsed = parseDateHeader(header);

  if (!parsed) {
    diag.push(makeDiagnostic(reader, `Could not parse date from "${header}". Expected #MM.DD.YYYY.`));
  }

  const categories: DailyCategory[] = [];

  while (!reader.isAtEnd) {
    const next = reader.peek();
    if (!next.trim()) { reader.skip(); continue; }
    if (next.startsWith("#")) break;

    if (countTabs(next) === 1 && next.trimStart().startsWith("- ")) {
      categories.push(parseCategory(reader, diag));
    } else {
      diag.push(makeDiagnostic(reader, `Expected category (1 tab + "- Name"), got: "${next}"`));
      reader.skip();
    }
  }

  return {
    date: parsed ?? "1970-01-01",
    rawDateToken: header,
    categories,
  };
}

function parseDateHeader(line: string): string | null {
  // #MM.DD.YYYY → ISO "YYYY-MM-DD"
  const raw = line.replace(/^#/, "").trim();
  const parts = raw.split(".");
  if (parts.length !== 3) return null;
  const [m, d, y] = parts.map(Number);
  if ([m, d, y].some(isNaN)) return null;
  try {
    const date = new Date(y, m - 1, d);
    if (isNaN(date.getTime())) return null;
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  } catch { return null; }
}

// ── Category ──────────────────────────────────────────────────────────────────

function parseCategory(reader: LineReader, diag: ParseDiagnostic[]): DailyCategory {
  const header = reader.consume();
  const name = header.trimStart().replace(/^-\s*/, "").trim();
  const items: DailyItem[] = [];

  while (!reader.isAtEnd) {
    const next = reader.peek();
    if (!next.trim()) { reader.skip(); continue; }
    const indent = countTabs(next);
    if (indent <= 1) break;

    if (indent === 2 && isTaskLine(next.trimStart())) {
      items.push(parseItem(reader, diag, 2, 0));
    } else {
      diag.push(makeDiagnostic(reader, `Expected task at indent 2, got: "${next}"`));
      reader.skip();
    }
  }

  return { name, items };
}

// ── Item (recursive) ──────────────────────────────────────────────────────────

function parseItem(
  reader: LineReader,
  diag: ParseDiagnostic[],
  taskIndent: number,
  treeLevel: number
): DailyItem {
  const header = reader.consume();
  const trimmed = header.trimStart();
  const { status, summary } = parseItemHeader(trimmed);

  let estimatedTime = 0;
  let actualTime = 0;
  let definition = "";
  let timeline = "";
  let result = "";
  const subItems: DailyItem[] = [];
  let currentSection: ItemSection = "none";

  const defLines: string[] = [];
  const tlLines: string[] = [];
  const resLines: string[] = [];

  while (!reader.isAtEnd) {
    const next = reader.peek();
    if (!next.trim()) { reader.skip(); continue; }

    const indent = countTabs(next);
    if (indent <= taskIndent) break;

    const content = next.substring(taskIndent + 1);

    // Sub-task
    if (indent === taskIndent + 1 && isTaskLine(content)) {
      currentSection = "none";
      subItems.push(parseItem(reader, diag, taskIndent + 1, treeLevel + 1));
      continue;
    }

    reader.consume();

    // TIME annotation
    if (content.startsWith(TIME_TOKEN)) {
      currentSection = "none";
      const parsed = parseTimeAnnotation(content);
      if (parsed) {
        estimatedTime = parsed.estimated;
        actualTime = parsed.actual;
      } else {
        diag.push({
          lineNumber: reader.currentLineNumber - 1,
          lineContent: next,
          message: "Could not parse TIME annotation. Expected: > #TIME: ESTIMATED [hh:mm:ss] | ACTUAL [hh:mm:ss]",
          severity: "warning",
        });
      }
      continue;
    }

    if (content === DEFINITION_TOKEN) { currentSection = "definition"; continue; }
    if (content === TIMELINE_TOKEN)   { currentSection = "timeline";   continue; }
    if (content === RESULT_TOKEN)     { currentSection = "result";     continue; }

    switch (currentSection) {
      case "definition": defLines.push(content); break;
      case "timeline":   tlLines.push(content);  break;
      case "result":     resLines.push(content); break;
      default:
        diag.push({
          lineNumber: reader.currentLineNumber - 1,
          lineContent: next,
          message: `Unrecognised line inside item "${summary}" — ignored.`,
          severity: "warning",
        });
    }
  }

  const computedActualTime = actualTime +
    subItems.reduce((acc, s) => acc + s.computedActualTime, 0);

  estimatedTime = estimatedTime +
    subItems.reduce((acc, s) => acc + s.estimatedTime, 0);


  return {
    summary,
    status,
    estimatedTime,
    actualTime,
    computedActualTime,
    treeLevel,
    definition: defLines.join("\n").trimEnd(),
    timeline: tlLines.join("\n").trimEnd(),
    result: resLines.join("\n").trimEnd(),
    subItems,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function isTaskLine(trimmedLine: string): boolean {
  return ALL_STATUSES.some(s => trimmedLine.startsWith(`- ${s}:`));
}

function parseItemHeader(trimmed: string): { status: DailyItemStatus; summary: string } {
  for (const s of ALL_STATUSES) {
    const prefix = `- ${s}:`;
    if (trimmed.startsWith(prefix)) {
      return { status: s, summary: trimmed.slice(prefix.length).trim() };
    }
  }
  return { status: "TODO", summary: trimmed.replace(/^-\s*/, "").trim() };
}

function parseTimeAnnotation(content: string): { estimated: number; actual: number } | null {
  const raw = content.slice(TIME_TOKEN.length).trim();
  const pipeIdx = raw.indexOf("|");
  if (pipeIdx < 0) return null;

  const estPart = raw.slice(0, pipeIdx).trim();
  const actPart = raw.slice(pipeIdx + 1).trim();

  const est = parseTimePart(estPart, "ESTIMATED");
  const act = parseTimePart(actPart, "ACTUAL");
  if (est === null || act === null) return null;

  return { estimated: est, actual: act };
}

function parseTimePart(part: string, keyword: string): number | null {
  const stripped = part.replace(keyword, "").trim();
  const match = stripped.match(/^\[(\d{1,2}):(\d{2}):(\d{2})\]$/);
  if (!match) return null;
  const [, h, m, s] = match.map(Number);
  return h * 3600 + m * 60 + s;
}

// ── Utility ───────────────────────────────────────────────────────────────────

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function makeDiagnostic(
  reader: LineReader,
  message: string,
  severity: "warning" | "error" = "warning"
): ParseDiagnostic {
  return {
    lineNumber: reader.currentLineNumber,
    lineContent: reader.isAtEnd ? "<EOF>" : reader.peek(),
    message,
    severity,
  };
}
