import { beforeEach, describe, expect, it, vi } from "vitest";

const getAdminSessionUserMock = vi.hoisted(() => vi.fn());
const nextResponseJsonMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth/admin-session", () => ({
  getAdminSessionUser: getAdminSessionUserMock,
}));

vi.mock("next/server", () => ({
  NextResponse: {
    json: nextResponseJsonMock,
  },
}));

import { badRequest, ok, requireAdminApiUser } from "@/lib/auth/admin-api";

describe("admin-api helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    nextResponseJsonMock.mockImplementation(
      (body: unknown, init?: { status?: number }) => ({
        body,
        status: init?.status ?? 200,
      }),
    );
  });

  it("returns unauthorized response when session user is missing", async () => {
    getAdminSessionUserMock.mockResolvedValue(null);

    const result = await requireAdminApiUser("projects");

    expect(getAdminSessionUserMock).toHaveBeenCalledWith("projects");
    expect(result.user).toBeNull();
    expect(result.response).toEqual({
      body: {
        success: false,
        error: "Unauthorized",
      },
      status: 401,
    });
  });

  it("returns user with null response when authorized", async () => {
    const user = {
      id: "admin-1",
      email: "admin@bpholding.net",
      name: "Admin",
      role: "ADMIN",
    };

    getAdminSessionUserMock.mockResolvedValue(user);

    const result = await requireAdminApiUser();

    expect(getAdminSessionUserMock).toHaveBeenCalledWith("dashboard");
    expect(result).toEqual({
      user,
      response: null,
    });
  });

  it("creates success envelope with ok helper", () => {
    const response = ok({ hello: "world" });

    expect(nextResponseJsonMock).toHaveBeenCalledWith({
      success: true,
      data: { hello: "world" },
      error: null,
    });
    expect(response).toEqual({
      body: {
        success: true,
        data: { hello: "world" },
        error: null,
      },
      status: 200,
    });
  });

  it("creates error envelope with badRequest helper", () => {
    const response = badRequest("Bad input", 422);

    expect(nextResponseJsonMock).toHaveBeenCalledWith(
      {
        success: false,
        data: null,
        error: "Bad input",
      },
      { status: 422 },
    );
    expect(response).toEqual({
      body: {
        success: false,
        data: null,
        error: "Bad input",
      },
      status: 422,
    });
  });
});
