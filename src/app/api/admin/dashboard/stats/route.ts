import { requireAdminApiUser, ok } from "@/lib/auth/admin-api";
import { createAdminServicesContext } from "@/lib/services/admin";

export async function GET() {
  const { user, response } = await requireAdminApiUser("dashboard");

  if (!user) {
    return response;
  }

  const { repository } = createAdminServicesContext();
  const stats = await repository.listDashboardStats();

  return ok(stats);
}
