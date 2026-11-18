"use client";

import { memo, useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, type TooltipContentProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import type { DashboardStats } from "@/lib/api/types";
import { ChartTooltipBox } from "./chart-card";

const SERIES = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--chart-6)"];
const MAX_SLICES = SERIES.length;

interface Slice {
  name: string;
  count: number;
  share: number;
  color: string;
}

function TooltipContent({ active, payload }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  const slice = payload[0].payload as Slice;
  return (
    <ChartTooltipBox
      rows={[{ label: slice.name, value: `${slice.count} · ${Math.round(slice.share * 100)}%`, color: slice.color }]}
    />
  );
}

export const ConditionsDonut = memo(function ConditionsDonut({ data }: { data: DashboardStats["conditionBreakdown"] }) {
  const { slices, total } = useMemo(() => {
    const sorted = [...data].filter((d) => d.count > 0).sort((a, b) => b.count - a.count);
    const total = sorted.reduce((sum, d) => sum + d.count, 0) || 1;
    // past six hues things stop being distinguishable, so the tail folds into "Other"
    const head = sorted.slice(0, sorted.length > MAX_SLICES ? MAX_SLICES - 1 : MAX_SLICES);
    const tail = sorted.slice(head.length);
    const slices: Slice[] = head.map((d, i) => ({ name: d.condition, count: d.count, share: d.count / total, color: SERIES[i] }));
    if (tail.length) {
      const count = tail.reduce((sum, d) => sum + d.count, 0);
      slices.push({ name: `Other (${tail.length})`, count, share: count / total, color: "var(--chart-other)" });
    }
    return { slices, total };
  }, [data]);

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center lg:flex-col lg:items-stretch">
      <div className="relative mx-auto size-[180px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="count"
              nameKey="name"
              innerRadius={72}
              outerRadius={88}
              paddingAngle={1}
              stroke="var(--card)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {slices.map((s) => (
                <Cell key={s.name} fill={s.color} />
              ))}
            </Pie>
            <Tooltip content={TooltipContent} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="font-heading text-2xl font-semibold tabular">{total.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">patients</p>
          </div>
        </div>
      </div>
      <ul className="min-w-0 flex-1 space-y-2.5" aria-label="Conditions legend">
        {slices.map((s) => (
          <li key={s.name} className="flex items-center gap-2.5 text-sm">
            <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: s.color }} />
            <span className="truncate text-foreground">{s.name}</span>
            <span className="ml-auto font-medium tabular">{s.count}</span>
            <span className="w-10 text-right text-xs text-muted-foreground tabular">{Math.round(s.share * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
});
