# BP Holding Premium Bilingual Platform

Production-oriented bilingual platform for BP Holding, a Saudi construction and engineering group delivering integrated solutions.

## What’s Included

- Arabic-first marketing homepage with hero, about, services, portfolio preview, why-choose-us, certifications, and contact sections.
- Portfolio studio with category, location, year, and keyword filtering plus localized project detail pages.
- RFQ workflow with validated multi-step submission, file uploads, and success/reference tracking.
- Admin dashboard with login, submissions inbox, project management, content management, certifications, audit logs, and dashboard stats.
- Full Arabic/English support with RTL/LTR rendering and locale-aware navigation.

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript 5
- Tailwind CSS 4
- next-intl for Arabic/English localization
- Prisma + PostgreSQL
- Auth.js (NextAuth v5 beta)
- Zod + React Hook Form
- ImageKit for media handling and uploads
- Framer Motion for UI motion
- Vitest + Playwright for testing

## Quick Start

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:migrate
npm run dev
```

## Core Scripts

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run test:e2e`

## Notes

- Project and RFQ data are backed by Prisma when `DATABASE_URL` is configured.
- Local fallback repositories are used in environments without a database connection.

## Documentation

Full documentation is available in `docs/README.md`.
