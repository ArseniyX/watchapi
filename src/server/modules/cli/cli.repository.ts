import { BaseRepository } from "../shared/base.repository";

export class CliRepository extends BaseRepository {
  async getCollectionWithEndpoints(
    collectionId: string,
    organizationId: string,
  ) {
    return this.prisma.collection.findFirst({
      where: {
        id: collectionId,
        organizationId,
      },
      include: {
        apiEndpoints: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            url: true,
            method: true,
            headers: true,
            body: true,
            expectedStatus: true,
            timeout: true,
          },
        },
      },
    });
  }

  async createCliCheckBatch(
    data: {
      collectionId: string;
      environment: string;
      results: Array<{
        endpointId: string;
        status: "SUCCESS" | "FAILURE" | "TIMEOUT" | "ERROR";
        responseTime: number;
        statusCode?: number;
        errorMessage?: string;
      }>;
    },
    userId: string,
  ) {
    // Store checks in MonitoringCheck table
    const checks = data.results.map((result) => ({
      apiEndpointId: result.endpointId,
      userId,
      status: result.status,
      responseTime: result.responseTime,
      statusCode: result.statusCode,
      errorMessage: result.errorMessage,
    }));

    await this.prisma.monitoringCheck.createMany({
      data: checks,
    });

    return checks.length;
  }

  async getRecentChecksForEndpoint(endpointId: string, limit: number = 10) {
    return this.prisma.monitoringCheck.findMany({
      where: {
        apiEndpointId: endpointId,
      },
      orderBy: {
        checkedAt: "desc",
      },
      take: limit,
      select: {
        status: true,
        responseTime: true,
        statusCode: true,
        checkedAt: true,
      },
    });
  }
}
