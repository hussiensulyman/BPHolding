import { z } from "zod";

import { badRequest, ok, requireAdminApiUser } from "@/lib/auth/admin-api";
import { createAdminServicesContext } from "@/lib/services/admin";

const createProjectSchema = z.object({
  slug: z.string().min(3),
  titleEn: z.string().min(2),
  titleAr: z.string().min(2),
  descriptionEn: z.string().min(10),
  descriptionAr: z.string().min(10),
  location: z.string().min(2),
  city: z.string().min(2),
  year: z.number().int().optional(),
  category: z.enum([
    "RESIDENTIAL",
    "COMMERCIAL",
    "INTERIOR",
    "ENGINEERING",
    "MEP",
    "RENOVATION",
  ]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  featured: z.boolean().optional(),
  imageUrls: z.array(z.string().url()).default([]),
});

export async function GET(request: Request) {
  const { user, response } = await requireAdminApiUser("projects");

  if (!user) {
    return response;
  }

  const url = new URL(request.url);
  const page = Number.parseInt(url.searchParams.get("page") ?? "1", 10);
  const pageSize = Number.parseInt(url.searchParams.get("pageSize") ?? "20", 10);
  const status = url.searchParams.get("status") ?? undefined;
  const category = url.searchParams.get("category") ?? undefined;
  const search = url.searchParams.get("search") ?? undefined;

  const { projectAdminService } = createAdminServicesContext();
  const result = await projectAdminService.list({
    page: Number.isNaN(page) ? 1 : page,
    pageSize: Number.isNaN(pageSize) ? 20 : pageSize,
    status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined,
    category: category as
      | "RESIDENTIAL"
      | "COMMERCIAL"
      | "INTERIOR"
      | "ENGINEERING"
      | "MEP"
      | "RENOVATION"
      | undefined,
    search,
  });

  return ok(result);
}

export async function POST(request: Request) {
  const { user, response } = await requireAdminApiUser("projects");

  if (!user) {
    return response;
  }

  const payload = await request.json();
  const parsed = createProjectSchema.safeParse(payload);

  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid payload");
  }

  const { projectAdminService } = createAdminServicesContext();
  const created = await projectAdminService.create(
    {
      slug: parsed.data.slug,
      titleEn: parsed.data.titleEn,
      titleAr: parsed.data.titleAr,
      descriptionEn: parsed.data.descriptionEn,
      descriptionAr: parsed.data.descriptionAr,
      location: parsed.data.location,
      city: parsed.data.city,
      year: parsed.data.year,
      category: parsed.data.category,
      status: parsed.data.status,
      featured: parsed.data.featured,
      completedAt: parsed.data.year
        ? new Date(Date.UTC(parsed.data.year, 11, 31, 0, 0, 0))
        : undefined,
      ownerId: user.id,
    },
    user.id,
  );

  if (parsed.data.imageUrls.length > 0) {
    await projectAdminService.replaceImages(
      created.id,
      parsed.data.imageUrls.map((imageUrl, index) => ({ imageUrl, sortOrder: index })),
      user.id,
    );
  }

  return ok(created);
}
