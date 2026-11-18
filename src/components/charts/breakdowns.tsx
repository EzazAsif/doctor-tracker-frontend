"use client";

import { memo, useMemo } from "react";
import { STATUS_LABEL } from "@/components/common/badges";
import type { DashboardStats, PatientStatus } from "@/lib/api/types";
import { STATUSES } from "@/lib/api/types";

const STATUS_COLOR: Record<PatientStatus, string> = {
  admitted: "var(--status-admitted)",
  under_treatment: "var(--primary)",
  recovered: "var(--status-recovered)",
  discharged: "var(--chart-other)",
};

export const StatusBreakdown = memo(function StatusBreakdown({ data }: { data: DashboardStats["statusBreakdown"] }) {
  const rows = useMemo(() => {
    const byStatus = new Map(data.map((d) => [d.status, d.count]));
    const total = data.reduce((s, d) => s + d.count, 0) || 1;
    return STATUSES.map((status) => {
      const count = byStatus.get(status) ?? 0;
      return { status, count, share: count / total };
    });
  }, [data]);

  return (
    <div>
      <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full" role="img" aria-label="Share of patients by status">
        {rows
          .filter((r) => r.count > 0)
          .map((r) => (
            <div
              key={r.status}
              title={`${STATUS_LABEL[r.status]}: ${r.count}`}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{ width: `${r.share * 100}%`, background: STATUS_COLOR[r.status] }}
            />
          ))}
      </div>
      <ul className="mt-5 grid grid-cols-2 gap-2.5">
        {rows.map((r) => (
          <li key={r.status} className="rounded-lg bg-muted/60 px-3 py-2.5">
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <span className="size-2 rounded-full" style={{ background: STATUS_COLOR[r.status] }} />
              {STATUS_LABEL[r.status]}
            </div>
            <p className="mt-1 flex items-baseline gap-1.5">
              <span className="font-heading text-xl font-semibold tabular">{r.count}</span>
              <span className="text-xs text-muted-foreground tabular">{Math.round(r.share * 100)}%</span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
});

export const SpecializationBreakdown = memo(function SpecializationBreakdown({
  data,
  limit = 7,
}: {
  data: DashboardStats["specializationBreakdown"];
  limit?: number;
}) {
  const rows = useMemo(() => [...data].sort((a, b) => b.patients - a.patients).slice(0, limit), [data, limit]);
  const max = Math.max(1, ...rows.map((r) => r.patients));

  return (
    <ul className="space-y-4">
      {rows.map((r) => (
        <li key={r.specialization}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate font-medium">{r.specialization}</span>
            <span className="shrink-0 text-xs text-muted-foreground tabular">
              {r.doctors} {r.doctors === 1 ? "doctor" : "doctors"} · <span className="text-foreground">{r.patients}</span> patients
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div className="h-full rounded-full bg-chart-1" style={{ width: `${(r.patients / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
});

export const GenderBreakdown = memo(function GenderBreakdown({ data }: { data: DashboardStats["genderBreakdown"] }) {
  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  const label: Record<string, string> = { male: "Male", female: "Female", other: "Other" };
  return (
    <dl className="grid grid-cols-3 gap-2 border-t pt-4">
      {data.map((d) => (
        <div key={d.gender}>
          <dt className="text-xs text-muted-foreground">{label[d.gender] ?? d.gender}</dt>
          <dd className="mt-0.5 text-sm font-medium tabular">
            {d.count} <span className="text-xs font-normal text-muted-foreground">{Math.round((d.count / total) * 100)}%</span>
          </dd>
        </div>
      ))}
    </dl>
  );
});
