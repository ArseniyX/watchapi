import jwt from "jsonwebtoken";
import { UserService } from "../user/user.service";
import { OrganizationService } from "../organization/organization.service";
import { User } from "../../../generated/prisma";
import {
  LoginInput,
  RegisterInput,
  OAuthProfile,
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
    ctx,
    input,
  }: {
    ctx: Context;
    input: RegisterInput;
  }): Promise<{ user: User; tokens: AuthTokens }> {
    // Create user without personal org (handled by setupNewUser)
    const user = await this.userService.createUser({
      email: input.email,
      name: input.name,
      password: input.password,
      skipPersonalOrg: true,
    });

    // Handle invitation or create personal org
    await this.setupNewUser(user, input.invitationToken);

    const tokens = this.generateTokens(user);

    return { user, tokens };
  }

  async login({
    ctx,
    input,
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

    const tokens = this.generateTokens(user);

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

      return this.generateTokens(user);
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
    let user = await this.userService.getUserByProvider(
      input.provider,
      input.profile.id,
    );

    let isNewUser = false;

    if (!user) {
      // Check if user exists with this email (from different provider or local)
      const existingUser = await this.userService.getUserByEmail(
        input.profile.email,
      );

      if (existingUser) {
        // Link OAuth to existing account
        user = await this.userService.updateUser(existingUser.id, {
          provider: input.provider,
          providerId: input.profile.id,
          avatar: input.profile.avatar,
        });
      } else {
        // Create new user without personal org (handled by setupNewUser)
        user = await this.userService.createOAuthUser({
          email: input.profile.email,
          name: input.profile.name,
          provider: input.provider,
          providerId: input.profile.id,
          avatar: input.profile.avatar,
          skipPersonalOrg: true,
        });

        // Handle invitation or create personal org
        await this.setupNewUser(user, input.invitationToken);

        isNewUser = true;
      }
    } else {
      user = await this.userService.updateUser(user.id, {
        name: input.profile.name || user.name,
        avatar: input.profile.avatar || user.avatar,
      });
    }

    const tokens = this.generateTokens(user);

    return { user, tokens, isNewUser };
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

  private generateTokens(user: User): AuthTokens {
    const now = Math.floor(Date.now() / 1000);

    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
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
