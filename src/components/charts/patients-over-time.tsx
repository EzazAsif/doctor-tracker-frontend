"use client";

import { memo, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import type { DashboardStats } from "@/lib/api/types";
import { ChartTooltipBox } from "./chart-card";

type Point = DashboardStats["patientsOverTime"][number] & { label: string; full: string };

function TooltipContent({ active, payload }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as Point;
  return <ChartTooltipBox title={point.full} rows={[{ label: "Admissions", value: point.count, color: "var(--chart-1)" }]} />;
}

export const PatientsOverTimeChart = memo(function PatientsOverTimeChart({
  data,
  height = 280,
}: {
  data: DashboardStats["patientsOverTime"];
  height?: number;
}) {
  const points = useMemo<Point[]>(
    () =>
      data.map((d) => {
        const date = parseISO(`${d.period}-01`);
        return { ...d, label: format(date, "MMM"), full: format(date, "MMMM yyyy") };
      }),
    [data],
  );

  return (
    <div style={{ height }} role="img" aria-label="Area chart of patient admissions per month">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <defs>
            <linearGradient id="admissions-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            minTickGap={12}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            width={48}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          />
          <Tooltip
            content={TooltipContent}
            cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "3 3", strokeOpacity: 0.6 }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="var(--chart-1)"
            strokeWidth={2}
            fill="url(#admissions-fill)"
            activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--card)", fill: "var(--chart-1)" }}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});
