"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { doctorsApi, patientsApi, type PatientListParams } from "@/lib/api/endpoints";
import type { Paginated, Patient, PatientInput } from "@/lib/api/types";
import { qk } from "./keys";

export function usePatients(params: PatientListParams) {
  return useQuery({
    queryKey: qk.patients.list(params),
    queryFn: ({ signal }) => patientsApi.list(params, signal),
    placeholderData: keepPreviousData,
  });
}

export function useDoctorPatients(doctorId: string, params: PatientListParams) {
  return useQuery({
    queryKey: qk.doctors.patients(doctorId, params),
    queryFn: ({ signal }) => doctorsApi.patients(doctorId, params, signal),
    placeholderData: keepPreviousData,
  });
}

/** Anything that shows patient numbers needs a refresh after a patient changes. */
function useInvalidatePatientData() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: qk.patients.all }),
      qc.invalidateQueries({ queryKey: qk.doctors.all }),
      qc.invalidateQueries({ queryKey: ["dashboard"] }),
    ]);
}

export function useCreatePatient() {
  const invalidate = useInvalidatePatientData();
  return useMutation({
    mutationFn: (body: PatientInput) => patientsApi.create(body),
    onSuccess: invalidate,
  });
}

export function useAddDoctorPatient(doctorId: string) {
  const invalidate = useInvalidatePatientData();
  return useMutation({
    mutationFn: (body: Omit<PatientInput, "doctor">) => doctorsApi.addPatient(doctorId, body),
    onSuccess: invalidate,
  });
}

export function useUpdatePatient() {
  const invalidate = useInvalidatePatientData();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<PatientInput> }) => patientsApi.update(id, body),
    onSuccess: invalidate,
  });
}

type Snapshot = [QueryKey, Paginated<Patient> | undefined][];

/**
 * Optimistic delete: drop the row from every cached patient list (global and
 * per-doctor) right away, roll back if the request fails.
 */
export function useDeletePatient(doctorId?: string) {
  const qc = useQueryClient();
  const invalidate = useInvalidatePatientData();

  return useMutation({
    mutationFn: (patient: Pick<Patient, "_id" | "name">) =>
      doctorId ? doctorsApi.removePatient(doctorId, patient._id) : patientsApi.remove(patient._id),
    onMutate: async (patient) => {
      const filters: { queryKey: QueryKey }[] = [{ queryKey: qk.patients.lists() }, { queryKey: qk.doctors.all }];
      await Promise.all(filters.map((f) => qc.cancelQueries(f)));

      const snapshot: Snapshot = filters.flatMap((f) => qc.getQueriesData<Paginated<Patient>>(f));
      for (const [key, value] of snapshot) {
        if (!value || !Array.isArray(value.data) || !value.meta) continue;
        if (!value.data.some((p) => p._id === patient._id)) continue;
        qc.setQueryData<Paginated<Patient>>(key, {
          data: value.data.filter((p) => p._id !== patient._id),
          meta: { ...value.meta, total: Math.max(0, value.meta.total - 1) },
        });
      }
      return { snapshot };
    },
    onError: (_err, _patient, ctx) => {
      ctx?.snapshot.forEach(([key, value]) => qc.setQueryData(key, value));
    },
    onSettled: invalidate,
  });
}
