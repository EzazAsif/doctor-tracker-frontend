"use client";

import { memo, useState } from "react";
import { ChevronsUpDown, Loader2 } from "lucide-react";
import { Avatar } from "@/components/common/badges";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDoctorLookup } from "@/hooks/queries/use-doctors";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { DoctorLookup } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface DoctorPickerProps {
  value: string;
  /** label of the current value, so we can show it before a lookup runs */
  selected?: Pick<DoctorLookup, "_id" | "name" | "specialization"> | null;
  onChange: (doctor: DoctorLookup | null) => void;
  placeholder?: string;
  /** adds a "Any doctor" entry (for filters) */
  allowClear?: boolean;
  id?: string;
  invalid?: boolean;
  className?: string;
  "aria-label"?: string;
}

/** Searchable doctor combobox backed by /doctors/lookup. */
export const DoctorPicker = memo(function DoctorPicker({
  value,
  selected,
  onChange,
  placeholder = "Select a doctor",
  allowClear,
  id,
  invalid,
  className,
  "aria-label": ariaLabel,
}: DoctorPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search, 250);
  const { data = [], isFetching } = useDoctorLookup(debounced, open);
  const current = selected && selected._id === value ? selected : data.find((d) => d._id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={invalid || undefined}
            aria-label={ariaLabel}
            className={cn(
              "h-10 w-full justify-between bg-card px-3 font-normal",
              !current && "text-muted-foreground",
              value && allowClear && "border-primary/40",
              className,
            )}
          />
        }
      >
        <span className="truncate">
          {current ? (
            <>
              {current.name}
              <span className="ml-1.5 text-muted-foreground">· {current.specialization}</span>
            </>
          ) : (
            placeholder
          )}
        </span>
        <ChevronsUpDown className="opacity-50" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--anchor-width) min-w-72 p-0">
        <Command shouldFilter={false}>
          <CommandInput value={search} onValueChange={setSearch} placeholder="Search doctors…" />
          <CommandList>
            {isFetching && data.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Searching…
              </div>
            ) : (
              <CommandEmpty>No doctors found.</CommandEmpty>
            )}
            <CommandGroup>
              {allowClear && !search && (
                <CommandItem
                  value="__any"
                  data-checked={!value}
                  onSelect={() => {
                    onChange(null);
                    setOpen(false);
                  }}
                >
                  <span className="text-muted-foreground">Any doctor</span>
                </CommandItem>
              )}
              {data.map((d) => (
                <CommandItem
                  key={d._id}
                  value={d._id}
                  data-checked={d._id === value}
                  onSelect={() => {
                    onChange(d);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <Avatar name={d.name} className="size-7 text-[10px]" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{d.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{d.specialization}</span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
});
