"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/auth";

type AdminLoginActionState = {
  error: "invalid" | "unavailable" | null;
};

function normalizeRedirectTarget(rawValue: string, locale: "en" | "ar"): string {
  const fallback = `/${locale}/admin`;

  if (!rawValue) {
    return fallback;
  }

  const callbackUrl = rawValue.trim();

  if (!callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) {
    return fallback;
  }

  if (
    callbackUrl === "/admin/login" ||
    callbackUrl.startsWith("/admin/login?") ||
    callbackUrl === `/${locale}/admin/login` ||
    callbackUrl.startsWith(`/${locale}/admin/login?`)
  ) {
    return fallback;
  }

  return callbackUrl;
}

export async function adminLoginAction(
  _previousState: AdminLoginActionState,
  formData: FormData,
): Promise<AdminLoginActionState> {
  const email = String(formData.get("email") ?? "")
    .toLowerCase()
    .trim();
  const password = String(formData.get("password") ?? "");
  const locale = formData.get("locale") === "ar" ? "ar" : "en";
  const callbackUrl = String(formData.get("callbackUrl") ?? "");
  const redirectTo = normalizeRedirectTarget(callbackUrl, locale);

  if (!email || !password) {
    return { error: "invalid" };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo,
    });

    return { error: null };
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { error: "invalid" };
      }

      return { error: "unavailable" };
    }

    throw error;
  }
}
