import createMiddleware from "next-intl/middleware";
import type { Role } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "@/i18n/routing";
import { canAccessAdminSection, isAdminRole } from "@/lib/auth/role-guard";

const intlMiddleware = createMiddleware(routing);
const AUTH_SECRET =
  process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "bp-holding-dev-secret";

function extractAdminSection(pathname: string): {
  locale: string;
  section: string;
  isAdminRoute: boolean;
  isLoginRoute: boolean;
} {
  const segments = pathname.split("/").filter(Boolean);
  const hasLocalePrefix =
    segments[0] &&
    routing.locales.includes(segments[0] as (typeof routing.locales)[number]);
  const locale = hasLocalePrefix ? segments[0]! : routing.defaultLocale;
  const normalizedSegments = hasLocalePrefix ? segments.slice(1) : segments;

  const isAdminRoute = normalizedSegments[0] === "admin";
  const section = normalizedSegments[1] ?? "dashboard";

  return {
    locale,
    section,
    isAdminRoute,
    isLoginRoute: normalizedSegments[0] === "admin" && normalizedSegments[1] === "login",
  };
}

export default async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const route = extractAdminSection(pathname);

  if (route.isAdminRoute && route.isLoginRoute) {
    const token = await getToken({
      req: request,
      secret: AUTH_SECRET,
    });
    const role = token?.role;

    if (typeof role === "string" && isAdminRole(role as Role)) {
      return NextResponse.redirect(new URL(`/${route.locale}/admin`, request.url));
    }

    return intlMiddleware(request);
  }

  if (route.isAdminRoute && !route.isLoginRoute) {
    const token = await getToken({
      req: request,
      secret: AUTH_SECRET,
    });
    const role = token?.role;

    if (typeof role !== "string" || !isAdminRole(role as Role)) {
      const callbackUrl = encodeURIComponent(`${pathname}${search}`);
      return NextResponse.redirect(
        new URL(`/${route.locale}/admin/login?callbackUrl=${callbackUrl}`, request.url),
      );
    }

    if (!canAccessAdminSection(role as Role, route.section)) {
      return NextResponse.redirect(new URL(`/${route.locale}/admin`, request.url));
    }
  }

  const response = intlMiddleware(request);
  // Signal to the locale layout whether this is an admin route so it can
  // suppress the public Header and Footer.
  response.headers.set("x-is-admin", route.isAdminRoute ? "1" : "0");
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
