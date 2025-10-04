import { execSync } from "child_process";
import { config } from "dotenv";

async function globalSetup() {
  // Load environment variables from .env file
  config();

  console.log("\n🧹 Resetting E2E test database...");

  const dbUrl = process.env.DATABASE_URL_E2E || process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error(
      "DATABASE_URL_E2E or DATABASE_URL must be set for E2E tests",
    );
  }

  console.log(`📦 Using database: ${dbUrl.split("@")[1] || "local"}`);

  try {
    // Check if this is an E2E database (safe to reset)
    const isE2EDatabase = dbUrl.includes("api_e2e") || dbUrl.includes("localhost") || dbUrl.includes("test");

    if (!isE2EDatabase) {
      throw new Error(
        "⚠️  Safety check: DATABASE_URL does not appear to be a test database. " +
        "E2E tests should use a dedicated test database (e.g., api_e2e, not production)."
      );
    }

    // Push schema to database (creates tables if they don't exist, resets data)
    execSync("npx prisma db push --force-reset --skip-generate", {
      stdio: "inherit",
      env: {
        ...process.env,
        DATABASE_URL: dbUrl,
        // Bypass Prisma AI safety check for E2E test database
        PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: "Automated E2E test setup - resetting test database",
      },
    });

    console.log("✅ E2E test database ready!\n");
  } catch (error) {
    console.error("❌ Failed to setup test database:", error);
    throw error;
  }
}

export default globalSetup;
