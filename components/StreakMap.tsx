import HeatMap from '@uiw/react-heat-map';
import Tooltip from '@uiw/react-tooltip';

import type { Daily, DailyScore } from "../parser/types";
import { useEffect, useMemo, useState } from 'react';

interface Props {
  days: Daily[] | null;
  scores: DailyScore[] | null;
}



const xvalue = [
   { date: '2026/01/01', count:1 },
   { date: '2026/01/03', count:1 },
//    ...[...Array(17)].map((_, idx) => ({ date: `2016/01/${idx + 10}`, count: idx, })),
//    ...[...Array(17)].map((_, idx) => ({ date: `2016/02/${idx + 10}`, count: idx, })),
//   { date: '2016/05/12', count:2 },
//    { date: '2016/05/01', count:5 },
//    { date: '2016/05/02', count:5 },
//    { date: '2016/05/03', count:1 },
//    { date: '2016/05/04', count:11 },
//    { date: '2016/05/08', count:32 },
];


export function StreakMap({ days, scores }: Props) {

const [value, setValue] = useState<any>(
    [
    { date: '2026/01/01', count:1 },
    { date: '2026/02/01', count:1 }
    ]
);

const catFilter = "Personal";
const taskSummaryFilter = 
//"mancat 2200 calorii zilnic";
//"mers la sala";
"GABA mia";
//"1h40min, facut 8000 pasi pe zi";
//"luat glicemia cu aparatul OneTouch";
//"citit carti dezvoltare personala sau alte subiecte";

    useEffect(() => {
        console.log("days modified in StreakMap:", days);
        const tempData:Array<any> = [];
        
        days?.forEach((curDay) => {
            let isActive: boolean = false;
            let curDate: string = "";

            curDay.categories.forEach((cat) => {
                if(cat.name === catFilter) {
                    cat.items.forEach((task) => {
                        if(task.summary === taskSummaryFilter
                            && task.status === "OK"
                        ) {
                            isActive = true;
                        }
                    })
                }
            })

            const tokens = curDay.date.split("-");
            const pointDate = `${tokens[0]}/${tokens[1]}/${tokens[2]}`;
            if(isActive) {
                tempData.push(
                    { date: pointDate, count: 1 }
                )
            }
        })


        setValue(tempData);
    }, [days]);

    let x = useMemo(() => (
        <div className="streak-map">
            <div className="section-title">Streak Map / 2026 - {taskSummaryFilter}</div>

            <div className="item-list">
            <HeatMap
// panelColors={['#f4decd', '#e4b293', '#d48462', '#c2533a', '#ad001d', '#6c0012']}
style={{ color: '#ffffff' }}
                value={value}
                width={750}
                height={150}
                space={3}
                weekLabels={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
                startDate={new Date('2026/01/01')}
                endDate={new Date('2026/12/31')}
                monthPlacement="top"
                monthLabels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']}
                rectRender={(props, data) => {
                if (!data.count) return <rect {...props} />;
                return (
                <Tooltip placement="top" content={`date ${data.date} | count: ${data.count || 0}`}>
                    <rect {...props} />
                </Tooltip>
                );
            }}
            />
            </div>
        </div>
    ),[value, taskSummaryFilter]);

    return x;
}