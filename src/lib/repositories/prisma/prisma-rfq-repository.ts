import type { PrismaClient } from "@prisma/client";

import { prisma } from "@/lib/db";
import type {
  CreateRFQSubmissionInput,
  IRFQRepository,
  RFQSubmissionRecord,
} from "@/lib/repositories/contracts/rfq-repository";

type RFQSubmissionDelegate = {
  count(args: unknown): Promise<number>;
  create(args: unknown): Promise<{ id: string; submittedAt: Date }>;
};

type RFQPrismaClient = Pick<PrismaClient, never> & {
  rFQSubmission: RFQSubmissionDelegate;
};

function serializeSubmissionMessage(input: CreateRFQSubmissionInput): string {
  const fileSummary =
    input.files.length === 0
      ? "No files attached"
      : input.files.map((file) => `${file.type}:${file.url}`).join("\n");

  return [
    input.description,
    "",
    `Timeline: ${input.timeline}`,
    `Files (${input.files.length}):`,
    fileSummary,
    `IP: ${input.ipAddress}`,
    `Reference: ${input.referenceNumber}`,
  ].join("\n");
}

export class PrismaRFQRepository implements IRFQRepository {
  constructor(
    private readonly prismaClient: RFQPrismaClient = prisma as unknown as RFQPrismaClient,
  ) {}

  countByYear(year: number): Promise<number> {
    const start = new Date(Date.UTC(year, 0, 1));
    const end = new Date(Date.UTC(year + 1, 0, 1));

    return this.prismaClient.rFQSubmission.count({
      where: {
        submittedAt: {
          gte: start,
          lt: end,
        },
      },
    });
  }

  async create(input: CreateRFQSubmissionInput): Promise<RFQSubmissionRecord> {
    const created = await this.prismaClient.rFQSubmission.create({
      data: {
        fullName: input.contactName,
        email: input.contactEmail,
        phone: input.contactPhone,
        companyName: input.contactCompany || null,
        serviceType: `${input.projectType} | ${input.timeline}`,
        projectLocation: `${input.location} (${input.city})`,
        estimatedBudget: input.budgetRange,
        message: serializeSubmissionMessage(input),
      },
      select: {
        id: true,
        submittedAt: true,
      },
    });

    return {
      id: created.id,
      referenceNumber: input.referenceNumber,
      submittedAt: created.submittedAt,
    };
  }
}
