import type { DoctorListParams, PatientListParams } from "@/lib/api/endpoints";

export const qk = {
  me: ["me"] as const,
  doctors: {
    all: ["doctors"] as const,
    lists: () => [...qk.doctors.all, "list"] as const,
    list: (params: DoctorListParams) => [...qk.doctors.lists(), params] as const,
    options: () => [...qk.doctors.all, "options"] as const,
    lookup: (search: string) => [...qk.doctors.all, "lookup", search] as const,
    detail: (id: string) => [...qk.doctors.all, "detail", id] as const,
    patients: (id: string, params?: PatientListParams) =>
      params
        ? ([...qk.doctors.all, "detail", id, "patients", params] as const)
        : ([...qk.doctors.all, "detail", id, "patients"] as const),
  },
  patients: {
    all: ["patients"] as const,
    lists: () => [...qk.patients.all, "list"] as const,
    list: (params: PatientListParams) => [...qk.patients.lists(), params] as const,
  },
  dashboard: (range: { from?: string; to?: string }) => ["dashboard", range] as const,
  staff: ["staff"] as const,
  activity: (page: number) => ["activity", page] as const,
};
