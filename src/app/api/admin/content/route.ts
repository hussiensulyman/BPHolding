import { z } from "zod";

import { badRequest, ok, requireAdminApiUser } from "@/lib/auth/admin-api";
import { createAdminServicesContext } from "@/lib/services/admin";

const upsertContentSchema = z.object({
  sectionKey: z.enum(["hero", "mission", "vision", "services"]),
  titleEn: z.string().min(2),
  titleAr: z.string().min(2),
  bodyEn: z.string().min(2),
  bodyAr: z.string().min(2),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export async function GET() {
  const { user, response } = await requireAdminApiUser("content");

  if (!user) {
    return response;
  }

  const { contentAdminService } = createAdminServicesContext();
  const sections = await contentAdminService.list();

  return ok(sections);
}

export async function PUT(request: Request) {
  const { user, response } = await requireAdminApiUser("content");

  if (!user) {
    return response;
  }

  const payload = await request.json();
  const parsed = upsertContentSchema.safeParse(payload);

  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid payload");
  }

  const { contentAdminService } = createAdminServicesContext();
  const updated = await contentAdminService.upsert(parsed.data, user.id);

  return ok(updated);
}
