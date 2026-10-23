"use client";

import { useState } from "react";
import { Button, InfoHint, PageHeader, Tabs, TextField } from "@/components/ui";
import { useToast } from "@/components/providers";
import type { ProjectDetail } from "@/lib/data";
import { useSaveProject } from "@/hooks/useProjects";
import { HouseTypesPanel } from "./HouseTypesPanel";
import { draftsFromStages, StageList, stagesPayload, type StageDraft } from "./StageList";

/** What "unchanged" means: the name and the stages as they would be saved. */
const signature = (name: string, stages: StageDraft[]) => JSON.stringify({ name: name.trim(), stages: stagesPayload(stages) });

/**
 * One project, everything about it in one place. The name and stages are edited here and saved
 * together from the header; house types are managed in their own tab. Houses, sheets, and vendors
 * join as more tabs.
 */
export function ProjectView({ project }: { project: ProjectDetail }) {
  const { addToast } = useToast();
  const { submit, busy, fieldErrors, clearErrors } = useSaveProject();
  const [saved, setSaved] = useState(project);
  const [name, setName] = useState(project.name);
  const [stages, setStages] = useState<StageDraft[]>(() => draftsFromStages(project.stages));
  const [baseline, setBaseline] = useState(() => signature(project.name, draftsFromStages(project.stages)));
  // Drafts are made once so a stage without a saved color keeps the same suggestion until saved.
  const dirty = signature(name, stages) !== baseline;

  const save = async () => {
    const result = await submit({ projectId: saved.id, name, stages: stagesPayload(stages) });
    if (!result) return;
    const next = draftsFromStages(result.stages);
    setSaved(result);
    setName(result.name);
    setStages(next);
    setBaseline(signature(result.name, next));
    addToast("Project saved", { tone: "ok" });
  };

  const discard = () => {
    clearErrors();
    setName(saved.name);
    const back = draftsFromStages(saved.stages);
    setStages(back);
    setBaseline(signature(saved.name, back));
  };

  return (
    <>
      <PageHeader
        title={saved.name}
        back={{ href: "/staff/projects", label: "Projects" }}
        actions={
          dirty ? (
            <>
              <Button variant="ghost" onClick={discard} disabled={busy}>
                Cancel
              </Button>
              <Button onClick={() => void save()} loading={busy}>
                Save changes
              </Button>
            </>
          ) : null
        }
      />

      <Tabs
        label="Project"
        tabs={[
          {
            id: "overview",
            label: "Overview",
            content: (
              <div className="max-w-xl space-y-6 pt-6">
                <TextField label="Project name" value={name} error={fieldErrors.name} onChange={(e) => setName(e.target.value)} />
                <p className="t-small">
                  Created {new Date(saved.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}. {saved.stages.length}{" "}
                  {saved.stages.length === 1 ? "stage" : "stages"}.
                </p>
              </div>
            ),
          },
          {
            id: "stages",
            label: "Stages",
            badge: stages.filter((s) => s.name.trim()).length,
            content: (
              <div className="max-w-3xl pt-6">
                <div className="mb-3 flex items-center gap-2">
                  <h2 className="t-h4">Stages</h2>
                  <InfoHint label="About stages">
                    Drag a stage to reorder it. Each stage has its own color. The due date is the last day for the stage, and it is the same for every house type in the project. Press Enter in a stage to add the next one; stages with no name are skipped.
                  </InfoHint>
                </div>
                <StageList stages={stages} onChange={setStages} fieldErrors={fieldErrors} />
              </div>
            ),
          },
          {
            id: "house-types",
            label: "House types",
            content: (
              <div className="pt-6">
                <HouseTypesPanel projectId={saved.id} />
              </div>
            ),
          },
        ]}
      />
    </>
  );
}
