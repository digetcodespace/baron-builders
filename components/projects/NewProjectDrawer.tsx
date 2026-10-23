"use client";

import { useEffect, useState } from "react";
import { Button, Drawer, TextField } from "@/components/ui";
import { useToast } from "@/components/providers";
import type { ProjectDetail } from "@/lib/data";
import { useSaveProject } from "@/hooks/useProjects";
import { blankStage, StageList, stagesPayload, type StageDraft } from "./StageList";

export interface NewProjectDrawerProps {
  open: boolean;
  onClose: () => void;
  /** Called with the new project so the caller can open its page. */
  onCreated: (project: ProjectDetail) => void;
}

/** Start a project: its name and first stages. Everything else is managed on the project's own page. */
export function NewProjectDrawer({ open, onClose, onCreated }: NewProjectDrawerProps) {
  const { addToast } = useToast();
  const { submit, busy, fieldErrors, clearErrors } = useSaveProject();
  const [name, setName] = useState("");
  const [stages, setStages] = useState<StageDraft[]>([]);

  // A clean slate each time it opens.
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      clearErrors();
      setName("");
      setStages([blankStage([])]);
    });
    return () => cancelAnimationFrame(frame);
  }, [open, clearErrors]);

  const create = async () => {
    const saved = await submit({ name, stages: stagesPayload(stages) });
    if (!saved) return;
    addToast(`${saved.name} created`, { tone: "ok" });
    onCreated(saved);
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      dismissible={!busy}
      size="lg"
      title="New project"
      description="Name the project, then list its stages in the order a house moves through them."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={() => void create()} loading={busy}>
            Create project
          </Button>
        </>
      }
    >
      <div className="space-y-8 py-1">
        <TextField label="Project name" value={name} error={fieldErrors.name} onChange={(e) => setName(e.target.value)} data-autofocus />
        <section aria-labelledby="new-stages-heading">
          <div className="mb-3 flex items-baseline justify-between">
            <h3 id="new-stages-heading" className="t-h4">
              Stages
            </h3>
            <span className="t-small">{stages.filter((s) => s.name.trim()).length} named</span>
          </div>
          <StageList stages={stages} onChange={setStages} fieldErrors={fieldErrors} />
        </section>
      </div>
    </Drawer>
  );
}
