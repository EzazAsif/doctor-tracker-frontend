import { api } from "./client";
import type {
  DashboardStats,
  Doctor,
  DoctorInput,
  DoctorLookup,
  DoctorOptions,
  ID,
  Paginated,
  Patient,
  PatientInput,
  User,
} from "./types";

type Data<T> = { data: T };

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  from?: string;
  to?: string;
}

export interface DoctorListParams extends ListParams {
  specialization?: string;
  hospital?: string;
}

export interface PatientListParams extends ListParams {
  condition?: string;
  status?: string;
  gender?: string;
  doctor?: string;
}

export const authApi = {
  login: (body: { email: string; password: string }) =>
    api<Data<{ user: User }>>("/auth/login", { method: "POST", body }).then((r) => r.data.user),
  logout: () => api<Data<{ ok: true }>>("/auth/logout", { method: "POST" }),
  me: () => api<Data<{ user: User }>>("/auth/me").then((r) => r.data.user),
};

export const doctorsApi = {
  list: (params: DoctorListParams, signal?: AbortSignal) =>
    api<Paginated<Doctor>>("/doctors", { query: { ...params }, signal }),
  options: () => api<Data<DoctorOptions>>("/doctors/options").then((r) => r.data),
  lookup: (search: string, signal?: AbortSignal) =>
    api<Data<DoctorLookup[]>>("/doctors/lookup", { query: { search }, signal }).then((r) => r.data),
  get: (id: ID, signal?: AbortSignal) => api<Data<Doctor>>(`/doctors/${id}`, { signal }).then((r) => r.data),
  create: (body: DoctorInput) => api<Data<Doctor>>("/doctors", { method: "POST", body }).then((r) => r.data),
  update: (id: ID, body: Partial<DoctorInput>) =>
    api<Data<Doctor>>(`/doctors/${id}`, { method: "PATCH", body }).then((r) => r.data),
  remove: (id: ID) =>
    api<Data<{ deleted: true; patientsDeleted: number }>>(`/doctors/${id}`, { method: "DELETE" }).then((r) => r.data),
  patients: (id: ID, params: PatientListParams, signal?: AbortSignal) =>
    api<Paginated<Patient>>(`/doctors/${id}/patients`, { query: { ...params }, signal }),
  addPatient: (id: ID, body: Omit<PatientInput, "doctor">) =>
    api<Data<Patient>>(`/doctors/${id}/patients`, { method: "POST", body }).then((r) => r.data),
  removePatient: (id: ID, patientId: ID) =>
    api<Data<{ deleted: true }>>(`/doctors/${id}/patients/${patientId}`, { method: "DELETE" }),
};

export const patientsApi = {
  list: (params: PatientListParams, signal?: AbortSignal) =>
    api<Paginated<Patient>>("/patients", { query: { ...params }, signal }),
  get: (id: ID) => api<Data<Patient>>(`/patients/${id}`).then((r) => r.data),
  create: (body: PatientInput) => api<Data<Patient>>("/patients", { method: "POST", body }).then((r) => r.data),
  update: (id: ID, body: Partial<PatientInput>) =>
    api<Data<Patient>>(`/patients/${id}`, { method: "PATCH", body }).then((r) => r.data),
  remove: (id: ID) => api<Data<{ deleted: true }>>(`/patients/${id}`, { method: "DELETE" }),
};

export const dashboardApi = {
  stats: (params: { from?: string; to?: string }, signal?: AbortSignal) =>
    api<Data<DashboardStats>>("/dashboard/stats", { query: { ...params }, signal }).then((r) => r.data),
};
