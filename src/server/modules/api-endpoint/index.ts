import { PrismaClient } from '../../../generated/prisma'
import { ApiEndpointRepository } from './api-endpoint.repository'
import { ApiEndpointService } from './api-endpoint.service'
import { createApiEndpointRouter } from './api-endpoint.router'

export class ApiEndpointModule {
  public readonly repository: ApiEndpointRepository
  public readonly service: ApiEndpointService
  public readonly router: ReturnType<typeof createApiEndpointRouter>

  constructor(prisma: PrismaClient) {
    this.repository = new ApiEndpointRepository(prisma)
    this.service = new ApiEndpointService(this.repository)
    this.router = createApiEndpointRouter(this.service)
  }
}
