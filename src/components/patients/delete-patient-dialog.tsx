"use client";

import { toast } from "sonner";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { useDeletePatient } from "@/hooks/queries/use-patients";
import { errorMessage } from "@/lib/api/client";
import type { Patient } from "@/lib/api/types";

interface DeletePatientDialogProps {
  patient: Patient | null;
  onOpenChange: (open: boolean) => void;
  /** remove through /doctors/:id/patients/:patientId instead of /patients/:id */
  doctorId?: string;
  doctorName?: string;
}

export function DeletePatientDialog({ patient, onOpenChange, doctorId, doctorName }: DeletePatientDialogProps) {
  const remove = useDeletePatient(doctorId);

  return (
    <ConfirmDialog
      open={Boolean(patient)}
      onOpenChange={onOpenChange}
      title={doctorId ? `Remove ${patient?.name ?? "patient"}?` : `Delete ${patient?.name ?? "patient"}?`}
      description={
        doctorId
          ? `${patient?.name} will be removed from ${doctorName ?? "this doctor"}'s caseload and deleted. This can't be undone.`
          : "Their record and notes will be permanently deleted. This can't be undone."
      }
      confirmLabel={doctorId ? "Remove patient" : "Delete patient"}
      onConfirm={() => {
        if (!patient) return;
        // optimistic: the row disappears right away, so close immediately
        onOpenChange(false);
        remove.mutate(patient, {
          onSuccess: () => toast.success(`${patient.name} ${doctorId ? "removed" : "deleted"}`),
          onError: (error) => toast.error(`Couldn't delete ${patient.name}: ${errorMessage(error)}`),
        });
      }}
    />
  );
}
