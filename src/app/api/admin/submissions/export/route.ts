import { requireAdminApiUser } from "@/lib/auth/admin-api";
import { createAdminServicesContext } from "@/lib/services/admin";

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

  const { submissionAdminService } = createAdminServicesContext();
  const csv = await submissionAdminService.exportCsv({ type, status });

  return new Response(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="submissions-${Date.now()}.csv"`,
    },
  });
}
