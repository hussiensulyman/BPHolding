import { buildSrc, upload } from "@imagekit/next";
import type { Transformation } from "@imagekit/next";

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
