import jwt from "jsonwebtoken";
import { UserService } from "../user/user.service";
import { OrganizationService } from "../organization/organization.service";
import { User } from "@/generated/prisma";
import {
  LoginInput,
  RegisterInput,
  AuthTokens,
  OAuthCallbackInput,
} from "./auth.schema";
import { UnauthorizedError, NotFoundError } from "../../errors/custom-errors";
import type { Context } from "../../trpc";

export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly organizationService: OrganizationService,
    private readonly jwtSecret: string,
  ) {}

  async register({
    input,
  }: {
    input: RegisterInput;
  }): Promise<{ user: User; tokens: AuthTokens }> {
    const user = await this.userService.createUser({
      email: input.email,
      name: input.name,
      password: input.password,
    });

    await this.setupNewUser(user, input.invitationToken);

    // Refetch user to get updated organizations
    const userWithOrgs = await this.userService.getUserById(user.id);
    if (!userWithOrgs) {
      throw new NotFoundError("User", user.id);
    }

    const tokens = this.generateTokens(userWithOrgs, userWithOrgs.organizations[0].organizationId);

    return { user: userWithOrgs, tokens };
  }

  async login({
    input,
    ctx,
  }: {
    ctx: Context;
    input: LoginInput;
  }): Promise<{ user: User; tokens: AuthTokens }> {
    const user = await this.userService.getUserByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isValid = await this.userService.verifyPassword(user, input.password);
    if (!isValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const tokens = this.generateTokens(
      user,
      ctx.organizationId || user.organizations[0].organizationId,
    );

    return { user, tokens };
  }

  async verifyToken({
    ctx,
    input,
  }: {
    ctx: Context;
    input: { token: string };
  }): Promise<User | null> {
    try {
      const payload = jwt.verify(input.token, this.jwtSecret, {
        algorithms: ["HS256"],
        issuer: "watchapi",
        audience: "watchapi-app",
      }) as {
        userId: string;
        type: string;
      };

      // Verify it's an access token
      if (payload.type !== "access") {
        return null;
      }

      return this.userService.getUserById(payload.userId);
    } catch (error) {
      return null;
    }
  }

  async refreshToken({
    ctx,
    input,
  }: {
    ctx: Context;
    input: { refreshToken: string };
  }): Promise<AuthTokens> {
    try {
      const payload = jwt.verify(input.refreshToken, this.jwtSecret, {
        algorithms: ["HS256"],
        issuer: "watchapi",
        audience: "watchapi-app",
      }) as {
        userId: string;
        type: string;
      };

      if (payload.type !== "refresh") {
        throw new UnauthorizedError("Invalid token type");
      }

      const user = await this.userService.getUserById(payload.userId);
      if (!user) {
        throw new NotFoundError("User", payload.userId);
      }

      return this.generateTokens(
        user,
        ctx.organizationId || user.organizations[0].organizationId,
      );
    } catch (error) {
      if (
        error instanceof UnauthorizedError ||
        error instanceof NotFoundError
      ) {
        throw error;
      }
      throw new UnauthorizedError("Invalid refresh token");
    }
  }

  async authenticateWithOAuth({
    ctx,
    input,
  }: {
    ctx: Context;
    input: OAuthCallbackInput;
  }): Promise<{ user: User; tokens: AuthTokens; isNewUser: boolean }> {
    let user: any = await this.userService.getUserByProvider(
      input.provider,
      input.profile.id,
    );

    let isNewUser = false;

    if (!user) {
      const existingUserWithEmail = await this.userService.getUserByEmail(
        input.profile.email,
      );

      if (existingUserWithEmail) {
        const updateData: {
          provider: string;
          providerId: string;
          name?: string;
          avatar?: string;
        } = {
          provider: input.provider,
          providerId: input.profile.id,
        };

        if (!existingUserWithEmail.name && input.profile.name) {
          updateData.name = input.profile.name;
        }

        if (input.profile.avatar) {
          updateData.avatar = input.profile.avatar;
        }

        user = await this.userService.updateUser(
          existingUserWithEmail.id,
          updateData,
        );

        if (input.invitationToken) {
          try {
            await this.organizationService.acceptInvitation(
              input.invitationToken,
              existingUserWithEmail.id,
            );
            user = await this.userService.getUserById(
              existingUserWithEmail.id,
            );
          } catch (error) {
            console.error("Failed to accept invitation:", error);
          }
        }
      } else {
        // Create new user without personal org (handled by setupNewUser)
        const newUser = await this.userService.createOAuthUser({
          email: input.profile.email,
          name: input.profile.name,
          provider: input.provider,
          providerId: input.profile.id,
          avatar: input.profile.avatar,
        });

        // Handle invitation or create personal org
        await this.setupNewUser(newUser, input.invitationToken);

        // Refetch to get organizations
        user = await this.userService.getUserById(newUser.id);
        isNewUser = true;
      }
    } else {
      user = await this.userService.updateUser(user.id, {
        name: input.profile.name || user.name,
        avatar: input.profile.avatar || user.avatar,
      });
    }

    if (!user) {
      throw new NotFoundError("User", input.profile.email);
    }

    const tokens = this.generateTokens(
      user,
      ctx.organizationId || user.organizations[0].organizationId,
    );

    return { user, tokens, isNewUser };
  }

  async switchOrganization({
    ctx,
    input,
  }: {
    ctx: Context;
    input: { organizationId: string };
  }): Promise<AuthTokens> {
    if (!ctx.user) {
      throw new UnauthorizedError("Authentication required");
    }

    // Get user with organizations
    const user = await this.userService.getUserById(ctx.user.id);
    if (!user) {
      throw new NotFoundError("User", ctx.user.id);
    }

    // Verify user is a member of the target organization
    const isMember = user.organizations.some(
      (org) => org.organizationId === input.organizationId
    );

    if (!isMember) {
      throw new UnauthorizedError("You are not a member of this organization");
    }

    // Generate new tokens with the new organization ID
    return this.generateTokens(user, input.organizationId);
  }

  /**
   * Unified setup for new users - handles invitation acceptance or creates personal org
   * Single source of truth for both regular signup and OAuth
   */
  private async setupNewUser(
    user: User,
    invitationToken?: string,
  ): Promise<void> {
    if (invitationToken) {
      try {
        // Try to accept invitation
        await this.organizationService.acceptInvitation(
          invitationToken,
          user.id,
        );
        console.log(
          `User ${user.id} joined via invitation: ${invitationToken}`,
        );
        return; // Success - user is now part of invited organization
      } catch (error) {
        // Invitation failed (expired, invalid, etc.)
        console.error("Failed to accept invitation:", error);
        // Fall through to create personal org
      }
    }

    // No invitation or invitation failed - create personal organization
    await this.userService.createPersonalOrganizationForUser(user);
    console.log(`Created personal organization for user ${user.id}`);
  }

  private generateTokens(user: User, activeOrgId: string): AuthTokens {
    const now = Math.floor(Date.now() / 1000);

    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        activeOrganizationId: activeOrgId,
        type: "access",
        iss: "watchapi",
        aud: "watchapi-app",
        iat: now,
        jti: `${user.id}-${now}-${Math.random().toString(36).substring(7)}`,
      },
      this.jwtSecret,
      {
        expiresIn: "7d", // 15 minutes for security
        algorithm: "HS256", // Explicit algorithm to prevent "none" attack
      },
    );

    const refreshToken = jwt.sign(
      {
        userId: user.id,
        type: "refresh",
        iss: "watchapi",
        aud: "watchapi-app",
        iat: now,
        jti: `${user.id}-${now}-${Math.random()
          .toString(36)
          .substring(7)}-refresh`,
      },
      this.jwtSecret,
      {
        expiresIn: "30d", // 30 days for refresh token
        algorithm: "HS256",
      },
    );

    return { accessToken, refreshToken };
  }
}
