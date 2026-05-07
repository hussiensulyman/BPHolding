import { z } from "zod";

import { badRequest, ok, requireAdminApiUser } from "@/lib/auth/admin-api";
import { createAdminServicesContext } from "@/lib/services/admin";

const certificationSchema = z.object({
  title: z.string().min(2),
  titleAr: z.string().optional(),
  documentType: z.enum([
    "GOSI",
    "VAT",
    "ZAKAT",
    "TRADE_LICENSE",
    "SAUDIZATION",
    "SAFETY_CERTIFICATE",
  ]),
  issueDate: z.coerce.date(),
  expiryDate: z.coerce.date().nullable().optional(),
  fileUrl: z.string().url().optional(),
  showOnPublicGrid: z.boolean().optional(),
});

export async function GET() {
  const { user, response } = await requireAdminApiUser("certifications");

  if (!user) {
    return response;
  }

  const { certificationAdminService } = createAdminServicesContext();
  const certifications = await certificationAdminService.list();

  return ok(certifications);
}

export async function POST(request: Request) {
  const { user, response } = await requireAdminApiUser("certifications");

  if (!user) {
    return response;
  }

  const payload = await request.json();
  const parsed = certificationSchema.safeParse(payload);

  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid payload");
  }

  const { certificationAdminService } = createAdminServicesContext();
  const created = await certificationAdminService.create(
    {
      ...parsed.data,
      expiryDate: parsed.data.expiryDate ?? null,
      issuedById: user.id,
    },
    user.id,
  );

  return ok(created);
}
