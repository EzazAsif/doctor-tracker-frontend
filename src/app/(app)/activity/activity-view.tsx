"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Activity } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { Pagination } from "@/components/common/pagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useActivity } from "@/hooks/queries/use-admin";
import type { ActivityEvent } from "@/lib/api/types";

function eventSummary(event: ActivityEvent) {
  if (event.action === "imported") return `${event.importedCount ?? 0} imported · ${event.failedCount ?? 0} skipped`;
  if (event.relatedCount) return `${event.relatedCount} related patient records removed`;
  if (event.fields?.length) return `Fields: ${event.fields.join(", ")}`;
  return "Record action";
}

export function ActivityView() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useActivity(page);

  return (
    <>
      <PageHeader title="Activity history" description="Who changed which record and when. Patient details are not copied into this log." />
      <Card>
        <CardContent className="p-0">
          {error && !data ? <ErrorState error={error} onRetry={() => refetch()} /> : isLoading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Loading activity…</p>
          ) : !data?.data.length ? (
            <EmptyState icon={Activity} title="No activity yet" description="Record changes and imports will appear here." />
          ) : (
            <div className="divide-y">
              {data.data.map((event) => (
                <article key={event._id} className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:gap-5 sm:px-5">
                  <time dateTime={event.createdAt} className="shrink-0 text-xs tabular text-muted-foreground sm:w-36">
                    {format(parseISO(event.createdAt), "d MMM yyyy, HH:mm")}
                  </time>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {event.actor?.name ?? "Unknown staff"}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">{event.actorRole}</span>
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{eventSummary(event)}</p>
                    <p className="mt-1 truncate font-mono text-xs text-muted-foreground" title={event.resourceId}>{event.resourceId}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="secondary" className="capitalize">{event.resource}</Badge>
                    <Badge variant={event.action === "deleted" || event.action === "deactivated" ? "destructive" : "outline"}>{event.action}</Badge>
                  </div>
                </article>
              ))}
            </div>
          )}
          <Pagination meta={data?.meta} onPageChange={setPage} noun="events" />
        </CardContent>
      </Card>
    </>
  );
}
