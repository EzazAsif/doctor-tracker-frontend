"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { activityApi, staffApi } from "@/lib/api/endpoints";
import { qk } from "./keys";

export function useStaff() {
  return useQuery({ queryKey: qk.staff, queryFn: staffApi.list });
}

export function useCreateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: staffApi.create,
    onSuccess: () => Promise.all([qc.invalidateQueries({ queryKey: qk.staff }), qc.invalidateQueries({ queryKey: ["activity"] })]),
  });
}

export function useSetStaffActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => staffApi.setActive(id, active),
    onSuccess: () => Promise.all([qc.invalidateQueries({ queryKey: qk.staff }), qc.invalidateQueries({ queryKey: ["activity"] })]),
  });
}

export function useActivity(page: number) {
  return useQuery({
    queryKey: qk.activity(page),
    queryFn: () => activityApi.list({ page, limit: 20 }),
    placeholderData: (previous) => previous,
  });
}
