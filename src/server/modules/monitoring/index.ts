import { PrismaClient } from "../../../generated/prisma";
import { MonitoringRepository } from "./monitoring.repository";
import { MonitoringService } from "./monitoring.service";
import { createMonitoringRouter } from "./monitoring.router";
import { ApiEndpointRepository } from "../api-endpoint/api-endpoint.repository";
import { NotificationChannelRepository } from "../notification-channel/notification-channel.repository";
import { NotificationChannelService } from "../notification-channel/notification-channel.service";

export class MonitoringModule {
  public readonly repository: MonitoringRepository;
  public readonly service: MonitoringService;
  public readonly router: ReturnType<typeof createMonitoringRouter>;

  constructor(prisma: PrismaClient) {
    this.repository = new MonitoringRepository(prisma);
    const apiEndpointRepository = new ApiEndpointRepository(prisma);
    const notificationChannelRepository = new NotificationChannelRepository(
      prisma,
    );
    const notificationChannelService = new NotificationChannelService(
      notificationChannelRepository,
    );
    this.service = new MonitoringService(
      this.repository,
      apiEndpointRepository,
      notificationChannelService,
    );
    this.router = createMonitoringRouter(this.service);
  }
}

export * from "./monitoring.repository";
export * from "./monitoring.service";
export * from "./monitoring.router";
