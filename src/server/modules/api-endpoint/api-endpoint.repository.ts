import { ApiEndpoint, Prisma } from "@/generated/prisma";
import { BaseRepository } from "../shared/base.repository";

// Type for endpoint with all relations loaded
export type ApiEndpointWithRelations = Prisma.ApiEndpointGetPayload<{
  include: {
    user: true;
    organization: true;
    collection: true;
    monitoringChecks: {
      orderBy: { checkedAt: "desc" };
      take: 10;
    };
    alerts: true;
  };
}>;

export type ApiEndpointWithBasicRelations = Prisma.ApiEndpointGetPayload<{
  include: {
    collection: true;
    monitoringChecks: {
      orderBy: { checkedAt: "desc" };
      take: 5;
    };
  };
}>;

export interface IApiEndpointRepository {
  findById(
    id: string,
    organizationId: string,
  ): Promise<ApiEndpointWithRelations | null>;
  findByOrganizationId(
    organizationId: string,
  ): Promise<ApiEndpointWithBasicRelations[]>;
  create(
    data: Omit<ApiEndpoint, "id" | "createdAt" | "updatedAt">,
  ): Promise<ApiEndpoint>;
  update(
    id: string,
    organizationId: string,
    data: Partial<Omit<ApiEndpoint, "id" | "createdAt" | "updatedAt">>,
  ): Promise<ApiEndpoint>;
  delete(id: string, organizationId: string): Promise<void>;
  findActive(): Promise<ApiEndpoint[]>;
  findMany(options?: {
    skip?: number;
    take?: number;
    where?: Prisma.ApiEndpointWhereInput;
    orderBy?: Prisma.ApiEndpointOrderByWithRelationInput;
    include?: Prisma.ApiEndpointInclude;
  }): Promise<ApiEndpoint[]>;
  search(
    query: string,
    organizationId: string,
  ): Promise<ApiEndpointWithBasicRelations[]>;
  // Internal method for scheduler - no org filtering
  findByIdInternal(id: string): Promise<ApiEndpointWithRelations | null>;
}

export class ApiEndpointRepository
  extends BaseRepository
  implements IApiEndpointRepository
{
  /**
   * Find endpoint by ID within an organization.
   * Returns null if endpoint doesn't exist or doesn't belong to the organization.
   */
  async findById(
    id: string,
    organizationId: string,
  ): Promise<ApiEndpointWithRelations | null> {
    return this.prisma.apiEndpoint.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        user: true,
        organization: true,
        collection: true,
        monitoringChecks: {
          orderBy: { checkedAt: "desc" },
          take: 10,
        },
        alerts: true,
      },
    }) as Promise<ApiEndpointWithRelations | null>;
  }

  /**
   * INTERNAL: Find endpoint by ID without organization filtering.
   * Only use for scheduler/system operations.
   * @internal
   */
  async findByIdInternal(id: string): Promise<ApiEndpointWithRelations | null> {
    return this.prisma.apiEndpoint.findUnique({
      where: { id },
      include: {
        user: true,
        organization: true,
        collection: true,
        monitoringChecks: {
          orderBy: { checkedAt: "desc" },
          take: 10,
        },
        alerts: true,
      },
    }) as Promise<ApiEndpointWithRelations | null>;
  }

  async findByOrganizationId(
    organizationId: string,
  ): Promise<ApiEndpointWithBasicRelations[]> {
    return this.prisma.apiEndpoint.findMany({
      where: { organizationId },
      include: {
        collection: true,
        monitoringChecks: {
          orderBy: { checkedAt: "desc" },
          take: 5,
        },
      },
      orderBy: { createdAt: "desc" },
    }) as Promise<ApiEndpointWithBasicRelations[]>;
  }

  async create(
    data: Omit<ApiEndpoint, "id" | "createdAt" | "updatedAt">,
  ): Promise<ApiEndpoint> {
    return this.prisma.apiEndpoint.create({
      data,
      include: {
        user: true,
        collection: true,
      },
    });
  }

  async update(
    id: string,
    organizationId: string,
    data: Partial<Omit<ApiEndpoint, "id" | "createdAt" | "updatedAt">>,
  ): Promise<ApiEndpoint> {
    // First verify endpoint belongs to organization
    const endpoint = await this.findById(id, organizationId);
    if (!endpoint) {
      throw new Error("API endpoint not found or access denied");
    }

    return this.prisma.apiEndpoint.update({
      where: { id },
      data,
      include: {
        user: true,
        collection: true,
      },
    });
  }

  async delete(id: string, organizationId: string): Promise<void> {
    // First verify endpoint belongs to organization
    const endpoint = await this.findById(id, organizationId);
    if (!endpoint) {
      throw new Error("API endpoint not found or access denied");
    }

    await this.prisma.apiEndpoint.delete({
      where: { id },
    });
  }

  async findActive(): Promise<ApiEndpoint[]> {
    return this.prisma.apiEndpoint.findMany({
      where: { isActive: true },
      include: {
        user: true,
        organization: true,
      },
    });
  }

  async findMany(
    options: {
      skip?: number;
      take?: number;
      where?: Prisma.ApiEndpointWhereInput;
      orderBy?: Prisma.ApiEndpointOrderByWithRelationInput;
      include?: Prisma.ApiEndpointInclude;
    } = {},
  ): Promise<ApiEndpoint[]> {
    return this.prisma.apiEndpoint.findMany(options);
  }

  async search(
    query: string,
    organizationId: string,
  ): Promise<ApiEndpointWithBasicRelations[]> {
    return this.prisma.apiEndpoint.findMany({
      where: {
        organizationId,
        OR: [{ name: { contains: query } }, { url: { contains: query } }],
      },
      include: {
        collection: true,
        monitoringChecks: {
          orderBy: { checkedAt: "desc" },
          take: 5,
        },
      },
      orderBy: { createdAt: "desc" },
    }) as Promise<ApiEndpointWithBasicRelations[]>;
  }
}
