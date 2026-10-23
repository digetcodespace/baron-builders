"use client";

import { useEffect, useRef } from "react";
import { Button, ColorPicker, DateField, IconButton, SortableList, TextField } from "@/components/ui";
import type { ProjectStageRow } from "@/lib/data";
import { swatchColors } from "@/lib/design/tokens";

export interface StageDraft {
  /** Stable across edits and reorders; the server id once the stage exists. */
  key: string;
  id?: string;
  name: string;
  cutoffDate: string | null;
  color: string;
}

let counter = 0;
const newKey = () => `new-${++counter}`;

/** A random swatch no stage uses yet, so each new stage starts with a color of its own. Once all 25 are taken, any swatch. */
function unusedColor(taken: string[]): string {
  const free = swatchColors.filter((c) => !taken.includes(c.hex));
  const pool = free.length ? free : swatchColors;
  return pool[Math.floor(Math.random() * pool.length)].hex;
}

export const blankStage = (taken: string[]): StageDraft => ({ key: newKey(), name: "", cutoffDate: null, color: unusedColor(taken) });

/** Saved stages as editable drafts. Stages saved before colors existed get one now; it is stored the next time they are saved. */
export function draftsFromStages(stages: ProjectStageRow[]): StageDraft[] {
  const taken: string[] = stages.flatMap((s) => (s.color ? [s.color] : []));
  return stages.map((s) => {
    const color = s.color ?? unusedColor(taken);
    if (!s.color) taken.push(color);
    return { key: s.id, id: s.id, name: s.name, cutoffDate: s.cutoff_date, color };
  });
}

/** What gets saved: stages with no name are skipped. */
export function stagesPayload(stages: StageDraft[]) {
  return stages
    .filter((s) => s.name.trim() !== "")
    .map((s) => ({ id: s.id, name: s.name, cutoffDate: s.cutoffDate, color: s.color }));
}

export interface StageListProps {
  stages: StageDraft[];
  onChange: (next: StageDraft[]) => void;
  /** Field errors from a failed save, keyed by path (`stages.2.name`, `stages`). */
  fieldErrors?: Record<string, string>;
}

/**
 * The editable list of a project's stages: drag the grip (or use the arrow keys on it) to
 * reorder, give each a name, a color, and an optional due date. Stages are unlimited, and their
 * order is what every house's progress is measured against.
 */
export function StageList({ stages, onChange, fieldErrors = {} }: StageListProps) {
  const list = useRef<HTMLDivElement>(null);
  const focusKey = useRef<string | null>(null);

  // Put the cursor in a stage that was just added.
  useEffect(() => {
    const key = focusKey.current;
    if (!key) return;
    focusKey.current = null;
    requestAnimationFrame(() => list.current?.querySelector<HTMLInputElement>(`[data-stage="${key}"] input`)?.focus());
  }, [stages]);

  const addAfter = (index: number) => {
    const stage = blankStage(stages.map((s) => s.color));
    focusKey.current = stage.key;
    onChange([...stages.slice(0, index + 1), stage, ...stages.slice(index + 1)]);
  };
  const patch = (key: string, change: Partial<StageDraft>) => onChange(stages.map((s) => (s.key === key ? { ...s, ...change } : s)));

  // The server numbers stages after blank rows are dropped, so map its index back to the row on screen.
  const namedKeys = stages.filter((s) => s.name.trim() !== "").map((s) => s.key);
  const rowError = (key: string) => fieldErrors[`stages.${namedKeys.indexOf(key)}.name`];

  return (
    <div>
      <div ref={list}>
        <SortableList
          items={stages}
          getKey={(s) => s.key}
          getLabel={(s, i) => s.name.trim() || `stage ${i + 1}`}
          onReorder={onChange}
          renderItem={(stage, index, handle) => (
            <div data-stage={stage.key} className="flex items-center gap-1.5 rounded-[var(--r-md)] border border-border bg-surface py-1.5 pl-1.5 pr-2">
              {handle}
              <span aria-hidden="true" className="w-5 shrink-0 text-center font-mono text-[length:var(--fs-label)] text-n-500">
                {index + 1}
              </span>
              <ColorPicker
                label={`Color for ${stage.name.trim() || `stage ${index + 1}`}`}
                value={stage.color}
                onChange={(hex) => patch(stage.key, { color: hex })}
                usedColors={stages.filter((s) => s.key !== stage.key).map((s) => s.color)}
              />
              <div className="grid min-w-0 flex-1 gap-1.5 sm:grid-cols-[minmax(0,1fr)_11.5rem]">
                <TextField
                  label="Stage name"
                  value={stage.name}
                  error={rowError(stage.key)}
                  onChange={(e) => patch(stage.key, { name: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (stage.name.trim()) addAfter(index);
                    }
                  }}
                />
                <DateField label="Due date" value={stage.cutoffDate} clearable onChange={(iso) => patch(stage.key, { cutoffDate: iso || null })} />
              </div>
              <IconButton label="Remove stage" icon="trash" size="sm" variant="ghost" onClick={() => onChange(stages.filter((s) => s.key !== stage.key))} />
            </div>
          )}
        />
      </div>

      {fieldErrors.stages ? <p className="mt-2 t-small text-bad">{fieldErrors.stages}</p> : null}

      <Button className="mt-3" variant="secondary" size="sm" leftIcon="plus" onClick={() => addAfter(stages.length - 1)}>
        Add stage
      </Button>
      <p className="mt-3 max-w-prose t-small">
        Each stage has its own color. The due date is the last day for the stage, and it is the same for every house type in the project. Press Enter in a stage to add the next one; stages with no name are skipped.
      </p>
    </div>
  );
}
