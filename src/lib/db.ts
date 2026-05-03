import { PrismaClient } from "@prisma/client";

const PRISMA_RECONNECT_ATTEMPTS = 3;

type PrismaGlobal = {
  prisma?: PrismaClient;
  shutdownHooksRegistered?: boolean;
};

const globalForPrisma = globalThis as unknown as PrismaGlobal;

export function buildDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL;

  if (!url) {
    return undefined;
  }

  if (process.env.NODE_ENV !== "production") {
    return url;
  }

  try {
    const parsedUrl = new URL(url);

    if (!parsedUrl.searchParams.has("connection_limit")) {
      parsedUrl.searchParams.set(
        "connection_limit",
        process.env.PRISMA_CONNECTION_LIMIT ?? "20",
      );
    }

    if (!parsedUrl.searchParams.has("pool_timeout")) {
      parsedUrl.searchParams.set(
        "pool_timeout",
        process.env.PRISMA_POOL_TIMEOUT_SECONDS ?? "15",
      );
    }

    return parsedUrl.toString();
  } catch {
    return url;
  }
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    datasourceUrl: buildDatabaseUrl(),
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

export const prisma = db;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function ensureDbConnection(
  retries = PRISMA_RECONNECT_ATTEMPTS,
): Promise<void> {
  let attempt = 0;

  while (attempt < retries) {
    try {
      await db.$connect();
      return;
    } catch {
      attempt += 1;

      if (attempt >= retries) {
        throw new Error(
          "Unable to connect to PostgreSQL with Prisma after retry attempts.",
        );
      }

      await delay(attempt * 500);
    }
  }
}

function registerShutdownHooks(): void {
  if (globalForPrisma.shutdownHooksRegistered) {
    return;
  }

  globalForPrisma.shutdownHooksRegistered = true;

  const closeConnection = async () => {
    await db.$disconnect();
  };

  process.on("SIGINT", () => {
    void closeConnection().finally(() => {
      process.exit(0);
    });
  });

  process.on("SIGTERM", () => {
    void closeConnection().finally(() => {
      process.exit(0);
    });
  });

  process.on("beforeExit", () => {
    void closeConnection();
  });
}

registerShutdownHooks();
