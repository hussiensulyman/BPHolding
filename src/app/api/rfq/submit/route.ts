import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";

import {
  createRFQSubmissionService,
  submitRfqWithDependencies,
} from "@/app/actions/submit-rfq";
import type { RfqTranslator } from "@/validations/rfq";

function resolveLocale(acceptLanguageHeader: string | null): "ar" | "en" {
  if (!acceptLanguageHeader) {
    return "ar";
  }

  return acceptLanguageHeader.toLowerCase().includes("en") ? "en" : "ar";
}

async function createTranslator(locale: "ar" | "en"): Promise<RfqTranslator> {
  const t = await getTranslations({ locale });

  return (key: string) => {
    try {
      return t(key as never);
    } catch {
      return key;
    }
  };
}

function statusCodeFromResult(
  code: "VALIDATION" | "RATE_LIMIT" | "UPLOAD_VERIFICATION" | "INTERNAL",
): number {
  if (code === "RATE_LIMIT") {
    return 429;
  }

  if (code === "VALIDATION" || code === "UPLOAD_VERIFICATION") {
    return 400;
  }

  return 500;
}

export async function POST(request: Request) {
  const locale = resolveLocale(request.headers.get("accept-language"));
  const translator = await createTranslator(locale);
  const service = await createRFQSubmissionService(translator);
  const payload = await request.json();

  const result = await submitRfqWithDependencies(payload, {
    service,
    requestHeaders: request.headers,
    bypassCsrf: true,
  });

  if (!result.success) {
    return NextResponse.json(result, { status: statusCodeFromResult(result.code) });
  }

  return NextResponse.json(result, { status: 200 });
}
