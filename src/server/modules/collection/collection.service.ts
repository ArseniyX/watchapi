import { Collection, ApiEndpoint } from "../../../generated/prisma";
import { CollectionRepository } from "./collection.repository";
import {
  CreateCollectionInput,
  UpdateCollectionInput,
} from "./collection.schema";
import { BadRequestError, NotFoundError } from "../../errors/custom-errors";

export interface CollectionWithStats extends Collection {
  apiEndpoints: ApiEndpoint[];
  requestCount: number;
  lastModified: string;
}

export class CollectionService {
  constructor(private readonly collectionRepository: CollectionRepository) {}

  async createCollection(input: CreateCollectionInput): Promise<Collection> {
    // Validate organizationId is provided
    if (!input.organizationId) {
      throw new BadRequestError("Organization ID is required");
    }

    return this.collectionRepository.create({
      name: input.name.trim(),
      description: input.description?.trim() || null,
      organizationId: input.organizationId,
    });
  }

  async getCollection(id: string, organizationId: string): Promise<Collection | null> {
    if (!id || id.trim() === "") {
      throw new BadRequestError("Collection ID is required");
    }

    return this.collectionRepository.findByIdAndOrganization(id, organizationId);
  }

  async getCollections(
    organizationId?: string,
  ): Promise<CollectionWithStats[]> {
    const collections = organizationId
      ? await this.collectionRepository.findByOrganizationId(organizationId)
      : await this.collectionRepository.findMany();

    return collections.map((collection) => {
      const collectionWithEndpoints = collection as Collection & {
        apiEndpoints: ApiEndpoint[];
      };
      return {
        ...collectionWithEndpoints,
        requestCount: collectionWithEndpoints.apiEndpoints.length,
        lastModified: this.formatLastModified(collection.updatedAt),
      };
    });
  }

  async updateCollection(
    id: string,
    organizationId: string,
    input: UpdateCollectionInput,
  ): Promise<Collection> {
    if (!id || id.trim() === "") {
      throw new BadRequestError("Collection ID is required");
    }

    // Verify collection exists and belongs to organization
    const existing = await this.collectionRepository.findByIdAndOrganization(id, organizationId);
    if (!existing) {
      throw new NotFoundError("Collection", id);
    }

    const updateData: any = {};

    if (input.name !== undefined) {
      updateData.name = input.name.trim();
    }
    if (input.description !== undefined) {
      updateData.description = input.description?.trim() || null;
    }

    return this.collectionRepository.update(id, updateData);
  }

  async deleteCollection(id: string, organizationId: string): Promise<void> {
    if (!id || id.trim() === "") {
      throw new BadRequestError("Collection ID is required");
    }

    // Verify collection exists and belongs to organization
    const existing = await this.collectionRepository.findByIdAndOrganization(id, organizationId);
    if (!existing) {
      throw new NotFoundError("Collection", id);
    }

    return this.collectionRepository.delete(id);
  }

  async getCollectionStats(organizationId?: string) {
    const total = await this.collectionRepository.count(organizationId);
    const collections = await this.getCollections(organizationId);

    const totalRequests = collections.reduce(
      (sum, collection) => sum + collection.requestCount,
      0,
    );
    const averageRequestsPerCollection =
      total > 0 ? Math.round(totalRequests / total) : 0;

    return {
      total,
      totalRequests,
      averageRequestsPerCollection,
    };
  }

  async searchCollections(query: string, organizationId: string): Promise<CollectionWithStats[]> {
    if (!query || query.trim() === "") {
      return [];
    }

    const collections = await this.collectionRepository.search(query.trim(), organizationId);

    return collections.map((collection) => {
      const collectionWithEndpoints = collection as Collection & {
        apiEndpoints: ApiEndpoint[];
      };
      return {
        ...collectionWithEndpoints,
        requestCount: collectionWithEndpoints.apiEndpoints.length,
        lastModified: this.formatLastModified(collection.updatedAt),
      };
    });
  }

  private formatLastModified(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) return `${diffWeeks}w ago`;

    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths}mo ago`;
  }
}
