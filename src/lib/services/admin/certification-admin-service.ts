import type {
  CreateAdminCertificationInput,
  IAdminRepository,
  UpdateAdminCertificationInput,
} from "@/lib/repositories/contracts/admin-repository";

const EXPIRY_ALERT_DAYS = 30;

export class CertificationAdminService {
  constructor(private readonly repository: IAdminRepository) {}

  async list() {
    const certifications = await this.repository.listCertifications();

    return certifications.map((certification) => {
      const now = Date.now();
      const expiry = certification.expiryDate?.getTime();
      const daysToExpiry = expiry
        ? Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
        : Number.POSITIVE_INFINITY;

      return {
        ...certification,
        daysToExpiry,
        isExpiringSoon:
          Number.isFinite(daysToExpiry) && daysToExpiry <= EXPIRY_ALERT_DAYS,
      };
    });
  }

  async create(input: CreateAdminCertificationInput, adminId?: string | null) {
    const created = await this.repository.createCertification(input);

    await this.repository.createAuditLog({
      adminId,
      action: "CERTIFICATION_CREATED",
      entityType: "CERTIFICATION",
      entityId: created.id,
      metadata: {
        documentType: created.documentType,
        expiryDate: created.expiryDate,
      },
    });

    return created;
  }

  async update(
    id: string,
    input: UpdateAdminCertificationInput,
    adminId?: string | null,
  ) {
    const updated = await this.repository.updateCertification(id, input);

    if (!updated) {
      return null;
    }

    await this.repository.createAuditLog({
      adminId,
      action: "CERTIFICATION_UPDATED",
      entityType: "CERTIFICATION",
      entityId: id,
      metadata: {
        changedFields: Object.keys(input),
      },
    });

    return updated;
  }
}
