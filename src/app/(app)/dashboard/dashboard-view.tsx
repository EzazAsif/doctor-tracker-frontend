"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Activity, ArrowRight, Stethoscope, UserPlus, UsersRound } from "lucide-react";
import { ConditionsDonut } from "@/components/charts/conditions-donut";
import { ChartCard } from "@/components/charts/chart-card";
import { GenderBreakdown, SpecializationBreakdown, StatusBreakdown } from "@/components/charts/breakdowns";
import { PatientsOverTimeChart } from "@/components/charts/patients-over-time";
import { TopDoctorsChart } from "@/components/charts/top-doctors-chart";
import { DateRangePicker, type DateRangeValue } from "@/components/common/date-range-picker";
import { ErrorState } from "@/components/common/error-state";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { buttonVariants } from "@/components/ui/button";
import { useDashboardStats } from "@/hooks/queries/use-dashboard";
import { useUrlState } from "@/hooks/use-url-state";

const KEYS = ["from", "to"] as const;

function rangeLabel(from: string, to: string) {
  if (!from && !to) return "the last 12 months";
  const f = from ? format(parseISO(from), "d MMM yyyy") : "the start";
  const t = to ? format(parseISO(to), "d MMM yyyy") : "today";
  return `${f} – ${t}`;
}

export function DashboardView() {
  const { values, setParams } = useUrlState(KEYS);
  const range = useMemo(() => ({ from: values.from || undefined, to: values.to || undefined }), [values.from, values.to]);
  const { data, isLoading, isFetching, error, refetch } = useDashboardStats(range);

  const onRangeChange = useCallback((v: DateRangeValue) => setParams({ from: v.from, to: v.to }), [setParams]);
  const rangeValue = useMemo(() => ({ from: values.from, to: values.to }), [values.from, values.to]);

  const totals = data?.totals;
  const sum = (arr?: { count: number }[]) => arr?.reduce((s, d) => s + d.count, 0) ?? 0;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Doctors and patient activity for ${rangeLabel(values.from, values.to)}.`}
        actions={
          <DateRangePicker
            value={rangeValue}
            onChange={onRangeChange}
            placeholder="Last 12 months"
            label="Dashboard period"
            align="end"
            className="w-full sm:w-auto"
          />
        }
      />

      {error && !data ? (
        <div className="rounded-xl border bg-card">
          <ErrorState error={error} onRetry={() => refetch()} title="Couldn't load the dashboard" />
        </div>
      ) : (
        <div className={isFetching && !isLoading ? "opacity-70 transition-opacity" : "transition-opacity"}>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <StatCard
              label="Doctors"
              icon={Stethoscope}
              loading={isLoading}
              value={totals?.doctors.toLocaleString()}
              hint={`${data?.specializationBreakdown.length ?? 0} specializations`}
            />
            <StatCard
              label="Patients"
              icon={UsersRound}
              tone="sage"
              loading={isLoading}
              value={totals?.patients.toLocaleString()}
              hint={
                <>
                  <span className="font-medium text-foreground tabular">{totals?.patientsInRange.toLocaleString()}</span> admitted in
                  period
                </>
              }
            />
            <StatCard
              label="New this month"
              icon={UserPlus}
              tone="terracotta"
              loading={isLoading}
              value={totals?.newPatientsThisMonth.toLocaleString()}
              hint="Admissions since the 1st"
            />
            <StatCard
              label="Avg per doctor"
              icon={Activity}
              tone="ochre"
              loading={isLoading}
              value={totals?.avgPatientsPerDoctor.toFixed(1)}
              hint="Patients per doctor"
            />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <ChartCard
              title="Patients admitted over time"
              description="Monthly admissions in the selected period"
              loading={isLoading}
              height={340}
              empty={sum(data?.patientsOverTime) === 0}
              className="lg:col-span-2"
            >
              <PatientsOverTimeChart data={data?.patientsOverTime ?? []} />
            </ChartCard>
            <ChartCard
              title="Conditions"
              description="Primary diagnosis share"
              loading={isLoading}
              empty={sum(data?.conditionBreakdown) === 0}
            >
              <ConditionsDonut data={data?.conditionBreakdown ?? []} />
            </ChartCard>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <ChartCard
              title="Top doctors by patients"
              description="Ten largest caseloads · click a bar to open"
              loading={isLoading}
              height={376}
              empty={!data?.patientsPerDoctor.length}
              action={
                <Link href="/doctors?sort=-patientCount" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                  View all
                  <ArrowRight data-icon="inline-end" />
                </Link>
              }
            >
              <TopDoctorsChart data={data?.patientsPerDoctor ?? []} />
            </ChartCard>
            <ChartCard
              title="Specializations"
              description="Patients per specialty, with doctor headcount"
              loading={isLoading}
              height={376}
              empty={!data?.specializationBreakdown.length}
            >
              <SpecializationBreakdown data={data?.specializationBreakdown ?? []} />
            </ChartCard>
            <ChartCard
              title="Patient status"
              description="Where patients are in their care"
              loading={isLoading}
              height={260}
              empty={sum(data?.statusBreakdown) === 0}
              className="lg:col-span-2 xl:col-span-1"
            >
              <StatusBreakdown data={data?.statusBreakdown ?? []} />
              <div className="mt-5">
                <GenderBreakdown data={data?.genderBreakdown ?? []} />
              </div>
            </ChartCard>
          </div>
        </div>
      )}
    </>
  );
}
