// @vitest-environment node

import type { PrismaClient } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.resetModules();
  vi.unstubAllEnvs();
  delete (globalThis as { prisma?: PrismaClient }).prisma;
  delete (globalThis as { shutdownHooksRegistered?: boolean }).shutdownHooksRegistered;
});

describe("db singleton", () => {
  it("reuses global prisma instance in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv(
      "DATABASE_URL",
      "postgresql://postgres:postgres@localhost:5432/bpholding?schema=public",
    );

    const firstModule = await import("@/lib/db");
    const secondModule = await import("@/lib/db");

    expect(firstModule.db).toBe(secondModule.db);
    expect((globalThis as { prisma?: PrismaClient }).prisma).toBe(firstModule.db);
  });

  it("adds pooling params to production datasource URL", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv(
      "DATABASE_URL",
      "postgresql://postgres:postgres@localhost:5432/bpholding?schema=public",
    );
    vi.stubEnv("PRISMA_CONNECTION_LIMIT", "33");
    vi.stubEnv("PRISMA_POOL_TIMEOUT_SECONDS", "22");

    const dbModule = await import("@/lib/db");
    const datasourceUrl = dbModule.buildDatabaseUrl();

    expect(datasourceUrl).toContain("connection_limit=33");
    expect(datasourceUrl).toContain("pool_timeout=22");
  });
});
