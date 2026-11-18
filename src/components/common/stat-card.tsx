import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  hint?: React.ReactNode;
  tone?: "primary" | "terracotta" | "sage" | "ochre";
  loading?: boolean;
}

const tones: Record<NonNullable<StatCardProps["tone"]>, string> = {
  primary: "bg-accent text-accent-foreground",
  terracotta: "bg-terracotta/12 text-terracotta",
  sage: "bg-status-recovered-bg text-status-recovered",
  ochre: "bg-status-admitted-bg text-status-admitted",
};

export function StatCard({ label, value, icon: Icon, hint, tone = "primary", loading }: StatCardProps) {
  return (
    <div className="rounded-xl border bg-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-medium tracking-[0.1em] text-muted-foreground uppercase sm:text-xs">{label}</p>
        <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg sm:size-9", tones[tone])}>
          <Icon className="size-4" strokeWidth={1.9} />
        </span>
      </div>
      {loading ? (
        <>
          <Skeleton className="mt-3 h-8 w-20" />
          <Skeleton className="mt-3 h-4 w-32" />
        </>
      ) : (
        <>
          <p className="mt-2 font-heading text-[28px] leading-none font-semibold tracking-tight tabular sm:text-[34px]">
            {value}
          </p>
          {hint && <div className="mt-3 text-xs text-muted-foreground sm:text-[13px]">{hint}</div>}
        </>
      )}
    </div>
  );
}
