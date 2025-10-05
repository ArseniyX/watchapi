import { UserService } from "../user/user.service";
import { OrganizationService } from "../organization/organization.service";
import { AuthService } from "./auth.service";
import { createAuthRouter } from "./auth.router";

export class AuthModule {
  public readonly service: AuthService;
  public readonly router: ReturnType<typeof createAuthRouter>;

  constructor(
    userService: UserService,
    organizationService: OrganizationService,
    jwtSecret: string,
  ) {
    this.service = new AuthService(
      userService,
      organizationService,
      jwtSecret,
    );
    this.router = createAuthRouter(this.service);
  }
}

export * from "./auth.service";
export * from "./auth.router";
