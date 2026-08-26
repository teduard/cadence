import {
  Document, Page, Text, View, StyleSheet, Font
} from "@react-pdf/renderer";
import type { Daily, DailyScore, DailyCategoryScore } from "../parser/types";
import { formatDuration } from "../parser/DailyParser";

// ── Styles ────────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#222222",
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 36,
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 2,
    borderBottomColor: "#888888",
    paddingBottom: 6,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#333",
    padding: 4,
  },
  headerTitleName: {
    fontSize: 18,
    backgroundColor: "#CCCCCC",
    padding: 40,
  },

  headerSubTitle: {
    fontSize: 12,
    color: "#666666",
    padding: 4,
  },
  headerDate: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#111111",
  },

  // ── Scores ──
  scoresRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginBottom: 12,
    marginTop: 4,
  },
  scoreText: {
    fontSize: 10,
    color: "#3B82F6",
    fontFamily: "Helvetica-Bold",
  },

  // ── Category block ──
  categoryBlock: {
    marginBottom: 10,
  },
  categoryHeader: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#3B82F6",
    marginBottom: 3,
  },

  // ── Item row ──
  itemRow: {
    flexDirection: "row",
    marginBottom: 1,
    paddingLeft: 12,
  },
  itemBullet: {
    width: 8,
    color: "#444444",
  },
  itemStatus: {
    fontFamily: "Helvetica-Bold",
    marginRight: 4,
    minWidth: 70,
  },
  itemSummary: {
    flex: 1,
    color: "#222222",
  },
  itemComputed: {
    color: "#666666",
    minWidth: 80,
    textAlign: "right",
  },

  // ── Sub-item indentation ──
  subItemRow: {
    paddingLeft: 24,
  },

  // ── Time summary ──
  timeSummary: {
    marginTop: 12,
    marginBottom: 12,
    gap: 2,
  },
  timeText: {
    fontSize: 8,
    color: "#888888",
  },

  // ── Chart section ──
  chartSection: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    padding: 12,
  },
  chartRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    marginBottom: 8,
    height: 100,
  },
  chartCol: {
    alignItems: "center",
    width: 70,
  },
  chartPctText: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#111111",
    marginBottom: 4,
  },
  chartBarWrap: {
    width: 60,
    height: 72,
    justifyContent: "flex-end",
  },
  chartBarBg: {
    width: 60,
    backgroundColor: "#F3F4F6",
    position: "absolute",
    bottom: 0,
    top: 0,
  },
  chartBarFill: {
    width: 60,
    position: "absolute",
    bottom: 0,
  },
  chartLabel: {
    fontSize: 9,
    color: "#888888",
    marginTop: 6,
  },

  // ── Page number ──
  pageNumber: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 8,
    color: "#AAAAAA",
  },
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#DDDDDD",
    marginVertical: 6,
  },
});

// ── Category colors (matches your screenshot) ─────────────────────────────────
const CAT_COLORS = [
  "#4CAF50", // green
  "#E53935", // red
  "#E91E8C", // pink
  "#5C6BC0", // indigo
  "#FF9800", // orange
  "#00BCD4", // cyan
  "#9C27B0", // purple
  "#795548", // brown
];

const STATUS_COLOR: Record<string, string> = {
  OK:          "#4CAF50",
  NOK:         "#E53935",
  IN_PROGRESS: "#F59E0B",
  TODO:        "#888888",
  OVERDUE:     "#D97706",
  ON_HOLD:     "#56B6C2",
};

// ── Components ────────────────────────────────────────────────────────────────

function ItemLine({ item, indent = 0 }: {
  item: { status: string; summary: string; computedActualTime: number; subItems: any[] };
  indent?: number;
}) {
  return (
    <>
      <View style={[S.itemRow, { paddingLeft: 12 + indent * 12 }]}>
        <Text style={S.itemBullet}>-</Text>
        <Text style={[S.itemStatus, { color: STATUS_COLOR[item.status] ?? "#888" }]}>
          {item.status}:
        </Text>
        <Text style={S.itemSummary}>{item.summary}</Text>
        <Text style={S.itemComputed}>
          [Computed: {formatDuration(item.computedActualTime)}]
        </Text>
      </View>
      {item.subItems?.map((sub: any, i: number) => (
        <ItemLine key={i} item={sub} indent={indent + 1} />
      ))}
    </>
  );
}

function CategoryBlock({
  category,
  score,
  colorIndex,
}: {
  category: { name: string; items: readonly any[] };
  score: DailyCategoryScore;
  colorIndex: number;
}) {
  const color = CAT_COLORS[colorIndex % CAT_COLORS.length];

  return (
    <View style={S.categoryBlock}>
      <Text style={[S.categoryHeader, { color }]}>
        - {category.name} [{category.items.length} count]
        {" "}[score: {score.categoryScore.toFixed(1)}%]
        {" "}[ESTIMATED: {formatDuration(score.estimatedTime)}]
        {" "}[Computed: {formatDuration(score.computedActualTime)}]
      </Text>
      {category.items.map((item, i) => (
        <ItemLine key={i} item={item} />
      ))}
    </View>
  );
}

function ChartBars({ categoryScores }: { categoryScores: readonly DailyCategoryScore[] }) {
  const maxScore = Math.max(...categoryScores.map(c => c.categoryScore), 1);

  return (
    <View style={S.chartSection}>
      <View style={S.chartRow}>
        {categoryScores.map((cat, i) => {
          const color = CAT_COLORS[i % CAT_COLORS.length];
          const fillHeight = (cat.categoryScore / 100) * 72;
          const bgHeight = 72;

          return (
            <View key={cat.categoryName} style={S.chartCol}>
              <Text style={S.chartPctText}>{cat.categoryScore.toFixed(1)}%</Text>
              <View style={S.chartBarWrap}>
                <View style={[S.chartBarBg, { height: bgHeight }]} />
                <View style={[S.chartBarFill, { height: fillHeight, backgroundColor: color }]} />
              </View>
            </View>
          );
        })}
      </View>
      {/* X-axis labels */}
      <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
        {categoryScores.map((cat) => (
          <Text key={cat.categoryName} style={[S.chartLabel, { width: 70, textAlign: "center" }]}>
            {cat.categoryName}
          </Text>
        ))}
      </View>
    </View>
  );
}

// ── Main Document ─────────────────────────────────────────────────────────────

interface Props {
  day: Daily;
  score: DailyScore;
}

export function DailyPdfDocument({ day, score }: Props) {
  return (
    <Document>
      <Page size="A4" style={S.page}>

        {/* Header */}
        <View style={S.header}>
          <Text style={S.headerTitle}>
            <Text style={S.headerTitleName}>&nbsp;Cadence&nbsp;</Text>
            <Text style={S.headerSubTitle}>&nbsp;&nbsp;Journal Editor</Text>
          </Text>
          
          <Text style={S.headerDate}>{day.rawDateToken}</Text>
        </View>

        {/* Day scores */}
        <View style={S.scoresRow}>
          <Text style={S.scoreText}>DayScore {score.dayScore.toFixed(1)}%</Text>
          <br/>
          <Text style={S.scoreText}>DayCountItemsScore {score.dayCountItemsScore.toFixed(1)}%</Text>
        </View>

        {/* Categories + items */}
        {day.categories.map((cat, i) => (
          <CategoryBlock
            key={cat.name}
            category={cat}
            score={score.categoryScores[i] ?? {
              categoryScore: 0, countItemsScore: 0, itemCount: 0,
              estimatedTime: 0, actualTime: 0, computedActualTime: 0,
              categoryName: cat.name,
            }}
            colorIndex={i}
          />
        ))}

        <View style={S.divider} />

        {/* Time summary */}
        <View style={S.timeSummary}>
          <Text style={S.timeText}>Estimated time: {formatDuration(score.estimatedTime)}</Text>
          <Text style={S.timeText}>Computed Actual time: {formatDuration(score.computedActualTime)}</Text>
        </View>

        {/* Bar chart */}
        <ChartBars categoryScores={score.categoryScores} />

        {/* Page number */}
        <Text
          style={S.pageNumber}
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}
