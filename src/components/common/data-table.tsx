"use client";

import { memo } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface Column<T> {
  id: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  /** value used in the `sort` query param, e.g. "name" → name / -name */
  sortKey?: string;
  className?: string;
  headClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[] | undefined;
  getRowId: (row: T) => string;
  isLoading?: boolean;
  /** true while a new page/filter is loading over old (placeholder) data */
  isFetching?: boolean;
  sort?: string;
  onSortChange?: (sort: string) => void;
  onRowClick?: (row: T) => void;
  /** card layout below the md breakpoint instead of a scrolling table */
  renderMobileCard?: (row: T) => React.ReactNode;
  empty?: React.ReactNode;
  error?: React.ReactNode;
  skeletonRows?: number;
  caption?: string;
}

function SortIcon({ dir }: { dir: "asc" | "desc" | null }) {
  if (dir === "asc") return <ArrowUp className="size-3.5" />;
  if (dir === "desc") return <ArrowDown className="size-3.5" />;
  return <ChevronsUpDown className="size-3.5 opacity-40" />;
}

interface RowProps<T> {
  row: T;
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
}

// Rows only re-render when their own data (or the column defs) change.
const Row = memo(function Row<T>({ row, columns, onRowClick }: RowProps<T>) {
  return (
    <tr
      onClick={onRowClick ? () => onRowClick(row) : undefined}
      className={cn(
        "border-b transition-colors last:border-b-0 hover:bg-muted/50",
        onRowClick && "cursor-pointer",
      )}
    >
      {columns.map((col) => (
        <td key={col.id} className={cn("h-[60px] px-4 align-middle first:pl-5 last:pr-5", col.className)}>
          {col.cell(row)}
        </td>
      ))}
    </tr>
  );
}) as <T>(props: RowProps<T>) => React.ReactElement;

const MobileCard = memo(function MobileCard<T>({
  row,
  render,
}: {
  row: T;
  render: (row: T) => React.ReactNode;
}) {
  return <li>{render(row)}</li>;
}) as <T>(props: { row: T; render: (row: T) => React.ReactNode }) => React.ReactElement;

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  isLoading,
  isFetching,
  sort,
  onSortChange,
  onRowClick,
  renderMobileCard,
  empty,
  error,
  skeletonRows = 8,
  caption,
}: DataTableProps<T>) {
  const sortField = sort?.replace(/^-/, "");
  const sortDir = sort ? (sort.startsWith("-") ? "desc" : "asc") : null;

  const toggleSort = (key: string) => {
    if (!onSortChange) return;
    // first click sorts descending for numbers/dates feels odd for names, so: asc → desc → asc
    onSortChange(sortField === key && sortDir === "asc" ? `-${key}` : key);
  };

  let body: React.ReactNode;
  if (error) {
    body = error;
  } else if (isLoading) {
    body = null;
  } else if (!rows || rows.length === 0) {
    body = empty;
  }

  const showTable = !error && (isLoading || (rows && rows.length > 0));

  return (
    <div className={cn("relative transition-opacity", isFetching && !isLoading && "opacity-60")} aria-busy={isFetching || isLoading}>
      {isFetching && !isLoading && (
        <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden">
          <div className="h-full w-1/3 animate-[loading-bar_1s_ease-in-out_infinite] bg-primary" />
        </div>
      )}

      {showTable && (
        <>
          <div className={cn("overflow-x-auto", renderMobileCard && "hidden md:block")}>
            <table className="w-full min-w-[720px] text-sm">
              {caption && <caption className="sr-only">{caption}</caption>}
              <thead className="sticky top-0 z-[1] bg-muted/60 backdrop-blur">
                <tr className="border-b">
                  {columns.map((col) => {
                    const active = col.sortKey && col.sortKey === sortField;
                    return (
                      <th
                        key={col.id}
                        scope="col"
                        aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : undefined}
                        className={cn(
                          "h-11 px-4 text-left text-[11px] font-medium tracking-[0.08em] whitespace-nowrap text-muted-foreground uppercase first:pl-5 last:pr-5",
                          col.headClassName,
                        )}
                      >
                        {col.sortKey && onSortChange ? (
                          <button
                            type="button"
                            onClick={() => toggleSort(col.sortKey!)}
                            className={cn(
                              "-mx-1.5 inline-flex items-center gap-1 rounded px-1.5 py-1 uppercase outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                              active && "text-foreground",
                            )}
                          >
                            {col.header}
                            <SortIcon dir={active ? sortDir : null} />
                          </button>
                        ) : (
                          col.header
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: skeletonRows }, (_, i) => (
                      <tr key={i} className="border-b last:border-b-0">
                        {columns.map((col) => (
                          <td key={col.id} className="h-[60px] px-4 first:pl-5 last:pr-5">
                            <Skeleton className="h-4 w-full max-w-[140px]" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : rows!.map((row) => (
                      <Row key={getRowId(row)} row={row} columns={columns} onRowClick={onRowClick} />
                    ))}
              </tbody>
            </table>
          </div>

          {renderMobileCard && (
            <ul className="divide-y md:hidden">
              {isLoading
                ? Array.from({ length: 5 }, (_, i) => (
                    <li key={i} className="space-y-2 p-4">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </li>
                  ))
                : rows!.map((row) => <MobileCard key={getRowId(row)} row={row} render={renderMobileCard} />)}
            </ul>
          )}
        </>
      )}

      {body}
    </div>
  );
}
