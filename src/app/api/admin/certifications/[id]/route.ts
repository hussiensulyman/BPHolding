import { z } from "zod";

import { badRequest, ok, requireAdminApiUser } from "@/lib/auth/admin-api";
import { createAdminServicesContext } from "@/lib/services/admin";

const certificationUpdateSchema = z.object({
  title: z.string().min(2).optional(),
  titleAr: z.string().optional(),
  documentType: z
    .enum(["GOSI", "VAT", "ZAKAT", "TRADE_LICENSE", "SAUDIZATION", "SAFETY_CERTIFICATE"])
    .optional(),
  issueDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().nullable().optional(),
  fileUrl: z.string().url().optional(),
  showOnPublicGrid: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireAdminApiUser("certifications");

  if (!user) {
    return response;
  }

  const payload = await request.json();
  const parsed = certificationUpdateSchema.safeParse(payload);

  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid payload");
  }

  const { id } = await params;
  const { certificationAdminService } = createAdminServicesContext();
  const updated = await certificationAdminService.update(
    id,
    {
      ...parsed.data,
      issuedById: user.id,
    },
    user.id,
  );

  if (!updated) {
    return badRequest("Certification not found", 404);
  }

  return ok(updated);
}
