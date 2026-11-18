"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, UserX, UsersRound } from "lucide-react";
import { STATUS_LABEL } from "@/components/common/badges";
import { DataTable } from "@/components/common/data-table";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { FilterBar, FilterSelect, type Option } from "@/components/common/filter-bar";
import { Pagination } from "@/components/common/pagination";
import { SearchInput } from "@/components/common/search-input";
import { DeleteDoctorDialog } from "@/components/doctors/delete-doctor-dialog";
import { DoctorFormDialog } from "@/components/doctors/doctor-form-dialog";
import { DoctorProfileCard } from "@/components/doctors/doctor-profile-card";
import { DeletePatientDialog } from "@/components/patients/delete-patient-dialog";
import { patientColumns, PatientMobileCard } from "@/components/patients/patient-columns";
import { PatientFormSheet } from "@/components/patients/patient-form-sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { useDoctor } from "@/hooks/queries/use-doctors";
import { useDoctorPatients } from "@/hooks/queries/use-patients";
import { toInt, useUrlState } from "@/hooks/use-url-state";
import { ApiError } from "@/lib/api/client";
import { CONDITIONS, STATUSES, type Patient } from "@/lib/api/types";

const KEYS = ["search", "condition", "status", "page", "limit"] as const;
const CONDITION_OPTIONS: Option[] = CONDITIONS.map((c) => ({ value: c, label: c }));
const STATUS_OPTIONS: Option[] = STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] }));

/** count of one status for this doctor, via the paginated endpoint's meta.total */
function useStatusCount(id: string, status: string) {
  const { data } = useDoctorPatients(id, { status, limit: 1 });
  return data?.meta.total;
}

export function DoctorDetailView({ id }: { id: string }) {
  const router = useRouter();
  const { values, setParams, clear } = useUrlState(KEYS);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [patientFormOpen, setPatientFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [removing, setRemoving] = useState<Patient | null>(null);

  const doctorQuery = useDoctor(id);
  const doctor = doctorQuery.data;

  const params = useMemo(
    () => ({
      page: toInt(values.page, 1),
      limit: toInt(values.limit, 10),
      search: values.search || undefined,
      condition: values.condition || undefined,
      status: values.status || undefined,
    }),
    [values],
  );
  const { data, isLoading, isFetching, error, refetch } = useDoctorPatients(id, params);
  const admitted = useStatusCount(id, "admitted");
  const recovered = useStatusCount(id, "recovered");

  const stats = useMemo(
    () => [
      { label: "Patients", value: doctor?.patientCount, dot: "var(--primary)" },
      { label: "Admitted", value: admitted, dot: "var(--status-admitted)" },
      { label: "Recovered", value: recovered, dot: "var(--status-recovered)" },
    ],
    [doctor?.patientCount, admitted, recovered],
  );

  const activeFilters = [values.search, values.condition, values.status].filter(Boolean).length;

  const onSearch = useCallback((search: string) => setParams({ search }), [setParams]);
  const onCondition = useCallback((v: string) => setParams({ condition: v }), [setParams]);
  const onStatus = useCallback((v: string) => setParams({ status: v }), [setParams]);
  const onPage = useCallback((page: number) => setParams({ page }, { push: true }), [setParams]);
  const onLimit = useCallback((limit: number) => setParams({ limit }), [setParams]);
  const onEditPatient = useCallback((p: Patient) => {
    setEditingPatient(p);
    setPatientFormOpen(true);
  }, []);
  const onAddPatient = useCallback(() => {
    setEditingPatient(null);
    setPatientFormOpen(true);
  }, []);
  const onRemove = useCallback((p: Patient) => setRemoving(p), []);
  const onEditDoctor = useCallback(() => setEditOpen(true), []);
  const onDeleteDoctor = useCallback(() => setDeleteOpen(true), []);

  const columns = useMemo(
    () => patientColumns({ onEdit: onEditPatient, onDelete: onRemove, showDoctor: false, deleteLabel: "Remove" }),
    [onEditPatient, onRemove],
  );
  const renderMobileCard = useCallback(
    (p: Patient) => (
      <PatientMobileCard patient={p} onEdit={onEditPatient} onDelete={onRemove} showDoctor={false} deleteLabel="Remove" />
    ),
    [onEditPatient, onRemove],
  );

  const doctorRef = useMemo(
    () => (doctor ? { _id: doctor._id, name: doctor.name, specialization: doctor.specialization } : undefined),
    [doctor],
  );

  const notFound =
    doctorQuery.error instanceof ApiError && (doctorQuery.error.status === 404 || doctorQuery.error.status === 400);

  if (notFound) {
    return (
      <div className="rounded-xl border bg-card">
        <EmptyState
          icon={UserX}
          title="Doctor not found"
          description="They may have been deleted, or the link is wrong."
          action={
            <Link href="/doctors" className={buttonVariants({ variant: "outline" })}>
              Back to doctors
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-4">
        <Link
          href="/doctors"
          className="inline-flex items-center gap-1 rounded text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronLeft className="size-4" />
          Doctors
        </Link>
      </nav>

      {doctorQuery.error && !doctor ? (
        <div className="rounded-xl border bg-card">
          <ErrorState error={doctorQuery.error} onRetry={() => doctorQuery.refetch()} />
        </div>
      ) : (
        <DoctorProfileCard
          doctor={doctor}
          loading={doctorQuery.isLoading}
          stats={stats}
          onEdit={onEditDoctor}
          onDelete={onDeleteDoctor}
        />
      )}

      <section className="mt-6 overflow-hidden rounded-xl border bg-card" aria-labelledby="patients-heading">
        <header className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 id="patients-heading" className="text-lg font-semibold">
              Patients
            </h2>
            <p className="text-[13px] text-muted-foreground">
              {data ? `${data.meta.total} ${activeFilters ? "matching" : "under this doctor's care"}` : "Caseload"}
            </p>
          </div>
          <Button onClick={onAddPatient} disabled={!doctor} className="w-full sm:w-auto">
            <Plus data-icon="inline-start" />
            Add patient
          </Button>
        </header>

        <FilterBar
          activeCount={activeFilters}
          onClear={clear}
          search={<SearchInput value={values.search} onChange={onSearch} label="Search this doctor's patients" placeholder="Search patients…" />}
        >
          <FilterSelect label="Condition" allLabel="All conditions" value={values.condition} options={CONDITION_OPTIONS} onChange={onCondition} />
          <FilterSelect label="Status" allLabel="All statuses" value={values.status} options={STATUS_OPTIONS} onChange={onStatus} />
        </FilterBar>

        <DataTable
          caption={`Patients of ${doctor?.name ?? "this doctor"}`}
          columns={columns}
          rows={data?.data}
          getRowId={(p) => p._id}
          isLoading={isLoading}
          isFetching={isFetching}
          renderMobileCard={renderMobileCard}
          skeletonRows={5}
          error={error && !data ? <ErrorState error={error} onRetry={() => refetch()} /> : null}
          empty={
            activeFilters ? (
              <EmptyState
                title="No patients match"
                description="Try another search or clear the filters."
                action={
                  <Button variant="outline" onClick={clear}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={UsersRound}
                title="No patients yet"
                description="Admit a patient under this doctor to start their caseload."
                action={
                  <Button onClick={onAddPatient} disabled={!doctor}>
                    <Plus data-icon="inline-start" />
                    Add patient
                  </Button>
                }
              />
            )
          }
        />
        <Pagination meta={data?.meta} onPageChange={onPage} onLimitChange={onLimit} noun="patients" />
      </section>

      <DoctorFormDialog open={editOpen} onOpenChange={setEditOpen} doctor={doctor} />
      <DeleteDoctorDialog
        doctor={deleteOpen ? (doctor ?? null) : null}
        onOpenChange={setDeleteOpen}
        onDeleted={() => router.replace("/doctors")}
      />
      <PatientFormSheet
        open={patientFormOpen}
        onOpenChange={setPatientFormOpen}
        patient={editingPatient}
        doctor={editingPatient ? undefined : doctorRef}
      />
      <DeletePatientDialog
        patient={removing}
        onOpenChange={(open) => !open && setRemoving(null)}
        doctorId={id}
        doctorName={doctor?.name}
      />
    </>
  );
}
