import { useMemo, useState } from "react";
import { formatDuration } from "../parser/DailyParser";
import { Daily, DailyScore } from "../parser/types";

const STATUS_COLORS: Record<string, string> = {
  OK: "var(--green)",
  NOK: "var(--red)",
  IN_PROGRESS: "var(--yellow)",
  TODO: "var(--muted)",
  OVERDUE: "var(--orange)",
  ON_HOLD: "var(--cyan)",
};

interface Props {
  pastDays: Daily[] | null;
  pastScores: DailyScore[] | null;
}

export function PastDays({pastDays, pastScores}:Props) {
  let allItems: Array<any> = [
    {
      status: "OK",
      treeLevel: 1,
      summary: "#All Past Days",
      computedActualTime: 10,
    },
    {
      status: "OK",
      treeLevel: 1,
      summary: "#08.31.2026",
      computedActualTime: 10,
    },
    {
      status: "OK",
      treeLevel: 1,
      summary: "#08.30.2026",
      computedActualTime: 10,
    },
    {
      status: "OK",
      treeLevel: 1,
      summary: "#08.29.2026",
      computedActualTime: 10,
    },
    ...[...Array(200)].map((_, idx) => (
        {
        status: "OK",
        treeLevel: 1,
        summary: "#08.28.2026",
        computedActualTime: 10,
        }
    )),
    
  ];

  const [selectedItem, setSelectedItem] = useState<string | null>(null);

let pastDaysContent = useMemo(() => (
    <>
      {/* Item list */}
      <div className="dashboard">
        <div className="section-title">Past Days</div>
            <div className="item-row">There are
            <span
              style={{ color: "var(--green)" }}
            >241</span> tracked days
            </div>

        <div className="section-title">Items</div>
        <div className="item-list">
          {allItems.map((item, i) => (
            <div
              key={i}
              className={`item-row ${selectedItem === item.summary ? "selected" : ""}`}
              style={{ paddingLeft: `${item.treeLevel * 12}px` }}
              onClick={() => {
                    console.log("Clicked item:", item.summary);
                    setSelectedItem(item.summary);
                    }
                }
            >
            <span className="item-summary">{item.summary}</span>

                {item.summary !== "#All Past Days" && (
                  <>
                    <span className="item-statistic">Score</span> 

                    <span
                        
                        style={{ color: STATUS_COLORS[item.status] ?? "var(--muted)" }}
                    >
                        {/* {item.status} */}
                        34%
                    </span>
                    
                    <span className="item-statistic">Count </span> 
                    
                    <span
                        
                        style={{ color: STATUS_COLORS[item.status] ?? "var(--muted)" }}
                    >
                        {/* {item.status} */}
                        56%
                    </span>
                  </>
                )}

              {/* 
              {item.computedActualTime > 0 && (
                <span className="item-time">
                  {formatDuration(item.computedActualTime)}
                </span>
              )}

              {item.computedActualTime > 0 && (
                <span className="item-time">
                  {formatDuration(item.computedActualTime)}
                </span>
              )} */}
            </div>
          ))}
        </div>
      </div>
    </>
),[allItems, selectedItem]);

  return pastDaysContent;
}
