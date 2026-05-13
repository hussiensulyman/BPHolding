# API Guide

## Design Principles

- Arabic and English support for response messages where user-facing text exists.
- Server-side validation for all inputs using Zod schemas.
- Role-based authorization checks before state changes.
- Prisma ORM only for database interactions; no raw SQL in feature routes.

## Initial API Surface (Phase 1)

1. Authentication

- `POST /api/auth/[...nextauth]` handled by Auth.js.
- `GET /api/auth/session` returns authenticated session payload.
- Credentials login at `/[locale]/admin/login`.

1. RFQ

- `POST /api/rfq` for request submission with validated payload and MIME checks.
- `POST /api/rfq/submit` for structured multi-step RFQ submissions.

1. Admin Projects

- `GET /api/admin/projects`
- `POST /api/admin/projects`
- `PATCH /api/admin/projects/:id`
- `DELETE /api/admin/projects/:id`

1. Admin Submissions

- `GET /api/admin/submissions`
- `PATCH /api/admin/submissions/:type/:id`
- `GET /api/admin/submissions/export`

1. Admin Content

- `GET /api/admin/content`
- `PUT /api/admin/content`

1. Admin Certifications

- `GET /api/admin/certifications`
- `POST /api/admin/certifications`
- `PATCH /api/admin/certifications/:id`

1. Admin Audit and Notifications

- `GET /api/admin/audit`
- `GET /api/admin/notifications`

1. Admin Dashboard Stats

- `GET /api/admin/dashboard/stats`

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

## Admin Authentication and RBAC

- NextAuth v5 credentials provider with Prisma adapter.
- JWT session strategy includes `user.role` for route authorization.
- Session user shape:

```json
{
  "user": {
    "id": "user_id",
    "email": "admin@bpholding.net",
    "name": "BP Holding Admin",
    "role": "ADMIN"
  }
}
```

- Protected routes:
  - `/[locale]/admin/*` requires admin-authenticated session.
  - `ADMIN` can access all admin sections.
  - `HR` is allowed only on configured sections (`submissions`, `certifications`, `audit`, dashboard).

## Admin CRUD Contracts

### Projects

- `GET /api/admin/projects`
  - Query: `page`, `pageSize`, `status`, `category`, `search`
- `POST /api/admin/projects`
  - Body: `slug`, bilingual fields, `category`, `location`, `city`, `year`, `status`, `featured`, optional `imageUrls[]`
- `PATCH /api/admin/projects/:id`
  - Partial update for inline status and featured toggles or full edits.
- `DELETE /api/admin/projects/:id`
  - Removes project and logs audit action.

### Submissions Inbox

- `GET /api/admin/submissions`
  - Query: `type` (`RFQ`, `JOB`, `CONTRACTOR`), `status`, `fromDate`, `toDate`
- `PATCH /api/admin/submissions/:type/:id`
  - Body: `status`, `internalNotes`, `markContacted`
  - `markContacted=true` sets status to `CONTACTED` and persists timestamp.
- `GET /api/admin/submissions/export`
  - Exports filtered inbox rows as CSV.

### Content Manager

- `GET /api/admin/content`
  - Returns editable homepage sections.
- `PUT /api/admin/content`
  - Body: `sectionKey`, `titleEn`, `titleAr`, `bodyEn`, `bodyAr`, `status` (`DRAFT`/`PUBLISHED`).

### Certifications Manager

- `GET /api/admin/certifications`
  - Returns certifications with expiry metadata.
- `POST /api/admin/certifications`
  - Body: `title`, `titleAr`, `documentType`, `issueDate`, `expiryDate`, `fileUrl`, `showOnPublicGrid`.
- `PATCH /api/admin/certifications/:id`
  - Updates metadata and public visibility toggle.

## Audit Log Schema

Audit records are persisted in `audit_logs` with:

- `admin_id`: nullable actor reference to users table.
- `action`: event key (`PROJECT_CREATED`, `SUBMISSION_UPDATED`, etc.).
- `entity_type`: logical domain (`PROJECT`, `RFQ`, `CONTENT`, `CERTIFICATION`).
- `entity_id`: targeted record identifier.
- `timestamp`: event creation timestamp.
- `metadata`: JSON payload for extra context (changed fields, counts, statuses).

Audit read endpoint:

- `GET /api/admin/audit`
  - Query filters: `adminId`, `action`, `fromDate`, `toDate`.

## RFQ Submit Endpoint

### Route

- `POST /api/rfq/submit`

### Zod Schema Reference

- Validation schema: `src/validations/rfq.ts`
- Server action: `src/app/actions/submit-rfq.ts`

### Request Body

```json
{
  "projectType": "Residential",
  "location": "Al Olaya",
  "city": "Riyadh",
  "budgetRange": "500k-2M SAR",
  "timeline": "1-3mo",
  "description": "Integrated delivery with design-build and MEP scope.",
  "contact": {
    "name": "Faisal Al-Zahrani",
    "email": "faisal@example.com",
    "phone": "+966512345678",
    "company": "Optional Company"
  },
  "files": [
    {
      "fileId": "ik-file-id",
      "name": "brief.pdf",
      "url": "https://ik.imagekit.io/.../brief.pdf",
      "mimeType": "application/pdf",
      "size": 900000,
      "type": "pdf"
    }
  ]
}
```

### Response

Successful response:

```json
{
  "success": true,
  "submissionId": "RFQ-2026-00123"
}
```

Error responses:

- `400` validation or upload verification errors.

```json
{
  "success": false,
  "code": "VALIDATION",
  "message": "Validation failed.",
  "fieldErrors": {
    "contact.phone": ["Phone must be a valid Saudi number in +966 format."]
  }
}
```

- `429` rate limit exceeded (3 submissions per IP per hour).

```json
{
  "success": false,
  "code": "RATE_LIMIT",
  "message": "Too many RFQ submissions. Please try again later."
}
```

- `500` unexpected server failure.

```json
{
  "success": false,
  "code": "INTERNAL",
  "message": "Unable to submit RFQ right now."
}
```

### File Upload Constraints

- Maximum files per submission: `10`
- Maximum file size: `10MB` per file
- Allowed extensions: `.pdf`, `.png`, `.jpg`, `.jpeg`, `.dwg`
- Allowed MIME types:
  - `application/pdf`
  - `image/png`
  - `image/jpeg`
  - `image/vnd.dwg`
  - `application/acad`
  - `application/x-acad`
  - `application/dwg`
- Server-side verification: ImageKit file details are validated before persistence.

## Current Route Notes

- The public site currently ships homepage, portfolio, RFQ, and localized admin routes under `src/app/[locale]`.
- Careers endpoints remain a roadmap item until a matching route is implemented.
