# i18n Guide

## Locale Policy

- Supported locales: `en`, `ar`
- Default locale: `ar`
- All UI strings must come from locale JSON files.

## Routing

- Locale-prefixed routes are enforced by `src/middleware.ts` using `next-intl`.
- `localeDetection: true` is enabled in `src/i18n/routing.ts` to redirect based on `Accept-Language`.
- Locale is preserved on navigation with `LanguageSwitcher` (`router.replace(pathname, {locale})`).
- Locale is preserved on navigation with `LocalizedLink` (injects current locale into internal hrefs).
- Root route (`/`) redirects to `/ar` by default.

## RTL/LTR Rules

- Apply `dir` at `html` level based on locale.
- Prefer logical CSS properties (`padding-inline`, `margin-inline-start`, `text-align: start`, `inset-inline-start`).
- Directional visuals use `[dir="rtl"]` selectors for flipping (`.icon-flip`, `.carousel-flip`).

## Translation Workflow

1. Add keys to `src/messages/en.json`.
2. Add matching keys to `src/messages/ar.json`.
3. Use `useTranslations`/`getTranslations` only.
4. Avoid hardcoded visible strings in components.

## Usage Steps

1. Add or update locale metadata in `src/lib/seo.ts` (`title`, `description`, hreflang output).
2. Use `useLocale(namespace)` in client components to access `{ locale, dir, t }`.
3. Use `LocalizedLink` for internal links to keep locale prefixes stable.
4. Use `LanguageSwitcher` in headers or navigation to switch locale while preserving current route.
5. Keep direction-safe styles in `src/app/globals.css` using logical CSS utilities.

## Fonts

- English: Inter + Manrope.
- Arabic: Cairo + IBM Plex Sans Arabic.
- Load in `src/app/layout.tsx` through `next/font/google` and CSS variables.
- Keep fallback stacks in body CSS variables (`--font-fallback-en`, `--font-fallback-ar`).

## RTL Testing Checklist

1. Visit `/ar` and confirm `<html dir="rtl">`.
2. Confirm directional icon classes are flipped under RTL.
3. Switch from Arabic to English and verify URL prefix changes to `/en`.
4. Confirm switched locale updates text and `<html dir="ltr">`.
5. Validate internal links preserve locale prefixes on every page.
6. Run component test: `npx vitest run src/components/layout/LanguageSwitcher.spec.tsx`.
7. Run e2e test: `npx playwright test tests/e2e/i18n-rtl.e2e.ts`.
