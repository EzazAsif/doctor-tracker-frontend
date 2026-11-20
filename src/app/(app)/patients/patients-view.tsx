"use client";

import { useCallback, useMemo, useState } from "react";
import { Plus, Upload, UsersRound } from "lucide-react";
import { STATUS_LABEL } from "@/components/common/badges";
import { DataTable } from "@/components/common/data-table";
import { DateRangePicker, type DateRangeValue } from "@/components/common/date-range-picker";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { FilterBar, FilterSelect, type Option } from "@/components/common/filter-bar";
import { PageHeader } from "@/components/common/page-header";
import { Pagination } from "@/components/common/pagination";
import { SearchInput } from "@/components/common/search-input";
import { DoctorPicker } from "@/components/doctors/doctor-picker";
import { DeletePatientDialog } from "@/components/patients/delete-patient-dialog";
import { CsvImportDialog } from "@/components/common/csv-import-dialog";
import { patientColumns, PatientMobileCard } from "@/components/patients/patient-columns";
import { PatientFormSheet } from "@/components/patients/patient-form-sheet";
import { Button } from "@/components/ui/button";
import { useDoctor } from "@/hooks/queries/use-doctors";
import { usePatients } from "@/hooks/queries/use-patients";
import { useMe } from "@/hooks/queries/use-auth";
import { toInt, useUrlState } from "@/hooks/use-url-state";
import { CONDITIONS, GENDERS, STATUSES, type DoctorLookup, type Patient } from "@/lib/api/types";

const KEYS = ["search", "condition", "status", "gender", "doctor", "from", "to", "sort", "page", "limit"] as const;

const CONDITION_OPTIONS: Option[] = CONDITIONS.map((c) => ({ value: c, label: c }));
const STATUS_OPTIONS: Option[] = STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] }));
const GENDER_OPTIONS: Option[] = GENDERS.map((g) => ({ value: g, label: g[0].toUpperCase() + g.slice(1) }));
const SORT_OPTIONS: Option[] = [
  { value: "-admissionDate", label: "Recently admitted" },
  { value: "admissionDate", label: "Earliest admitted" },
  { value: "name", label: "Name A–Z" },
  { value: "-name", label: "Name Z–A" },
  { value: "age", label: "Youngest first" },
  { value: "-age", label: "Oldest first" },
];

export function PatientsView() {
  const { data: user } = useMe();
  const { values, setParams, clear } = useUrlState(KEYS, { sort: "-admissionDate" });
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [deleting, setDeleting] = useState<Patient | null>(null);
  const [doctorLabel, setDoctorLabel] = useState<DoctorLookup | null>(null);

  const params = useMemo(
    () => ({
      page: toInt(values.page, 1),
      limit: toInt(values.limit, 10),
      search: values.search || undefined,
      condition: values.condition || undefined,
      status: values.status || undefined,
      gender: values.gender || undefined,
      doctor: values.doctor || undefined,
      from: values.from || undefined,
      to: values.to || undefined,
      sort: values.sort,
    }),
    [values],
  );

  const { data, isLoading, isFetching, error, refetch } = usePatients(params);
  // a shared link may carry ?doctor=<id>: fetch its name for the picker label
  const needsDoctorName = user?.role !== "doctor" && Boolean(values.doctor) && doctorLabel?._id !== values.doctor;
  const { data: filterDoctor } = useDoctor(values.doctor, needsDoctorName);
  const pickerSelected = doctorLabel?._id === values.doctor ? doctorLabel : filterDoctor ?? null;

  const activeFilters = [
    values.search,
    values.condition,
    values.status,
    values.gender,
    values.doctor,
    values.from || values.to,
  ].filter(Boolean).length;

  const onSearch = useCallback((search: string) => setParams({ search }), [setParams]);
  const onCondition = useCallback((v: string) => setParams({ condition: v }), [setParams]);
  const onStatus = useCallback((v: string) => setParams({ status: v }), [setParams]);
  const onGender = useCallback((v: string) => setParams({ gender: v }), [setParams]);
  const onSort = useCallback((sort: string) => setParams({ sort }), [setParams]);
  const onDates = useCallback((v: DateRangeValue) => setParams({ from: v.from, to: v.to }), [setParams]);
  const onDoctor = useCallback(
    (d: DoctorLookup | null) => {
      setDoctorLabel(d);
      setParams({ doctor: d?._id ?? "" });
    },
    [setParams],
  );
  const onPage = useCallback((page: number) => setParams({ page }, { push: true }), [setParams]);
  const onLimit = useCallback((limit: number) => setParams({ limit }), [setParams]);
  const onEdit = useCallback((p: Patient) => {
    setEditing(p);
    setFormOpen(true);
  }, []);
  const onCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);
  const onDelete = useCallback((p: Patient) => setDeleting(p), []);

  const dateValue = useMemo(() => ({ from: values.from, to: values.to }), [values.from, values.to]);
  const columns = useMemo(() => patientColumns({ onEdit, onDelete, showDoctor: user?.role !== "doctor" }), [onEdit, onDelete, user?.role]);
  const renderMobileCard = useCallback(
    (p: Patient) => <PatientMobileCard patient={p} onEdit={onEdit} onDelete={onDelete} showDoctor={user?.role !== "doctor"} />,
    [onEdit, onDelete, user?.role],
  );

  return (
    <>
      <PageHeader
        title="Patients"
        description={
          data
            ? activeFilters
              ? `${data.meta.total.toLocaleString()} matching patients`
              : `${data.meta.total.toLocaleString()} patients across all doctors`
            : "Every patient, their condition and care status"
        }
        actions={
          <>
            <Button variant="outline" size="lg" onClick={() => setImportOpen(true)} className="w-full sm:w-auto">
              <Upload data-icon="inline-start" />
              Import CSV
            </Button>
            <Button size="lg" onClick={onCreate} className="w-full sm:w-auto">
              <Plus data-icon="inline-start" />
              Add patient
            </Button>
          </>
        }
      />

      <div className="overflow-hidden rounded-xl border bg-card">
        <FilterBar
          activeCount={activeFilters}
          onClear={() => {
            setDoctorLabel(null);
            clear();
          }}
          search={
            <SearchInput value={values.search} onChange={onSearch} label="Search patients" placeholder="Search name, phone, email…" />
          }
        >
          <FilterSelect label="Condition" allLabel="All conditions" value={values.condition} options={CONDITION_OPTIONS} onChange={onCondition} />
          <FilterSelect label="Status" allLabel="All statuses" value={values.status} options={STATUS_OPTIONS} onChange={onStatus} />
          <FilterSelect label="Gender" allLabel="All genders" value={values.gender} options={GENDER_OPTIONS} onChange={onGender} />
          {user?.role !== "doctor" && (
            <DoctorPicker
              aria-label="Filter by doctor"
              value={values.doctor}
              selected={pickerSelected}
              onChange={onDoctor}
              placeholder="All doctors"
              allowClear
              className="sm:w-[200px]"
            />
          )}
          <DateRangePicker value={dateValue} onChange={onDates} placeholder="Admitted any time" label="Admitted between" />
          <FilterSelect label="Sort" highlight={false} value={values.sort} options={SORT_OPTIONS} onChange={onSort} />
        </FilterBar>

        <DataTable
          caption="Patients"
          columns={columns}
          rows={data?.data}
          getRowId={(p) => p._id}
          isLoading={isLoading}
          isFetching={isFetching}
          sort={values.sort}
          onSortChange={onSort}
          renderMobileCard={renderMobileCard}
          error={error && !data ? <ErrorState error={error} onRetry={() => refetch()} /> : null}
          empty={
            activeFilters ? (
              <EmptyState
                title="No patients match these filters"
                description="Try a broader search or clear the filters."
                action={
                  <Button variant="outline" onClick={clear}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <EmptyState icon={UsersRound} title="No patients yet" description="Patients you add will show up here." />
            )
          }
        />
        <Pagination meta={data?.meta} onPageChange={onPage} onLimitChange={onLimit} noun="patients" />
      </div>

      <PatientFormSheet open={formOpen} onOpenChange={setFormOpen} patient={editing} />
      <CsvImportDialog kind="patients" open={importOpen} onOpenChange={setImportOpen} />
      <DeletePatientDialog patient={deleting} onOpenChange={(open) => !open && setDeleting(null)} />
    </>
  );
}

