"use client";

import { useState } from "react";
import { Button, DataTable, EmptyState, PageHeader, Skeleton, type Column } from "@/components/ui";
import type { ProjectRow } from "@/lib/data";
import { useProjectsList } from "@/hooks/useProjects";
import { ProjectDrawer } from "./ProjectDrawer";

const COLUMNS: Column<ProjectRow>[] = [
  { id: "name", header: "Project", cell: (p) => <p className="font-semibold">{p.name}</p> },
  {
    id: "created",
    header: "Created",
    align: "right",
    cell: (p) => new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  },
];

/** Every project. A row opens its drawer to edit the name and stages; the button opens an empty one. */
export function ProjectsView() {
  // Which project the drawer shows (null is a new one) is kept apart from whether it is open, so it
  // keeps its content while it slides away.
  const [open, setOpen] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const openProject = (id: string | null) => {
    setProjectId(id);
    setOpen(true);
  };
  const { items, isLoading, hasMore, sentinelRef, reload } = useProjectsList();

  return (
    <>
      <PageHeader
        title="Projects"
        description="Each development is a pipeline: its stages, in order, are what every house moves through."
        actions={
          <Button leftIcon="plus" onClick={() => openProject(null)}>
            New project
          </Button>
        }
      />
      {items.length === 0 && !isLoading ? (
        <EmptyState
          icon="building"
          title="No projects yet"
          description="Start with a project and its stages, then add its house types and houses."
          action={<Button onClick={() => openProject(null)}>New project</Button>}
        />
      ) : (
        <>
          <DataTable
            caption="Projects"
            columns={COLUMNS}
            rows={items}
            rowKey={(p) => p.id}
            onRowClick={(p) => openProject(p.id)}
            loading={isLoading && items.length === 0}
          />
          {isLoading && items.length > 0 ? <Skeleton className="mt-3 h-14" /> : null}
          {hasMore ? <div ref={sentinelRef} className="h-px" /> : null}
        </>
      )}
      <ProjectDrawer
        open={open}
        projectId={projectId}
        onClose={() => setOpen(false)}
        onSaved={reload}
      />
    </>
  );
}
