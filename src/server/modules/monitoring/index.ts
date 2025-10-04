import { PrismaClient } from "../../../generated/prisma";
import { MonitoringRepository } from "./monitoring.repository";
import { MonitoringService } from "./monitoring.service";
import { createMonitoringRouter } from "./monitoring.router";
import { ApiEndpointRepository } from "../api-endpoint/api-endpoint.repository";
import { AlertService } from "../alert/alert.service";

export class MonitoringModule {
  public readonly repository: MonitoringRepository;
  public readonly service: MonitoringService;
  public readonly router: ReturnType<typeof createMonitoringRouter>;

  constructor(prisma: PrismaClient, alertService: AlertService) {
    this.repository = new MonitoringRepository(prisma);
    const apiEndpointRepository = new ApiEndpointRepository(prisma);
    this.service = new MonitoringService(
      this.repository,
      apiEndpointRepository,
      alertService,
    );
    this.router = createMonitoringRouter(this.service);
  }
}

export * from "./monitoring.repository";
export * from "./monitoring.service";
export * from "./monitoring.router";
