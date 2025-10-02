-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "OrganizationRole" AS ENUM ('MEMBER', 'ADMIN', 'OWNER');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('ACTIVE', 'INVITED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "HttpMethod" AS ENUM ('GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS');

-- CreateEnum
CREATE TYPE "CheckStatus" AS ENUM ('SUCCESS', 'FAILURE', 'TIMEOUT', 'ERROR');

-- CreateEnum
CREATE TYPE "AlertCondition" AS ENUM ('RESPONSE_TIME_ABOVE', 'RESPONSE_TIME_BELOW', 'STATUS_CODE_NOT', 'UPTIME_BELOW', 'ERROR_RATE_ABOVE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('EMAIL', 'WEBHOOK', 'SLACK', 'DISCORD');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "avatar" TEXT,
    "provider" TEXT,
    "providerId" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_members" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" "OrganizationRole" NOT NULL DEFAULT 'MEMBER',
    "status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "invitedBy" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_invitations" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" "OrganizationRole" NOT NULL DEFAULT 'MEMBER',
    "invitedBy" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collections" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_endpoints" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "method" "HttpMethod" NOT NULL DEFAULT 'GET',
    "headers" TEXT,
    "body" TEXT,
    "expectedStatus" INTEGER NOT NULL DEFAULT 200,
    "timeout" INTEGER NOT NULL DEFAULT 30000,
    "interval" INTEGER NOT NULL DEFAULT 300000,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT,
    "collectionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_endpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monitoring_checks" (
    "id" TEXT NOT NULL,
    "apiEndpointId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "CheckStatus" NOT NULL,
    "responseTime" INTEGER,
    "statusCode" INTEGER,
    "errorMessage" TEXT,
    "responseSize" INTEGER,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monitoring_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "apiEndpointId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "condition" "AlertCondition" NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastTriggered" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_triggers" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alert_triggers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_notifications" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "recipient" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alert_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_provider_providerId_key" ON "users"("provider", "providerId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "organization_members_userId_organizationId_key" ON "organization_members"("userId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_invitations_token_key" ON "organization_invitations"("token");

-- CreateIndex
CREATE INDEX "monitoring_checks_apiEndpointId_checkedAt_idx" ON "monitoring_checks"("apiEndpointId", "checkedAt");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_endpoints" ADD CONSTRAINT "api_endpoints_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_endpoints" ADD CONSTRAINT "api_endpoints_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_endpoints" ADD CONSTRAINT "api_endpoints_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitoring_checks" ADD CONSTRAINT "monitoring_checks_apiEndpointId_fkey" FOREIGN KEY ("apiEndpointId") REFERENCES "api_endpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitoring_checks" ADD CONSTRAINT "monitoring_checks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_apiEndpointId_fkey" FOREIGN KEY ("apiEndpointId") REFERENCES "api_endpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_triggers" ADD CONSTRAINT "alert_triggers_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "alerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_notifications" ADD CONSTRAINT "alert_notifications_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "alerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
