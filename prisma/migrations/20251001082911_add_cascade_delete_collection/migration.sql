-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_api_endpoints" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'GET',
    "headers" TEXT,
    "body" TEXT,
    "expectedStatus" INTEGER NOT NULL DEFAULT 200,
    "timeout" INTEGER NOT NULL DEFAULT 30000,
    "interval" INTEGER NOT NULL DEFAULT 300000,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT,
    "collectionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "api_endpoints_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "api_endpoints_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "api_endpoints_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_api_endpoints" ("body", "collectionId", "createdAt", "expectedStatus", "headers", "id", "interval", "isActive", "method", "name", "organizationId", "timeout", "updatedAt", "url", "userId") SELECT "body", "collectionId", "createdAt", "expectedStatus", "headers", "id", "interval", "isActive", "method", "name", "organizationId", "timeout", "updatedAt", "url", "userId" FROM "api_endpoints";
DROP TABLE "api_endpoints";
ALTER TABLE "new_api_endpoints" RENAME TO "api_endpoints";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
