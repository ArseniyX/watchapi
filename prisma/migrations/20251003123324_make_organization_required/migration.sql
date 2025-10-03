/*
  Warnings:

  - Made the column `organizationId` on table `api_endpoints` required. This step will fail if there are existing NULL values in that column.
  - Made the column `organizationId` on table `collections` required. This step will fail if there are existing NULL values in that column.

  Migration strategy:
  1. Create personal organizations for all existing users
  2. Create organization memberships (users as owners of their personal orgs)
  3. Assign existing endpoints and collections to users' personal organizations
  4. Make organizationId required
*/

-- Step 1: Create personal organizations for all users who don't have one
INSERT INTO "organizations" (id, name, slug, "createdAt", "updatedAt")
SELECT
  'org_' || u.id,
  COALESCE(u.name, u.email) || '''s Workspace',
  'personal-' || LOWER(REPLACE(u.email, '@', '-')),
  NOW(),
  NOW()
FROM "users" u
WHERE NOT EXISTS (
  SELECT 1 FROM "organization_members" om WHERE om."userId" = u.id
);

-- Step 2: Add users as owners of their personal organizations
INSERT INTO "organization_members" (id, "userId", "organizationId", role, status, "joinedAt")
SELECT
  'member_' || u.id,
  u.id,
  'org_' || u.id,
  'OWNER',
  'ACTIVE',
  NOW()
FROM "users" u
WHERE NOT EXISTS (
  SELECT 1 FROM "organization_members" om WHERE om."userId" = u.id
);

-- Step 3: Assign existing collections with NULL organizationId to personal organizations
-- (Collections don't have userId, so we can't auto-assign them - set to first user's org as fallback)
UPDATE "collections"
SET "organizationId" = (SELECT 'org_' || id FROM "users" LIMIT 1)
WHERE "organizationId" IS NULL;

-- Step 4: Assign existing api_endpoints with NULL organizationId to users' personal organizations
UPDATE "api_endpoints"
SET "organizationId" = 'org_' || "userId"
WHERE "organizationId" IS NULL;

-- DropForeignKey
ALTER TABLE "api_endpoints" DROP CONSTRAINT IF EXISTS "api_endpoints_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "collections" DROP CONSTRAINT IF EXISTS "collections_organizationId_fkey";

-- AlterTable: Make organizationId required
ALTER TABLE "api_endpoints" ALTER COLUMN "organizationId" SET NOT NULL;

-- AlterTable: Make organizationId required
ALTER TABLE "collections" ALTER COLUMN "organizationId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_endpoints" ADD CONSTRAINT "api_endpoints_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
