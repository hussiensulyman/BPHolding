import { z } from "zod";

const ALLOWED_ATTACHMENT_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

const MAX_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024;

export const rfqFormSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(8).max(20),
  projectType: z.enum(["construction", "fitout", "mep", "consultancy"]),
  message: z.string().min(20).max(2000),
  attachment: z
    .object({
      mimeType: z.enum(ALLOWED_ATTACHMENT_MIME_TYPES),
      sizeBytes: z.number().int().positive().max(MAX_ATTACHMENT_SIZE_BYTES),
    })
    .optional(),
});

export type RfqFormInput = z.infer<typeof rfqFormSchema>;

export function validateRfqForm(payload: unknown) {
  return rfqFormSchema.safeParse(payload);
}