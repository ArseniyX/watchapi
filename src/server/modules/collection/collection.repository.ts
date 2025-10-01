import { PrismaClient, Collection } from "../../../generated/prisma";
import { BaseRepository } from "../shared/base.repository";

export interface CreateCollectionData {
    name: string;
    description?: string | null;
    organizationId?: string | null;
}

export interface UpdateCollectionData {
    name?: string;
    description?: string | null;
}

export class CollectionRepository extends BaseRepository {
    constructor(prisma: PrismaClient) {
        super(prisma);
    }

    async create(data: CreateCollectionData): Promise<Collection> {
        return this.prisma.collection.create({
            data,
            include: {
                apiEndpoints: true,
            },
        });
    }

    async findById(id: string): Promise<Collection | null> {
        return this.prisma.collection.findUnique({
            where: { id },
            include: {
                apiEndpoints: true,
            },
        });
    }

    async findByOrganizationId(organizationId: string): Promise<Collection[]> {
        return this.prisma.collection.findMany({
            where: { organizationId },
            include: {
                apiEndpoints: true,
            },
            orderBy: { updatedAt: "desc" },
        });
    }

    async findMany(
        options: { skip?: number; take?: number } = {}
    ): Promise<Collection[]> {
        return this.prisma.collection.findMany({
            ...options,
            include: {
                apiEndpoints: true,
            },
            orderBy: { updatedAt: "desc" },
        });
    }

    async update(id: string, data: UpdateCollectionData): Promise<Collection> {
        return this.prisma.collection.update({
            where: { id },
            data,
            include: {
                apiEndpoints: true,
            },
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.collection.delete({
            where: { id },
        });
    }

    async count(organizationId?: string): Promise<number> {
        return this.prisma.collection.count({
            where: organizationId ? { organizationId } : undefined,
        });
    }
}
