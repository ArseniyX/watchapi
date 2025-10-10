import { router } from "./trpc";
import { prisma } from "./database";
import { UserModule } from "./modules/user";
import { AuthModule } from "./modules/auth";
import { MonitoringModule } from "./modules/monitoring";
import { CollectionModule } from "./modules/collection";
import { OrganizationModule } from "./modules/organization";
import { ApiEndpointModule } from "./modules/api-endpoint";
import { contactRouter } from "./modules/contact";
import { notificationChannelRouter } from "./modules/notification-channel";
import { alertRouter, alertService } from "./modules/alert";
import { cliRouter } from "./modules/cli";
import "./scheduler"; // Initialize monitoring scheduler

// Validate critical environment variables at startup
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

if (process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters for security");
}

// Initialize modules
const organizationModule = new OrganizationModule(prisma);
const userModule = new UserModule(prisma, organizationModule.repository);
const authModule = new AuthModule(
  userModule.service,
  organizationModule.service,
  process.env.JWT_SECRET,
);
const apiEndpointModule = new ApiEndpointModule(prisma);
const monitoringModule = new MonitoringModule(prisma, alertService);
const collectionModule = new CollectionModule(prisma);

// Create main app router
export const appRouter = router({
  auth: authModule.router,
  user: userModule.router,
  apiEndpoint: apiEndpointModule.router,
  monitoring: monitoringModule.router,
  collection: collectionModule.router,
  organization: organizationModule.router,
  contact: contactRouter,
  notificationChannel: notificationChannelRouter,
  alert: alertRouter,
  cli: cliRouter,
});

export type AppRouter = typeof appRouter;

// Export modules for use in other parts of the application
export const modules = {
  user: userModule,
  auth: authModule,
  apiEndpoint: apiEndpointModule,
  monitoring: monitoringModule,
  collection: collectionModule,
  organization: organizationModule,
};
