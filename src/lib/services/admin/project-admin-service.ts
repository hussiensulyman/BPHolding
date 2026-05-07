import type { IAdminRepository } from "@/lib/repositories/contracts/admin-repository";
import type {
  CreateProjectInput,
  ListAdminProjectsInput,
  ListAdminProjectsResult,
  UpdateProjectInput,
} from "@/lib/repositories/contracts/project-repository";

export type ProjectBulkAction =
  | { type: "PUBLISH" }
  | { type: "ARCHIVE" }
  | { type: "DRAFT" }
  | { type: "DELETE" }
  | { type: "FEATURE"; value: boolean };

export class ProjectAdminService {
  constructor(private readonly repository: IAdminRepository) {}

  list(input?: ListAdminProjectsInput): Promise<ListAdminProjectsResult> {
    return this.repository.listAdmin(input);
  }

  listImages(projectId: string) {
    return this.repository.listProjectImages(projectId);
  }

  async create(input: CreateProjectInput, adminId?: string | null) {
    const created = await this.repository.create(input);

    await this.repository.createAuditLog({
      adminId,
      action: "PROJECT_CREATED",
      entityType: "PROJECT",
      entityId: created.id,
      metadata: {
        slug: created.slug,
        status: created.status,
      },
    });

    return created;
  }

  async update(id: string, input: UpdateProjectInput, adminId?: string | null) {
    const updated = await this.repository.update(id, input);

    if (!updated) {
      return null;
    }

    await this.repository.createAuditLog({
      adminId,
      action: "PROJECT_UPDATED",
      entityType: "PROJECT",
      entityId: id,
      metadata: {
        fields: Object.keys(input),
      },
    });

    return updated;
  }

  async replaceImages(
    projectId: string,
    images: Array<{
      imageUrl: string;
      altEn?: string;
      altAr?: string;
      sortOrder?: number;
    }>,
    adminId?: string | null,
  ) {
    await this.repository.replaceProjectImages(projectId, images);
    await this.repository.createAuditLog({
      adminId,
      action: "PROJECT_IMAGES_UPDATED",
      entityType: "PROJECT",
      entityId: projectId,
      metadata: {
        totalImages: images.length,
      },
    });
  }

  async remove(id: string, adminId?: string | null) {
    const success = await this.repository.delete(id);

    if (success) {
      await this.repository.createAuditLog({
        adminId,
        action: "PROJECT_DELETED",
        entityType: "PROJECT",
        entityId: id,
      });
    }

    return success;
  }

  async applyBulkAction(
    ids: string[],
    action: ProjectBulkAction,
    adminId?: string | null,
  ) {
    const updates = await Promise.all(
      ids.map(async (id) => {
        if (action.type === "DELETE") {
          const removed = await this.repository.delete(id);
          return removed ? { id, removed: true } : null;
        }

        if (action.type === "FEATURE") {
          return this.repository.update(id, { featured: action.value });
        }

        if (action.type === "ARCHIVE") {
          return this.repository.update(id, { status: "ARCHIVED" });
        }

        if (action.type === "PUBLISH") {
          return this.repository.update(id, { status: "PUBLISHED" });
        }

        return this.repository.update(id, { status: "DRAFT" });
      }),
    );

    await this.repository.createAuditLog({
      adminId,
      action: "PROJECT_BULK_ACTION",
      entityType: "PROJECT",
      entityId: ids.join(","),
      metadata: {
        action,
        count: ids.length,
      },
    });

    return updates.filter(Boolean);
  }
}
