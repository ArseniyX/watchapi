import { PrismaClient } from "../../../generated/prisma";
import { CollectionRepository } from "./collection.repository";
import { CollectionService } from "./collection.service";
import { createCollectionRouter } from "./collection.router";

export class CollectionModule {
    public readonly repository: CollectionRepository;
    public readonly service: CollectionService;
    public readonly router: ReturnType<typeof createCollectionRouter>;

    constructor(prisma: PrismaClient) {
        this.repository = new CollectionRepository(prisma);
        this.service = new CollectionService(this.repository);
        this.router = createCollectionRouter(this.service);
    }
}

export * from "./collection.service";
export * from "./collection.router";
