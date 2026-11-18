"use client";

import { memo, useState } from "react";
import { endOfDay, format, parseISO, startOfMonth, startOfYear, subDays, subMonths } from "date-fns";
import { CalendarDays, X } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface DateRangeValue {
  from: string; // YYYY-MM-DD or ""
  to: string;
}

const iso = (d: Date) => format(d, "yyyy-MM-dd");

const PRESETS: { label: string; range: () => [Date, Date] }[] = [
  { label: "Last 7 days", range: () => [subDays(new Date(), 6), new Date()] },
  { label: "Last 30 days", range: () => [subDays(new Date(), 29), new Date()] },
  { label: "This month", range: () => [startOfMonth(new Date()), new Date()] },
  { label: "Last 3 months", range: () => [subMonths(new Date(), 3), new Date()] },
  { label: "Last 12 months", range: () => [subMonths(new Date(), 12), new Date()] },
  { label: "Year to date", range: () => [startOfYear(new Date()), new Date()] },
];

function toLabel({ from, to }: DateRangeValue, placeholder: string) {
  if (!from && !to) return placeholder;
  const f = from ? format(parseISO(from), "d MMM yyyy") : "…";
  const t = to ? format(parseISO(to), "d MMM yyyy") : "…";
  return `${f} – ${t}`;
}

interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  placeholder?: string;
  label?: string;
  clearable?: boolean;
  align?: "start" | "end" | "center";
  className?: string;
}

export const DateRangePicker = memo(function DateRangePicker({
  value,
  onChange,
  placeholder = "Any date",
  label = "Date range",
  clearable = true,
  align = "start",
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>();
  const hasValue = Boolean(value.from || value.to);

  const selected: DateRange | undefined =
    draft ?? (hasValue ? { from: value.from ? parseISO(value.from) : undefined, to: value.to ? parseISO(value.to) : undefined } : undefined);

  const commit = (from?: Date, to?: Date) => {
    onChange({ from: from ? iso(from) : "", to: to ? iso(endOfDay(to)) : "" });
    setDraft(undefined);
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setDraft(undefined);
      }}
    >
      <div className={cn("relative", className)}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              aria-label={`${label}: ${toLabel(value, placeholder)}`}
              className={cn(
                "h-10 w-full justify-start bg-card font-normal sm:w-auto",
                hasValue && clearable && "pr-9",
                hasValue ? "border-primary/40 text-foreground" : "text-muted-foreground",
              )}
            />
          }
        >
          <CalendarDays className="text-muted-foreground" />
          <span className="truncate tabular">{toLabel(value, placeholder)}</span>
        </PopoverTrigger>
        {hasValue && clearable && (
          <button
            type="button"
            aria-label="Clear date range"
            onClick={() => onChange({ from: "", to: "" })}
            className="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
      <PopoverContent align={align} className="w-auto p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="flex gap-1 overflow-x-auto border-b p-2 sm:w-40 sm:flex-col sm:border-r sm:border-b-0">
            {PRESETS.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                className="shrink-0 justify-start font-normal"
                onClick={() => commit(...preset.range())}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <div className="p-1">
            <Calendar
              mode="range"
              numberOfMonths={1}
              selected={selected}
              defaultMonth={selected?.from}
              onSelect={(range) => {
                setDraft(range);
                if (range?.from && range?.to && range.from.getTime() !== range.to.getTime()) {
                  commit(range.from, range.to);
                }
              }}
              disabled={{ after: new Date() }}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
});
