# Deployment Guide

## Target Runtime

- Hosting: Vercel
- Database: Managed PostgreSQL (Neon or Railway)
- Storage/media: ImageKit

## Environment Variables

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `IMAGEKIT_PUBLIC_KEY`
- `IMAGEKIT_PRIVATE_KEY`
- `IMAGEKIT_URL_ENDPOINT`

## Production Steps

1. Create PostgreSQL instance and obtain connection string.
2. Configure project variables in Vercel.
3. Run migrations during release process:

   ```bash
   npm run db:migrate
   ```

4. Deploy main branch to Vercel.
5. Smoke test Arabic default route and key flows.

## Post-Deploy Verification

- Home route redirects to `/ar`.
- Locale toggle switches to `/en` correctly.
- Auth session flow works for admin and user roles.
- File upload restrictions enforce MIME and size.
