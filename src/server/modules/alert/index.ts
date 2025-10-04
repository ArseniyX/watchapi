import { AlertRepository } from "./alert.repository";
import { AlertService } from "./alert.service";
import { createAlertRouter } from "./alert.router";
import { prisma } from "../../database";
import { ApiEndpointRepository } from "../api-endpoint/api-endpoint.repository";
import { MonitoringRepository } from "../monitoring/monitoring.repository";
import { NotificationChannelService } from "../notification-channel/notification-channel.service";
import { NotificationChannelRepository } from "../notification-channel/notification-channel.repository";

// Initialize repositories
const alertRepository = new AlertRepository(prisma);
const apiEndpointRepository = new ApiEndpointRepository(prisma);
const monitoringRepository = new MonitoringRepository(prisma);

// Initialize notification dependencies
const notificationChannelRepository = new NotificationChannelRepository(prisma);
const notificationChannelService = new NotificationChannelService(
  notificationChannelRepository,
);

// Initialize service
const alertService = new AlertService(
  alertRepository,
  apiEndpointRepository,
  monitoringRepository,
  notificationChannelService,
);

// Create and export router
export const alertRouter = createAlertRouter(alertService);

// Export service for use in other modules (e.g., monitoring)
export { alertService };
export { AlertService } from "./alert.service";
export type { AlertEvaluationContext } from "./alert.service";
