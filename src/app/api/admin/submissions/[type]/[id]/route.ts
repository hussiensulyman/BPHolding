import { z } from "zod";

import { badRequest, ok, requireAdminApiUser } from "@/lib/auth/admin-api";
import { createAdminServicesContext } from "@/lib/services/admin";

const updateSubmissionSchema = z.object({
  status: z.enum(["NEW", "REVIEWED", "CONTACTED", "ARCHIVED"]).optional(),
  internalNotes: z.string().max(5000).optional(),
  markContacted: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  const { user, response } = await requireAdminApiUser("submissions");

  if (!user) {
    return response;
  }

  const { type, id } = await params;
  const normalizedType = type.toUpperCase();

  if (!["RFQ", "JOB", "CONTRACTOR"].includes(normalizedType)) {
    return badRequest("Unsupported submission type");
  }

  const payload = await request.json();
  const parsed = updateSubmissionSchema.safeParse(payload);

  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid payload");
  }

  const { submissionAdminService } = createAdminServicesContext();

  const updated = parsed.data.markContacted
    ? await submissionAdminService.markContacted(
        normalizedType as "RFQ" | "JOB" | "CONTRACTOR",
        id,
        user.id,
      )
    : await submissionAdminService.update(
        normalizedType as "RFQ" | "JOB" | "CONTRACTOR",
        id,
        {
          status: parsed.data.status,
          internalNotes: parsed.data.internalNotes,
          reviewedAt: parsed.data.status ? new Date() : undefined,
        },
        user.id,
      );

  if (!updated) {
    return badRequest("Submission not found", 404);
  }

  return ok(updated);
}
