"use client";

import { memo, useMemo } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const ALL = "__all";

export interface Option {
  value: string;
  label: string;
}

interface FilterSelectProps {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  /** label for the "no filter" option, e.g. "All conditions" */
  allLabel?: string;
  className?: string;
}

export const FilterSelect = memo(function FilterSelect({
  label,
  value,
  options,
  onChange,
  allLabel,
  className,
}: FilterSelectProps) {
  const items = useMemo(
    () => (allLabel ? [{ value: ALL, label: allLabel }, ...options] : options),
    [allLabel, options],
  );

  return (
    <Select
      items={items}
      value={value || (allLabel ? ALL : null)}
      onValueChange={(next) => onChange(!next || next === ALL ? "" : String(next))}
    >
      <SelectTrigger
        aria-label={label}
        className={cn("w-full min-w-0 bg-card sm:w-auto sm:min-w-[160px]", value && "border-primary/40 text-foreground", className)}
      >
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} align="start" className="min-w-48">
        {items.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});

interface FilterBarProps {
  children: React.ReactNode;
  search?: React.ReactNode;
  activeCount?: number;
  onClear?: () => void;
  className?: string;
}

/** Search on top, filters wrap underneath; shows a clear button once anything is set. */
export function FilterBar({ children, search, activeCount = 0, onClear, className }: FilterBarProps) {
  return (
    <div className={cn("flex flex-col gap-3 border-b p-4 sm:px-5", className)}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {search && <div className="lg:max-w-sm lg:flex-1">{search}</div>}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
          {children}
          {activeCount > 0 && onClear && (
            <Button variant="ghost" onClick={onClear} className="col-span-2 text-muted-foreground sm:col-span-1">
              <X />
              Clear{activeCount > 1 ? ` (${activeCount})` : ""}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
