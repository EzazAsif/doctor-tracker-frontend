"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { Avatar, ConditionPill, StatusBadge } from "@/components/common/badges";
import type { Column } from "@/components/common/data-table";
import { RowActions } from "@/components/common/row-actions";
import type { Patient } from "@/lib/api/types";

interface Handlers {
  onEdit: (p: Patient) => void;
  onDelete: (p: Patient) => void;
  /** hide the doctor column on a doctor's own page */
  showDoctor?: boolean;
  deleteLabel?: string;
}

const GENDER_SHORT = { male: "M", female: "F", other: "Other" } as const;

/** Column defs shared by the patients page and the doctor detail page. Build inside useMemo. */
export function patientColumns({ onEdit, onDelete, showDoctor = true, deleteLabel = "Delete" }: Handlers): Column<Patient>[] {
  const cols: Column<Patient>[] = [
    {
      id: "name",
      header: "Patient",
      sortKey: "name",
      cell: (p) => (
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={p.name} className="bg-secondary text-secondary-foreground" />
          <div className="min-w-0">
            <p className="truncate font-medium">{p.name}</p>
            <p className="truncate text-xs text-muted-foreground tabular">{p.email || p.phone}</p>
          </div>
        </div>
      ),
    },
    {
      id: "age",
      header: "Age",
      sortKey: "age",
      cell: (p) => (
        <span className="tabular">
          {p.age} <span className="text-muted-foreground">· {GENDER_SHORT[p.gender]}</span>
        </span>
      ),
    },
    { id: "condition", header: "Condition", cell: (p) => <ConditionPill condition={p.condition} /> },
    { id: "status", header: "Status", cell: (p) => <StatusBadge status={p.status} /> },
  ];

  if (showDoctor) {
    cols.push({
      id: "doctor",
      header: "Doctor",
      cell: (p) =>
        p.doctor ? (
          <Link
            href={`/doctors/${p.doctor._id}`}
            className="block max-w-[200px] outline-none hover:underline focus-visible:underline"
          >
            <span className="block truncate">{p.doctor.name}</span>
            <span className="block truncate text-xs text-muted-foreground">{p.doctor.specialization}</span>
          </Link>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    });
  }

  cols.push(
    {
      id: "admissionDate",
      header: "Admitted",
      sortKey: "admissionDate",
      cell: (p) => (
        <span className="whitespace-nowrap text-muted-foreground tabular">{format(parseISO(p.admissionDate), "d MMM yyyy")}</span>
      ),
    },
    {
      id: "actions",
      header: <span className="sr-only">Actions</span>,
      className: "w-12",
      cell: (p) => (
        <RowActions
          label={`Actions for ${p.name}`}
          actions={[
            { label: "Edit", icon: Pencil, onSelect: () => onEdit(p) },
            { label: deleteLabel, icon: Trash2, destructive: true, onSelect: () => onDelete(p) },
          ]}
        />
      ),
    },
  );

  return cols;
}

export function PatientMobileCard({
  patient: p,
  onEdit,
  onDelete,
  showDoctor = true,
  deleteLabel = "Delete",
}: { patient: Patient } & Handlers) {
  return (
    <div className="flex items-start gap-3 p-4">
      <Avatar name={p.name} className="bg-secondary text-secondary-foreground" />
      <button type="button" onClick={() => onEdit(p)} className="min-w-0 flex-1 text-left outline-none">
        <p className="truncate font-medium">{p.name}</p>
        <p className="truncate text-xs text-muted-foreground tabular">
          {p.age} yrs · <span className="capitalize">{p.gender}</span>
          {showDoctor && p.doctor ? ` · ${p.doctor.name}` : ""}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <StatusBadge status={p.status} />
          <ConditionPill condition={p.condition} />
        </div>
      </button>
      <RowActions
        label={`Actions for ${p.name}`}
        actions={[
          { label: "Edit", icon: Pencil, onSelect: () => onEdit(p) },
          { label: deleteLabel, icon: Trash2, destructive: true, onSelect: () => onDelete(p) },
        ]}
      />
    </div>
  );
}
