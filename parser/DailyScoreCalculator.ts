import type { Daily, DailyCategoryScore, DailyScore, DailyItemStatus } from "./types";

const STATUS_WEIGHTS: Record<DailyItemStatus, number> = {
  OK:          1.0,
  IN_PROGRESS: 0.5,
  NOK:         0.1,
  TODO:        0.0,
  OVERDUE:     0.0,
  ON_HOLD:     0.0,
};

export class DailyScoreCalculator {
  computeAll(days: Daily[]): DailyScore[] {
    const averages = this.computeOptimalAverages(days);
    return days.map(d => this.computeDay(d, averages));
  }

  computeDay(day: Daily, averages: Map<string, number>): DailyScore {
    const catScores = day.categories.map(c => this.computeCategory(c, averages));
    const weight = catScores.length > 0 ? 1 / catScores.length : 0;

    //console.table(catScores);

    return {
      date:                day.date,
      dayScore:            catScores.reduce((a, c) => a + c.categoryScore * weight, 0),
      dayCountItemsScore:  catScores.reduce((a, c) => a + c.countItemsScore * weight, 0),
      estimatedTime:       catScores.reduce((a, c) => a + c.estimatedTime, 0),
      actualTime:          catScores.reduce((a, c) => a + c.actualTime, 0),
      computedActualTime:  catScores.reduce((a, c) => a + c.computedActualTime, 0),
      categoryScores:      catScores,
    };
  }

  computeOptimalAverages(days: Daily[]): Map<string, number> {
    const grouped = new Map<string, number[]>();

    for (const day of days) {
      for (const cat of day.categories) {
        if (cat.items.length === 0) continue;
        const counts = grouped.get(cat.name) ?? [];
        counts.push(cat.items.length);
        grouped.set(cat.name, counts);
      }
    }

    const result = new Map<string, number>();
    for (const [name, counts] of grouped) {
      result.set(name, counts.reduce((a, b) => a + b, 0) / counts.length);
    }
    return result;
  }

  private computeCategory(
    category: { name: string; items: readonly { status: DailyItemStatus; estimatedTime: number; actualTime: number; computedActualTime: number }[] },
    averages: Map<string, number>
  ): DailyCategoryScore {
    const optimal = averages.get(category.name) ?? 0;
    const weighted = category.items.reduce((a, i) => a + (STATUS_WEIGHTS[i.status] ?? 0), 0);

    return {
      categoryName:      category.name,
      categoryScore:     optimal > 0 ? Math.min(weighted / optimal * 100, 100) : 0,
      countItemsScore:   optimal > 0 ? Math.min(category.items.length / optimal * 100, 100) : 0,
      itemCount:         category.items.length,
      estimatedTime:     category.items.reduce((a, i) => a + i.estimatedTime, 0),
      actualTime:        category.items.reduce((a, i) => a + i.actualTime, 0),
      computedActualTime: category.items.reduce((a, i) => a + i.computedActualTime, 0),
    };
  }
}
