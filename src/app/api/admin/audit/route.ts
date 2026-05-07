import { ok, requireAdminApiUser } from "@/lib/auth/admin-api";
import { createAdminServicesContext } from "@/lib/services/admin";

function parseDate(value: string | null): Date | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed;
}

export async function GET(request: Request) {
  const { user, response } = await requireAdminApiUser("audit");

  if (!user) {
    return response;
  }

  const url = new URL(request.url);

  const { auditAdminService } = createAdminServicesContext();
  const records = await auditAdminService.list({
    adminId: url.searchParams.get("adminId") ?? undefined,
    action: url.searchParams.get("action") ?? undefined,
    fromDate: parseDate(url.searchParams.get("fromDate")),
    toDate: parseDate(url.searchParams.get("toDate")),
  });

  return ok(records);
}
