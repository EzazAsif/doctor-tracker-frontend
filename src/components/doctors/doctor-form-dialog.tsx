"use client";

import { useEffect, useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { FormField } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCreateDoctor, useDoctorOptions, useUpdateDoctor } from "@/hooks/queries/use-doctors";
import { errorMessage } from "@/lib/api/client";
import type { Doctor } from "@/lib/api/types";
import { applyServerErrors, PHONE_RE } from "@/lib/forms";

const schema = z.object({
  name: z.string().trim().min(2, "At least 2 characters").max(100, "At most 100 characters"),
  specialization: z.string().trim().min(2, "At least 2 characters").max(80, "At most 80 characters"),
  hospital: z.string().trim().min(2, "At least 2 characters").max(120, "At most 120 characters"),
  phone: z.string().trim().regex(PHONE_RE, "7–20 digits; spaces, + - ( ) allowed"),
  email: z.email("Enter a valid email").trim().toLowerCase(),
});
type Values = z.infer<typeof schema>;
const FIELDS = ["name", "specialization", "hospital", "phone", "email"] as const;

const EMPTY: Values = { name: "", specialization: "", hospital: "", phone: "", email: "" };

interface DoctorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** pass a doctor to edit, omit to create */
  doctor?: Doctor | null;
  onCreated?: (doctor: Doctor) => void;
}

export function DoctorFormDialog({ open, onOpenChange, doctor, onCreated }: DoctorFormDialogProps) {
  const isEdit = Boolean(doctor);
  const listId = useId();
  const create = useCreateDoctor();
  const update = useUpdateDoctor();
  const { data: options } = useDoctorOptions();
  const pending = create.isPending || update.isPending;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  useEffect(() => {
    if (open) reset(doctor ? { ...EMPTY, ...Object.fromEntries(FIELDS.map((f) => [f, doctor[f]])) } : EMPTY);
  }, [open, doctor, reset]);

  const onSubmit = handleSubmit((values) => {
    const onError = (error: unknown) => {
      if (!applyServerErrors(error, setError, FIELDS)) toast.error(errorMessage(error));
    };

    if (doctor) {
      update.mutate(
        { id: doctor._id, body: values },
        {
          onSuccess: (d) => {
            toast.success(`${d.name} updated`);
            onOpenChange(false);
          },
          onError,
        },
      );
    } else {
      create.mutate(values, {
        onSuccess: (d) => {
          toast.success(`${d.name} added`);
          onOpenChange(false);
          onCreated?.(d);
        },
        onError,
      });
    }
  });

  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">{isEdit ? "Edit doctor" : "Add doctor"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this practitioner's details." : "Add a practitioner and their hospital assignment."}
          </DialogDescription>
        </DialogHeader>

        <form id="doctor-form" onSubmit={onSubmit} noValidate className="grid gap-4 py-1 sm:grid-cols-2">
          <FormField label="Full name" error={errors.name?.message} className="sm:col-span-2">
            {(f) => <Input {...f} {...register("name")} placeholder="Dr. Nadia Rahman" autoComplete="off" />}
          </FormField>
          <FormField label="Specialization" error={errors.specialization?.message}>
            {(f) => (
              <Input {...f} {...register("specialization")} list={`${listId}-spec`} placeholder="Cardiology" autoComplete="off" />
            )}
          </FormField>
          <FormField label="Hospital" error={errors.hospital?.message}>
            {(f) => (
              <Input {...f} {...register("hospital")} list={`${listId}-hosp`} placeholder="Square Hospital" autoComplete="off" />
            )}
          </FormField>
          <FormField label="Phone" error={errors.phone?.message}>
            {(f) => <Input {...f} {...register("phone")} type="tel" placeholder="+880 1711 000000" autoComplete="off" />}
          </FormField>
          <FormField label="Email" error={errors.email?.message}>
            {(f) => <Input {...f} {...register("email")} type="email" placeholder="name@hospital.com" autoComplete="off" />}
          </FormField>
          <datalist id={`${listId}-spec`}>
            {options?.specializations.map((s) => <option key={s} value={s} />)}
          </datalist>
          <datalist id={`${listId}-hosp`}>
            {options?.hospitals.map((h) => <option key={h} value={h} />)}
          </datalist>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" form="doctor-form" disabled={pending || (isEdit && !isDirty)}>
            {pending && <Loader2 className="animate-spin" />}
            {isEdit ? "Save changes" : "Add doctor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
