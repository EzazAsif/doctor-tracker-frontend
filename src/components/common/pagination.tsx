"use client";

import { memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PageMeta } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const PAGE_SIZES = [10, 20, 50];

function pageWindow(page: number, totalPages: number): (number | "gap")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

interface PaginationProps {
  meta?: PageMeta;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  noun?: string;
  className?: string;
}

export const Pagination = memo(function Pagination({
  meta,
  onPageChange,
  onLimitChange,
  noun = "results",
  className,
}: PaginationProps) {
  if (!meta || meta.total === 0) return null;
  const { page, limit, total, totalPages } = meta;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5", className)}
    >
      <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground sm:justify-start">
        <p className="tabular">
          <span className="font-medium text-foreground">
            {from}–{to}
          </span>{" "}
          of <span className="font-medium text-foreground">{total.toLocaleString()}</span> {noun}
        </p>
        {onLimitChange && (
          <label className="hidden items-center gap-2 sm:flex">
            <span>Rows</span>
            <Select value={String(limit)} onValueChange={(v) => v && onLimitChange(Number(v))}>
              <SelectTrigger size="sm" aria-label="Rows per page" className="w-[72px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        )}
      </div>

      <div className="flex items-center justify-between gap-1 sm:justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft />
          <span className="sm:hidden">Prev</span>
        </Button>
        <div className="hidden items-center gap-1 sm:flex">
          {pageWindow(page, totalPages).map((p, i) =>
            p === "gap" ? (
              <span key={`gap-${i}`} className="px-1.5 text-muted-foreground">
                …
              </span>
            ) : (
              <Button
                key={p}
                size="icon-sm"
                variant={p === page ? "default" : "ghost"}
                aria-current={p === page ? "page" : undefined}
                aria-label={`Page ${p}`}
                onClick={() => onPageChange(p)}
                className="tabular"
              >
                {p}
              </Button>
            ),
          )}
        </div>
        <span className="text-sm text-muted-foreground tabular sm:hidden">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <span className="sm:hidden">Next</span>
          <ChevronRight />
        </Button>
      </div>
    </nav>
  );
});
