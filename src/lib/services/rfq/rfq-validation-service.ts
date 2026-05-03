import DOMPurify from "isomorphic-dompurify";
import type { ZodIssue } from "zod";

import { createRfqSchema, type RfqPayload, type RfqTranslator } from "@/validations/rfq";

export type RFQValidationResult =
  | { success: true; data: RfqPayload }
  | { success: false; fieldErrors: Record<string, string[]> };

function sanitizeText(value: string): string {
  return DOMPurify.sanitize(value, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }).trim();
}

function normalizeFieldErrors(issues: ZodIssue[]): Record<string, string[]> {
  const normalized: Record<string, string[]> = {};

  for (const issue of issues) {
    const field = issue.path.join(".") || "root";

    if (!normalized[field]) {
      normalized[field] = [];
    }

    if (!issue.message) {
      continue;
    }

    normalized[field]?.push(issue.message);
  }

  return normalized;
}

function sanitizePayload(input: RfqPayload): RfqPayload {
  return {
    ...input,
    location: sanitizeText(input.location),
    description: sanitizeText(input.description),
    contact: {
      ...input.contact,
      name: sanitizeText(input.contact.name),
      email: input.contact.email.trim(),
      phone: input.contact.phone.trim(),
      company: input.contact.company ? sanitizeText(input.contact.company) : "",
    },
    files: input.files.map((file) => ({
      ...file,
      name: sanitizeText(file.name),
      url: file.url.trim(),
      mimeType: file.mimeType.trim().toLowerCase(),
    })),
  };
}

export class RFQValidationService {
  constructor(private readonly t: RfqTranslator) {}

  validate(payload: unknown): RFQValidationResult {
    const parsed = createRfqSchema(this.t).safeParse(payload);

    if (!parsed.success) {
      return {
        success: false,
        fieldErrors: normalizeFieldErrors(parsed.error.issues),
      };
    }

    return {
      success: true,
      data: sanitizePayload(parsed.data),
    };
  }
}
