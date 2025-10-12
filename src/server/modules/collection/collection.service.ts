import { Collection, ApiEndpoint } from "../../../generated/prisma";
import { CollectionRepository } from "./collection.repository";
import {
  CreateCollectionInput,
  UpdateCollectionInput,
} from "./collection.schema";
import { BadRequestError, NotFoundError } from "../../errors/custom-errors";
import type { Context } from "../../trpc";

export interface CollectionWithStats extends Collection {
  apiEndpoints: ApiEndpoint[];
  requestCount: number;
  lastModified: string;
}

export class CollectionService {
  constructor(private readonly collectionRepository: CollectionRepository) {}

  async createCollection({
    ctx,
    input,
  }: {
    ctx: Context;
    input: CreateCollectionInput;
  }): Promise<Collection> {
    return this.collectionRepository.create({
      name: input.name.trim(),
      description: input.description?.trim() || null,
      organizationId: ctx.organizationId,
    });
  }

  async getCollection({
    ctx,
    input,
  }: {
    ctx: Context;
    input: { id: string };
  }): Promise<Collection | null> {
    if (!input.id || input.id.trim() === "") {
      throw new BadRequestError("Collection ID is required");
    }

    return this.collectionRepository.findByIdAndOrganization(
      input.id,
      ctx.organizationId,
    );
  }

  async getCollections({
    ctx,
  }: {
    ctx: Context;
  }): Promise<CollectionWithStats[]> {
    const collections = await this.collectionRepository.findByOrganizationId(
      ctx.organizationId,
    );

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

  async updateCollection({
    ctx,
    input,
  }: {
    ctx: Context;
    input: UpdateCollectionInput & { id: string };
  }): Promise<Collection> {
    if (!input.id || input.id.trim() === "") {
      throw new BadRequestError("Collection ID is required");
    }

    // Verify collection exists and belongs to organization
    const existing = await this.collectionRepository.findByIdAndOrganization(
      input.id,
      ctx.organizationId,
    );
    if (!existing) {
      throw new NotFoundError("Collection", input.id);
    }

    const updateData: any = {};

    if (input.name !== undefined) {
      updateData.name = input.name.trim();
    }
    if (input.description !== undefined) {
      updateData.description = input.description?.trim() || null;
    }

    return this.collectionRepository.update(input.id, updateData);
  }

  async deleteCollection({
    ctx,
    input,
  }: {
    ctx: Context;
    input: { id: string };
  }): Promise<void> {
    if (!input.id || input.id.trim() === "") {
      throw new BadRequestError("Collection ID is required");
    }

    // Verify collection exists and belongs to organization
    const existing = await this.collectionRepository.findByIdAndOrganization(
      input.id,
      ctx.organizationId,
    );
    if (!existing) {
      throw new NotFoundError("Collection", input.id);
    }

    return this.collectionRepository.delete(input.id);
  }

  async getCollectionStats({
    ctx,
  }: {
    ctx: Context;
  }) {
    const total = await this.collectionRepository.count(ctx.organizationId);
    const collections = await this.getCollections({ ctx });

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

  async searchCollections({
    ctx,
    input,
  }: {
    ctx: Context;
    input: { query: string };
  }): Promise<CollectionWithStats[]> {
    if (!input.query || input.query.trim() === "") {
      return [];
    }

    const collections = await this.collectionRepository.search(
      input.query.trim(),
      ctx.organizationId,
    );

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
