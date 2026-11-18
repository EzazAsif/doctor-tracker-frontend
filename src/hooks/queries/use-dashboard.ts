"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/endpoints";
import { qk } from "./keys";

export function useDashboardStats(range: { from?: string; to?: string }) {
  return useQuery({
    queryKey: qk.dashboard(range),
    queryFn: ({ signal }) => dashboardApi.stats(range, signal),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}
