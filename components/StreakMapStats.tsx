import HeatMap from '@uiw/react-heat-map';
import Tooltip from '@uiw/react-tooltip';

import type { Daily, DailyScore } from "../parser/types";
import { useEffect, useMemo, useState } from 'react';

interface Props {
  days: Daily[] | null;
  scores: DailyScore[] | null;
  statType: string;
}

const statsData = [
   //{ date: '2026/01/01', count:1 },
   //{ date: '2026/01/03', count:1 },
    //    ...[...Array(17)].map((_, idx) => ({ date: `2016/01/${idx + 10}`, count: idx, })),
    //    ...[...Array(17)].map((_, idx) => ({ date: `2016/02/${idx + 10}`, count: idx, })),

    { date: '2026/01/01', steps:  8513 , phone_time: 27 },
    { date: '2026/01/02', steps:  8774 , phone_time: 78 },
    { date: '2026/01/03', steps:  2539 , phone_time: 66 },
    { date: '2026/01/04', steps:  2509 , phone_time: 103 },
    { date: '2026/01/05', steps:  3758 , phone_time: 95 },
    { date: '2026/01/06', steps:  7998 , phone_time: 182 },
    { date: '2026/01/07', steps:  10753 , phone_time: 141 },
    { date: '2026/01/08', steps:  5055 , phone_time: 135 },
    { date: '2026/01/09', steps:  3434 , phone_time: 102 },
    { date: '2026/01/10', steps:  6821 , phone_time: 103 },
    { date: '2026/01/11', steps:  8160 , phone_time: 107 },
    { date: '2026/01/12', steps:  3239 , phone_time: 183 },
    { date: '2026/01/13', steps:  8373 , phone_time: 89 },
    { date: '2026/01/14', steps:  7323 , phone_time: 163 },
    { date: '2026/01/15', steps:  26691 , phone_time: 159 },
    { date: '2026/01/16', steps:  3152 , phone_time: 70 },
    { date: '2026/01/17', steps:  13169 , phone_time: 122 },
    { date: '2026/01/18', steps:  12658 , phone_time: 143 },
    { date: '2026/01/19', steps:  10458 , phone_time: 85 },
    { date: '2026/01/20', steps:  8190 , phone_time: 87 },
    { date: '2026/01/21', steps:  10006 , phone_time: 123 },
    { date: '2026/01/22', steps:  13445 , phone_time: 34 },
    { date: '2026/01/23', steps:  8342 , phone_time: 96 },
    { date: '2026/01/24', steps:  15261 , phone_time: 102 },
    { date: '2026/01/25', steps:  9491 , phone_time: 243 },
    { date: '2026/01/26', steps:  11086 , phone_time: 132 },
    { date: '2026/01/27', steps:  9757 , phone_time: 85 },
    { date: '2026/01/28', steps:  8070 , phone_time: 99 },
    { date: '2026/01/29', steps:  8838 , phone_time: 180 },
    { date: '2026/01/30', steps:  11344 , phone_time: 103 },
    { date: '2026/01/31', steps:  14885 , phone_time: 167 },
    { date: '2026/02/01', steps:  8525 , phone_time: 134 },
    { date: '2026/02/02', steps:  8813 , phone_time: 131 },
    { date: '2026/02/03', steps:  18170 , phone_time: 136 },
    { date: '2026/02/04', steps:  8310 , phone_time: 123 },
    { date: '2026/02/05', steps:  11851 , phone_time: 152 },
    { date: '2026/02/06', steps:  12707 , phone_time: 178 },
    { date: '2026/02/07', steps:  11114 , phone_time: 140 },
    { date: '2026/02/08', steps:  16608 , phone_time: 145 },
    { date: '2026/02/09', steps:  8877 , phone_time: 118 },
    { date: '2026/02/10', steps:  9627 , phone_time: 86 },
    { date: '2026/02/11', steps:  8546 , phone_time: 124 },
    { date: '2026/02/12', steps:  10201 , phone_time: 140 },
    { date: '2026/02/13', steps:  8292 , phone_time: 153 },
    { date: '2026/02/14', steps:  9064 , phone_time: 210 },
    { date: '2026/02/15', steps:  10092 , phone_time: 260 },
    { date: '2026/02/16', steps:  8207 , phone_time: 129 },
    { date: '2026/02/17', steps:  5293 , phone_time: 156 },
    { date: '2026/02/18', steps:  4076 , phone_time: 92 },
    { date: '2026/02/19', steps:  6940 , phone_time: 159 },
    { date: '2026/02/20', steps:  9090 , phone_time: 117 },
    { date: '2026/02/21', steps:  10087 , phone_time: 182 },
    { date: '2026/02/22', steps:  13194 , phone_time: 218 },
    { date: '2026/02/23', steps:  9947 , phone_time: 164 },
    { date: '2026/02/24', steps:  12219 , phone_time: 153 },
    { date: '2026/02/25', steps:  9994 , phone_time: 129 },
    { date: '2026/02/26', steps:  3155 , phone_time: 247 },
    { date: '2026/02/27', steps:  7944 , phone_time: 78 },
    { date: '2026/02/28', steps:  9196 , phone_time: 102 },
    { date: '2026/02/29', steps:  9196 , phone_time: 102 },
    { date: '2026/03/01', steps:  9653 , phone_time: 158 },
    { date: '2026/03/02', steps:  9494 , phone_time: 183 },
    { date: '2026/03/03', steps:  6747 , phone_time: 112 },
    { date: '2026/03/04', steps:  12920 , phone_time: 97 },
    { date: '2026/03/05', steps:  12696 , phone_time: 224 },
    { date: '2026/03/06', steps:  11184 , phone_time: 163 },
    { date: '2026/03/07', steps:  10873 , phone_time: 252 },
    { date: '2026/03/08', steps:  15316 , phone_time: 280 },
    { date: '2026/03/09', steps:  13837 , phone_time: 132 },
    { date: '2026/03/10', steps:  5661 , phone_time: 191 },
    { date: '2026/03/11', steps:  3976 , phone_time: 183 },
    { date: '2026/03/12', steps:  8447 , phone_time: 192 },
    { date: '2026/03/13', steps:  10588 , phone_time: 274 },
    { date: '2026/03/14', steps:  10156 , phone_time: 200 },
    { date: '2026/03/15', steps:  14302 , phone_time: 218 },
    { date: '2026/03/16', steps:  9368 , phone_time: 180 },
    { date: '2026/03/17', steps:  8486 , phone_time: 131 },
    { date: '2026/03/18', steps:  8174 , phone_time: 103 },
    { date: '2026/03/19', steps:  8516 , phone_time: 291 },
    { date: '2026/03/20', steps:  10048 , phone_time: 311 },
    { date: '2026/03/21', steps:  12510 , phone_time: 225 },
    { date: '2026/03/22', steps:  18567 , phone_time: 148 },
    { date: '2026/03/23', steps:  4366 , phone_time: 147 },
    { date: '2026/03/24', steps:  8656 , phone_time: 177 },
    { date: '2026/03/25', steps:  10119 , phone_time: 161 },
    { date: '2026/03/26', steps:  9077 , phone_time: 268 },
    { date: '2026/03/27', steps:  12803 , phone_time: 254 },
    { date: '2026/03/28', steps:  14181 , phone_time: 222 },
    { date: '2026/03/29', steps:  6670 , phone_time: 294 },
    { date: '2026/03/30', steps:  9371 , phone_time: 172 },
    { date: '2026/03/31', steps:  16160 , phone_time: 285 },
    { date: '2026/04/01', steps:  8980 , phone_time: 212 },
    { date: '2026/04/02', steps:  8638 , phone_time: 216 },
    { date: '2026/04/03', steps:  9045 , phone_time: 219 },
    { date: '2026/04/04', steps:  3429 , phone_time: 543 },
    { date: '2026/04/05', steps:  11940 , phone_time: 294 },
    { date: '2026/04/06', steps:  9312 , phone_time: 290 },
    { date: '2026/04/07', steps:  6395 , phone_time: 283 },
    { date: '2026/04/08', steps:  14271 , phone_time: 244 },
    { date: '2026/04/09', steps:  17055 , phone_time: 232 },
    { date: '2026/04/10', steps:  10238 , phone_time: 339 },
    { date: '2026/04/11', steps:  20530 , phone_time: 255 },
    { date: '2026/04/12', steps:  6641 , phone_time: 418 },
    { date: '2026/04/13', steps:  16015 , phone_time: 402 },
    { date: '2026/04/14', steps:  14919 , phone_time: 210 },
    { date: '2026/04/15', steps:  11064 , phone_time: 311 },
    { date: '2026/04/16', steps:  13940 , phone_time: 201 },
    { date: '2026/04/17', steps:  2306 , phone_time: 185 },
    { date: '2026/04/18', steps:  919 , phone_time: 268 },
    { date: '2026/04/19', steps:  9499 , phone_time: 192 },
    { date: '2026/04/20', steps:  7043 , phone_time: 119 },
    { date: '2026/04/21', steps:  6333 , phone_time: 223 },
    { date: '2026/04/22', steps:  9025 , phone_time: 266 },
    { date: '2026/04/23', steps:  9227 , phone_time: 265 },
    { date: '2026/04/24', steps:  6995 , phone_time: 376 },
    { date: '2026/04/25', steps:  13701 , phone_time: 299 },
    { date: '2026/04/26', steps:  13307 , phone_time: 224 },
    { date: '2026/04/27', steps:  6418 , phone_time: 285 },
    { date: '2026/04/28', steps:  7504 , phone_time: 267 },
    { date: '2026/04/29', steps:  8011 , phone_time: 296 },
    { date: '2026/04/30', steps:  9845 , phone_time: 221 },
    { date: '2026/05/01', steps:  11512 , phone_time: 245 },
    { date: '2026/05/02', steps:  14524 , phone_time: 261 },
    { date: '2026/05/03', steps:  10824 , phone_time: 219 },
    { date: '2026/05/04', steps:  9100 , phone_time: 190 },
    { date: '2026/05/05', steps:  8812 , phone_time: 245 },
    { date: '2026/05/06', steps:  7548 , phone_time: 256 },
    { date: '2026/05/07', steps:  10488 , phone_time: 171 },
    { date: '2026/05/08', steps:  5178 , phone_time: 213 },
    { date: '2026/05/09', steps:  6769 , phone_time: 127 },
    { date: '2026/05/10', steps:  3590 , phone_time: 234 },
    { date: '2026/05/11', steps:  13759 , phone_time: 233 },
    { date: '2026/05/12', steps:  20133 , phone_time: 218 },
    { date: '2026/05/13', steps:  5303 , phone_time: 327 },
    { date: '2026/05/14', steps:  8763 , phone_time: 279 },
    { date: '2026/05/15', steps:  14354 , phone_time: 253 },
    { date: '2026/05/16', steps:  6613 , phone_time: 80 },
    { date: '2026/05/17', steps:  13300 , phone_time: 245 },
    { date: '2026/05/18', steps:  9307 , phone_time: 169 },
    { date: '2026/05/19', steps:  590 , phone_time: 255 },
    { date: '2026/05/20', steps:  7576 , phone_time: 306 },
    { date: '2026/05/21', steps:  16784 , phone_time: 205 },
    { date: '2026/05/22', steps:  5221 , phone_time: 276 },
    { date: '2026/05/23', steps:  16540 , phone_time: 275 },
    { date: '2026/05/24', steps:  10862 , phone_time: 353 },
    { date: '2026/05/25', steps:  9426 , phone_time: 188 },
    { date: '2026/05/26', steps:  11010 , phone_time: 187 },
    { date: '2026/05/27', steps:  10986 , phone_time: 220 },
    { date: '2026/05/28', steps:  7323 , phone_time: 236 },
    { date: '2026/05/29', steps:  9473 , phone_time: 191 },
    { date: '2026/05/30', steps:  9175 , phone_time: 282 },
    { date: '2026/05/31', steps:  13862 , phone_time: 189 },
    { date: '2026/06/01', steps:  13744 , phone_time: 257 },
    { date: '2026/06/02', steps:  15021 , phone_time: 154 },
    { date: '2026/06/03', steps:  3278 , phone_time: 311 },
    { date: '2026/06/04', steps:  12516 , phone_time: 75 },
    { date: '2026/06/05', steps:  13760 , phone_time: 184 },
    { date: '2026/06/06', steps:  11106 , phone_time: 272 },
    { date: '2026/06/07', steps:  21374 , phone_time: 228 },
    { date: '2026/06/08', steps:  9452 , phone_time: 262 },
    { date: '2026/06/09', steps:  17912 , phone_time: 288 },
    { date: '2026/06/10', steps:  10055 , phone_time: 132 },
    { date: '2026/06/11', steps:  14643 , phone_time: 164 },
    { date: '2026/06/12', steps:  13556 , phone_time: 224 },
    { date: '2026/06/13', steps:  14888 , phone_time: 240 },
    { date: '2026/06/14', steps:  16163 , phone_time: 160 },
    { date: '2026/06/15', steps:  9861 , phone_time: 102 },
    { date: '2026/06/16', steps:  14248 , phone_time: 119 },
    { date: '2026/06/17', steps:  10871 , phone_time: 85 },
    { date: '2026/06/18', steps:  21519 , phone_time: 70 },
    { date: '2026/06/19', steps:  13100 , phone_time: 139 },
    { date: '2026/06/20', steps:  11587 , phone_time: 17 },
    { date: '2026/06/21', steps:  10444 , phone_time: 186 },
    { date: '2026/06/22', steps:  9445 , phone_time: 75 },
    { date: '2026/06/23', steps:  4301 , phone_time: 115 },
    { date: '2026/06/24', steps:  6935 , phone_time: 209 },
    { date: '2026/06/25', steps:  18225 , phone_time: 101 },
    { date: '2026/06/26', steps:  14660 , phone_time: 104 },
    { date: '2026/06/27', steps:  24087 , phone_time: 138 },
    { date: '2026/06/28', steps:  14427 , phone_time: 131 },
    { date: '2026/06/29', steps:  13347 , phone_time: 216 },
    { date: '2026/06/30', steps:  14627 , phone_time: 158 },
    { date: '2026/07/01', steps:  4047 , phone_time: 150 },
    { date: '2026/07/02', steps:  13231 , phone_time: 258 },
    { date: '2026/07/03', steps:  12002 , phone_time: 293 },
    { date: '2026/07/04', steps:  11156 , phone_time: 249 },
    { date: '2026/07/05', steps:  10610 , phone_time: 418 },
    { date: '2026/07/06', steps:  9569 , phone_time: 122 },
    { date: '2026/07/07', steps:  8635 , phone_time: 250 },
    { date: '2026/07/08', steps:  9949 , phone_time: 237 },
    { date: '2026/07/09', steps:  10956 , phone_time: 191 },
    { date: '2026/07/10', steps:  12552 , phone_time: 203 },
    { date: '2026/07/11', steps:  10414 , phone_time: 175 },
    { date: '2026/07/12', steps:  6680 , phone_time: 465 },
    { date: '2026/07/13', steps:  10118 , phone_time: 91 },
    { date: '2026/07/14', steps:  12354 , phone_time: 192 },
    { date: '2026/07/15', steps:  12593 , phone_time: 279 },
    { date: '2026/07/16', steps:  17117 , phone_time: 315 },
    { date: '2026/07/17', steps:  35388 , phone_time: 108 },
    { date: '2026/07/18', steps:  9722 , phone_time: 84 },
    { date: '2026/07/19', steps:  19576 , phone_time: 235 },
    { date: '2026/07/20', steps:  17284 , phone_time: 200 },
    { date: '2026/07/21', steps:  17954 , phone_time: 87 },
    { date: '2026/07/22', steps:  12879 , phone_time: 126 },
    { date: '2026/07/23', steps:  12404 , phone_time: 103 },
    { date: '2026/07/24', steps:  12495 , phone_time: 243 },
    { date: '2026/07/25', steps:  19911 , phone_time: 23 },
    { date: '2026/07/26', steps:  9359 , phone_time: 169 },
    { date: '2026/07/27', steps:  12295 , phone_time: 131 },
    { date: '2026/07/28', steps:  12410 , phone_time: 190 },
    { date: '2026/07/29', steps:  26919 , phone_time: 188 },
    { date: '2026/07/30', steps:  11188 , phone_time: 283 },
    { date: '2026/07/31', steps:  14536 , phone_time: 180 },
    { date: '2026/08/01', steps:  27395 , phone_time: 206 },
    { date: '2026/08/02', steps:  18462 , phone_time: 174 },
    { date: '2026/08/03', steps:  21344 , phone_time: 95 },
    { date: '2026/08/04', steps:  27415 , phone_time: 89 },
    { date: '2026/08/05', steps:  22511 , phone_time: 126 },
    { date: '2026/08/06', steps:  24128 , phone_time: 68 },
    { date: '2026/08/07', steps:  19912 , phone_time: 116 },
    { date: '2026/08/08', steps:  19782 , phone_time: 145 },
    { date: '2026/08/09', steps:  15518 , phone_time: 136 },
    { date: '2026/08/10', steps:  3609 , phone_time: 111 },
    { date: '2026/08/11', steps:  7670 , phone_time: 119 },
    { date: '2026/08/12', steps:  9884 , phone_time: 131 },
    { date: '2026/08/13', steps:  2858 , phone_time: 104 },
    { date: '2026/08/14', steps:  15401 , phone_time: 164 },
    { date: '2026/08/15', steps:  8178 , phone_time: 166 },
    { date: '2026/08/16', steps:  7181 , phone_time: 285 },
    { date: '2026/08/17', steps:  4912 , phone_time: 195 },
    { date: '2026/08/18', steps:  7030 , phone_time: 193 },
    { date: '2026/08/19', steps:  15282 , phone_time: 145 },
    { date: '2026/08/20', steps:  10960 , phone_time: 158 },
    { date: '2026/08/21', steps:  28409 , phone_time: 102 },
    { date: '2026/08/22', steps:  17135 , phone_time: 185 },
    { date: '2026/08/23', steps:  23024 , phone_time: 200 },
    { date: '2026/08/24', steps:  13216 , phone_time: 163 },
    { date: '2026/08/25', steps:  23815 , phone_time: 161 },
    { date: '2026/08/26', steps:  17912 , phone_time: 157 },
    { date: '2026/08/27', steps:  13653 , phone_time: 129 },
    { date: '2026/08/28', steps:  22600 , phone_time: 153 },
    { date: '2026/08/29', steps:  21281 , phone_time: 126 }
];


export function StreakMapStats({ days, scores, statType }: Props) {

const [value, setValue] = useState<any>(
    statsData
);

    useEffect(() => {
        console.log("days modified in StreakMap:", days);
        const tempData:Array<any> = [];

        //console.log("in useEffect statsData = ", statsData);

        statsData?.forEach((curItem:any) => {
            
            //{ date: '2026/01/01', steps:  8513 , phone_time: 27 },

            if(statType === "steps") {
                tempData.push(
                    { date: curItem.date, count: curItem.steps }
                )
            } else if(statType == "phone_time") {
                tempData.push(
                    { date: curItem.date, count: curItem.phone_time }
                )
            }
        })

        //console.log("tempData = ", tempData);

        setValue(tempData);
    }, [days]);

    useEffect(() => {
        console.log("in streak map stats, days have changed");
    }, [days]);


    let panelColorsSteps = ['#EBEDF0','#d4eda1', '#C6E48B','#7BC96F','#239A3B','#196127'];
    let panelColorsPhoneTime = ['#f4fefd', '#e4b293', '#d48462', '#c2533a', '#ad001d', '#6c0012'];


    let x = useMemo(() => (
        <div className="streak-map">
            <div className="section-title">Streak Map / 2026 - {statType}</div>

            <div className="item-list">
            <HeatMap
                //panelColors={['#f4decd', '#e4b293', '#d48462', '#c2533a', '#ad001d', '#6c0012']}
                //panelColors={['#EBEDF0','#d4eda1', '#C6E48B','#7BC96F','#239A3B','#196127']}

                panelColors={statType === "steps" ? panelColorsSteps : panelColorsPhoneTime}

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
    ), [value])

    return x;
}