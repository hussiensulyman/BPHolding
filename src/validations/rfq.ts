import { z } from "zod";

export const RFQ_PROJECT_TYPES = [
  "Residential",
  "Commercial",
  "Renovation",
  "MEP",
  "Engineering",
] as const;

export const RFQ_CITIES = ["Riyadh", "Jeddah"] as const;

export const RFQ_BUDGET_RANGES = [
  "<500k SAR",
  "500k-2M SAR",
  "2M-5M SAR",
  "5M+ SAR",
] as const;

export const RFQ_TIMELINES = ["Urgent <1mo", "1-3mo", "3-6mo", "6mo+"] as const;

export const RFQ_FILE_TYPES = ["pdf", "image", "dwg"] as const;

export const RFQ_MAX_FILES = 10;
export const RFQ_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const RFQ_ALLOWED_MIME_TYPES = {
  pdf: ["application/pdf"],
  image: ["image/png", "image/jpeg"],
  dwg: ["image/vnd.dwg", "application/acad", "application/x-acad", "application/dwg"],
} as const;

export const RFQ_ALLOWED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".dwg"] as const;

export const SAUDI_PHONE_REGEX = /^\+966\d{9}$/;

const IMAGEKIT_HOST_MATCHER = /(^|\.)imagekit\.io$/i;

export type RfqProjectType = (typeof RFQ_PROJECT_TYPES)[number];
export type RfqCity = (typeof RFQ_CITIES)[number];
export type RfqBudgetRange = (typeof RFQ_BUDGET_RANGES)[number];
export type RfqTimeline = (typeof RFQ_TIMELINES)[number];
export type RfqFileType = (typeof RFQ_FILE_TYPES)[number];

export type RfqTranslator = (key: string) => string;

function defaultTranslator(key: string): string {
  return key;
}

function isImageKitUrl(value: string): boolean {
  try {
    const parsed = new URL(value);

    return IMAGEKIT_HOST_MATCHER.test(parsed.hostname);
  } catch {
    return false;
  }
}

function fileTypeFromMimeType(mimeType: string): RfqFileType | null {
  if (
    RFQ_ALLOWED_MIME_TYPES.pdf.includes(
      mimeType as (typeof RFQ_ALLOWED_MIME_TYPES.pdf)[number],
    )
  ) {
    return "pdf";
  }

  if (
    RFQ_ALLOWED_MIME_TYPES.image.includes(
      mimeType as (typeof RFQ_ALLOWED_MIME_TYPES.image)[number],
    )
  ) {
    return "image";
  }

  if (
    RFQ_ALLOWED_MIME_TYPES.dwg.includes(
      mimeType as (typeof RFQ_ALLOWED_MIME_TYPES.dwg)[number],
    )
  ) {
    return "dwg";
  }

  return null;
}

export function inferFileType(fileName: string, mimeType: string): RfqFileType | null {
  const lowerName = fileName.toLowerCase();

  if (lowerName.endsWith(".pdf")) {
    return "pdf";
  }

  if (
    lowerName.endsWith(".png") ||
    lowerName.endsWith(".jpg") ||
    lowerName.endsWith(".jpeg")
  ) {
    return "image";
  }

  if (lowerName.endsWith(".dwg")) {
    return "dwg";
  }

  return fileTypeFromMimeType(mimeType);
}

export function createRfqSchema(t: RfqTranslator = defaultTranslator) {
  return z.object({
    projectType: z.enum(RFQ_PROJECT_TYPES, {
      required_error: t("forms.rfq.projectType.error"),
      invalid_type_error: t("forms.rfq.projectType.error"),
    }),
    location: z.string().trim().min(2, t("forms.rfq.location.error")),
    city: z.enum(RFQ_CITIES, {
      required_error: t("forms.rfq.city.error"),
      invalid_type_error: t("forms.rfq.city.error"),
    }),
    budgetRange: z.enum(RFQ_BUDGET_RANGES, {
      required_error: t("forms.rfq.budgetRange.error"),
      invalid_type_error: t("forms.rfq.budgetRange.error"),
    }),
    timeline: z.enum(RFQ_TIMELINES, {
      required_error: t("forms.rfq.timeline.error"),
      invalid_type_error: t("forms.rfq.timeline.error"),
    }),
    description: z
      .string()
      .trim()
      .min(1, t("forms.rfq.description.error"))
      .max(2000, t("forms.rfq.description.error")),
    contact: z.object({
      name: z.string().trim().min(2, t("forms.rfq.contact.name.error")),
      email: z.string().trim().email(t("forms.rfq.contact.email.error")),
      phone: z
        .string()
        .trim()
        .regex(SAUDI_PHONE_REGEX, t("forms.rfq.contact.phone.error")),
      company: z.string().trim().max(140).optional().or(z.literal("")),
    }),
    files: z
      .array(
        z.object({
          url: z
            .string()
            .url(t("forms.rfq.files.error"))
            .refine((value) => isImageKitUrl(value), {
              message: t("forms.rfq.files.error"),
            }),
          type: z.enum(RFQ_FILE_TYPES, {
            required_error: t("forms.rfq.files.error"),
            invalid_type_error: t("forms.rfq.files.error"),
          }),
          name: z.string().trim().min(1, t("forms.rfq.files.error")),
          mimeType: z.string().trim().min(1, t("forms.rfq.files.error")),
          size: z
            .number()
            .int()
            .positive()
            .max(RFQ_MAX_FILE_SIZE_BYTES, t("forms.rfq.files.error")),
          fileId: z.string().trim().min(1).optional(),
        }),
      )
      .max(RFQ_MAX_FILES, t("forms.rfq.files.error")),
  });
}

export type RfqSchema = ReturnType<typeof createRfqSchema>;
export type RfqPayload = z.infer<RfqSchema>;

export function validateRfqPayload(
  payload: unknown,
  t: RfqTranslator = defaultTranslator,
) {
  return createRfqSchema(t).safeParse(payload);
}

export function mapPortfolioCategoryToProjectType(category: string): RfqProjectType {
  const normalized = category.toUpperCase().trim();

  switch (normalized) {
    case "RESIDENTIAL":
      return "Residential";
    case "COMMERCIAL":
      return "Commercial";
    case "RENOVATION":
      return "Renovation";
    case "MEP":
      return "MEP";
    case "ENGINEERING":
      return "Engineering";
    case "INTERIOR":
      return "Renovation";
    default:
      return "Residential";
  }
}
