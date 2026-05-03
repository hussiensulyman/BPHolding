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

## Media Handling Strategy

- Delivery: project media is rendered through ImageKit Next components with responsive transformation chains (`w`, `q`, format) and URL-based optimization.
- Performance defaults: portfolio cards request 800px/85 quality variants for masonry cards, while detail galleries request larger responsive variants.
- Loading strategy: above-the-fold images are prioritized for preload; below-the-fold cards and gallery thumbnails use lazy loading.
- Utility layer: `src/lib/imagekit.ts` centralizes upload signing/upload execution and responsive URL generation via environment-based endpoints.

## Caching Strategy

- Portfolio list and detail routes use ISR (`revalidate = 3600`) to keep seeded project data fast and fresh on an hourly window.
- Server-rendered filtering and pagination are resolved in the service/repository pipeline, then cached at the route level for repeated traffic patterns.
- Image transformations are delegated to ImageKit CDN URLs so cacheable transformed assets are served from edge locations.

## Portfolio Data Flow

```mermaid
flowchart LR
  A[Prisma PostgreSQL] --> B[PrismaProjectRepository]
  B --> C[PortfolioService / IPortfolioService]
  C --> D[Server Components]
  D --> E[FilterBar Client Component]
  D --> F[PortfolioGrid Client Component]
  F --> G[ProjectCard Client Component]
  D --> H[Project Detail + Gallery]
```

- Dependency inversion: server components call the portfolio service interface, while repository implementations remain swappable.
- Single responsibility: filtering logic lives in service/repository, grid virtualization in `PortfolioGrid`, project presentation in `ProjectCard`, and filter interaction in `FilterBar`.
