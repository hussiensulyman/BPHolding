# Architecture

## Mission Fit

BP Holding's platform supports premium construction and engineering operations with Arabic-first UX, secure workflows, and scalable service modules.

## High-Level Layers

1. Presentation Layer

- Next.js App Router pages, layouts, and UI components.
- Locale-aware rendering with RTL/LTR support and translation-driven UI.

1. Application Layer

- Server actions and feature services (RFQ, careers, portfolio, admin).
- Validation boundaries with Zod.

1. Domain Layer

- Business entities and use-case interfaces.
- Role-based policies and workflow rules.

1. Infrastructure Layer

- Prisma repositories against PostgreSQL.
- Auth.js, ImageKit, logging, and rate-limiting adapters.

## SOLID Enforcement

- Single Responsibility: each component/hook/service has one purpose.
- Open/Closed: features extend via composition and interfaces.
- Liskov Substitution: repository contracts support implementation swaps.
- Interface Segregation: small, focused contracts per feature aggregate.
- Dependency Inversion: domain/application layers depend on repository interfaces, not Prisma directly.

## Directory Baseline

```text
src/
  app/
  components/
  i18n/
  lib/
    config/
    contexts/
    hooks/
    repositories/
    utils/
prisma/
tests/
docs/
```

## Data Model

```mermaid
erDiagram
  users ||--o| profiles : has
  users ||--o{ projects : owns
  users ||--o{ rfq_submissions : reviews
  users ||--o{ job_applications : reviews
  users ||--o{ contractor_registrations : reviews
  users ||--o{ certifications : issues
  users ||--o{ audit_logs : writes
  contractor_registrations ||--o{ certifications : contains

  users {
    string id PK
    string email
    string role
    boolean isActive
  }
  profiles {
    string id PK
    string userId FK
    string companyMissionEn
    string companyMissionAr
    string[] coreServicesEn
    string[] coreServicesAr
  }
  projects {
    string id PK
    string slug
    string titleEn
    string titleAr
    string category
    string status
    boolean featured
    string ownerId FK
  }
  rfq_submissions {
    string id PK
    string fullName
    string email
    string status
    datetime submittedAt
    string handledById FK
  }
  job_applications {
    string id PK
    string fullName
    string email
    string positionApplied
    string status
    datetime submittedAt
    string handledById FK
  }
  contractor_registrations {
    string id PK
    string companyName
    string contactName
    string email
    string status
    datetime submittedAt
    string handledById FK
  }
  certifications {
    string id PK
    string title
    string issuingAuthority
    datetime issuedAt
    string contractorRegistrationId FK
    string issuedById FK
  }
  audit_logs {
    string id PK
    string actorId FK
    string action
    string entityType
    string entityId
    datetime createdAt
  }
```

## Relationship Flow

```mermaid
flowchart LR
  A[Admin User] --> B[Profile]
  A --> C[Projects]
  A --> D[Audit Logs]
  U[Public/Client/Contractor] --> E[RFQ Submission]
  U --> F[Job Application]
  U --> G[Contractor Registration]
  G --> H[Certifications]
  E --> A
  F --> A
  G --> A
```
