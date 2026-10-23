"use client";

import { useEffect, useState } from "react";
import { Button, ConfirmDialog, DataTable, Drawer, EmptyState, IconButton, Skeleton, TextField, type Column } from "@/components/ui";
import { useToast } from "@/components/providers";
import type { HouseTypeRow } from "@/lib/data";
import { useHouseTypeActions, useHouseTypesList } from "@/hooks/useHouseTypes";

/** `null` is a new house type, a row is that type being renamed. */
type Editing = HouseTypeRow | null;

function HouseTypeDrawer({
  open,
  editing,
  projectId,
  onClose,
  onSaved,
}: {
  open: boolean;
  editing: Editing;
  projectId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { addToast } = useToast();
  const { create, rename, busy, fieldErrors, clearErrors } = useHouseTypeActions(projectId);
  const [name, setName] = useState("");

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      clearErrors();
      setName(editing?.name ?? "");
    });
    return () => cancelAnimationFrame(frame);
  }, [open, editing, clearErrors]);

  const save = async () => {
    const saved = editing ? await rename(editing.id, name) : await create(name);
    if (!saved) return;
    addToast(editing ? "House type renamed" : `${saved.name} added`, { tone: "ok" });
    onSaved();
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      dismissible={!busy}
      title={editing ? "Rename house type" : "New house type"}
      description="A house type is a model of house in this project, like Corner or Middle."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={() => void save()} loading={busy}>
            {editing ? "Save" : "Add house type"}
          </Button>
        </>
      }
    >
      <form
        className="py-1"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <TextField label="House type name" value={name} error={fieldErrors.name} onChange={(e) => setName(e.target.value)} data-autofocus />
      </form>
    </Drawer>
  );
}

/** The house types of one project: add, rename, and remove the ones nothing uses. */
export function HouseTypesPanel({ projectId }: { projectId: string }) {
  const { items, isLoading, hasMore, sentinelRef, reload } = useHouseTypesList(projectId);
  const { remove, busy } = useHouseTypeActions(projectId);
  const { addToast } = useToast();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Editing>(null);
  const [removing, setRemoving] = useState<HouseTypeRow | null>(null);

  const open = (row: Editing) => {
    setEditing(row);
    setDrawerOpen(true);
  };

  const columns: Column<HouseTypeRow>[] = [
    { id: "name", header: "House type", cell: (t) => <p className="font-semibold">{t.name}</p> },
    { id: "houses", header: "Houses", align: "right", width: "w-28", cell: (t) => t.house_count },
    {
      id: "actions",
      header: "",
      align: "right",
      width: "w-24",
      cell: (t) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <IconButton label={`Rename ${t.name}`} icon="pencil" size="sm" variant="ghost" onClick={() => open(t)} />
          <IconButton label={`Remove ${t.name}`} icon="trash" size="sm" variant="ghost" onClick={() => setRemoving(t)} />
        </div>
      ),
    },
  ];

  return (
    <section aria-labelledby="house-types-heading">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="house-types-heading" className="t-h4">
            House types
          </h2>
          <p className="mt-0.5 t-small">The models of house in this project. Each house will be one of these.</p>
        </div>
        <Button leftIcon="plus" onClick={() => open(null)}>
          New house type
        </Button>
      </div>

      {items.length === 0 && !isLoading ? (
        <EmptyState
          icon="home"
          title="No house types yet"
          description="Add the models in this project, like Corner or Middle."
          action={<Button onClick={() => open(null)}>New house type</Button>}
        />
      ) : (
        <>
          <DataTable
            caption="House types"
            columns={columns}
            rows={items}
            rowKey={(t) => t.id}
            onRowClick={(t) => open(t)}
            loading={isLoading && items.length === 0}
          />
          {isLoading && items.length > 0 ? <Skeleton className="mt-3 h-14" /> : null}
          {hasMore ? <div ref={sentinelRef} className="h-px" /> : null}
        </>
      )}

      <HouseTypeDrawer open={drawerOpen} editing={editing} projectId={projectId} onClose={() => setDrawerOpen(false)} onSaved={reload} />

      <ConfirmDialog
        open={removing !== null}
        title={removing ? `Remove ${removing.name}?` : "Remove house type?"}
        description="This cannot be undone. A house type that still has houses or sheets cannot be removed."
        confirmLabel="Remove"
        destructive
        loading={busy}
        onClose={() => setRemoving(null)}
        onConfirm={async () => {
          if (!removing) return;
          const name = removing.name;
          if (await remove(removing.id)) {
            addToast(`${name} removed`, { tone: "ok" });
            reload();
          }
          setRemoving(null);
        }}
      />
    </section>
  );
}
