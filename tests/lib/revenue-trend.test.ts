import { describe, expect, it } from "vitest";
import { fromMinorUnits } from "@/lib/utils";

describe("Revenue Trend Series Generation", () => {
  it("builds a continuous 12-day time series including dates and labels", () => {
    const feeMap = new Map<string, number>();
    feeMap.set("2026-08-28", 250000); // 2500.00 GHS in minor units
    feeMap.set("2026-08-25", 120050); // 1200.50 GHS in minor units

    const revenue_graph = [];
    const baseDate = new Date("2026-08-28T12:00:00Z");

    for (let i = 11; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const amountMinor = feeMap.get(dateStr) || 0;
      revenue_graph.push({
        date: dateStr,
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        day_name: d.toLocaleDateString("en-US", { weekday: "short" }),
        amount: fromMinorUnits(amountMinor),
      });
    }

    expect(revenue_graph).toHaveLength(12);
    expect(revenue_graph[11].date).toBe("2026-08-28");
    expect(revenue_graph[11].amount).toBe(2500);
    expect(revenue_graph[11].label).toBe("Aug 28");

    // Check a day without fees defaults to 0
    const dayWithNoFees = revenue_graph.find((d) => d.date === "2026-08-27");
    expect(dayWithNoFees).toBeDefined();
    expect(dayWithNoFees?.amount).toBe(0);

    // Check day 2026-08-25
    const dayWithFees = revenue_graph.find((d) => d.date === "2026-08-25");
    expect(dayWithFees?.amount).toBe(1200.5);
  });
});
