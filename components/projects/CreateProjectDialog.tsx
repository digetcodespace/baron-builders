"use client";

import { useEffect, useState } from "react";
import { Button, Modal, TextField } from "@/components/ui";
import { useToast } from "@/components/providers";
import { useCreateProject } from "@/hooks/useProjects";

export interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
  /** Called after a successful create so the list can refresh. */
  onCreated: () => void;
}

/** Name a new project. Its stages, house types, and houses are set up from its own page. */
export function CreateProjectDialog({ open, onClose, onCreated }: CreateProjectDialogProps) {
  const { addToast } = useToast();
  const { submit, busy, fieldErrors, clearErrors } = useCreateProject();
  const [name, setName] = useState("");

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      setName("");
      clearErrors();
    });
    return () => cancelAnimationFrame(frame);
  }, [open, clearErrors]);

  const create = async () => {
    const project = await submit(name);
    if (!project) return;
    addToast(`${project.name} created`, { tone: "ok" });
    onCreated();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New project"
      description="A development, like Beaver Crossing."
      size="sm"
      dismissible={!busy}
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
      <form
        className="py-2"
        onSubmit={(event) => {
          event.preventDefault();
          void create();
        }}
      >
        <TextField label="Project name" value={name} error={fieldErrors.name} onChange={(e) => setName(e.target.value)} data-autofocus />
      </form>
    </Modal>
  );
}
