import Papa from "papaparse";

import type {
  IAdminRepository,
  ListAdminSubmissionsInput,
  SubmissionType,
  UpdateAdminSubmissionInput,
} from "@/lib/repositories/contracts/admin-repository";

export class SubmissionAdminService {
  constructor(private readonly repository: IAdminRepository) {}

  list(input?: ListAdminSubmissionsInput) {
    return this.repository.listSubmissions(input);
  }

  async update(
    type: SubmissionType,
    id: string,
    input: UpdateAdminSubmissionInput,
    adminId?: string | null,
  ) {
    const updated = await this.repository.updateSubmission(type, id, input);

    if (!updated) {
      return null;
    }

    await this.repository.createAuditLog({
      adminId,
      action: "SUBMISSION_UPDATED",
      entityType: type,
      entityId: id,
      metadata: {
        status: updated.status,
        contactedAt: updated.contactedAt,
      },
    });

    return updated;
  }

  markContacted(type: SubmissionType, id: string, adminId?: string | null) {
    return this.update(
      type,
      id,
      {
        status: "CONTACTED",
        contactedAt: new Date(),
      },
      adminId,
    );
  }

  async exportCsv(input?: ListAdminSubmissionsInput): Promise<string> {
    const records = await this.repository.listSubmissions(input);

    return Papa.unparse(
      records.map((record) => ({
        id: record.id,
        type: record.type,
        title: record.title,
        email: record.email,
        phone: record.phone,
        status: record.status,
        submittedAt: record.submittedAt.toISOString(),
        contactedAt: record.contactedAt?.toISOString() ?? "",
        reviewedAt: record.reviewedAt?.toISOString() ?? "",
        internalNotes: record.internalNotes ?? "",
      })),
    );
  }

  countNewSince(since: Date) {
    return this.repository.countNewRfqSubmissionsSince(since);
  }
}
