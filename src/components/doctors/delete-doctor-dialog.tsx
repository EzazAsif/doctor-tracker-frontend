"use client";

import { toast } from "sonner";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { useDeleteDoctor } from "@/hooks/queries/use-doctors";
import { errorMessage } from "@/lib/api/client";
import type { Doctor } from "@/lib/api/types";

interface DeleteDoctorDialogProps {
  doctor: Doctor | null;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export function DeleteDoctorDialog({ doctor, onOpenChange, onDeleted }: DeleteDoctorDialogProps) {
  const remove = useDeleteDoctor();

  return (
    <ConfirmDialog
      open={Boolean(doctor)}
      onOpenChange={onOpenChange}
      title={`Delete ${doctor?.name ?? "doctor"}?`}
      description={
        doctor && doctor.patientCount > 0 ? (
          <>
            This also deletes their <strong className="text-foreground">{doctor.patientCount} patients</strong>. This can&apos;t
            be undone.
          </>
        ) : (
          "This doctor has no patients. This can't be undone."
        )
      }
      confirmLabel="Delete doctor"
      pending={remove.isPending}
      onConfirm={() => {
        if (!doctor) return;
        remove.mutate(doctor._id, {
          onSuccess: (res) => {
            toast.success(
              res.patientsDeleted
                ? `${doctor.name} and ${res.patientsDeleted} patients deleted`
                : `${doctor.name} deleted`,
            );
            onOpenChange(false);
            onDeleted?.();
          },
          onError: (error) => toast.error(errorMessage(error)),
        });
      }}
    />
  );
}
