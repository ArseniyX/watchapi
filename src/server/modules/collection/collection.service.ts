import { Collection, ApiEndpoint } from "../../../generated/prisma";
import { CollectionRepository } from "./collection.repository";

export interface CreateCollectionInput {
    name: string;
    description?: string;
    organizationId?: string;
}

export interface UpdateCollectionInput {
    name?: string;
    description?: string;
}

export interface CollectionWithStats extends Collection {
    apiEndpoints: ApiEndpoint[];
    requestCount: number;
    lastModified: string;
}

export class CollectionService {
    constructor(private readonly collectionRepository: CollectionRepository) {}

    async createCollection(input: CreateCollectionInput): Promise<Collection> {
        // Validate name is not empty
        if (!input.name || input.name.trim() === "") {
            throw new Error("Collection name is required");
        }

        return this.collectionRepository.create({
            name: input.name.trim(),
            description: input.description?.trim() || null,
            organizationId: input.organizationId || null,
        });
    }

    async getCollection(id: string): Promise<Collection | null> {
        if (!id || id.trim() === "") {
            throw new Error("Collection ID is required");
        }

        return this.collectionRepository.findById(id);
    }

    async getCollections(
        organizationId?: string
    ): Promise<CollectionWithStats[]> {
        const collections = organizationId
            ? await this.collectionRepository.findByOrganizationId(
                  organizationId
              )
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
        input: UpdateCollectionInput
    ): Promise<Collection> {
        if (!id || id.trim() === "") {
            throw new Error("Collection ID is required");
        }

        // Verify collection exists
        const existing = await this.collectionRepository.findById(id);
        if (!existing) {
            throw new Error("Collection not found");
        }

        const updateData: any = {};

        if (input.name !== undefined) {
            if (!input.name || input.name.trim() === "") {
                throw new Error("Collection name cannot be empty");
            }
            updateData.name = input.name.trim();
        }
        if (input.description !== undefined) {
            updateData.description = input.description?.trim() || null;
        }

        return this.collectionRepository.update(id, updateData);
    }

    async deleteCollection(id: string): Promise<void> {
        if (!id || id.trim() === "") {
            throw new Error("Collection ID is required");
        }

        // Verify collection exists
        const existing = await this.collectionRepository.findById(id);
        if (!existing) {
            throw new Error("Collection not found");
        }

        return this.collectionRepository.delete(id);
    }

    async getCollectionStats(organizationId?: string) {
        const total = await this.collectionRepository.count(organizationId);
        const collections = await this.getCollections(organizationId);

        const totalRequests = collections.reduce(
            (sum, collection) => sum + collection.requestCount,
            0
        );
        const averageRequestsPerCollection =
            total > 0 ? Math.round(totalRequests / total) : 0;

        return {
            total,
            totalRequests,
            averageRequestsPerCollection,
        };
    }

    async searchCollections(query: string): Promise<CollectionWithStats[]> {
        if (!query || query.trim() === "") {
            return [];
        }

        const collections = await this.collectionRepository.search(
            query.trim()
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
