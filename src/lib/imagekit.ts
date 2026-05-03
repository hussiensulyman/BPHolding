import { buildSrc, upload } from "@imagekit/next";
import type { Transformation } from "@imagekit/next";
import ImageKit from "imagekit";

import {
  RFQ_ALLOWED_EXTENSIONS,
  RFQ_ALLOWED_MIME_TYPES,
  RFQ_MAX_FILE_SIZE_BYTES,
  type RfqFileType,
  type RfqProjectType,
  inferFileType,
} from "@/validations/rfq";

function resolveImageKitPublicUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_IMAGEKIT_URL_PUBLIC,
    process.env.IMAGEKIT_URL_PUBLIC,
    process.env.IMAGEKIT_URL_ENDPOINT,
  ];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    try {
      const normalized = new URL(candidate);

      return normalized.toString().replace(/\/$/, "");
    } catch {
      continue;
    }
  }

  return "https://ik.imagekit.io/demo";
}

export const IMAGEKIT_PUBLIC_URL = resolveImageKitPublicUrl();

const IMAGEKIT_PRIVATE_KEY =
  process.env.IMAGEKIT_URL_PRIVATE ?? process.env.IMAGEKIT_PRIVATE_KEY;

const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY;

type ImageKitAuthParameters = {
  token: string;
  expire: number;
  signature: string;
};

export type RfqUploadSignatureInput = {
  fileName: string;
  mimeType: string;
  size: number;
  projectType: RfqProjectType;
};

export type RfqUploadSignatureResult =
  | {
      mode: "imagekit";
      uploadUrl: string;
      publicKey: string;
      folder: string;
      fileName: string;
      token: string;
      expire: number;
      signature: string;
    }
  | {
      mode: "mock";
      mockPublicUrlBase: string;
      fileName: string;
    };

export type RfqUploadedFileVerificationInput = {
  fileId?: string;
  url: string;
  type: RfqFileType;
  mimeType: string;
};

export type ImageKitResponsiveOptions = {
  width?: number;
  quality?: number;
  format?:
    | "auto"
    | "webp"
    | "jpg"
    | "jpeg"
    | "png"
    | "gif"
    | "svg"
    | "mp4"
    | "webm"
    | "avif"
    | "orig";
};

function getUploadCredentials(): { privateKey: string; publicKey: string } {
  if (!IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_PUBLIC_KEY) {
    throw new Error(
      "ImageKit upload credentials are missing. Set IMAGEKIT_PUBLIC_KEY and IMAGEKIT_URL_PRIVATE.",
    );
  }

  return {
    privateKey: IMAGEKIT_PRIVATE_KEY,
    publicKey: IMAGEKIT_PUBLIC_KEY,
  };
}

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
}

function getFileExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf(".");

  if (lastDotIndex < 0) {
    return "";
  }

  return fileName.slice(lastDotIndex).toLowerCase();
}

function normalizeMimeType(value: string): string {
  return value.trim().toLowerCase();
}

function isAllowedRfqMimeType(mimeType: string, type: RfqFileType): boolean {
  const normalizedMimeType = normalizeMimeType(mimeType);
  const allowedMimeTypes = RFQ_ALLOWED_MIME_TYPES[type] as readonly string[];

  return allowedMimeTypes.includes(normalizedMimeType);
}

function createImageKitClient(): ImageKit | null {
  if (!IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_PUBLIC_KEY) {
    return null;
  }

  return new ImageKit({
    publicKey: IMAGEKIT_PUBLIC_KEY,
    privateKey: IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: IMAGEKIT_PUBLIC_URL,
  });
}

const imageKitClient = createImageKitClient();

function toAuthParameters(auth: unknown): ImageKitAuthParameters {
  const authObject = auth as Record<string, unknown>;

  return {
    token: String(authObject.token ?? ""),
    expire: Number(authObject.expire ?? 0),
    signature: String(authObject.signature ?? ""),
  };
}

export function buildRfqUploadSignature(
  input: RfqUploadSignatureInput,
): RfqUploadSignatureResult {
  const normalizedMimeType = normalizeMimeType(input.mimeType);
  const normalizedFileName = sanitizeFileName(input.fileName);
  const fileType = inferFileType(normalizedFileName, normalizedMimeType);

  if (!fileType) {
    throw new Error("Unsupported file extension or MIME type.");
  }

  if (input.size > RFQ_MAX_FILE_SIZE_BYTES) {
    throw new Error("File size exceeds the maximum of 10MB.");
  }

  const extension = getFileExtension(normalizedFileName);
  const isAllowedExtension = RFQ_ALLOWED_EXTENSIONS.includes(
    extension as (typeof RFQ_ALLOWED_EXTENSIONS)[number],
  );

  if (!isAllowedExtension || !isAllowedRfqMimeType(normalizedMimeType, fileType)) {
    throw new Error("Unsupported file extension or MIME type.");
  }

  if (!imageKitClient || !IMAGEKIT_PUBLIC_KEY) {
    return {
      mode: "mock",
      mockPublicUrlBase: `${IMAGEKIT_PUBLIC_URL}/rfq/mock`,
      fileName: normalizedFileName,
    };
  }

  const auth = toAuthParameters(imageKitClient.getAuthenticationParameters());

  return {
    mode: "imagekit",
    uploadUrl: "https://upload.imagekit.io/api/v1/files/upload",
    publicKey: IMAGEKIT_PUBLIC_KEY,
    folder: `/rfq/${new Date().getUTCFullYear()}/${input.projectType.toLowerCase()}`,
    fileName: normalizedFileName,
    token: auth.token,
    expire: auth.expire,
    signature: auth.signature,
  };
}

export async function verifyRfqUploadedFile(
  file: RfqUploadedFileVerificationInput,
): Promise<boolean> {
  if (!isAllowedRfqMimeType(file.mimeType, file.type)) {
    return false;
  }

  if (!imageKitClient || !file.fileId) {
    return file.url.includes("imagekit.io");
  }

  const details = (await imageKitClient.getFileDetails(file.fileId)) as unknown as {
    mime?: string;
    url?: string;
  };
  const resolvedMimeType = normalizeMimeType(String(details.mime ?? ""));
  const resolvedUrl = String(details.url ?? "");

  if (!resolvedUrl || !file.url.startsWith(resolvedUrl)) {
    return false;
  }

  return isAllowedRfqMimeType(resolvedMimeType, file.type);
}

async function createUploadSignature(
  payload: string,
  privateKey: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    encoder.encode(privateKey),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const signatureBuffer = await globalThis.crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload),
  );

  return Array.from(new Uint8Array(signatureBuffer))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

export async function uploadFile(file: File, folder: string): Promise<string> {
  if (typeof window !== "undefined") {
    throw new Error("uploadFile must be called from a server context.");
  }

  const credentials = getUploadCredentials();
  const token = globalThis.crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 60 * 30;
  const signature = await createUploadSignature(
    `${token}${expire}`,
    credentials.privateKey,
  );

  const uploadResponse = await upload({
    file,
    fileName: sanitizeFileName(file.name || `portfolio-${Date.now()}.jpg`),
    folder,
    publicKey: credentials.publicKey,
    token,
    signature,
    expire,
    useUniqueFileName: true,
  });

  if (!uploadResponse.url) {
    throw new Error("ImageKit upload failed to return a URL.");
  }

  return uploadResponse.url;
}

export function getResponsiveUrl(
  url: string,
  opts: ImageKitResponsiveOptions = {},
): string {
  if (!url) {
    return "";
  }

  const transformation: Transformation[] = [
    {
      width: opts.width ?? 800,
      quality: opts.quality ?? 85,
      ...(opts.format ? { format: opts.format } : {}),
    },
  ];

  return buildSrc({
    urlEndpoint: IMAGEKIT_PUBLIC_URL,
    src: url,
    transformation,
    transformationPosition: "query",
  });
}
