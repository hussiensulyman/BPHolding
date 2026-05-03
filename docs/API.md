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
- `POST /api/rfq/submit` for structured multi-step RFQ submissions.

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
