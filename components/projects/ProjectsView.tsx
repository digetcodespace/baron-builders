"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, DataTable, EmptyState, PageHeader, Skeleton, type Column } from "@/components/ui";
import type { ProjectRow } from "@/lib/data";
import { useProjectsList } from "@/hooks/useProjects";
import { NewProjectDrawer } from "./NewProjectDrawer";

const COLUMNS: Column<ProjectRow>[] = [
  { id: "name", header: "Project", cell: (p) => <p className="font-semibold">{p.name}</p> },
  {
    id: "created",
    header: "Created",
    align: "right",
    cell: (p) => new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  },
];

/** Every project. A row opens the project's page; the button starts a new one in a drawer. */
export function ProjectsView() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const { items, isLoading, hasMore, sentinelRef } = useProjectsList();

  return (
    <>
      <PageHeader
        title="Projects"
        description="Each development is a pipeline. Open one to manage its stages, house types, and more."
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
          description="Start with a project and its stages, then add its house types and houses."
          action={<Button onClick={() => setCreating(true)}>New project</Button>}
        />
      ) : (
        <>
          <DataTable
            caption="Projects"
            columns={COLUMNS}
            rows={items}
            rowKey={(p) => p.id}
            onRowClick={(p) => router.push(`/staff/projects/${p.id}`)}
            loading={isLoading && items.length === 0}
          />
          {isLoading && items.length > 0 ? <Skeleton className="mt-3 h-14" /> : null}
          {hasMore ? <div ref={sentinelRef} className="h-px" /> : null}
        </>
      )}
      <NewProjectDrawer
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={(project) => router.push(`/staff/projects/${project.id}`)}
      />
    </>
  );
}
