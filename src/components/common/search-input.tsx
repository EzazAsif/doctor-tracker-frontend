"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  delay?: number;
  className?: string;
}

/**
 * Keeps its own text state so typing stays instant, and only reports the
 * debounced value upwards (which is what ends up in the URL / query key).
 */
export const SearchInput = memo(function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  label = "Search",
  delay = 350,
  className,
}: SearchInputProps) {
  const [text, setText] = useState(value);
  const debounced = useDebouncedValue(text, delay);
  const onChangeRef = useRef(onChange);
  const lastSent = useRef(value);

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  // external changes (clear filters, back/forward) win over local text
  useEffect(() => {
    if (value !== lastSent.current) {
      lastSent.current = value;
      setText(value);
    }
  }, [value]);

  useEffect(() => {
    const next = debounced.trim();
    if (next === lastSent.current) return;
    lastSent.current = next;
    onChangeRef.current(next);
  }, [debounced]);

  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        aria-label={label}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-input bg-card pr-9 pl-9 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 dark:bg-input/30 [&::-webkit-search-cancel-button]:hidden"
      />
      {text && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => setText("")}
          className="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
});
