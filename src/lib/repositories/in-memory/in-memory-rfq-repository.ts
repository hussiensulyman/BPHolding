import type {
  CreateRFQSubmissionInput,
  IRFQRepository,
  RFQSubmissionRecord,
} from "@/lib/repositories/contracts/rfq-repository";

export type StoredRFQSubmission = RFQSubmissionRecord & {
  year: number;
  payload: CreateRFQSubmissionInput;
};

const inMemoryRfqSubmissionsStore: StoredRFQSubmission[] = [];

export function getInMemoryRfqSubmissions(): StoredRFQSubmission[] {
  return [...inMemoryRfqSubmissionsStore];
}

export class InMemoryRFQRepository implements IRFQRepository {
  async countByYear(year: number): Promise<number> {
    return inMemoryRfqSubmissionsStore.filter((submission) => submission.year === year)
      .length;
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

    inMemoryRfqSubmissionsStore.unshift(created);

    return {
      id: created.id,
      referenceNumber: created.referenceNumber,
      submittedAt: created.submittedAt,
    };
  }
}
