"use client";

import { memo, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import type { DashboardStats } from "@/lib/api/types";
import { ChartTooltipBox } from "./chart-card";

type Row = DashboardStats["patientsPerDoctor"][number];

function TooltipContent({ active, payload }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload as Row;
  return (
    <ChartTooltipBox
      title={row.name}
      rows={[
        { label: row.specialization, value: "" },
        { label: "Patients", value: row.count, color: "var(--chart-1)" },
      ]}
    />
  );
}

export const TopDoctorsChart = memo(function TopDoctorsChart({
  data,
  limit = 10,
}: {
  data: DashboardStats["patientsPerDoctor"];
  limit?: number;
}) {
  const router = useRouter();
  const rows = useMemo(() => data.slice(0, limit), [data, limit]);
  const height = rows.length * 36 + 16;

  return (
    <div style={{ height }} role="img" aria-label="Bar chart of the doctors with the most patients">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 28, bottom: 0, left: 0 }} barCategoryGap={8}>
          <CartesianGrid horizontal={false} stroke="var(--chart-grid)" />
          <XAxis type="number" hide allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={132}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--foreground)", fontSize: 12.5 }}
            tickFormatter={(v: string) => (v.length > 18 ? `${v.slice(0, 17)}…` : v)}
          />
          <Tooltip content={TooltipContent} cursor={{ fill: "var(--muted)", opacity: 0.6 }} />
          <Bar
            dataKey="count"
            fill="var(--chart-1)"
            radius={[0, 4, 4, 0]}
            maxBarSize={20}
            isAnimationActive={false}
            className="cursor-pointer"
            onClick={(entry) => {
              const id = (entry as unknown as { payload?: Row }).payload?.doctorId;
              if (id) router.push(`/doctors/${id}`);
            }}
            label={{ position: "right", fill: "var(--muted-foreground)", fontSize: 12 }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});
