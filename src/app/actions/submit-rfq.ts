"use server";

import { cookies, headers } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";

import type { RfqUploadSignatureInput, RfqUploadSignatureResult } from "@/lib/imagekit";
import { createRfqRepository } from "@/lib/repositories";
import { InMemoryRateLimiter } from "@/lib/security/rate-limit";
import {
  RFQSubmissionError,
  RFQSubmissionService,
  type RFQNotificationService,
  type RFQSubmissionServiceDependencies,
} from "@/lib/services/rfq/rfq-submission-service";
import { RFQUploadService } from "@/lib/services/rfq/rfq-upload-service";
import { RFQValidationService } from "@/lib/services/rfq/rfq-validation-service";
import { APP_CONFIG } from "@/lib/config/app-config";
import type { RfqTranslator } from "@/validations/rfq";

type RFQFieldErrors = Record<string, string[]>;

type SubmitRfqFailureResult = {
  success: false;
  message: string;
  code: "VALIDATION" | "RATE_LIMIT" | "UPLOAD_VERIFICATION" | "INTERNAL";
  fieldErrors?: RFQFieldErrors;
};

export type SubmitRfqActionResult =
  | {
      success: true;
      submissionId: string;
    }
  | SubmitRfqFailureResult;

export type CreateRfqUploadSignatureActionResult =
  | {
      success: true;
      data: RfqUploadSignatureResult;
    }
  | SubmitRfqFailureResult;

const DEFAULT_RFQ_RATE_LIMIT_MAX = 3;
const DEFAULT_RFQ_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

const RFQ_RATE_LIMITER = new InMemoryRateLimiter(
  parsePositiveInteger(process.env.RFQ_RATE_LIMIT_MAX, DEFAULT_RFQ_RATE_LIMIT_MAX),
  parsePositiveInteger(
    process.env.RFQ_RATE_LIMIT_WINDOW_MS,
    DEFAULT_RFQ_RATE_LIMIT_WINDOW_MS,
  ),
);

function toErrorResult(error: unknown, fallbackMessage: string): SubmitRfqFailureResult {
  if (error instanceof RFQSubmissionError) {
    return {
      success: false,
      message: error.message,
      code: error.code,
      fieldErrors: error.details,
    };
  }

  return {
    success: false,
    message: fallbackMessage,
    code: "INTERNAL",
  };
}

function resolveClientIp(requestHeaders: Headers): string {
  const forwardedFor = requestHeaders.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const realIp = requestHeaders.get("x-real-ip");

  if (realIp) {
    return realIp;
  }

  return "unknown";
}

async function createTranslator(): Promise<RfqTranslator> {
  const locale = await getLocale().catch(() => APP_CONFIG.defaultLocale);
  const t = await getTranslations({ locale });

  return (key: string) => {
    try {
      return t(key as never);
    } catch {
      return key;
    }
  };
}

async function assertCsrfProtection(requestHeaders: Headers): Promise<void> {
  const origin = requestHeaders.get("origin");
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

  if (origin && host) {
    const originHost = new URL(origin).host;

    if (originHost !== host) {
      throw new Error("Invalid CSRF origin.");
    }
  }

  const cookieStore = await cookies();
  const csrfCookie = cookieStore.get("next-auth.csrf-token")?.value?.split("|")[0];
  const csrfHeader = requestHeaders.get("x-csrf-token");

  if (csrfCookie && csrfHeader && csrfCookie !== csrfHeader) {
    throw new Error("Invalid CSRF token.");
  }
}

async function sendSubmissionNotificationStub(payload: {
  submissionId: string;
  email: string;
  projectType: string;
}): Promise<void> {
  void payload;
}

export async function createRFQSubmissionService(
  t: RfqTranslator,
  overrides: Partial<RFQSubmissionServiceDependencies> = {},
): Promise<RFQSubmissionService> {
  const uploadService = overrides.uploadService ?? new RFQUploadService();

  return new RFQSubmissionService({
    repository: overrides.repository ?? createRfqRepository(),
    validationService: overrides.validationService ?? new RFQValidationService(t),
    uploadService,
    rateLimiter: overrides.rateLimiter ?? RFQ_RATE_LIMITER,
    notificationService:
      overrides.notificationService ??
      (sendSubmissionNotificationStub satisfies RFQNotificationService),
  });
}

export async function submitRfqWithDependencies(
  payload: unknown,
  options: {
    service?: RFQSubmissionService;
    requestHeaders?: Headers;
    translator?: RfqTranslator;
    ipAddress?: string;
    bypassCsrf?: boolean;
  } = {},
): Promise<SubmitRfqActionResult> {
  try {
    const requestHeaders = options.requestHeaders ?? (await headers());

    if (!options.bypassCsrf) {
      await assertCsrfProtection(requestHeaders);
    }

    const translator = options.translator ?? (await createTranslator());
    const service = options.service ?? (await createRFQSubmissionService(translator));
    const ipAddress = options.ipAddress ?? resolveClientIp(requestHeaders);

    const result = await service.submit(payload, { ipAddress });

    return result;
  } catch (error) {
    return toErrorResult(error, "Unable to submit RFQ right now.");
  }
}

export async function submitRfqAction(payload: unknown): Promise<SubmitRfqActionResult> {
  return submitRfqWithDependencies(payload);
}

export async function createRfqUploadSignatureAction(
  input: RfqUploadSignatureInput,
): Promise<CreateRfqUploadSignatureActionResult> {
  try {
    const requestHeaders = await headers();

    await assertCsrfProtection(requestHeaders);

    const uploadService = new RFQUploadService();

    return {
      success: true,
      data: uploadService.createUploadSignature(input),
    };
  } catch (error) {
    return toErrorResult(error, "Unable to prepare file upload.");
  }
}
