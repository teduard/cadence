import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, LabelList
} from "recharts";
import type { Daily, DailyScore } from "../parser/types";
import { formatDuration } from "../parser/DailyParser";

interface Props {
  day: Daily | null;
  score: DailyScore | null;
  days: Daily[] | null;
  scores: DailyScore[] | null;
}

// Matches the PDF palette
const CAT_COLORS = [
  "#4CAF50", "#E53935", "#E91E8C",
  "#5C6BC0", "#FF9800", "#00BCD4", "#9C27B0", "#795548",
];

const STATUS_COLORS: Record<string, string> = {
  OK:          "var(--green)",
  NOK:         "var(--red)",
  IN_PROGRESS: "var(--yellow)",
  TODO:        "var(--muted)",
  OVERDUE:     "var(--orange)",
  ON_HOLD:     "var(--cyan)",
};

// ── Score ring (SVG, CSS-animated) ────────────────────────────────────────────

function ScoreRing({ value, label }: { value: number; label: string }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const fill = (value / 100) * circ;
  const color = value >= 70 ? "var(--green)" : value >= 40 ? "var(--yellow)" : "var(--red)";
  return (
    <div className="score-ring-wrap">
      <svg width="72" height="72" viewBox="0 0 84 84">
        <circle cx="42" cy="42" r={r} fill="none" stroke="var(--border)" strokeWidth="4" />
        <circle
          cx="42" cy="42" r={r}
          fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${fill} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 42 42)"
          style={{ transition: "stroke-dasharray 0.5s ease" }}
        />
        <text x="42" y="42" textAnchor="middle" fontSize="20" fontWeight="700" fill={color}>
          {value.toFixed(0)}%
        </text>
      </svg>
      <span className="score-ring-label">{label}</span>
    </div>
  );
}

// ── Custom tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-name">{d.name}</div>
      <div className="chart-tooltip-row">
        <span>Quality</span>
        <span style={{ color: d.color }}>{d.quality.toFixed(1)}%</span>
      </div>
      <div className="chart-tooltip-row">
        <span>Count</span>
        <span style={{ color: "var(--cyan)" }}>{d.count.toFixed(1)}%</span>
      </div>
      <div className="chart-tooltip-row">
        <span>Items</span>
        <span>{d.itemCount}</span>
      </div>
      <div className="chart-tooltip-row">
        <span>Actual</span>
        <span>{formatDuration(d.actual)}</span>
      </div>
    </div>
  );
}

// ── Custom bar label (percentage above bar) ───────────────────────────────────

function BarLabel(props: any) {
  const { x, y, width, value } = props;
  if (!value) return null;
  return (
    <text
      x={x + width / 2} y={y - 4}
      textAnchor="middle"
      fill="var(--text)"
      fontSize={10}
      fontFamily="JetBrains Mono, monospace"
      fontWeight="700"
    >
      {value.toFixed(0)}%
    </text>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function DashboardPanel({ day, score, days, scores }: Props) {
  if (!day || !score) {
    return (
      <div className="panel-empty">
        <span className="empty-icon">◈</span>
        <p>Start typing your daily log<br />to see your dashboard.</p>
      </div>
    );
  }



  // Build chart data — one entry per category
  const chartData = score.categoryScores.map((c, i) => ({
    name:      c.categoryName,
    quality:   c.categoryScore,
    count:     c.countItemsScore,
    itemCount: c.itemCount,
    actual:    c.computedActualTime,
    color:     CAT_COLORS[i % CAT_COLORS.length],
  }));

  // Flatten all items for item list
  const allItems = day.categories.flatMap(cat =>
    cat.items.map(item => ({ ...item, categoryName: cat.name }))
  );

  //console.log("days:", days);
  console.log("scores:", scores);
  //console.log("allItems:", allItems);

  const dayCount = days?.length ?? 0;

    let MAX_DAYS = Math.min(500, dayCount-1);

  const summaryItems = day.categories.flatMap(cat =>
    cat.items.map(item => ({ ...item, categoryName: cat.name }))
  );


  summaryItems.forEach(item => {
        item.computedActualTime = 0;
        item.actualTime = 0;
        item.estimatedTime = 0;
    })

  console.log("initial summaryItems", summaryItems);

  for(let i=1;i<Math.min(MAX_DAYS+1, dayCount);i++) {
    const curDay = days![i];
  
    const curDayItems = curDay.categories.flatMap(cat =>
      cat.items.map(item => ({ ...item, categoryName: cat.name }))
    );

    console.log("curDayItems", curDayItems);

    summaryItems.forEach(item => {
      const curDay = curDayItems.find(pi => pi.summary === item.summary);
      if (curDay) {
        item.computedActualTime += curDay.computedActualTime;

        if(curDay.status === "OK") {
          item.actualTime ++;
        }

        item.estimatedTime ++;
      }
    })
  }

  summaryItems.forEach(item => {
        item.computedActualTime = Math.floor(item.computedActualTime / item.estimatedTime);
    })

  console.log("Math.min(",MAX_DAYS,", dayCount-1) = ", Math.min(MAX_DAYS, dayCount-1));
  console.log("summaryItems (past ",MAX_DAYS," days):", summaryItems);

let categories = ["monitorizat timpul de somn",
            "documentat diverse, youtube, sau video, divertisment, altceva",
            "placeholder activitati rutina pana la glicemie, inclusiv",
            "mers la sala",
            "mancat 2200 calorii zilnic",
            "1h40min, facut 8000 pasi pe zi"
          ];

    let totalTime = summaryItems.reduce((acc, item) => {

      if(
          categories.includes(item.summary) && item.computedActualTime > 0) {
                  return acc + item.computedActualTime;
          }

                  return acc;
                }, 0);


      let totalCategoryTime = score.categoryScores.reduce((acc, item) => {
        return acc + (item.computedActualTime ? item.computedActualTime : 0);
      },0);
  
  return (
    <div className="dashboard">
      <div className="dashboard-date">{day.rawDateToken}</div>

      {/* Score rings */}
      <div className="score-rings">
        <ScoreRing value={score.dayScore}           label="Quality" />
        <ScoreRing value={score.dayCountItemsScore} label="Quantity" />
      </div>

      {/* Time row */}
      <div className="time-row">
        <div className="time-cell">
          <span className="time-label">Estimated&nbsp;</span>
          <span className="time-value">{formatDuration(score.estimatedTime)}</span>
        </div>
        <div className="time-cell">
          <span className="time-label">Actual&nbsp;</span>
          <span className="time-value" style={{ color: "var(--green)" }}>
            {formatDuration(score.computedActualTime)}
          </span>
        </div>
      </div>

      {/* ── Live bar chart ── */}
      <div className="section-title">Category Scores&nbsp;</div>
      <div className="chart-wrap">
        <ResponsiveContainer width={600} height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 8, left: -24, bottom: 0 }}
            barCategoryGap="25%"
          >
            <CartesianGrid
              vertical={false}
              stroke="var(--border)"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="name"
              tick={{ fill: "var(--muted)", fontSize: 18, fontFamily: "JetBrains Mono, monospace" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "var(--muted)", fontSize: 18, fontFamily: "JetBrains Mono, monospace" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
            />
            {/* Quality score bar */}
            <Bar dataKey="quality" radius={[3, 3, 0, 0]} isAnimationActive={true} animationDuration={400}>
              <LabelList content={<BarLabel />} />
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} fillOpacity={0.9} />
              ))}
            </Bar>
            {/* Count score bar — lighter overlay */}
            <Bar dataKey="count" radius={[2, 2, 0, 0]} isAnimationActive={true} animationDuration={400}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} fillOpacity={0.25} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="chart-legend">
          <span className="legend-item">
            <span className="legend-dot" style={{ opacity: 0.9 }} />
            Quality score
          </span>
          <span className="legend-item">
            <span className="legend-dot" style={{ opacity: 0.25 }} />
            Count score
          </span>
        </div>
      </div>

      {/* Item list */}
      <div className="section-title">Items</div>
      <div className="item-list">
        {allItems.map((item, i) => (
          <div
            key={i}
            className="item-row"
            style={{ paddingLeft: `${item.treeLevel * 12}px` }}
          >
            <span
              className="item-status"
              style={{ color: STATUS_COLORS[item.status] ?? "var(--muted)" }}
            >
              {item.status}
            </span>
            <span className="item-summary">{item.summary}</span>
            {item.computedActualTime > 0 && (
              <span className="item-time">{formatDuration(item.computedActualTime)}</span>
            )}
          </div>
        ))}
      </div>

      {/* Past MAX_DAYS-days category stats */}
      <div className="section-title">Current day {day.rawDateToken} / Category computed_Actual_Time</div>
      
      <div className="item-list">
        {score.categoryScores.map((cat, i) => {
          console.log("cat [",i,"] = ", cat);

          // const catScore = summaryItems.filter(item => item.summary === cat);
          // const totalCount = catScore.length;
          // const okCount = catScore.filter(item => item.status === "OK").length;
          // const computedTime = catScore.reduce((acc, item) => acc + item.computedActualTime, 0);
          return (
            <div key={i} className="item-row">
              <span className="item-summary">{cat.categoryName}</span>
              <span className="item-time">{Math.floor(cat.computedActualTime * 100/totalCategoryTime)}%</span>
              <span className="item-time">{formatDuration(cat.computedActualTime)}</span>
            </div>
          );
        })}

        <hr style={{ border: "1px solid var(--muted)" }}/>
          <div
              key={"total"}
              className="item-row">
                 <span className="item-status"></span>
                 <span className="item-summary">Total category time</span>
              <span className="item-time">{formatDuration(totalCategoryTime)}</span>
          </div>
      </div>

      {/* Past MAX_DAYS-days stats */}
      <div className="section-title">Past {MAX_DAYS}-days / Task stats</div>
      <div className="item-list">
        {summaryItems.map((item, i) => (
          <>
          {
          categories
          .includes(item.summary) &&
          <div
            key={i}
            className="item-row"
            style={{ paddingLeft: `${item.treeLevel * 12}px` }}
          >
            <span
              className="item-status"
              style={{ color: "var(--green)" }}
            >
              {/* how many time the status was OK / how many times the task appeared */}
              {item.actualTime} OK 
              <span
              style={{ color: "var(--text)" }}
            >
              &nbsp;/ {item.estimatedTime}
            </span>
            </span>
            
            <span className="item-summary">{item.summary}</span>
            {item.computedActualTime > 0 && (
              <span className="item-time">{formatDuration(item.computedActualTime)}</span>
            )}
          </div>
          }
          </>
        ))}

        <hr style={{ border: "1px solid var(--muted)" }}/>
          <div
              key={"total"}
              className="item-row">
                 <span className="item-status"></span>
                 <span className="item-summary">Total time</span>
              <span className="item-time">{formatDuration(totalTime)}</span>
          </div>

      </div>
    </div>
  );
}
