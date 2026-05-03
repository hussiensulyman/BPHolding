import { describe, expect, it } from "vitest";

import { canManageProjects, hasMinimumRole } from "@/lib/auth/role-guard";
import { getPortfolioProjects } from "@/lib/data/portfolio-service";
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

  it("returns localized portfolio projects from seed data", async () => {
    const arabicProjects = await getPortfolioProjects("ar");
    const englishProjects = await getPortfolioProjects("en");

    expect(arabicProjects).toHaveLength(3);
    expect(englishProjects).toHaveLength(3);
    expect(arabicProjects[0]?.title).toContain("تشطيبات");
    expect(englishProjects[0]?.title).toContain("Riyadh");
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
