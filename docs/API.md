# API Guide

## Design Principles

- Arabic and English support for response messages where user-facing text exists.
- Server-side validation for all inputs using Zod schemas.
- Role-based authorization checks before state changes.
- Prisma ORM only for database interactions; no raw SQL in feature routes.

## Initial API Surface (Phase 1)

1. Authentication

- `POST /api/auth/[...nextauth]` handled by Auth.js.

1. RFQ

- `POST /api/rfq` for request submission with validated payload and MIME checks.

1. Careers

- `POST /api/careers/applications` for job applications with CV upload checks.

1. Admin Projects

- `GET /api/admin/projects`
- `POST /api/admin/projects`
- `PATCH /api/admin/projects/:id`
- `DELETE /api/admin/projects/:id`

## Common Response Envelope

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

## Security Checklist

- Rate limit write endpoints.
- Validate MIME/type/size for uploads.
- Enforce CSRF/session protections from Auth.js.
- Audit log admin mutations.
