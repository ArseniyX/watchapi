/*
  Warnings:

  - You are about to drop the column `activeOrganizationId` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."users" DROP CONSTRAINT "users_activeOrganizationId_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "activeOrganizationId";
