import { describe, it, expect, beforeEach, vi } from "vitest";
import { AuthService } from "../auth.service";
import { UserService } from "../../user/user.service";
import jwt from "jsonwebtoken";

// Mock UserService
const mockUserService = {
  createUser: vi.fn(),
  getUserById: vi.fn(),
  getUserByEmail: vi.fn(),
  getUserByProvider: vi.fn(),
  createOAuthUser: vi.fn(),
  updateUser: vi.fn(),
  verifyPassword: vi.fn(),
};

// Mock JWT
vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn((payload, secret, options) => "mock-token"),
    verify: vi.fn(),
  },
}));

describe("AuthService", () => {
  let service: AuthService;
  const jwtSecret = "test-secret";

  beforeEach(() => {
    service = new AuthService(mockUserService as any, jwtSecret);
    vi.clearAllMocks();
  });

  describe("register", () => {
    it("should register new user successfully", async () => {
      const input = {
        email: "test@example.com",
        name: "Test User",
        password: "password123",
      };

      const mockUser = {
        id: "user-1",
        email: input.email,
        name: input.name,
        role: "USER",
      };

      mockUserService.createUser.mockResolvedValue(mockUser);

      const result = await service.register(input);

      expect(mockUserService.createUser).toHaveBeenCalledWith(input);
      expect(result.user).toEqual(mockUser);
      expect(result.tokens).toHaveProperty("accessToken");
      expect(result.tokens).toHaveProperty("refreshToken");
    });

    it("should throw error if user already exists", async () => {
      mockUserService.createUser.mockRejectedValue(
        new Error("User with this email already exists"),
      );

      await expect(
        service.register({
          email: "existing@example.com",
          password: "password123",
        }),
      ).rejects.toThrow("User with this email already exists");
    });
  });

  describe("login", () => {
    it("should login user with correct credentials", async () => {
      const input = {
        email: "test@example.com",
        password: "password123",
      };

      const mockUser = {
        id: "user-1",
        email: input.email,
        name: "Test User",
        role: "USER",
      };

      mockUserService.getUserByEmail.mockResolvedValue(mockUser);
      mockUserService.verifyPassword.mockResolvedValue(true);

      const result = await service.login(input);

      expect(mockUserService.getUserByEmail).toHaveBeenCalledWith(input.email);
      expect(mockUserService.verifyPassword).toHaveBeenCalledWith(
        mockUser,
        input.password,
      );
      expect(result.user).toEqual(mockUser);
      expect(result.tokens).toHaveProperty("accessToken");
      expect(result.tokens).toHaveProperty("refreshToken");
    });

    it("should throw error if user not found", async () => {
      mockUserService.getUserByEmail.mockResolvedValue(null);

      await expect(
        service.login({
          email: "nonexistent@example.com",
          password: "password123",
        }),
      ).rejects.toThrow("Invalid email or password");
    });

    it("should throw error if password is incorrect", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
      };

      mockUserService.getUserByEmail.mockResolvedValue(mockUser);
      mockUserService.verifyPassword.mockResolvedValue(false);

      await expect(
        service.login({
          email: "test@example.com",
          password: "wrongpassword",
        }),
      ).rejects.toThrow("Invalid email or password");
    });
  });

  describe("verifyToken", () => {
    it("should verify valid token", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
        role: "USER",
      };

      (jwt.verify as any).mockReturnValue({ userId: "user-1" });
      mockUserService.getUserById = vi.fn().mockResolvedValue(mockUser);

      const result = await service.verifyToken("valid-token");

      expect(jwt.verify).toHaveBeenCalledWith("valid-token", jwtSecret);
      expect(result).toEqual(mockUser);
    });

    it("should return null for invalid token", async () => {
      (jwt.verify as any).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const result = await service.verifyToken("invalid-token");

      expect(result).toBeNull();
    });
  });

  describe("refreshToken", () => {
    it("should refresh token successfully", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        role: "USER",
      };

      (jwt.verify as any).mockReturnValue({
        userId: "user-1",
        type: "refresh",
      });
      mockUserService.getUserById = vi.fn().mockResolvedValue(mockUser);

      const result = await service.refreshToken("valid-refresh-token");

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
    });

    it("should throw error for invalid token type", async () => {
      (jwt.verify as any).mockReturnValue({ userId: "user-1", type: "access" });

      await expect(service.refreshToken("invalid-type-token")).rejects.toThrow(
        "Invalid",
      );
    });

    it("should throw error if user not found", async () => {
      (jwt.verify as any).mockReturnValue({
        userId: "user-1",
        type: "refresh",
      });
      mockUserService.getUserById = vi.fn().mockResolvedValue(null);

      await expect(service.refreshToken("valid-refresh-token")).rejects.toThrow(
        "User",
      );
    });

    it("should throw error for expired token", async () => {
      (jwt.verify as any).mockImplementation(() => {
        throw new Error("Token expired");
      });

      await expect(service.refreshToken("expired-token")).rejects.toThrow(
        "Invalid refresh token",
      );
    });
  });

  describe("authenticateWithOAuth", () => {
    it("should create new user for new OAuth login", async () => {
      const profile = {
        id: "google-123",
        email: "newuser@example.com",
        name: "New User",
        avatar: "https://example.com/avatar.jpg",
        provider: "google" as const,
      };

      const mockUser = {
        id: "user-1",
        email: profile.email,
        name: profile.name,
        avatar: profile.avatar,
        provider: profile.provider,
        providerId: profile.id,
        role: "USER",
      };

      mockUserService.getUserByProvider.mockResolvedValue(null);
      mockUserService.getUserByEmail.mockResolvedValue(null);
      mockUserService.createOAuthUser.mockResolvedValue(mockUser);

      const result = await service.authenticateWithOAuth(profile);

      expect(mockUserService.createOAuthUser).toHaveBeenCalledWith({
        email: profile.email,
        name: profile.name,
        provider: profile.provider,
        providerId: profile.id,
        avatar: profile.avatar,
      });
      expect(result.user).toEqual(mockUser);
      expect(result.isNewUser).toBe(true);
      expect(result.tokens).toHaveProperty("accessToken");
    });

    it("should link OAuth to existing local account", async () => {
      const profile = {
        id: "google-123",
        email: "existing@example.com",
        name: "Existing User",
        provider: "google" as const,
      };

      const existingUser = {
        id: "user-1",
        email: profile.email,
        name: "Existing User",
        password: "hashed-password",
        provider: null,
        providerId: null,
      };

      const updatedUser = {
        ...existingUser,
        provider: profile.provider,
        providerId: profile.id,
      };

      mockUserService.getUserByProvider.mockResolvedValue(null);
      mockUserService.getUserByEmail.mockResolvedValue(existingUser);
      mockUserService.updateUser.mockResolvedValue(updatedUser);

      const result = await service.authenticateWithOAuth(profile);

      expect(mockUserService.updateUser).toHaveBeenCalledWith("user-1", {
        provider: profile.provider,
        providerId: profile.id,
        avatar: undefined,
      });
      expect(result.user).toEqual(updatedUser);
      expect(result.isNewUser).toBe(false);
    });

    it("should update existing OAuth user info", async () => {
      const profile = {
        id: "github-456",
        email: "oauth@example.com",
        name: "Updated Name",
        avatar: "https://example.com/new-avatar.jpg",
        provider: "github" as const,
      };

      const existingUser = {
        id: "user-1",
        email: profile.email,
        name: "Old Name",
        provider: profile.provider,
        providerId: profile.id,
        avatar: "https://example.com/old-avatar.jpg",
      };

      const updatedUser = {
        ...existingUser,
        name: profile.name,
        avatar: profile.avatar,
      };

      mockUserService.getUserByProvider.mockResolvedValue(existingUser);
      mockUserService.updateUser.mockResolvedValue(updatedUser);

      const result = await service.authenticateWithOAuth(profile);

      expect(mockUserService.updateUser).toHaveBeenCalledWith("user-1", {
        name: profile.name,
        avatar: profile.avatar,
      });
      expect(result.user).toEqual(updatedUser);
      expect(result.isNewUser).toBe(false);
    });

    it("should handle GitHub OAuth profile", async () => {
      const profile = {
        id: "github-789",
        email: "github@example.com",
        name: "GitHub User",
        provider: "github" as const,
      };

      const mockUser = {
        id: "user-1",
        email: profile.email,
        provider: profile.provider,
        providerId: profile.id,
      };

      mockUserService.getUserByProvider.mockResolvedValue(null);
      mockUserService.getUserByEmail.mockResolvedValue(null);
      mockUserService.createOAuthUser.mockResolvedValue(mockUser);

      const result = await service.authenticateWithOAuth(profile);

      expect(mockUserService.createOAuthUser).toHaveBeenCalledWith({
        email: profile.email,
        name: profile.name,
        provider: "github",
        providerId: profile.id,
        avatar: undefined,
      });
      expect(result.isNewUser).toBe(true);
    });

    it("should preserve existing user data when linking OAuth", async () => {
      const profile = {
        id: "google-999",
        email: "local@example.com",
        provider: "google" as const,
      };

      const existingUser = {
        id: "user-1",
        email: profile.email,
        name: "Existing Name",
        avatar: null,
        password: "hashed",
      };

      mockUserService.getUserByProvider.mockResolvedValue(null);
      mockUserService.getUserByEmail.mockResolvedValue(existingUser);
      mockUserService.updateUser.mockResolvedValue({
        ...existingUser,
        provider: profile.provider,
        providerId: profile.id,
      });

      const result = await service.authenticateWithOAuth(profile);

      expect(mockUserService.updateUser).toHaveBeenCalledWith("user-1", {
        provider: profile.provider,
        providerId: profile.id,
        avatar: undefined,
      });
      expect(result.user.name).toBe("Existing Name");
    });
  });

  describe("generateTokens", () => {
    it("should generate access and refresh tokens", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        role: "USER",
      };

      mockUserService.createUser.mockResolvedValue(mockUser);
      (jwt.sign as any)
        .mockReturnValueOnce("access-token")
        .mockReturnValueOnce("refresh-token");

      const result = await service.register({
        email: "test@example.com",
        password: "password",
      });

      expect(jwt.sign).toHaveBeenCalledWith(
        {
          userId: expect.any(String),
          email: expect.any(String),
          role: expect.any(String),
        },
        jwtSecret,
        { expiresIn: "7d" },
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: expect.any(String), type: "refresh" },
        jwtSecret,
        { expiresIn: "30d" },
      );
    });
  });
});
