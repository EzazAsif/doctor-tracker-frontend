"use client";

import { useState } from "react";
import { Download, FileUp, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useImportDoctors } from "@/hooks/queries/use-doctors";
import { useImportPatients } from "@/hooks/queries/use-patients";
import { parseCsv, type CsvRow } from "@/lib/csv";
import type { ImportResult } from "@/lib/api/endpoints";
import { errorMessage } from "@/lib/api/client";
import { useMe } from "@/hooks/queries/use-auth";

type ImportKind = "doctors" | "patients";

const CONFIG: Record<ImportKind, { title: string; required: string[]; headers: string[]; preview: string[]; sample: string }> = {
  doctors: {
    title: "doctors",
    required: ["name", "specialization", "hospital", "phone", "email"],
    headers: ["name", "specialization", "hospital", "phone", "email"],
    preview: ["name", "specialization", "hospital"],
    sample: "name,specialization,hospital,phone,email\nDr. Nadia Rahman,Cardiology,City Hospital,+880 1711 000000,nadia@example.com\n",
  },
  patients: {
    title: "patients",
    required: ["name", "age", "gender", "phone", "condition", "doctorEmail"],
    headers: ["name", "age", "gender", "phone", "email", "condition", "status", "admissionDate", "notes", "doctorEmail"],
    preview: ["name", "condition", "doctorEmail"],
    sample: "name,age,gender,phone,email,condition,status,admissionDate,notes,doctorEmail\nNadia Karim,42,female,+880 1811 000000,nadia.patient@example.com,Hypertension,under_treatment,2026-11-20,Follow-up needed,nadia@example.com\n",
  },
};

const OPTIONAL_PATIENT_FIELDS = new Set(["email", "status", "admissionDate", "notes"]);

interface CsvImportDialogProps {
  kind: ImportKind;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CsvImportDialog({ kind, open, onOpenChange }: CsvImportDialogProps) {
  const config = CONFIG[kind];
  const { data: user } = useMe();
  const doctorAccount = kind === "patients" && user?.role === "doctor";
  const requiredHeaders = doctorAccount ? config.required.filter((header) => header !== "doctorEmail") : config.required;
  const importDoctors = useImportDoctors();
  const importPatients = useImportPatients();
  const pending = importDoctors.isPending || importPatients.isPending;
  const error = importDoctors.error ?? importPatients.error;
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);

  function changeOpen(next: boolean) {
    if (!next) {
      setRows([]);
      setFileName("");
      setFileError("");
      setResult(null);
      importDoctors.reset();
      importPatients.reset();
    }
    onOpenChange(next);
  }

  async function onFileChange(file?: File) {
    setRows([]);
    setResult(null);
    setFileError("");
    importDoctors.reset();
    importPatients.reset();
    if (!file) return;
    setFileName(file.name);
    if (!file.name.toLowerCase().endsWith(".csv") || file.size > 2 * 1024 * 1024) {
      setFileError("Choose a CSV file smaller than 2 MB.");
      return;
    }

    try {
      const parsed = parseCsv(await file.text());
      if (parsed.length > 100) throw new Error("A file can contain up to 100 records.");
      const missing = requiredHeaders.filter((header) => !(header.toLowerCase() in parsed[0]));
      if (missing.length) throw new Error(`Missing columns: ${missing.join(", ")}.`);
      const canonicalHeaders = new Map(config.headers.map((header) => [header.toLowerCase(), header]));
      const normalized = parsed.map((row) =>
        Object.fromEntries(
          Object.entries(row)
            .filter(([key]) => canonicalHeaders.has(key))
            .map(([key, value]) => [canonicalHeaders.get(key)!, value])
            .filter(([key, value]) => !(kind === "patients" && OPTIONAL_PATIENT_FIELDS.has(key) && value === "")),
        ),
      );
      if (new Blob([JSON.stringify({ rows: normalized })]).size > 80 * 1024) {
        throw new Error("This CSV is too large to send. Split it into smaller files.");
      }
      setRows(normalized);
    } catch (cause) {
      setFileError(errorMessage(cause, "Couldn't read that CSV file."));
    }
  }

  function downloadTemplate() {
    const url = URL.createObjectURL(new Blob([config.sample], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${kind}-template.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function submit() {
    if (!rows.length || pending) return;
    const mutation = kind === "doctors" ? importDoctors : importPatients;
    mutation.mutate(rows, { onSuccess: setResult });
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !pending && changeOpen(next)}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Import {config.title} from CSV</DialogTitle>
          <DialogDescription>Upload a CSV with a header row. Up to 100 records can be imported at a time.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-1">
          <div className="flex flex-col gap-2 rounded-lg border border-dashed p-4">
            <label htmlFor={`csv-${kind}`} className="text-sm font-medium">CSV file</label>
            <Input id={`csv-${kind}`} type="file" accept=".csv,text/csv" disabled={pending} onChange={(event) => onFileChange(event.target.files?.[0])} />
            {fileName && <p className="text-xs text-muted-foreground">{fileName}</p>}
            <p className="text-xs text-muted-foreground">Required columns: {config.required.join(", ")}</p>
          {kind === "patients" && <p className="text-xs text-muted-foreground">{doctorAccount ? "Imported records will be assigned to your account." : <>Use the doctor&apos;s email in <code>doctorEmail</code>.</>} Blank status and admission date use the defaults.</p>}
            <Button type="button" variant="ghost" size="sm" className="w-fit px-0" onClick={downloadTemplate}>
              <Download data-icon="inline-start" /> Download CSV template
            </Button>
          </div>

          {fileError && <p role="alert" className="text-sm text-destructive">{fileError}</p>}
          {rows.length > 0 && !result && (
            <>
              <p className="text-sm text-muted-foreground">Ready to import {countLabel(rows.length, kind)}. Previewing the first {Math.min(rows.length, 3)}.</p>
              <div className="overflow-hidden rounded-lg border">
                <div className="border-b bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">CSV preview</div>
                <div className="overflow-x-auto">
                  <table aria-label="CSV preview" className="w-full min-w-[420px] text-left text-xs">
                    <thead className="text-muted-foreground">
                      <tr>{config.preview.map((header) => <th key={header} className="px-3 py-2 font-medium">{header}</th>)}</tr>
                    </thead>
                    <tbody>
                      {rows.slice(0, 3).map((row, index) => (
                        <tr key={index} className="border-t">
                          {config.preview.map((header) => (
                            <td key={header} className="max-w-40 truncate px-3 py-2">{row[header] || "—"}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
          {error && <p role="alert" className="text-sm text-destructive">{errorMessage(error)}</p>}
          {result && (
            <div role="status" className="grid gap-2 rounded-lg border bg-muted/40 p-3 text-sm">
              <p>{result.imported} imported, {result.errors.length} skipped ({result.total} {result.total === 1 ? "row" : "rows"}).</p>
              {result.errors.slice(0, 8).map((row) => <p key={`${row.row}-${row.message}`} className="text-destructive">Row {row.row}: {row.message}</p>)}
              {result.errors.length > 8 && <p className="text-muted-foreground">And {result.errors.length - 8} more row errors.</p>}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>Close</Button>
          <Button type="button" onClick={submit} disabled={!rows.length || pending}>
            {pending ? <Loader2 className="animate-spin" /> : <FileUp />}
            Import {rows.length || "CSV"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function countLabel(count: number, kind: ImportKind) {
  const noun = kind === "doctors" ? "doctor" : "patient";
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}
