"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Plus, Shield, UserRound, UserRoundCheck, UserRoundX } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/common/form-field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useMe } from "@/hooks/queries/use-auth";
import { useCreateStaff, useSetStaffActive, useStaff } from "@/hooks/queries/use-admin";
import { errorMessage } from "@/lib/api/client";
import type { User } from "@/lib/api/types";
import { toast } from "sonner";

export function StaffView() {
  const { data, isLoading, error, refetch } = useStaff();
  const { data: currentUser } = useMe();
  const create = useCreateStaff();
  const setActive = useSetStaffActive();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<User["role"]>("doctor");
  const [formError, setFormError] = useState("");

  function resetForm() {
    setName("");
    setEmail("");
    setPassword("");
    setRole("doctor");
    setFormError("");
  }

  function submit() {
    setFormError("");
    create.mutate({ name, email, password, role }, {
      onSuccess: (user) => {
        toast.success(`${user.name}'s account created`);
        resetForm();
        setOpen(false);
      },
      onError: (reason) => setFormError(errorMessage(reason)),
    });
  }

  return (
    <>
      <PageHeader
        title="Staff"
        description="Manage individual admin and doctor accounts. Doctor accounts can access their own patient records."
        actions={<Button onClick={() => setOpen(true)}><Plus data-icon="inline-start" /> Add staff account</Button>}
      />

      <Card>
        <CardHeader><CardTitle className="text-base">Accounts</CardTitle></CardHeader>
        <CardContent>
          {error && !data ? <ErrorState error={error} onRetry={() => refetch()} /> : isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading staff…</p>
          ) : !data?.length ? (
            <div className="py-8 text-center">
              <Shield className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-3 font-medium">No staff accounts yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Create an account for a doctor or another admin.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead><tr className="border-b text-xs text-muted-foreground"><th className="px-3 py-3 font-medium">Account</th><th className="px-3 py-3 font-medium">Role</th><th className="px-3 py-3 font-medium">Doctor record</th><th className="px-3 py-3 font-medium">Status</th><th className="px-3 py-3 font-medium">Added</th><th className="px-3 py-3" /></tr></thead>
                <tbody>
                  {data.map((member) => (
                    <tr key={member._id} className="border-b last:border-0">
                      <td className="px-3 py-3"><p className="font-medium">{member.name}</p><p className="text-xs text-muted-foreground">{member.email}</p></td>
                      <td className="px-3 py-3"><Badge variant="secondary" className="capitalize">{member.role}</Badge></td>
                      <td className="px-3 py-3 text-muted-foreground">{member.doctor?.name ?? "—"}</td>
                      <td className="px-3 py-3"><Badge variant={member.active ? "outline" : "destructive"}>{member.active ? "Active" : "Inactive"}</Badge></td>
                      <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">{format(parseISO(member.createdAt), "d MMM yyyy")}</td>
                      <td className="px-3 py-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={setActive.isPending || (member._id === currentUser?._id && member.active)}
                          onClick={() => setActive.mutate({ id: member._id, active: !member.active }, {
                            onSuccess: () => toast.success(`${member.name} ${member.active ? "deactivated" : "reactivated"}`),
                            onError: (reason) => toast.error(errorMessage(reason)),
                          })}
                        >
                          {member.active ? <UserRoundX data-icon="inline-start" /> : <UserRoundCheck data-icon="inline-start" />}
                          {member.active ? "Deactivate" : "Reactivate"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={(next) => {
        if (create.isPending) return;
        setOpen(next);
        if (!next) resetForm();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create a staff account</DialogTitle>
            <DialogDescription>Each staff member signs in with their own account. Use a 12-character minimum password.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-1">
            <FormField label="Full name">{(field) => <Input id={field.id} value={name} onChange={(event) => setName(event.target.value)} autoComplete="off" />}</FormField>
            <FormField label="Email" hint={role === "doctor" ? "Must match an existing doctor record." : undefined}>
              {(field) => <Input id={field.id} value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="off" />}
            </FormField>
            <FormField label="Initial password">{(field) => <Input id={field.id} value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="new-password" />}</FormField>
            <FormField label="Role">
              {(field) => (
                <Select value={role} onValueChange={(value) => value && setRole(value as User["role"])}>
                  <SelectTrigger id={field.id} className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor"><span className="flex items-center gap-2"><UserRound /> Doctor</span></SelectItem>
                    <SelectItem value="admin"><span className="flex items-center gap-2"><Shield /> Admin</span></SelectItem>
                  </SelectContent>
                </Select>
              )}
            </FormField>
            {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}
            <p className="text-xs text-muted-foreground">Doctor accounts can view and manage their own patients. Admin accounts can manage all records and staff.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={create.isPending}>Cancel</Button>
            <Button onClick={submit} disabled={create.isPending || !name.trim() || !email.trim() || password.length < 12}>
              {create.isPending ? "Creating…" : "Create account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
