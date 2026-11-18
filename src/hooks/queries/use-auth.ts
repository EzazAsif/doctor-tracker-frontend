"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { suppressAuthRedirect } from "@/lib/api/client";
import { authApi } from "@/lib/api/endpoints";
import { qk } from "./keys";

export function useMe() {
  return useQuery({ queryKey: qk.me, queryFn: authApi.me, staleTime: 10 * 60_000 });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (user) => qc.setQueryData(qk.me, user),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onMutate: () => {
      suppressAuthRedirect();
    },
    onSettled: () => {
      qc.clear();
      window.location.assign("/login");
    },
  });
}
