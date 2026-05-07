import { requireAdminApiUser, ok } from "@/lib/auth/admin-api";
import { createAdminServicesContext } from "@/lib/services/admin";

export async function GET(request: Request) {
  const { user, response } = await requireAdminApiUser("submissions");

  if (!user) {
    return response;
  }

  const url = new URL(request.url);
  const sinceRaw = url.searchParams.get("since");
  const since = sinceRaw ? new Date(sinceRaw) : new Date(Date.now() - 30_000);

  const { repository, submissionAdminService } = createAdminServicesContext();

  const [newCount, pending] = await Promise.all([
    submissionAdminService.countNewSince(
      Number.isNaN(since.getTime()) ? new Date(0) : since,
    ),
    repository.listSubmissions({ type: "RFQ", status: "NEW" }),
  ]);

  return ok({
    newCount,
    totalPending: pending.length,
    checkedAt: new Date().toISOString(),
  });
}
