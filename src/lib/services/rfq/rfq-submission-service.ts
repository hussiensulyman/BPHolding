import type { InMemoryRateLimiter } from "@/lib/security/rate-limit";
import type {
  CreateRFQSubmissionInput,
  IRFQRepository,
} from "@/lib/repositories/contracts/rfq-repository";

import { RFQValidationService } from "@/lib/services/rfq/rfq-validation-service";
import { RFQUploadService } from "@/lib/services/rfq/rfq-upload-service";

export type RFQSubmissionContext = {
  ipAddress: string;
};

export type RFQSubmissionResult = {
  success: true;
  submissionId: string;
};

export type RFQNotificationPayload = {
  submissionId: string;
  email: string;
  projectType: string;
};

export type RFQNotificationService = (payload: RFQNotificationPayload) => Promise<void>;

type SubmissionErrorCode = "VALIDATION" | "RATE_LIMIT" | "UPLOAD_VERIFICATION";

export class RFQSubmissionError extends Error {
  constructor(
    message: string,
    readonly code: SubmissionErrorCode,
    readonly status: 400 | 429,
    readonly details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "RFQSubmissionError";
  }
}

export type RFQSubmissionServiceDependencies = {
  repository: IRFQRepository;
  validationService: RFQValidationService;
  uploadService: RFQUploadService;
  rateLimiter: InMemoryRateLimiter;
  notificationService?: RFQNotificationService;
};

function buildReferenceNumber(year: number, sequence: number): string {
  return `RFQ-${year}-${String(sequence).padStart(5, "0")}`;
}

function toRepositoryInput(
  payload: Parameters<IRFQRepository["create"]>[0],
): CreateRFQSubmissionInput {
  return payload;
}

export class RFQSubmissionService {
  private readonly repository: IRFQRepository;
  private readonly validationService: RFQValidationService;
  private readonly uploadService: RFQUploadService;
  private readonly rateLimiter: InMemoryRateLimiter;
  private readonly notificationService?: RFQNotificationService;

  constructor(dependencies: RFQSubmissionServiceDependencies) {
    this.repository = dependencies.repository;
    this.validationService = dependencies.validationService;
    this.uploadService = dependencies.uploadService;
    this.rateLimiter = dependencies.rateLimiter;
    this.notificationService = dependencies.notificationService;
  }

  async submit(
    payload: unknown,
    context: RFQSubmissionContext,
  ): Promise<RFQSubmissionResult> {
    const rateLimit = this.rateLimiter.consume(`rfq:${context.ipAddress}`);

    if (!rateLimit.allowed) {
      throw new RFQSubmissionError(
        "Too many RFQ submissions. Please try again later.",
        "RATE_LIMIT",
        429,
      );
    }

    const validation = this.validationService.validate(payload);

    if (!validation.success) {
      throw new RFQSubmissionError(
        "Validation failed.",
        "VALIDATION",
        400,
        validation.fieldErrors,
      );
    }

    const filesAreVerified = await this.uploadService.verifyFiles(validation.data.files);

    if (!filesAreVerified) {
      throw new RFQSubmissionError(
        "One or more files could not be verified.",
        "UPLOAD_VERIFICATION",
        400,
      );
    }

    const year = new Date().getUTCFullYear();
    const currentCount = await this.repository.countByYear(year);
    const submissionId = buildReferenceNumber(year, currentCount + 1);

    await this.repository.create(
      toRepositoryInput({
        referenceNumber: submissionId,
        projectType: validation.data.projectType,
        location: validation.data.location,
        city: validation.data.city,
        budgetRange: validation.data.budgetRange,
        timeline: validation.data.timeline,
        description: validation.data.description,
        contactName: validation.data.contact.name,
        contactEmail: validation.data.contact.email,
        contactPhone: validation.data.contact.phone,
        contactCompany: validation.data.contact.company || undefined,
        files: validation.data.files,
        ipAddress: context.ipAddress,
      }),
    );

    if (this.notificationService) {
      await this.notificationService({
        submissionId,
        email: validation.data.contact.email,
        projectType: validation.data.projectType,
      });
    }

    return {
      success: true,
      submissionId,
    };
  }
}
