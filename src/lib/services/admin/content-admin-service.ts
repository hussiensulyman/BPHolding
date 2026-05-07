import type {
  IAdminRepository,
  UpsertAdminContentInput,
} from "@/lib/repositories/contracts/admin-repository";

export class ContentAdminService {
  constructor(private readonly repository: IAdminRepository) {}

  list() {
    return this.repository.listContentSections();
  }

  async upsert(input: UpsertAdminContentInput, adminId?: string | null) {
    const updated = await this.repository.upsertContentSection({
      ...input,
      updatedBy: adminId ?? null,
    });

    await this.repository.createAuditLog({
      adminId,
      action: "CONTENT_SECTION_UPDATED",
      entityType: "CONTENT",
      entityId: updated.sectionKey,
      metadata: {
        status: updated.status,
      },
    });

    return updated;
  }
}
