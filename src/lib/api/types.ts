export type ID = string;

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PageMeta;
}

export interface User {
  _id: ID;
  name: string;
  email: string;
  role: "admin" | "doctor";
  doctor?: ID;
}

export interface StaffUser {
  _id: ID;
  name: string;
  email: string;
  role: User["role"];
  active: boolean;
  createdAt: string;
  doctor?: { _id: ID; name: string; specialization: string; email: string } | null;
}

export interface ActivityEvent {
  _id: ID;
  actor: { _id: ID; name: string; role: User["role"] } | null;
  actorRole: User["role"];
  action: "created" | "updated" | "deleted" | "imported" | "deactivated";
  resource: "doctor" | "patient" | "user";
  resourceId: string;
  fields?: string[];
  importedCount?: number;
  failedCount?: number;
  relatedCount?: number;
  createdAt: string;
}

export interface Doctor {
  _id: ID;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  patientCount: number;
  createdAt: string;
  updatedAt: string;
}

export type DoctorInput = Pick<Doctor, "name" | "specialization" | "hospital" | "phone" | "email">;

export const CONDITIONS = [
  "Hypertension",
  "Diabetes",
  "Asthma",
  "Cardiac",
  "Orthopedic",
  "Respiratory",
  "Neurological",
  "Dermatology",
  "Pediatric",
  "General",
] as const;
export type Condition = (typeof CONDITIONS)[number];

export const STATUSES = ["admitted", "under_treatment", "recovered", "discharged"] as const;
export type PatientStatus = (typeof STATUSES)[number];

export const GENDERS = ["male", "female", "other"] as const;
export type Gender = (typeof GENDERS)[number];

export interface Patient {
  _id: ID;
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  email?: string;
  condition: Condition;
  status: PatientStatus;
  admissionDate: string;
  notes?: string;
  doctor: { _id: ID; name: string; specialization: string };
  createdAt: string;
  updatedAt: string;
}

export interface PatientInput {
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  email?: string;
  condition: Condition;
  status: PatientStatus;
  admissionDate: string;
  notes?: string;
  doctor: ID;
}

export interface DoctorOptions {
  specializations: string[];
  hospitals: string[];
}

export interface DoctorLookup {
  _id: ID;
  name: string;
  specialization: string;
}

export interface DashboardStats {
  totals: {
    doctors: number;
    patients: number;
    patientsInRange: number;
    newPatientsThisMonth: number;
    avgPatientsPerDoctor: number;
  };
  patientsPerDoctor: { doctorId: ID; name: string; specialization: string; count: number }[];
  patientsOverTime: { period: string; count: number }[];
  doctorsOverTime: { period: string; count: number }[];
  conditionBreakdown: { condition: Condition; count: number }[];
  statusBreakdown: { status: PatientStatus; count: number }[];
  specializationBreakdown: { specialization: string; doctors: number; patients: number }[];
  genderBreakdown: { gender: Gender; count: number }[];
}
