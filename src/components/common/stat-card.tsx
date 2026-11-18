import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface Stat {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
}

/**
 * KPI strip: one panel split by hairlines, label over value. Numbers are the
 * point, so no icon tiles or sparklines competing with them.
 */
export function StatStrip({ stats, loading, className }: { stats: Stat[]; loading?: boolean; className?: string }) {
  return (
    <dl
      className={cn(
        "grid grid-cols-2 overflow-hidden rounded-xl border bg-card xl:grid-cols-4",
        "[&>div]:border-border max-xl:[&>div:nth-child(-n+2)]:border-b max-xl:[&>div:nth-child(odd)]:border-r xl:[&>div:not(:last-child)]:border-r",
        className,
      )}
    >
      {stats.map((stat) => (
        <div key={stat.label} className="min-w-0 px-4 py-4 sm:px-6 sm:py-5">
          <dt className="text-[13px] text-muted-foreground sm:text-sm">{stat.label}</dt>
          {loading ? (
            <>
              <Skeleton className="mt-2 h-8 w-20" />
              <Skeleton className="mt-2 h-4 w-28" />
            </>
          ) : (
            <>
              <dd className="mt-1 font-heading text-[26px] leading-tight font-semibold tracking-tight tabular sm:text-[30px]">
                {stat.value}
              </dd>
              {stat.hint && <dd className="mt-1 truncate text-xs text-muted-foreground sm:text-[13px]">{stat.hint}</dd>}
            </>
          )}
        </div>
      ))}
    </dl>
  );
}
