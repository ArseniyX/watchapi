import { PrismaClient } from "../../../generated/prisma";
import { UserRepository } from "./user.repository";
import { UserService } from "./user.service";
import { createUserRouter } from "./user.router";
import { OrganizationRepository } from "../organization/organization.repository";

export class UserModule {
  public readonly repository: UserRepository;
  public readonly service: UserService;
  public readonly router: ReturnType<typeof createUserRouter>;

  constructor(
    prisma: PrismaClient,
    organizationRepository: OrganizationRepository,
  ) {
    this.repository = new UserRepository(prisma);
    this.service = new UserService(this.repository, organizationRepository);
    this.router = createUserRouter(this.service);
  }
}

export * from "./user.repository";
export * from "./user.service";
export * from "./user.router";
