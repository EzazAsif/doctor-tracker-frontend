import type { Condition, PatientStatus } from "@/lib/api/types";
import { cn, initials } from "@/lib/utils";

export const STATUS_LABEL: Record<PatientStatus, string> = {
  admitted: "Admitted",
  under_treatment: "Under treatment",
  recovered: "Recovered",
  discharged: "Discharged",
};

const STATUS_STYLE: Record<PatientStatus, string> = {
  admitted: "bg-status-admitted-bg text-status-admitted",
  under_treatment: "bg-status-treatment-bg text-status-treatment",
  recovered: "bg-status-recovered-bg text-status-recovered",
  discharged: "bg-status-discharged-bg text-status-discharged",
};

export function StatusBadge({ status, className }: { status: PatientStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        STATUS_STYLE[status],
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-border/80 bg-secondary px-2 py-0.5 text-xs font-medium whitespace-nowrap text-secondary-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ConditionPill({ condition }: { condition: Condition }) {
  return <Pill>{condition}</Pill>;
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
