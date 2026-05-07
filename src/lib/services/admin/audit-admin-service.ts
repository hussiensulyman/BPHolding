import type {
  IAdminRepository,
  ListAdminAuditLogInput,
} from "@/lib/repositories/contracts/admin-repository";

export class AuditAdminService {
  constructor(private readonly repository: IAdminRepository) {}

  list(input?: ListAdminAuditLogInput) {
    return this.repository.listAuditLogs(input);
  }
}
