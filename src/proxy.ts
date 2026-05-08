import createMiddleware from "next-intl/middleware";
import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "@/i18n/routing";
import { canAccessAdminSection, isAdminRole } from "@/lib/auth/role-guard";

const intlMiddleware = createMiddleware(routing);
const AUTH_SECRET =
  process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "bp-holding-dev-secret";

// ---------------------------------------------------------------------------
// Route parsing helpers
// ---------------------------------------------------------------------------

type RouteInfo = {
  locale: string;
  section: string;
  hasLocalePrefix: boolean;
  isAdminRoute: boolean;
  isLoginRoute: boolean;
};

function extractAdminSection(pathname: string): RouteInfo {
  const segments = pathname.split("/").filter(Boolean);
  const hasLocalePrefix =
    segments[0] !== undefined &&
    routing.locales.includes(segments[0] as (typeof routing.locales)[number]);
  const locale = hasLocalePrefix ? segments[0]! : routing.defaultLocale;
  const normalizedSegments = hasLocalePrefix ? segments.slice(1) : segments;

  const isAdminRoute = normalizedSegments[0] === "admin";
  const section = normalizedSegments[1] ?? "dashboard";

  return {
    locale,
    section,
    hasLocalePrefix,
    isAdminRoute,
    isLoginRoute: isAdminRoute && normalizedSegments[1] === "login",
  };
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export default async function proxy(request: NextRequest) {
  const start = Date.now();
  const { pathname, search } = request.nextUrl;

  // FAST PATH: Explicit early-exit for known public/asset prefixes.
  // The matcher already excludes most of these, but belt-and-suspenders prevents
  // any Turbopack route-splitting edge cases from reaching the JWT decode.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    /\.(?:png|jpg|jpeg|svg|webp|ico|woff2?)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const route = extractAdminSection(pathname);

  const requestHeaders = new Headers(request.headers);

  if (route.isAdminRoute) {
    requestHeaders.set("x-is-admin", "1");

    // Ensure all admin traffic is locale-prefixed so App Router resolves the
    // same layout tree in local and production.
    if (!route.hasLocalePrefix) {
      const targetPath = `/${route.locale}${pathname}`;
      return NextResponse.redirect(new URL(`${targetPath}${search}`, request.url));
    }
  } else {
    requestHeaders.set("x-is-admin", "0");
  }

  // PUBLIC ROUTES: Skip auth entirely – just apply i18n routing.
  if (!route.isAdminRoute) {
    const response = intlMiddleware(request);
    if (process.env.NODE_ENV === "development") {
      console.log(`[proxy] ${pathname} → public ${Date.now() - start}ms`);
    }
    return response;
  }

  // ADMIN ROUTES: Decode JWT once for all admin sub-paths.
  const token = await getToken({ req: request, secret: AUTH_SECRET });
  const role = typeof token?.role === "string" ? token.role : null;

  // Admin login page: redirect already-authenticated users to dashboard.
  if (route.isLoginRoute) {
    if (role !== null && isAdminRole(role as Parameters<typeof isAdminRole>[0])) {
      if (process.env.NODE_ENV === "development") {
        console.log(
          `[proxy] ${pathname} → redirect to dashboard ${Date.now() - start}ms`,
        );
      }
      return NextResponse.redirect(new URL(`/${route.locale}/admin`, request.url));
    }
    const loginResponse = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    if (process.env.NODE_ENV === "development") {
      console.log(`[proxy] ${pathname} → login page ${Date.now() - start}ms`);
    }
    return loginResponse;
  }

  // Protected admin pages: require a valid admin role.
  if (role === null || !isAdminRole(role as Parameters<typeof isAdminRole>[0])) {
    const normalizedAdminRoot = `/${route.locale}/admin`;
    const isBareAdminRoot = pathname === "/admin" || pathname === normalizedAdminRoot;

    // Keep login URL clean for bare /admin requests, but preserve callback for deep links.
    const loginUrl = isBareAdminRoot
      ? `/${route.locale}/admin/login`
      : `/${route.locale}/admin/login?callbackUrl=${encodeURIComponent(`${pathname}${search}`)}`;

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[proxy] ${pathname} → unauthenticated redirect ${Date.now() - start}ms`,
      );
    }
    return NextResponse.redirect(new URL(loginUrl, request.url));
  }

  if (
    !canAccessAdminSection(
      role as Parameters<typeof canAccessAdminSection>[0],
      route.section,
    )
  ) {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[proxy] ${pathname} → insufficient role redirect ${Date.now() - start}ms`,
      );
    }
    return NextResponse.redirect(new URL(`/${route.locale}/admin`, request.url));
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  if (process.env.NODE_ENV === "development") {
    console.log(`[proxy] ${pathname} → admin ${Date.now() - start}ms`);
  }
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
