"use client";

import { memo, useState } from "react";
import { format, parseISO } from "date-fns";
import { Building2, CalendarDays, Check, Copy, Mail, Pencil, Phone, Trash2 } from "lucide-react";
import { Avatar, Pill } from "@/components/common/badges";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Doctor } from "@/lib/api/types";

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={`Copy ${label}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard blocked; nothing to do */
        }
      }}
      className="grid size-6 place-items-center rounded text-muted-foreground opacity-60 outline-none hover:bg-muted hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring"
    >
      {copied ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}
    </button>
  );
}

interface Stat {
  label: string;
  value: number | undefined;
  dot: string;
}

interface DoctorProfileCardProps {
  doctor?: Doctor;
  loading?: boolean;
  stats: Stat[];
  onEdit: () => void;
  onDelete: () => void;
}

export const DoctorProfileCard = memo(function DoctorProfileCard({ doctor, loading, stats, onEdit, onDelete }: DoctorProfileCardProps) {
  if (loading || !doctor) {
    return (
      <div className="rounded-xl border bg-card p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="mt-6 h-16 w-full" />
      </div>
    );
  }

  const meta = [
    { icon: Building2, value: doctor.hospital },
    { icon: Phone, value: doctor.phone, copy: "phone number" },
    { icon: Mail, value: doctor.email, copy: "email" },
    { icon: CalendarDays, value: `Joined ${format(parseISO(doctor.createdAt), "d MMM yyyy")}` },
  ];

  return (
    <section className="rounded-xl border bg-card">
      <div className="flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <Avatar name={doctor.name} className="size-14 text-lg sm:size-16" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold sm:text-[28px]">{doctor.name}</h1>
              <Pill className="border-primary/20 bg-accent text-accent-foreground">{doctor.specialization}</Pill>
            </div>
            <ul className="mt-3 grid gap-x-6 gap-y-1.5 text-sm text-muted-foreground sm:grid-cols-2">
              {meta.map(({ icon: Icon, value, copy }) => (
                <li key={value} className="flex min-w-0 items-center gap-2">
                  <Icon className="size-4 shrink-0 opacity-70" />
                  <span className="truncate text-foreground/85 tabular">{value}</span>
                  {copy && <CopyButton value={value} label={copy} />}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" onClick={onEdit} className="flex-1 lg:flex-none">
            <Pencil data-icon="inline-start" />
            Edit
          </Button>
          <Button variant="destructive" onClick={onDelete} className="flex-1 lg:flex-none">
            <Trash2 data-icon="inline-start" />
            Delete
          </Button>
        </div>
      </div>
      <dl className="grid grid-cols-3 divide-x border-t">
        {stats.map((s) => (
          <div key={s.label} className="px-4 py-4 sm:px-6">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground sm:text-[13px]">
              <span className="size-2 rounded-full" style={{ background: s.dot }} />
              {s.label}
            </dt>
            <dd className="mt-1 font-heading text-2xl font-semibold tabular">
              {s.value === undefined ? <Skeleton className="h-7 w-10" /> : s.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
});
