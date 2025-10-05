import jwt from "jsonwebtoken";
import { UserService } from "../user/user.service";
import { OrganizationService } from "../organization/organization.service";
import { User } from "../../../generated/prisma";
import {
  LoginInput,
  RegisterInput,
  OAuthProfile,
  AuthTokens,
} from "./auth.schema";
import { UnauthorizedError, NotFoundError } from "../../errors/custom-errors";

export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly organizationService: OrganizationService,
    private readonly jwtSecret: string,
  ) {}

  async register(
    input: RegisterInput,
  ): Promise<{ user: User; tokens: AuthTokens }> {
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

  async login(input: LoginInput): Promise<{ user: User; tokens: AuthTokens }> {
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

  async verifyToken(token: string): Promise<User | null> {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as {
        userId: string;
      };
      return this.userService.getUserById(payload.userId);
    } catch (error) {
      return null;
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = jwt.verify(refreshToken, this.jwtSecret) as {
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

  async authenticateWithOAuth(
    profile: OAuthProfile,
    invitationToken?: string,
  ): Promise<{ user: User; tokens: AuthTokens; isNewUser: boolean }> {
    // Check if user exists with this provider
    let user = await this.userService.getUserByProvider(
      profile.provider,
      profile.id,
    );

    let isNewUser = false;

    if (!user) {
      // Check if user exists with this email (from different provider or local)
      const existingUser = await this.userService.getUserByEmail(profile.email);

      if (existingUser) {
        // Link OAuth to existing account
        user = await this.userService.updateUser(existingUser.id, {
          provider: profile.provider,
          providerId: profile.id,
          avatar: profile.avatar,
        });
      } else {
        // Create new user without personal org (handled by setupNewUser)
        user = await this.userService.createOAuthUser({
          email: profile.email,
          name: profile.name,
          provider: profile.provider,
          providerId: profile.id,
          avatar: profile.avatar,
          skipPersonalOrg: true,
        });

        // Handle invitation or create personal org
        await this.setupNewUser(user, invitationToken);

        isNewUser = true;
      }
    } else {
      // Update user info from OAuth profile
      user = await this.userService.updateUser(user.id, {
        name: profile.name || user.name,
        avatar: profile.avatar || user.avatar,
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
        await this.organizationService.acceptInvitation(invitationToken, user.id);
        console.log(`User ${user.id} joined via invitation: ${invitationToken}`);
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
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      this.jwtSecret,
      { expiresIn: "7d" }, // Increased to 7 days for better UX
    );

    const refreshToken = jwt.sign(
      { userId: user.id, type: "refresh" },
      this.jwtSecret,
      { expiresIn: "30d" }, // 30 days for refresh token
    );

    return { accessToken, refreshToken };
  }
}
