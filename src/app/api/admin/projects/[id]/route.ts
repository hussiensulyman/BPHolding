import { z } from "zod";

import { badRequest, ok, requireAdminApiUser } from "@/lib/auth/admin-api";
import { createAdminServicesContext } from "@/lib/services/admin";

const updateProjectSchema = z.object({
  slug: z.string().min(3).optional(),
  titleEn: z.string().min(2).optional(),
  titleAr: z.string().min(2).optional(),
  descriptionEn: z.string().min(10).optional(),
  descriptionAr: z.string().min(10).optional(),
  location: z.string().min(2).optional(),
  city: z.string().min(2).optional(),
  year: z.number().int().optional(),
  category: z
    .enum(["RESIDENTIAL", "COMMERCIAL", "INTERIOR", "ENGINEERING", "MEP", "RENOVATION"])
    .optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  featured: z.boolean().optional(),
  imageUrls: z.array(z.string().url()).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireAdminApiUser("projects");

  if (!user) {
    return response;
  }

  const { id } = await params;
  const { repository, projectAdminService } = createAdminServicesContext();

  const [project, images] = await Promise.all([
    repository.findById(id),
    projectAdminService.listImages(id),
  ]);

  if (!project) {
    return badRequest("Project not found", 404);
  }

  return ok({
    project,
    imageUrls: images
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((image) => image.imageUrl),
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireAdminApiUser("projects");

  if (!user) {
    return response;
  }

  const { id } = await params;
  const payload = await request.json();
  const parsed = updateProjectSchema.safeParse(payload);

  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid payload");
  }

  const { projectAdminService } = createAdminServicesContext();
  const updated = await projectAdminService.update(
    id,
    {
      ...parsed.data,
      completedAt: parsed.data.year
        ? new Date(Date.UTC(parsed.data.year, 11, 31, 0, 0, 0))
        : undefined,
    },
    user.id,
  );

  if (!updated) {
    return badRequest("Project not found", 404);
  }

  if (parsed.data.imageUrls) {
    await projectAdminService.replaceImages(
      id,
      parsed.data.imageUrls.map((imageUrl, index) => ({ imageUrl, sortOrder: index })),
      user.id,
    );
  }

  return ok(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireAdminApiUser("projects");

  if (!user) {
    return response;
  }

  const { id } = await params;
  const { projectAdminService } = createAdminServicesContext();
  const deleted = await projectAdminService.remove(id, user.id);

  if (!deleted) {
    return badRequest("Project not found", 404);
  }

  return ok({ deleted: true, id });
}
