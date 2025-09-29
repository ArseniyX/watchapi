import { ApiEndpoint, Prisma } from '../../generated/prisma'
import { BaseRepository } from './base.repository'

export interface IApiEndpointRepository {
  findById(id: string): Promise<ApiEndpoint | null>
  findByUserId(userId: string): Promise<ApiEndpoint[]>
  findByOrganizationId(organizationId: string): Promise<ApiEndpoint[]>
  create(data: Omit<ApiEndpoint, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiEndpoint>
  update(id: string, data: Partial<Omit<ApiEndpoint, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ApiEndpoint>
  delete(id: string): Promise<void>
  findActive(): Promise<ApiEndpoint[]>
  findMany(options?: {
    skip?: number
    take?: number
    where?: Prisma.ApiEndpointWhereInput
    orderBy?: Prisma.ApiEndpointOrderByWithRelationInput
    include?: Prisma.ApiEndpointInclude
  }): Promise<ApiEndpoint[]>
}

export class ApiEndpointRepository extends BaseRepository implements IApiEndpointRepository {
  async findById(id: string): Promise<ApiEndpoint | null> {
    return this.prisma.apiEndpoint.findUnique({
      where: { id },
      include: {
        user: true,
        organization: true,
        collection: true,
        monitoringChecks: {
          orderBy: { checkedAt: 'desc' },
          take: 10,
        },
        alerts: true,
      },
    })
  }

  async findByUserId(userId: string): Promise<ApiEndpoint[]> {
    return this.prisma.apiEndpoint.findMany({
      where: { userId },
      include: {
        collection: true,
        monitoringChecks: {
          orderBy: { checkedAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findByOrganizationId(organizationId: string): Promise<ApiEndpoint[]> {
    return this.prisma.apiEndpoint.findMany({
      where: { organizationId },
      include: {
        user: true,
        collection: true,
        monitoringChecks: {
          orderBy: { checkedAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(data: Omit<ApiEndpoint, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiEndpoint> {
    return this.prisma.apiEndpoint.create({
      data,
      include: {
        user: true,
        collection: true,
      },
    })
  }

  async update(id: string, data: Partial<Omit<ApiEndpoint, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ApiEndpoint> {
    return this.prisma.apiEndpoint.update({
      where: { id },
      data,
      include: {
        user: true,
        collection: true,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.apiEndpoint.delete({
      where: { id },
    })
  }

  async findActive(): Promise<ApiEndpoint[]> {
    return this.prisma.apiEndpoint.findMany({
      where: { isActive: true },
      include: {
        user: true,
        organization: true,
      },
    })
  }

  async findMany(options: {
    skip?: number
    take?: number
    where?: Prisma.ApiEndpointWhereInput
    orderBy?: Prisma.ApiEndpointOrderByWithRelationInput
    include?: Prisma.ApiEndpointInclude
  } = {}): Promise<ApiEndpoint[]> {
    return this.prisma.apiEndpoint.findMany(options)
  }
}