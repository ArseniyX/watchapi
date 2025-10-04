import { PrismaClient } from "../../generated/prisma";

declare global {
  var __prisma: PrismaClient | undefined;
}

// Build DATABASE_URL with connection timeouts
const buildDatabaseUrl = () => {
  const baseUrl = process.env.DATABASE_URL;
  if (!baseUrl) return baseUrl;

  // Only add query params for PostgreSQL URLs
  if (!baseUrl.startsWith("postgresql://") && !baseUrl.startsWith("postgres://")) {
    return baseUrl;
  }

  const url = new URL(baseUrl);
  const params = new URLSearchParams(url.search);

  // PostgreSQL connection timeout parameters
  // statement_timeout: Abort any statement that takes more than the specified amount (milliseconds)
  if (!params.has("statement_timeout")) {
    params.set("statement_timeout", "30000"); // 30 seconds
  }

  // connect_timeout: Maximum time to wait for connection (seconds)
  if (!params.has("connect_timeout")) {
    params.set("connect_timeout", "10"); // 10 seconds
  }

  url.search = params.toString();
  return url.toString();
};

export const prisma =
  globalThis.__prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: buildDatabaseUrl(),
      },
    },
    // Connection pool configuration
    // Default pool size is 10, but we limit it to prevent connection saturation
    __internal: {
      engine: {
        connection_limit: 20, // Max connections in pool
      },
    },
  } as any);

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}

// Graceful shutdown - close connections on process exit
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;
