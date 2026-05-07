import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.hoisted(() => vi.fn());

vi.mock("@/auth", () => ({
  auth: authMock,
}));

import { getAdminSessionUser } from "@/lib/auth/admin-session";

describe("admin-session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when session user has missing required fields", async () => {
    authMock.mockResolvedValue({ user: { id: "u1", email: "admin@bpholding.net" } });

    const result = await getAdminSessionUser();

    expect(result).toBeNull();
  });

  it("returns null for non-admin role", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "u1",
        email: "client@bpholding.net",
        name: "Client User",
        role: "CLIENT",
      },
    });

    const result = await getAdminSessionUser("submissions");

    expect(result).toBeNull();
  });

  it("returns null when role cannot access section", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "u2",
        email: "hr@bpholding.net",
        name: "HR User",
        role: "HR",
      },
    });

    const result = await getAdminSessionUser("projects");

    expect(result).toBeNull();
  });

  it("returns normalized admin session user when role and section are allowed", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "admin-1",
        email: "admin@bpholding.net",
        name: "BP Holding Admin",
        role: "ADMIN",
      },
    });

    const result = await getAdminSessionUser("projects");

    expect(result).toEqual({
      id: "admin-1",
      email: "admin@bpholding.net",
      name: "BP Holding Admin",
      role: "ADMIN",
    });
  });

  it("allows HR role on default dashboard section", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "hr-1",
        email: "hr@bpholding.net",
        name: "HR User",
        role: "HR",
      },
    });

    const result = await getAdminSessionUser();

    expect(result).toEqual({
      id: "hr-1",
      email: "hr@bpholding.net",
      name: "HR User",
      role: "HR",
    });
  });
});
