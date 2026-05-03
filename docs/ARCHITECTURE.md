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
