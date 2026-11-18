"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { doctorsApi, type DoctorListParams } from "@/lib/api/endpoints";
import type { DoctorInput } from "@/lib/api/types";
import { qk } from "./keys";

export function useDoctors(params: DoctorListParams) {
  return useQuery({
    queryKey: qk.doctors.list(params),
    queryFn: ({ signal }) => doctorsApi.list(params, signal),
    placeholderData: keepPreviousData,
  });
}

export function useDoctorOptions() {
  return useQuery({
    queryKey: qk.doctors.options(),
    queryFn: doctorsApi.options,
    staleTime: 5 * 60_000,
  });
}

export function useDoctorLookup(search: string, enabled = true) {
  return useQuery({
    queryKey: qk.doctors.lookup(search),
    queryFn: ({ signal }) => doctorsApi.lookup(search, signal),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    enabled,
  });
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: qk.doctors.detail(id),
    queryFn: ({ signal }) => doctorsApi.get(id, signal),
  });
}

function useInvalidateDoctors() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: qk.doctors.all }),
      qc.invalidateQueries({ queryKey: ["dashboard"] }),
    ]);
}

export function useCreateDoctor() {
  const invalidate = useInvalidateDoctors();
  return useMutation({
    mutationFn: (body: DoctorInput) => doctorsApi.create(body),
    onSuccess: invalidate,
  });
}

export function useUpdateDoctor() {
  const qc = useQueryClient();
  const invalidate = useInvalidateDoctors();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<DoctorInput> }) => doctorsApi.update(id, body),
    onSuccess: (doctor) => {
      qc.setQueryData(qk.doctors.detail(doctor._id), doctor);
      // patient rows embed the doctor's name/specialization
      qc.invalidateQueries({ queryKey: qk.patients.all });
      return invalidate();
    },
  });
}

export function useDeleteDoctor() {
  const qc = useQueryClient();
  const invalidate = useInvalidateDoctors();
  return useMutation({
    mutationFn: (id: string) => doctorsApi.remove(id),
    onSuccess: (_res, id) => {
      qc.removeQueries({ queryKey: qk.doctors.detail(id) });
      qc.invalidateQueries({ queryKey: qk.patients.all });
      return invalidate();
    },
  });
}
