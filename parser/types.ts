// ── Enums ─────────────────────────────────────────────────────────────────────

export type DailyItemStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "OK"
  | "NOK"
  | "OVERDUE"
  | "ON_HOLD";

export type ItemSection = "none" | "definition" | "timeline" | "result";

// ── Domain models (immutable, mirrors C# records) ─────────────────────────────

export interface DailyItem {
  readonly summary: string;
  readonly status: DailyItemStatus;
  readonly estimatedTime: number;   // seconds
  readonly actualTime: number;      // seconds
  readonly computedActualTime: number; // seconds — own + recursive sub-item sum
  readonly treeLevel: number;
  readonly definition: string;
  readonly timeline: string;
  readonly result: string;
  readonly subItems: readonly DailyItem[];
}

export interface DailyCategory {
  readonly name: string;
  readonly items: readonly DailyItem[];
}

export interface Daily {
  readonly date: string;           // ISO: "2025-10-30"
  readonly rawDateToken: string;   // "#10.30.2025"
  readonly categories: readonly DailyCategory[];
  readonly rawDayContent: string; // full raw content of the day, for reference
}

// ── Score models ──────────────────────────────────────────────────────────────

export interface DailyCategoryScore {
  readonly categoryName: string;
  readonly categoryScore: number;    // 0-100
  readonly countItemsScore: number;  // 0-100
  readonly itemCount: number;
  readonly estimatedTime: number;
  readonly actualTime: number;
  readonly computedActualTime: number;
}

export interface DailyScore {
  readonly date: string;
  readonly dayScore: number;
  readonly dayCountItemsScore: number;
  readonly estimatedTime: number;
  readonly actualTime: number;
  readonly computedActualTime: number;
  readonly categoryScores: readonly DailyCategoryScore[];
}

// ── Parse result ──────────────────────────────────────────────────────────────

export type DiagnosticSeverity = "warning" | "error";

export interface ParseDiagnostic {
  readonly lineNumber: number;
  readonly lineContent: string;
  readonly message: string;
  readonly severity: DiagnosticSeverity;
}

export interface ParseResult<T> {
  readonly value: T;
  readonly diagnostics: readonly ParseDiagnostic[];
  readonly hasErrors: boolean;
  readonly hasWarnings: boolean;
}
