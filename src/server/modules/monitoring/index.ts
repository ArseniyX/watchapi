import { PrismaClient } from '../../../generated/prisma'
import { MonitoringRepository } from './monitoring.repository'
import { MonitoringService } from './monitoring.service'
import { createMonitoringRouter } from './monitoring.router'

export class MonitoringModule {
  public readonly repository: MonitoringRepository
  public readonly service: MonitoringService
  public readonly router: ReturnType<typeof createMonitoringRouter>

  constructor(prisma: PrismaClient) {
    this.repository = new MonitoringRepository(prisma)
    this.service = new MonitoringService(this.repository)
    this.router = createMonitoringRouter(this.service)
  }
}

export * from './monitoring.repository'
export * from './monitoring.service'
export * from './monitoring.router'