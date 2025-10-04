import jwt from "jsonwebtoken";
import { UserService } from "../user/user.service";
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
    private readonly jwtSecret: string,
  ) {}

  async register(
    input: RegisterInput,
  ): Promise<{ user: User; tokens: AuthTokens }> {
    const user = await this.userService.createUser(input);
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
        // Create new user
        user = await this.userService.createOAuthUser({
          email: profile.email,
          name: profile.name,
          provider: profile.provider,
          providerId: profile.id,
          avatar: profile.avatar,
        });
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
