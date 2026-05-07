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
  const { user, response } = await requireAdminApiUser("submissions");

  if (!user) {
    return response;
  }

  const url = new URL(request.url);
  const type = (url.searchParams.get("type") ?? undefined) as
    | "RFQ"
    | "JOB"
    | "CONTRACTOR"
    | undefined;
  const status = (url.searchParams.get("status") ?? undefined) as
    | "NEW"
    | "REVIEWED"
    | "CONTACTED"
    | "ARCHIVED"
    | undefined;

  const fromDate = parseDate(url.searchParams.get("fromDate"));
  const toDate = parseDate(url.searchParams.get("toDate"));

  const { submissionAdminService, repository } = createAdminServicesContext();

  const [records, statuses] = await Promise.all([
    submissionAdminService.list({
      type,
      status,
      fromDate,
      toDate,
    }),
    repository.listSubmissionStatuses(),
  ]);

  return ok({
    items: records,
    statuses,
  });
}
