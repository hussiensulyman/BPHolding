import type {
  CreateRFQSubmissionInput,
  IRFQRepository,
  RFQSubmissionRecord,
} from "@/lib/repositories/contracts/rfq-repository";

type StoredRFQSubmission = RFQSubmissionRecord & {
  year: number;
  payload: CreateRFQSubmissionInput;
};

export class InMemoryRFQRepository implements IRFQRepository {
  private submissions: StoredRFQSubmission[] = [];

  async countByYear(year: number): Promise<number> {
    return this.submissions.filter((submission) => submission.year === year).length;
  }

  async create(input: CreateRFQSubmissionInput): Promise<RFQSubmissionRecord> {
    const createdAt = new Date();
    const created: StoredRFQSubmission = {
      id: `rfq-memory-${createdAt.getTime()}`,
      referenceNumber: input.referenceNumber,
      submittedAt: createdAt,
      year: createdAt.getUTCFullYear(),
      payload: input,
    };

    this.submissions.unshift(created);

    return {
      id: created.id,
      referenceNumber: created.referenceNumber,
      submittedAt: created.submittedAt,
    };
  }
}
