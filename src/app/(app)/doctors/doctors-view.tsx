"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Eye, Pencil, Plus, Stethoscope, Trash2 } from "lucide-react";
import { Avatar, Pill } from "@/components/common/badges";
import { DataTable, type Column } from "@/components/common/data-table";
import { DateRangePicker, type DateRangeValue } from "@/components/common/date-range-picker";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { FilterBar, FilterSelect, type Option } from "@/components/common/filter-bar";
import { PageHeader } from "@/components/common/page-header";
import { Pagination } from "@/components/common/pagination";
import { RowActions } from "@/components/common/row-actions";
import { SearchInput } from "@/components/common/search-input";
import { DeleteDoctorDialog } from "@/components/doctors/delete-doctor-dialog";
import { DoctorFormDialog } from "@/components/doctors/doctor-form-dialog";
import { Button } from "@/components/ui/button";
import { useDoctorOptions, useDoctors } from "@/hooks/queries/use-doctors";
import { toInt, useUrlState } from "@/hooks/use-url-state";
import type { Doctor } from "@/lib/api/types";

const KEYS = ["search", "specialization", "hospital", "from", "to", "sort", "page", "limit"] as const;

const SORT_OPTIONS: Option[] = [
  { value: "-createdAt", label: "Newest first" },
  { value: "createdAt", label: "Oldest first" },
  { value: "name", label: "Name A–Z" },
  { value: "-name", label: "Name Z–A" },
  { value: "-patientCount", label: "Most patients" },
  { value: "patientCount", label: "Fewest patients" },
];

const toOptions = (values?: string[]): Option[] => (values ?? []).map((v) => ({ value: v, label: v }));

export function DoctorsView() {
  const router = useRouter();
  const { values, setParams, clear } = useUrlState(KEYS, { sort: "-createdAt" });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [deleting, setDeleting] = useState<Doctor | null>(null);

  const params = useMemo(
    () => ({
      page: toInt(values.page, 1),
      limit: toInt(values.limit, 10),
      search: values.search || undefined,
      specialization: values.specialization || undefined,
      hospital: values.hospital || undefined,
      from: values.from || undefined,
      to: values.to || undefined,
      sort: values.sort,
    }),
    [values],
  );

  const { data, isLoading, isFetching, error, refetch } = useDoctors(params);
  const { data: options } = useDoctorOptions();
  const specializationOptions = useMemo(() => toOptions(options?.specializations), [options]);
  const hospitalOptions = useMemo(() => toOptions(options?.hospitals), [options]);

  const activeFilters = [values.search, values.specialization, values.hospital, values.from || values.to].filter(Boolean).length;

  // stable handlers keep memoized rows / filters from re-rendering
  const onSearch = useCallback((search: string) => setParams({ search }), [setParams]);
  const onSpecialization = useCallback((v: string) => setParams({ specialization: v }), [setParams]);
  const onHospital = useCallback((v: string) => setParams({ hospital: v }), [setParams]);
  const onSort = useCallback((sort: string) => setParams({ sort }), [setParams]);
  const onDates = useCallback((v: DateRangeValue) => setParams({ from: v.from, to: v.to }), [setParams]);
  const onPage = useCallback((page: number) => setParams({ page }, { push: true }), [setParams]);
  const onLimit = useCallback((limit: number) => setParams({ limit }), [setParams]);
  const openDoctor = useCallback((d: Doctor) => router.push(`/doctors/${d._id}`), [router]);
  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);
  const openEdit = useCallback((d: Doctor) => {
    setEditing(d);
    setFormOpen(true);
  }, []);

  const dateValue = useMemo(() => ({ from: values.from, to: values.to }), [values.from, values.to]);

  const columns = useMemo<Column<Doctor>[]>(
    () => [
      {
        id: "name",
        header: "Doctor",
        sortKey: "name",
        cell: (d) => (
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name={d.name} />
            <div className="min-w-0">
              <Link
                href={`/doctors/${d._id}`}
                onClick={(e) => e.stopPropagation()}
                className="block truncate font-medium text-foreground outline-none hover:underline focus-visible:underline"
              >
                {d.name}
              </Link>
              <p className="truncate text-xs text-muted-foreground">{d.email}</p>
            </div>
          </div>
        ),
      },
      { id: "specialization", header: "Specialization", cell: (d) => <Pill>{d.specialization}</Pill> },
      {
        id: "hospital",
        header: "Hospital",
        cell: (d) => <span className="line-clamp-2 max-w-[220px] text-foreground/90">{d.hospital}</span>,
      },
      { id: "phone", header: "Phone", cell: (d) => <span className="whitespace-nowrap text-muted-foreground tabular">{d.phone}</span> },
      {
        id: "patients",
        header: "Patients",
        sortKey: "patientCount",
        headClassName: "text-right",
        className: "text-right",
        cell: (d) => <span className="font-medium tabular">{d.patientCount}</span>,
      },
      {
        id: "createdAt",
        header: "Joined",
        sortKey: "createdAt",
        cell: (d) => (
          <span className="whitespace-nowrap text-muted-foreground tabular">{format(parseISO(d.createdAt), "d MMM yyyy")}</span>
        ),
      },
      {
        id: "actions",
        header: <span className="sr-only">Actions</span>,
        className: "w-12",
        cell: (d) => (
          <RowActions
            label={`Actions for ${d.name}`}
            actions={[
              { label: "View", icon: Eye, onSelect: () => openDoctor(d) },
              { label: "Edit", icon: Pencil, onSelect: () => openEdit(d) },
              { label: "Delete", icon: Trash2, destructive: true, onSelect: () => setDeleting(d) },
            ]}
          />
        ),
      },
    ],
    [openDoctor, openEdit],
  );

  const renderMobileCard = useCallback(
    (d: Doctor) => (
      <div className="flex items-start gap-3 p-4">
        <Avatar name={d.name} />
        <Link href={`/doctors/${d._id}`} className="min-w-0 flex-1 outline-none">
          <p className="truncate font-medium">{d.name}</p>
          <p className="truncate text-xs text-muted-foreground">{d.hospital}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Pill>{d.specialization}</Pill>
            <span className="tabular">
              <span className="font-medium text-foreground">{d.patientCount}</span> patients
            </span>
          </div>
        </Link>
        <RowActions
          label={`Actions for ${d.name}`}
          actions={[
            { label: "Edit", icon: Pencil, onSelect: () => openEdit(d) },
            { label: "Delete", icon: Trash2, destructive: true, onSelect: () => setDeleting(d) },
          ]}
        />
      </div>
    ),
    [openEdit],
  );

  return (
    <>
      <PageHeader
        title="Doctors"
        description={
          data
            ? activeFilters
              ? `${data.meta.total.toLocaleString()} matching practitioners`
              : `${data.meta.total.toLocaleString()} practitioners on the roster`
            : "Practitioners and their caseloads"
        }
        actions={
          <Button size="lg" onClick={openCreate} className="w-full sm:w-auto">
            <Plus data-icon="inline-start" />
            Add doctor
          </Button>
        }
      />

      <div className="overflow-hidden rounded-xl border bg-card">
        <FilterBar
          activeCount={activeFilters}
          onClear={clear}
          search={
            <SearchInput
              value={values.search}
              onChange={onSearch}
              label="Search doctors"
              placeholder="Search name, specialty, hospital, email…"
            />
          }
        >
          <FilterSelect
            label="Specialization"
            allLabel="All specializations"
            value={values.specialization}
            options={specializationOptions}
            onChange={onSpecialization}
          />
          <FilterSelect
            label="Hospital"
            allLabel="All hospitals"
            value={values.hospital}
            options={hospitalOptions}
            onChange={onHospital}
          />
          <DateRangePicker value={dateValue} onChange={onDates} placeholder="Joined any time" label="Joined between" />
          <FilterSelect label="Sort" highlight={false} value={values.sort} options={SORT_OPTIONS} onChange={onSort} />
        </FilterBar>

        <DataTable
          caption="Doctors"
          columns={columns}
          rows={data?.data}
          getRowId={(d) => d._id}
          isLoading={isLoading}
          isFetching={isFetching}
          sort={values.sort}
          onSortChange={onSort}
          onRowClick={openDoctor}
          renderMobileCard={renderMobileCard}
          error={error && !data ? <ErrorState error={error} onRetry={() => refetch()} /> : null}
          empty={
            activeFilters ? (
              <EmptyState
                title="No doctors match these filters"
                description="Try a different search or clear the filters."
                action={
                  <Button variant="outline" onClick={clear}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={Stethoscope}
                title="No doctors yet"
                description="Add your first practitioner to start tracking their patients."
                action={
                  <Button onClick={openCreate}>
                    <Plus data-icon="inline-start" />
                    Add doctor
                  </Button>
                }
              />
            )
          }
        />
        <Pagination meta={data?.meta} onPageChange={onPage} onLimitChange={onLimit} noun="doctors" />
      </div>

      <DoctorFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        doctor={editing}
        onCreated={(d) => router.push(`/doctors/${d._id}`)}
      />
      <DeleteDoctorDialog doctor={deleting} onOpenChange={(open) => !open && setDeleting(null)} />
    </>
  );
}
