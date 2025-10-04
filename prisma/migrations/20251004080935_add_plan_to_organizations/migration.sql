/*
  Warnings:

  - You are about to drop the column `userId` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `plan` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `planExpiresAt` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[organizationId]` on the table `subscriptions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `organizationId` to the `subscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."subscriptions" DROP CONSTRAINT "subscriptions_userId_fkey";

-- DropIndex
DROP INDEX "public"."subscriptions_userId_key";

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "plan" "PlanType" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "planExpiresAt" TIMESTAMP(3);

-- AlterTable: Add organizationId as nullable first
ALTER TABLE "subscriptions" ADD COLUMN "organizationId" TEXT;

-- Data migration: Populate organizationId from userId
UPDATE "subscriptions" s
SET "organizationId" = om."organizationId"
FROM "organization_members" om
WHERE s."userId" = om."userId" AND om.role = 'OWNER';

-- Make organizationId required
ALTER TABLE "subscriptions" ALTER COLUMN "organizationId" SET NOT NULL;

-- Drop userId column
ALTER TABLE "subscriptions" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "plan",
DROP COLUMN "planExpiresAt";

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_organizationId_key" ON "subscriptions"("organizationId");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
