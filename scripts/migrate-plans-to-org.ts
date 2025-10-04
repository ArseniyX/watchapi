#!/usr/bin/env tsx
/**
 * Migration script: Move user plans to organization plans
 *
 * This script:
 * 1. Finds each user's personal organization (earliest joined)
 * 2. Migrates user.plan -> organization.plan
 * 3. Safe to run multiple times (idempotent)
 */

import { PrismaClient, PlanType } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function migratePlansToOrganization() {
  console.log("Starting migration: User plans → Organization plans\n");

  try {
    // Use raw SQL since plan field is removed from Prisma schema but still exists in DB
    const users = (await prisma.$queryRaw`
      SELECT
        u.id,
        u.email,
        u.plan,
        first_org."organizationId",
        first_org."organizationName",
        first_org."organizationPlan"
      FROM users u
      LEFT JOIN LATERAL (
        SELECT
          om."organizationId",
          o.name as "organizationName",
          o.plan as "organizationPlan"
        FROM organization_members om
        JOIN organizations o ON om."organizationId" = o.id
        WHERE om."userId" = u.id
        ORDER BY om."joinedAt" ASC
        LIMIT 1
      ) first_org ON true
      WHERE u.plan IS NOT NULL
    `) as any[];

    console.log(`Found ${users.length} users to migrate\n`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      if (!user.organizationId) {
        console.log(`⚠️  User ${user.email}: No organization found, skipping`);
        skippedCount++;
        continue;
      }

      // Only migrate if org is still on FREE plan (default)
      if (user.organizationPlan !== "FREE") {
        console.log(
          `⏭️  User ${user.email}: Org "${user.organizationName}" already has plan ${user.organizationPlan}, skipping`,
        );
        skippedCount++;
        continue;
      }

      try {
        // Update organization with user's plan
        await prisma.$executeRaw`
          UPDATE organizations
          SET plan = ${user.plan}::text::"PlanType"
          WHERE id = ${user.organizationId}
        `;

        console.log(
          `✅ User ${user.email} → Org "${user.organizationName}": ${user.plan}`,
        );
        migratedCount++;
      } catch (error) {
        console.error(
          `❌ Error migrating user ${user.email}:`,
          error instanceof Error ? error.message : error,
        );
        errorCount++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("Migration Summary:");
    console.log(`  ✅ Migrated: ${migratedCount}`);
    console.log(`  ⏭️  Skipped:  ${skippedCount}`);
    console.log(`  ❌ Errors:   ${errorCount}`);
    console.log("=".repeat(60) + "\n");

    if (errorCount > 0) {
      throw new Error(
        `Migration completed with ${errorCount} errors. Check logs above.`,
      );
    }

    console.log("✅ Migration completed successfully!\n");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migratePlansToOrganization()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
