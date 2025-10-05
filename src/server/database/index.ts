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

  // Prisma connection pool settings
  if (!params.has("connection_limit")) {
    // Increase limit - 5 was too small for concurrent requests
    params.set("connection_limit", "10"); // Max 10 connections in pool
  }

  if (!params.has("pool_timeout")) {
    params.set("pool_timeout", "20"); // Wait max 20s for connection from pool
  }

  url.search = params.toString();
  return url.toString();
};

export const prisma =
  globalThis.__prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development"
      ? process.env.PRISMA_LOG_QUERIES === "true"
        ? ["query", "error", "warn"]
        : ["error", "warn"]
      : ["error"],
    datasources: {
      db: {
        url: buildDatabaseUrl(),
      },
    },
    errorFormat: "pretty",
  }).$extends({
    query: {
      async $allOperations({ operation, model, args, query }) {
        const start = Date.now();
        try {
          const result = await query(args);
          const duration = Date.now() - start;

          // Log slow queries in development
          if (process.env.NODE_ENV === "development" && duration > 1000) {
            console.warn(`⚠️  Slow query (${duration}ms): ${model}.${operation}`);
          }

          return result;
        } catch (error) {
          console.error(`❌ Query failed: ${model}.${operation}`, error);
          throw error;
        }
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}

// Graceful shutdown - close connections on process exit
// Only register handlers once to avoid memory leaks in dev mode with hot reload
const HANDLERS_REGISTERED_KEY = Symbol.for("app.prisma.handlersRegistered");
if (!globalThis[HANDLERS_REGISTERED_KEY as any]) {
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

  globalThis[HANDLERS_REGISTERED_KEY as any] = true;
}

export default prisma;
