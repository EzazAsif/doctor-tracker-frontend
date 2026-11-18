"use client";

import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { STATUS_LABEL } from "@/components/common/badges";
import { FormField } from "@/components/common/form-field";
import { DoctorPicker } from "@/components/doctors/doctor-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useAddDoctorPatient, useCreatePatient, useUpdatePatient } from "@/hooks/queries/use-patients";
import { errorMessage } from "@/lib/api/client";
import { CONDITIONS, GENDERS, STATUSES, type DoctorLookup, type Patient } from "@/lib/api/types";
import { applyServerErrors, PHONE_RE } from "@/lib/forms";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(2, "At least 2 characters").max(100, "At most 100 characters"),
  age: z.coerce.number<string | number>({ error: "Enter an age" }).int("Whole years only").min(0, "0–120").max(120, "0–120"),
  gender: z.enum(GENDERS, { error: "Pick a gender" }),
  phone: z.string().trim().regex(PHONE_RE, "7–20 digits; spaces, + - ( ) allowed"),
  email: z.union([z.literal(""), z.email("Enter a valid email")]),
  condition: z.enum(CONDITIONS, { error: "Pick a condition" }),
  status: z.enum(STATUSES),
  admissionDate: z.string().min(1, "Pick a date"),
  notes: z.string().max(500, "At most 500 characters"),
  doctor: z.string().min(1, "Assign a doctor"),
});
type FormInput = z.input<typeof schema>;
type Values = z.output<typeof schema>;
const FIELDS = ["name", "age", "gender", "phone", "email", "condition", "status", "admissionDate", "notes", "doctor"] as const;

const today = () => format(new Date(), "yyyy-MM-dd");

function defaults(patient?: Patient | null, doctorId?: string): FormInput {
  if (patient) {
    return {
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      phone: patient.phone,
      email: patient.email ?? "",
      condition: patient.condition,
      status: patient.status,
      admissionDate: format(parseISO(patient.admissionDate), "yyyy-MM-dd"),
      notes: patient.notes ?? "",
      doctor: patient.doctor?._id ?? doctorId ?? "",
    };
  }
  return {
    name: "",
    age: "",
    gender: "female",
    phone: "",
    email: "",
    condition: "General",
    status: "admitted",
    admissionDate: today(),
    notes: "",
    doctor: doctorId ?? "",
  };
}

interface PatientFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: Patient | null;
  /** when set, the patient is created under this doctor and the picker is hidden */
  doctor?: Pick<DoctorLookup, "_id" | "name" | "specialization">;
}

const conditionItems = CONDITIONS.map((c) => ({ value: c, label: c }));
const statusItems = STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] }));

export function PatientFormSheet({ open, onOpenChange, patient, doctor }: PatientFormSheetProps) {
  const isEdit = Boolean(patient);
  const create = useCreatePatient();
  const addToDoctor = useAddDoctorPatient(doctor?._id ?? "");
  const update = useUpdatePatient();
  const pending = create.isPending || addToDoctor.isPending || update.isPending;
  const [pickedDoctor, setPickedDoctor] = useState<DoctorLookup | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<FormInput, unknown, Values>({ resolver: zodResolver(schema), defaultValues: defaults(null, doctor?._id) });

  useEffect(() => {
    if (open) {
      reset(defaults(patient, doctor?._id));
      setPickedDoctor(null);
    }
  }, [open, patient, doctor?._id, reset]);

  const notesLength = useWatch({ control, name: "notes" })?.length ?? 0;

  const onSubmit = handleSubmit((values) => {
    const body = {
      ...values,
      email: values.email || undefined,
      notes: values.notes || undefined,
      admissionDate: new Date(`${values.admissionDate}T12:00:00`).toISOString(),
    };
    const handlers = {
      onSuccess: (p: Patient) => {
        toast.success(isEdit ? `${p.name} updated` : `${p.name} added`);
        onOpenChange(false);
      },
      onError: (error: unknown) => {
        if (!applyServerErrors(error, setError, FIELDS)) toast.error(errorMessage(error));
      },
    };

    if (patient) update.mutate({ id: patient._id, body }, handlers);
    else if (doctor) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { doctor: _ignored, ...rest } = body;
      addToDoctor.mutate(rest, handlers);
    } else create.mutate(body, handlers);
  });

  const selectedDoctor = pickedDoctor ?? patient?.doctor ?? doctor ?? null;

  return (
    <Sheet open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b px-5 py-4 sm:px-6">
          <SheetTitle className="text-xl font-semibold">{isEdit ? "Edit patient" : "Add patient"}</SheetTitle>
          <SheetDescription>
            {doctor && !isEdit ? `Admitting under ${doctor.name}` : isEdit ? "Update clinical and contact details." : "Register a patient and assign their doctor."}
          </SheetDescription>
        </SheetHeader>

        <form
          id="patient-form"
          onSubmit={onSubmit}
          noValidate
          className="grid flex-1 content-start gap-4 overflow-y-auto px-5 py-5 sm:grid-cols-6 sm:px-6"
        >
          <FormField label="Full name" error={errors.name?.message} className="sm:col-span-6">
            {(f) => <Input {...f} {...register("name")} placeholder="Farhana Akter" autoComplete="off" />}
          </FormField>

          <FormField label="Age" error={errors.age?.message} className="sm:col-span-2">
            {(f) => <Input {...f} {...register("age")} type="number" inputMode="numeric" min={0} max={120} placeholder="42" />}
          </FormField>

          <fieldset className="flex flex-col gap-1.5 sm:col-span-4">
            <legend className="mb-1.5 text-sm font-medium">Gender</legend>
            <Controller
              control={control}
              name="gender"
              render={({ field }) => (
                <div role="radiogroup" aria-label="Gender" className="grid h-10 grid-cols-3 gap-1 rounded-lg border bg-muted/60 p-1">
                  {GENDERS.map((g) => (
                    <label
                      key={g}
                      className={cn(
                        "grid cursor-pointer place-items-center rounded-md text-sm capitalize transition-colors has-focus-visible:ring-2 has-focus-visible:ring-ring",
                        field.value === g ? "bg-card font-medium text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <input
                        type="radio"
                        name={field.name}
                        value={g}
                        checked={field.value === g}
                        onChange={() => field.onChange(g)}
                        className="sr-only"
                      />
                      {g}
                    </label>
                  ))}
                </div>
              )}
            />
            {errors.gender && <p className="text-[13px] text-destructive">{errors.gender.message}</p>}
          </fieldset>

          <FormField label="Phone" error={errors.phone?.message} className="sm:col-span-3">
            {(f) => <Input {...f} {...register("phone")} type="tel" placeholder="+880 1711 000000" autoComplete="off" />}
          </FormField>
          <FormField label="Email" optional error={errors.email?.message} className="sm:col-span-3">
            {(f) => <Input {...f} {...register("email")} type="email" placeholder="name@mail.com" autoComplete="off" />}
          </FormField>

          <FormField label="Condition" error={errors.condition?.message} className="sm:col-span-3">
            {(f) => (
              <Controller
                control={control}
                name="condition"
                render={({ field }) => (
                  <Select items={conditionItems} value={field.value} onValueChange={(v) => field.onChange(v)}>
                    <SelectTrigger id={f.id} aria-invalid={f["aria-invalid"]} className="w-full bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {conditionItems.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
          </FormField>
          <FormField label="Status" error={errors.status?.message} className="sm:col-span-3">
            {(f) => (
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select items={statusItems} value={field.value} onValueChange={(v) => field.onChange(v)}>
                    <SelectTrigger id={f.id} className="w-full bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusItems.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
          </FormField>

          {!doctor && (
            <FormField label="Doctor" error={errors.doctor?.message} className="sm:col-span-6">
              {(f) => (
                <Controller
                  control={control}
                  name="doctor"
                  render={({ field }) => (
                    <DoctorPicker
                      id={f.id}
                      invalid={Boolean(errors.doctor)}
                      value={field.value}
                      selected={selectedDoctor}
                      onChange={(d) => {
                        setPickedDoctor(d);
                        field.onChange(d?._id ?? "");
                      }}
                    />
                  )}
                />
              )}
            </FormField>
          )}

          <FormField label="Admission date" error={errors.admissionDate?.message} className="sm:col-span-3">
            {(f) => <Input {...f} {...register("admissionDate")} type="date" max={today()} className="bg-card" />}
          </FormField>

          <FormField
            label="Notes"
            optional
            error={errors.notes?.message}
            hint={<span className={cn("tabular", notesLength > 500 && "text-destructive")}>{notesLength}/500</span>}
            className="sm:col-span-6"
          >
            {(f) => <Textarea {...f} {...register("notes")} rows={4} placeholder="Clinical notes, allergies, follow-ups…" />}
          </FormField>
        </form>

        <SheetFooter className="flex-row justify-end gap-2 border-t px-5 py-4 sm:px-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" form="patient-form" disabled={pending || (isEdit && !isDirty)}>
            {pending && <Loader2 className="animate-spin" />}
            {isEdit ? "Save changes" : "Add patient"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
