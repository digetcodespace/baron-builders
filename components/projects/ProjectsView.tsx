"use client";

import { useState } from "react";
import { Button, DataTable, EmptyState, PageHeader, Skeleton, type Column } from "@/components/ui";
import type { ProjectRow } from "@/lib/data";
import { useProjectsList } from "@/hooks/useProjects";
import { CreateProjectDialog } from "./CreateProjectDialog";

const COLUMNS: Column<ProjectRow>[] = [
  { id: "name", header: "Project", cell: (p) => <p className="font-semibold">{p.name}</p> },
  {
    id: "created",
    header: "Created",
    align: "right",
    cell: (p) => new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  },
];

/** Every project, with the button that adds one. */
export function ProjectsView() {
  const [creating, setCreating] = useState(false);
  const { items, isLoading, hasMore, sentinelRef, reload } = useProjectsList();

  return (
    <>
      <PageHeader
        title="Projects"
        description="Each development Baron Builders is building."
        actions={
          <Button leftIcon="plus" onClick={() => setCreating(true)}>
            New project
          </Button>
        }
      />
      {items.length === 0 && !isLoading ? (
        <EmptyState
          icon="building"
          title="No projects yet"
          description="Start with a project, then add its house types and houses."
          action={<Button onClick={() => setCreating(true)}>New project</Button>}
        />
      ) : (
        <>
          <DataTable caption="Projects" columns={COLUMNS} rows={items} rowKey={(p) => p.id} loading={isLoading && items.length === 0} />
          {isLoading && items.length > 0 ? <Skeleton className="mt-3 h-14" /> : null}
          {hasMore ? <div ref={sentinelRef} className="h-px" /> : null}
        </>
      )}
      <CreateProjectDialog open={creating} onClose={() => setCreating(false)} onCreated={reload} />
    </>
  );
}
