"use client";

import { useEffect, useRef, useState } from "react";
import { Button, ColorPicker, DateField, Drawer, IconButton, Skeleton, SortableList, TextField } from "@/components/ui";
import { useToast } from "@/components/providers";
import { swatchColors } from "@/lib/design/tokens";
import { useProjectDetail, useSaveProject } from "@/hooks/useProjects";

interface StageDraft {
  /** Stable across edits and reorders; the server id once the stage exists. */
  key: string;
  id?: string;
  name: string;
  cutoffDate: string | null;
  color: string;
}

let counter = 0;
const newKey = () => `new-${++counter}`;

/** The first swatch no stage uses yet, so each stage starts with a color of its own. */
function unusedColor(taken: string[]): string {
  return (swatchColors.find((c) => !taken.includes(c.hex)) ?? swatchColors[taken.length % swatchColors.length]).hex;
}

const blankStage = (taken: string[]): StageDraft => ({ key: newKey(), name: "", cutoffDate: null, color: unusedColor(taken) });

export interface ProjectDrawerProps {
  open: boolean;
  /** The project being edited, or null to create one. */
  projectId: string | null;
  onClose: () => void;
  /** Called after a save so the list can refresh. */
  onSaved: () => void;
}

/**
 * Create or edit a project from a side drawer: its name, and its stages in order. Stages are
 * unlimited; drag the grip (or use the arrow keys on it) to reorder, and the order is what every
 * house's progress is measured against.
 */
export function ProjectDrawer({ open, projectId, onClose, onSaved }: ProjectDrawerProps) {
  const { addToast } = useToast();
  const { project, loading } = useProjectDetail(projectId, open);
  const { submit, busy, fieldErrors, clearErrors } = useSaveProject();
  const [name, setName] = useState("");
  const [stages, setStages] = useState<StageDraft[]>([]);
  const list = useRef<HTMLDivElement>(null);
  const focusKey = useRef<string | null>(null);

  // Start from the saved project, or from a clean slate for a new one.
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      clearErrors();
      if (!projectId) {
        setName("");
        setStages([blankStage([])]);
      } else if (project && project.id === projectId) {
        setName(project.name);
        // Stages saved before colors existed get one now; it is stored the next time the project is saved.
        const taken: string[] = project.stages.flatMap((s) => (s.color ? [s.color] : []));
        setStages(
          project.stages.map((s) => {
            const color = s.color ?? unusedColor(taken);
            if (!s.color) taken.push(color);
            return { key: s.id, id: s.id, name: s.name, cutoffDate: s.cutoff_date, color };
          }),
        );
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [open, projectId, project, clearErrors]);

  // Put the cursor in a stage that was just added.
  useEffect(() => {
    const key = focusKey.current;
    if (!key) return;
    focusKey.current = null;
    requestAnimationFrame(() => list.current?.querySelector<HTMLInputElement>(`[data-stage="${key}"] input`)?.focus());
  }, [stages]);

  const addStageAfter = (index: number) => {
    const stage = blankStage(stages.map((s) => s.color));
    focusKey.current = stage.key;
    setStages((current) => [...current.slice(0, index + 1), stage, ...current.slice(index + 1)]);
  };

  const rename = (key: string, value: string) => setStages((current) => current.map((s) => (s.key === key ? { ...s, name: value } : s)));
  const setDue = (key: string, iso: string) => setStages((current) => current.map((s) => (s.key === key ? { ...s, cutoffDate: iso || null } : s)));
  const setColor = (key: string, color: string) => setStages((current) => current.map((s) => (s.key === key ? { ...s, color } : s)));
  const remove = (key: string) => setStages((current) => current.filter((s) => s.key !== key));

  const save = async () => {
    const filled = stages.filter((s) => s.name.trim() !== "");
    const saved = await submit({
      projectId: projectId ?? undefined,
      name,
      stages: filled.map((s) => ({ id: s.id, name: s.name, cutoffDate: s.cutoffDate, color: s.color })),
    });
    if (!saved) return;
    addToast(projectId ? "Project saved" : `${saved.name} created`, { tone: "ok" });
    onSaved();
    onClose();
  };

  // The server numbers stages after blank rows are dropped, so map its index back to the row on screen.
  const namedKeys = stages.filter((s) => s.name.trim() !== "").map((s) => s.key);
  const rowError = (key: string) => fieldErrors[`stages.${namedKeys.indexOf(key)}.name`];
  const showLoading = Boolean(projectId) && (loading || project?.id !== projectId);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      dismissible={!busy}
      size="lg"
      title={projectId ? "Edit project" : "New project"}
      description="Name the project, then list its stages in the order a house moves through them."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={() => void save()} loading={busy} disabled={showLoading}>
            {projectId ? "Save changes" : "Create project"}
          </Button>
        </>
      }
    >
      {showLoading ? (
        <div className="space-y-3 py-1">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      ) : (
        <div className="space-y-8 py-1">
          <TextField label="Project name" value={name} error={fieldErrors.name} onChange={(e) => setName(e.target.value)} {...(projectId ? {} : { "data-autofocus": true })} />

          <section aria-labelledby="stages-heading">
            <div className="mb-3 flex items-baseline justify-between">
              <h3 id="stages-heading" className="t-h4">
                Stages
              </h3>
              <span className="t-small">{stages.filter((s) => s.name.trim()).length} named</span>
            </div>

            <div ref={list}>
              <SortableList
                items={stages}
                getKey={(s) => s.key}
                getLabel={(s, i) => s.name.trim() || `stage ${i + 1}`}
                onReorder={setStages}
                renderItem={(stage, index, handle) => (
                  <div data-stage={stage.key} className="flex items-center gap-1.5 rounded-[var(--r-md)] border border-border bg-surface py-1.5 pl-1.5 pr-2">
                    {handle}
                    <span aria-hidden="true" className="w-5 shrink-0 text-center font-mono text-[length:var(--fs-label)] text-n-500">
                      {index + 1}
                    </span>
                    <ColorPicker
                      label={`Color for ${stage.name.trim() || `stage ${index + 1}`}`}
                      value={stage.color}
                      onChange={(hex) => setColor(stage.key, hex)}
                      usedColors={stages.filter((s) => s.key !== stage.key).map((s) => s.color)}
                    />
                    <div className="grid min-w-0 flex-1 gap-1.5 sm:grid-cols-[minmax(0,1fr)_11.5rem]">
                      <TextField
                        label="Stage name"
                        value={stage.name}
                        error={rowError(stage.key)}
                        onChange={(e) => rename(stage.key, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (stage.name.trim()) addStageAfter(index);
                          }
                        }}
                      />
                      <DateField label="Due date" value={stage.cutoffDate} clearable onChange={(iso) => setDue(stage.key, iso)} />
                    </div>
                    <IconButton label="Remove stage" icon="trash" size="sm" variant="ghost" onClick={() => remove(stage.key)} />
                  </div>
                )}
              />
            </div>

            {fieldErrors.stages ? <p className="mt-2 t-small text-bad">{fieldErrors.stages}</p> : null}

            <Button className="mt-3" variant="secondary" size="sm" leftIcon="plus" onClick={() => addStageAfter(stages.length - 1)}>
              Add stage
            </Button>
            <p className="mt-3 t-small">Each stage has its own color. The due date is the last day for the stage, and it is the same for every house type in the project. Press Enter in a stage to add the next one; stages with no name are skipped.</p>
          </section>
        </div>
      )}
    </Drawer>
  );
}
