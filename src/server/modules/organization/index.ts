import { PrismaClient } from "../../../generated/prisma";
import { OrganizationRepository } from "./organization.repository";
import { OrganizationService } from "./organization.service";
import { createOrganizationRouter } from "./organization.router";

export class OrganizationModule {
  public readonly repository: OrganizationRepository;
  public readonly service: OrganizationService;
  public readonly router: ReturnType<typeof createOrganizationRouter>;

  constructor(prisma: PrismaClient) {
    this.repository = new OrganizationRepository(prisma);
    this.service = new OrganizationService(this.repository);
    this.router = createOrganizationRouter(this.service);
  }
}

export { OrganizationRepository } from "./organization.repository";
export { OrganizationService } from "./organization.service";
