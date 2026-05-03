# BP Holding Platform Documentation

This documentation set defines the engineering baseline for BP Holding's bilingual digital platform.

## Company Snapshot

- Business Pioneers (BP) is the foundation of BP Holding, established in 2021.
- Leadership brings over 20 years of engineering and construction experience.
- Core direction aligns with Saudi Vision 2030 and integrated urban development.
- Main service pillars include engineering consultancy, general contracting, MEP, and renovation/retrofitting.

## Local Setup

1. Install Node.js 22+ and npm 10+.
2. Copy `.env.example` to `.env` and fill PostgreSQL/Auth/ImageKit variables.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Generate Prisma client and apply initial migrations:

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. Start development server:

   ```bash
   npm run dev
   ```

## Quality Gates

- Lint: `npm run lint`
- Type safety: `npm run typecheck`
- Unit tests: `npm run test`
- E2E tests: `npm run test:e2e`

## Document Map

- `ARCHITECTURE.md`: system design, SOLID boundaries, modules.
- `API.md`: API conventions, route contracts, auth requirements.
- `DEPLOYMENT.md`: Vercel + managed PostgreSQL deployment flow.
- `i18n-GUIDE.md`: Arabic-first localization and RTL/LTR implementation.
- `COMMIT-CONVENTION.md`: enforced commit format and scopes.
- `PHASES.md`: delivery roadmap and phase scope.
