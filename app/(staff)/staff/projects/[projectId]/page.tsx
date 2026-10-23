import { notFound } from "next/navigation";
import { ProjectView } from "@/components/projects/ProjectView";
import { createRequestContext } from "@/lib/http";
import { BadRequestError, NotFoundError, getProject } from "@/lib/services";

export const metadata = { title: "Project" };

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const ctx = await createRequestContext();
  const project = await getProject(ctx, await params).catch((error: unknown) => {
    // A mistyped or unknown link is a missing page, not an error screen.
    if (error instanceof NotFoundError || error instanceof BadRequestError) notFound();
    throw error;
  });
  return <ProjectView project={project} />;
}
