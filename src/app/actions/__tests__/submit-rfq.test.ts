import { describe, expect, it, vi } from "vitest";

import { createRFQSubmissionService } from "@/app/actions/submit-rfq";
import type { IRFQRepository } from "@/lib/repositories/contracts/rfq-repository";
import { InMemoryRateLimiter } from "@/lib/security/rate-limit";
import { RFQSubmissionError } from "@/lib/services/rfq/rfq-submission-service";
import { RFQUploadService } from "@/lib/services/rfq/rfq-upload-service";
import { RFQValidationService } from "@/lib/services/rfq/rfq-validation-service";

const translator = (key: string) => key;

function buildValidPayload() {
  return {
    projectType: "Residential",
    location: "Al Olaya",
    city: "Riyadh",
    budgetRange: "500k-2M SAR",
    timeline: "1-3mo",
    description:
      "We need integrated construction and engineering delivery with staged handover and quality controls.",
    contact: {
      name: "Faisal Al-Zahrani",
      email: "faisal@example.com",
      phone: "+966512345678",
      company: "BP Holding Partner",
    },
    files: [
      {
        name: "project-brief.pdf",
        type: "pdf",
        mimeType: "application/pdf",
        size: 900_000,
        fileId: "mock-file-1",
        url: "https://ik.imagekit.io/demo/rfq/mock/project-brief.pdf",
      },
    ],
  };
}

function createUploadServiceMock(): RFQUploadService {
  return {
    createUploadSignature: vi.fn(),
    verifyFiles: vi.fn().mockResolvedValue(true),
  } as unknown as RFQUploadService;
}

describe("submitRfqAction", () => {
  it("accepts valid payload and returns formatted submission ID", async () => {
    const repository: IRFQRepository = {
      countByYear: vi.fn().mockResolvedValue(122),
      create: vi.fn().mockResolvedValue({
        id: "rfq-record-1",
        referenceNumber: "RFQ-2026-00123",
        submittedAt: new Date("2026-05-04T09:00:00.000Z"),
      }),
    };

    const service = await createRFQSubmissionService(translator, {
      repository,
      rateLimiter: new InMemoryRateLimiter(3, 60 * 60 * 1000),
      validationService: new RFQValidationService(translator),
      uploadService: createUploadServiceMock(),
    });

    const response = await service.submit(buildValidPayload(), {
      ipAddress: "127.0.0.1",
    });

    expect(response.success).toBe(true);
    const expectedPrefix = `RFQ-${new Date().getUTCFullYear()}-`;
    expect(response.submissionId.startsWith(expectedPrefix)).toBe(true);
    expect(response.submissionId.endsWith("00123")).toBe(true);

    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        projectType: "Residential",
        city: "Riyadh",
        timeline: "1-3mo",
      }),
    );
  });

  it("returns field errors for invalid payloads", async () => {
    const repository: IRFQRepository = {
      countByYear: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockResolvedValue({
        id: "rfq-record-2",
        referenceNumber: "RFQ-2026-00001",
        submittedAt: new Date("2026-05-04T09:00:00.000Z"),
      }),
    };

    const service = await createRFQSubmissionService(translator, {
      repository,
      rateLimiter: new InMemoryRateLimiter(3, 60 * 60 * 1000),
      validationService: new RFQValidationService(translator),
      uploadService: createUploadServiceMock(),
    });

    const invalidPayload = {
      ...buildValidPayload(),
      contact: {
        name: "A",
        email: "not-an-email",
        phone: "0501234567",
        company: "",
      },
    };

    await expect(
      service.submit(invalidPayload, {
        ipAddress: "127.0.0.1",
      }),
    ).rejects.toMatchObject<Partial<RFQSubmissionError>>({
      code: "VALIDATION",
      details: expect.objectContaining({
        "contact.phone": ["forms.rfq.contact.phone.error"],
        "contact.email": ["forms.rfq.contact.email.error"],
      }),
    });

    expect(repository.create).not.toHaveBeenCalled();
  });

  it("enforces rate limiting by IP", async () => {
    const repository: IRFQRepository = {
      countByYear: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockResolvedValue({
        id: "rfq-record-3",
        referenceNumber: "RFQ-2026-00001",
        submittedAt: new Date("2026-05-04T09:00:00.000Z"),
      }),
    };

    const service = await createRFQSubmissionService(translator, {
      repository,
      rateLimiter: new InMemoryRateLimiter(1, 60 * 60 * 1000),
      validationService: new RFQValidationService(translator),
      uploadService: createUploadServiceMock(),
    });

    const first = await service.submit(buildValidPayload(), {
      ipAddress: "10.0.0.1",
    });

    await expect(
      service.submit(buildValidPayload(), {
        ipAddress: "10.0.0.1",
      }),
    ).rejects.toMatchObject<Partial<RFQSubmissionError>>({
      code: "RATE_LIMIT",
    });

    expect(first.success).toBe(true);
  });
});
