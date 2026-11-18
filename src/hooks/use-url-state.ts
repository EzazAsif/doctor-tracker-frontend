"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type UrlPatch = Record<string, string | number | null | undefined>;

/**
 * Search, filters, sort and page all live in the query string so a view can be
 * shared or bookmarked and survives back/forward. Any change other than `page`
 * resets pagination back to 1.
 */
export function useUrlState<K extends string>(keys: readonly K[], defaults: Partial<Record<K, string>> = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qs = searchParams.toString();

  const values = useMemo(() => {
    const params = new URLSearchParams(qs);
    const out = {} as Record<K, string>;
    for (const key of keys) out[key] = params.get(key) ?? defaults[key] ?? "";
    return out;
    // keys/defaults are static per page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qs]);

  const setParams = useCallback(
    (patch: UrlPatch, opts: { push?: boolean } = {}) => {
      const params = new URLSearchParams(window.location.search);
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === undefined || value === "") params.delete(key);
        else params.set(key, String(value));
      }
      if (!("page" in patch)) params.delete("page");
      if (params.get("page") === "1") params.delete("page");
      const next = params.toString();
      const url = next ? `${pathname}?${next}` : pathname;
      if (opts.push) router.push(url, { scroll: false });
      else router.replace(url, { scroll: false });
    },
    [pathname, router],
  );

  const clear = useCallback(() => router.replace(pathname, { scroll: false }), [pathname, router]);

  return { values, setParams, clear };
}

export function toInt(value: string | undefined, fallback: number) {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
