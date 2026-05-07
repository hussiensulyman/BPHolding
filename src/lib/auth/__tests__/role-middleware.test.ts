import { describe, expect, it } from "vitest";

import { canAccessAdminRoute } from "@/lib/auth/role-middleware";

describe("role middleware", () => {
  it("allows admin to access protected admin sections", () => {
    expect(canAccessAdminRoute("ADMIN", "projects")).toBe(true);
    expect(canAccessAdminRoute("ADMIN", "submissions")).toBe(true);
  });

  it("allows HR only in permitted sections", () => {
    expect(canAccessAdminRoute("HR", "submissions")).toBe(true);
    expect(canAccessAdminRoute("HR", "audit")).toBe(true);
    expect(canAccessAdminRoute("HR", "projects")).toBe(false);
  });

  it("rejects non-admin roles", () => {
    expect(canAccessAdminRoute("CLIENT", "submissions")).toBe(false);
    expect(canAccessAdminRoute("SALES", "submissions")).toBe(false);
    expect(canAccessAdminRoute(null, "submissions")).toBe(false);
  });
});
