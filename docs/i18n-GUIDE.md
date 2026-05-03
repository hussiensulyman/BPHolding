# i18n Guide

## Locale Policy

- Supported locales: `ar`, `en`
- Default locale: `ar`
- All UI strings must come from locale JSON files.

## Routing

- Locale-prefixed routes via `next-intl` middleware.
- Root route redirects to default locale.

## RTL/LTR Rules

- Apply `dir` at `html` level based on locale.
- Prefer logical CSS properties (`padding-inline`, `text-align: start`).
- Directional icons must flip in RTL contexts.

## Translation Workflow

1. Add keys to `src/messages/en.json`.
2. Add matching keys to `src/messages/ar.json`.
3. Use `useTranslations`/`getTranslations` only.
4. Avoid hardcoded visible strings in components.

## Fonts

- English: Inter + Manrope.
- Arabic: Cairo + IBM Plex Sans Arabic.
- Load through `next/font` and CSS variables.
