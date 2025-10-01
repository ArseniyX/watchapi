import { PrismaClient, MonitoringCheck, CheckStatus, Prisma } from '../../../generated/prisma'

export class MonitoringRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // Monitoring Checks
  async createMonitoringCheck(data: Omit<MonitoringCheck, 'id' | 'checkedAt'>): Promise<MonitoringCheck> {
    return this.prisma.monitoringCheck.create({
      data,
      include: {
        apiEndpoint: true,
      },
    })
  }

  async findChecksByApiEndpointId(
    apiEndpointId: string,
    options: {
      skip?: number
      take?: number
      orderBy?: Prisma.MonitoringCheckOrderByWithRelationInput
    } = {}
  ): Promise<MonitoringCheck[]> {
    return this.prisma.monitoringCheck.findMany({
      where: { apiEndpointId },
      ...options,
    })
  }

  async getUptimeStats(apiEndpointId: string, from: Date, to: Date) {
    const [total, successful] = await Promise.all([
      this.prisma.monitoringCheck.count({
        where: {
          apiEndpointId,
          checkedAt: { gte: from, lte: to },
        },
      }),
      this.prisma.monitoringCheck.count({
        where: {
          apiEndpointId,
          status: CheckStatus.SUCCESS,
          checkedAt: { gte: from, lte: to },
        },
      }),
    ])

    const failed = total - successful
    const uptimePercentage = total > 0 ? (successful / total) * 100 : 0

    return {
      total,
      successful,
      failed,
      uptimePercentage,
    }
  }

  async getAverageResponseTime(apiEndpointId: string, from: Date, to: Date): Promise<number> {
    const result = await this.prisma.monitoringCheck.aggregate({
      where: {
        apiEndpointId,
        status: CheckStatus.SUCCESS,
        responseTime: { not: null },
        checkedAt: { gte: from, lte: to },
      },
      _avg: {
        responseTime: true,
      },
    })

    return result._avg.responseTime || 0
  }

  async getResponseTimeHistoryByEndpoint(
    apiEndpointId: string,
    from: Date,
    to: Date,
    intervalMinutes: number = 60
  ) {
    // This is a simplified version - you might want to use raw SQL for more complex time-series queries
    return this.prisma.monitoringCheck.findMany({
      where: {
        apiEndpointId,
        status: CheckStatus.SUCCESS,
        responseTime: { not: null },
        checkedAt: { gte: from, lte: to },
      },
      select: {
        responseTime: true,
        checkedAt: true,
      },
      orderBy: { checkedAt: 'asc' },
    })
  }

  async deleteOldChecks(beforeDate: Date): Promise<number> {
    const result = await this.prisma.monitoringCheck.deleteMany({
      where: {
        checkedAt: {
          lt: beforeDate,
        },
      },
    })

    return result.count
  }

  async findUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    })
  }

  // Analytics methods
  async getOverallStats(userId: string, from: Date, to: Date) {
    const [totalChecks, successfulChecks, avgResponse] = await Promise.all([
      this.prisma.monitoringCheck.count({
        where: {
          userId,
          checkedAt: { gte: from, lte: to },
        },
      }),
      this.prisma.monitoringCheck.count({
        where: {
          userId,
          status: CheckStatus.SUCCESS,
          checkedAt: { gte: from, lte: to },
        },
      }),
      this.prisma.monitoringCheck.aggregate({
        where: {
          userId,
          status: CheckStatus.SUCCESS,
          responseTime: { not: null },
          checkedAt: { gte: from, lte: to },
        },
        _avg: {
          responseTime: true,
        },
      }),
    ])

    const failedChecks = totalChecks - successfulChecks
    const errorRate = totalChecks > 0 ? (failedChecks / totalChecks) * 100 : 0
    const uptimePercentage = totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 0

    return {
      totalChecks,
      successfulChecks,
      failedChecks,
      errorRate,
      uptimePercentage,
      avgResponseTime: avgResponse._avg.responseTime || 0,
    }
  }

  async getTopEndpoints(userId: string, from: Date, to: Date, limit: number = 5) {
    const endpoints = await this.prisma.apiEndpoint.findMany({
      where: { userId },
      include: {
        monitoringChecks: {
          where: {
            checkedAt: { gte: from, lte: to },
          },
        },
      },
    })

    const endpointStats = endpoints.map(endpoint => {
      const checks = endpoint.monitoringChecks
      const totalChecks = checks.length
      const successfulChecks = checks.filter(c => c.status === CheckStatus.SUCCESS).length
      const failedChecks = totalChecks - successfulChecks
      const avgResponseTime = checks.reduce((sum, c) => sum + (c.responseTime || 0), 0) / totalChecks || 0
      const errorRate = totalChecks > 0 ? (failedChecks / totalChecks) * 100 : 0

      return {
        id: endpoint.id,
        name: endpoint.name,
        url: endpoint.url,
        totalChecks,
        avgResponseTime: Math.round(avgResponseTime),
        errorRate: errorRate.toFixed(2),
      }
    })

    return endpointStats
      .sort((a, b) => b.totalChecks - a.totalChecks)
      .slice(0, limit)
  }

  async getResponseTimeHistoryByUser(userId: string, from: Date, to: Date) {
    return this.prisma.monitoringCheck.findMany({
      where: {
        userId,
        status: CheckStatus.SUCCESS,
        responseTime: { not: null },
        checkedAt: { gte: from, lte: to },
      },
      select: {
        responseTime: true,
        checkedAt: true,
      },
      orderBy: { checkedAt: 'asc' },
    })
  }

  async getUptimeHistory(userId: string, from: Date, to: Date) {
    return this.prisma.monitoringCheck.findMany({
      where: {
        userId,
        checkedAt: { gte: from, lte: to },
      },
      select: {
        status: true,
        checkedAt: true,
      },
      orderBy: { checkedAt: 'asc' },
    })
  }
}
