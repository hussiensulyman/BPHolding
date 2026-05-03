import { describe, expect, it } from "vitest";

import { canManageProjects, hasMinimumRole } from "@/lib/auth/role-guard";
import { PortfolioService } from "@/lib/data/portfolio-service";
import type { IProjectRepository } from "@/lib/repositories/contracts/project-repository";
import { InMemoryRateLimiter } from "@/lib/security/rate-limit";
import { validateRfqForm } from "@/lib/validation/rfq-form.schema";

describe("critical paths", () => {
  it("authorizes project management only for admin roles", () => {
    expect(canManageProjects("ADMIN")).toBe(true);
    expect(canManageProjects("CLIENT")).toBe(false);
    expect(hasMinimumRole("ADMIN", "CLIENT")).toBe(true);
    expect(hasMinimumRole("CLIENT", "ADMIN")).toBe(false);
  });

  it("validates RFQ payload server-side with MIME and size checks", () => {
    const validPayload = validateRfqForm({
      fullName: "Ahmad Al Qahtani",
      email: "ahmad@example.com",
      phone: "+966500000000",
      projectType: "construction",
      message: "We need full-scope construction delivery for a mixed-use facility.",
      attachment: {
        mimeType: "application/pdf",
        sizeBytes: 1024,
      },
    });

    const invalidPayload = validateRfqForm({
      fullName: "A",
      email: "invalid",
      phone: "123",
      projectType: "construction",
      message: "short",
      attachment: {
        mimeType: "image/png",
        sizeBytes: 9_000_000,
      },
    });

    expect(validPayload.success).toBe(true);
    expect(invalidPayload.success).toBe(false);
  });

  it("returns filtered projects through injected portfolio repository", async () => {
    const projects = [
      {
        id: "1",
        slug: "al-fursan-residential-compound-riyadh",
        titleEn: "Al-Fursan Residential Compound - Riyadh",
        titleAr: "مجمع الفرسان السكني - الرياض",
        descriptionEn:
          "Integrated residential delivery including civil works, MEP systems, and high-end interior finishing for villa clusters in Al-Fursan district.",
        descriptionAr:
          "تسليم سكني متكامل يشمل الأعمال المدنية، أنظمة الميكانيكا والكهرباء والسباكة، وتشطيبات داخلية راقية لمجمعات الفلل في حي الفرسان.",
        location: "Al-Fursan District",
        city: "Riyadh",
        category: "RESIDENTIAL",
        status: "PUBLISHED",
        featured: true,
        completedAt: new Date("2024-03-10T00:00:00.000Z"),
        sortOrder: 1,
        ownerId: null,
        createdAt: new Date("2024-03-10T00:00:00.000Z"),
        updatedAt: new Date("2024-03-10T00:00:00.000Z"),
      },
    ] as const;

    const repository: IProjectRepository = {
      findById: async () => projects[0] ?? null,
      findBySlug: async () => projects[0] ?? null,
      listPublished: async () => [...projects],
      listPublishedFiltered: async () => ({
        items: [...projects],
        total: projects.length,
      }),
      listRelatedByCategory: async () => [],
      create: async () => projects[0]!,
    };

    const service = new PortfolioService(repository);
    const result = await service.listProjects({
      category: "RESIDENTIAL",
      location: "Riyadh",
      page: 1,
      pageSize: 12,
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.titleEn).toContain("Al-Fursan");
    expect(result.items[0]?.titleAr).toContain("الفرسان");
    expect(result.availableYears).toContain(2024);
  });

  it("enforces request limits per key", () => {
    const limiter = new InMemoryRateLimiter(2, 10_000);
    const now = 1_000;

    const first = limiter.consume("rfq:ip:1", now);
    const second = limiter.consume("rfq:ip:1", now + 1);
    const third = limiter.consume("rfq:ip:1", now + 2);
    const afterWindow = limiter.consume("rfq:ip:1", now + 10_001);

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(third.allowed).toBe(false);
    expect(third.retryAfterSeconds).toBeGreaterThan(0);
    expect(afterWindow.allowed).toBe(true);
  });
});
