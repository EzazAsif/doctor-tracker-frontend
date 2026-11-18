import { BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  loading?: boolean;
  empty?: boolean;
  /** height of the plot area, used for the skeleton/empty state too */
  height?: number;
  className?: string;
  children: React.ReactNode;
}

export function ChartCard({
  title,
  description,
  action,
  loading,
  empty,
  height = 280,
  className,
  children,
}: ChartCardProps) {
  return (
    <section className={cn("flex flex-col rounded-xl border bg-card p-4 sm:p-6", className)}>
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-semibold">{title}</h2>
          {description && <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p>}
        </div>
        {action}
      </header>
      {loading ? (
        <Skeleton className="w-full rounded-lg" style={{ height }} />
      ) : empty ? (
        <div
          className="grid place-items-center rounded-lg border border-dashed text-center text-sm text-muted-foreground"
          style={{ height }}
        >
          <div>
            <BarChart3 className="mx-auto mb-2 size-5 opacity-60" />
            No data for this period
          </div>
        </div>
      ) : (
        children
      )}
    </section>
  );
}

interface TooltipRow {
  label: string;
  value: React.ReactNode;
  color?: string;
}

/** Shared tooltip body so every chart's hover reads the same. */
export function ChartTooltipBox({ title, rows }: { title?: React.ReactNode; rows: TooltipRow[] }) {
  return (
    <div className="min-w-36 rounded-lg border bg-popover px-3 py-2 text-xs shadow-lg">
      {title && <p className="mb-1.5 font-medium text-foreground">{title}</p>}
      <ul className="space-y-1">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center gap-2">
            {row.color && <span className="size-2 shrink-0 rounded-[3px]" style={{ background: row.color }} />}
            <span className="text-muted-foreground">{row.label}</span>
            <span className="ml-auto pl-3 font-medium text-foreground tabular">{row.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
