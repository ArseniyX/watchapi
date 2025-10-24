import { describe, it, expect, beforeEach, vi } from "vitest";
import { AuthService } from "../auth.service";
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
  createPersonalOrganizationForUser: vi.fn(),
};

// Mock OrganizationService
const mockOrganizationService = {
  acceptInvitation: vi.fn(),
};

// Mock JWT
vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(() => "mock-token"),
    verify: vi.fn(),
  },
}));

describe("AuthService", () => {
  let service: AuthService;
  const jwtSecret = "test-secret";
  const TEST_CTX = {}; // Public procedures have empty context

  beforeEach(() => {
    service = new AuthService(
      mockUserService as any,
      mockOrganizationService as any,
      jwtSecret,
    );
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

      const mockUserWithOrgs = {
        ...mockUser,
        organizations: [
          {
            id: "member-1",
            organizationId: "org-1",
            userId: "user-1",
            role: "OWNER",
          },
        ],
      };

      mockUserService.createUser.mockResolvedValue(mockUser);
      mockUserService.createPersonalOrganizationForUser.mockResolvedValue(undefined);
      mockUserService.getUserById.mockResolvedValue(mockUserWithOrgs);

      const result = await service.register({ input });

      expect(mockUserService.createUser).toHaveBeenCalledWith({
        email: input.email,
        name: input.name,
        password: input.password,
      });
      expect(mockUserService.createPersonalOrganizationForUser).toHaveBeenCalledWith(mockUser);
      expect(mockUserService.getUserById).toHaveBeenCalledWith(mockUser.id);
      expect(result.user).toEqual(mockUserWithOrgs);
      expect(result.tokens).toHaveProperty("accessToken");
      expect(result.tokens).toHaveProperty("refreshToken");
    });

    it("should throw error if user already exists", async () => {
      mockUserService.createUser.mockRejectedValue(
        new Error("User with this email already exists"),
      );

      await expect(
        service.register({
          input: {
            email: "existing@example.com",
            password: "password123",
          },
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
        organizations: [
          {
            id: "member-1",
            organizationId: "org-1",
            userId: "user-1",
            role: "OWNER",
          },
        ],
      };

      mockUserService.getUserByEmail.mockResolvedValue(mockUser);
      mockUserService.verifyPassword.mockResolvedValue(true);

      const result = await service.login({ ctx: TEST_CTX, input });

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
          ctx: TEST_CTX,
          input: {
            email: "nonexistent@example.com",
            password: "password123",
          },
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
          ctx: TEST_CTX,
          input: {
            email: "test@example.com",
            password: "wrongpassword",
          },
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

      (jwt.verify as any).mockReturnValue({
        userId: "user-1",
        type: "access",
      });
      mockUserService.getUserById = vi.fn().mockResolvedValue(mockUser);

      const result = await service.verifyToken({
        ctx: TEST_CTX,
        input: { token: "valid-token" },
      });

      expect(jwt.verify).toHaveBeenCalledWith("valid-token", jwtSecret, {
        algorithms: ["HS256"],
        issuer: "watchapi",
        audience: "watchapi-app",
      });
      expect(result).toEqual(mockUser);
    });

    it("should return null for invalid token", async () => {
      (jwt.verify as any).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const result = await service.verifyToken({
        ctx: TEST_CTX,
        input: { token: "invalid-token" },
      });

      expect(result).toBeNull();
    });
  });

  describe("refreshToken", () => {
    it("should refresh token successfully", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        role: "USER",
        organizations: [
          {
            id: "member-1",
            organizationId: "org-1",
            userId: "user-1",
            role: "OWNER",
          },
        ],
      };

      (jwt.verify as any).mockReturnValue({
        userId: "user-1",
        type: "refresh",
      });
      mockUserService.getUserById = vi.fn().mockResolvedValue(mockUser);

      const result = await service.refreshToken({
        ctx: TEST_CTX,
        input: { refreshToken: "valid-refresh-token" },
      });

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
    });

    it("should throw error for invalid token type", async () => {
      (jwt.verify as any).mockReturnValue({ userId: "user-1", type: "access" });

      await expect(
        service.refreshToken({
          ctx: TEST_CTX,
          input: { refreshToken: "invalid-type-token" },
        }),
      ).rejects.toThrow("Invalid");
    });

    it("should throw error if user not found", async () => {
      (jwt.verify as any).mockReturnValue({
        userId: "user-1",
        type: "refresh",
      });
      mockUserService.getUserById = vi.fn().mockResolvedValue(null);

      await expect(
        service.refreshToken({
          ctx: TEST_CTX,
          input: { refreshToken: "valid-refresh-token" },
        }),
      ).rejects.toThrow("User");
    });

    it("should throw error for expired token", async () => {
      (jwt.verify as any).mockImplementation(() => {
        throw new Error("Token expired");
      });

      await expect(
        service.refreshToken({
          ctx: TEST_CTX,
          input: { refreshToken: "expired-token" },
        }),
      ).rejects.toThrow("Invalid refresh token");
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

      const mockUserWithOrgs = {
        ...mockUser,
        organizations: [
          {
            id: "member-1",
            organizationId: "org-1",
            userId: "user-1",
            role: "OWNER",
          },
        ],
      };

      mockUserService.getUserByProvider.mockResolvedValue(null);
      mockUserService.getUserByEmail.mockResolvedValue(null);
      mockUserService.createOAuthUser.mockResolvedValue(mockUser);
      mockUserService.createPersonalOrganizationForUser.mockResolvedValue(undefined);
      mockUserService.getUserById.mockResolvedValue(mockUserWithOrgs);

      const result = await service.authenticateWithOAuth({
        ctx: TEST_CTX,
        input: { provider: profile.provider, profile },
      });

      expect(mockUserService.createOAuthUser).toHaveBeenCalledWith({
        email: profile.email,
        name: profile.name,
        provider: profile.provider,
        providerId: profile.id,
        avatar: profile.avatar,
      });
      expect(mockUserService.createPersonalOrganizationForUser).toHaveBeenCalledWith(mockUser);
      expect(mockUserService.getUserById).toHaveBeenCalledWith(mockUser.id);
      expect(result.user).toEqual(mockUserWithOrgs);
      expect(result.isNewUser).toBe(true);
      expect(result.tokens).toHaveProperty("accessToken");
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
        organizations: [
          {
            id: "member-1",
            organizationId: "org-1",
            userId: "user-1",
            role: "OWNER",
          },
        ],
      };

      const updatedUser = {
        ...existingUser,
        name: profile.name,
        avatar: profile.avatar,
      };

      mockUserService.getUserByProvider.mockResolvedValue(existingUser);
      mockUserService.updateUser.mockResolvedValue(updatedUser);

      const result = await service.authenticateWithOAuth({
        ctx: TEST_CTX,
        input: { provider: profile.provider, profile },
      });

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

      const mockUserWithOrgs = {
        ...mockUser,
        organizations: [
          {
            id: "member-1",
            organizationId: "org-1",
            userId: "user-1",
            role: "OWNER",
          },
        ],
      };

      mockUserService.getUserByProvider.mockResolvedValue(null);
      mockUserService.getUserByEmail.mockResolvedValue(null);
      mockUserService.createOAuthUser.mockResolvedValue(mockUser);
      mockUserService.createPersonalOrganizationForUser.mockResolvedValue(undefined);
      mockUserService.getUserById.mockResolvedValue(mockUserWithOrgs);

      const result = await service.authenticateWithOAuth({
        ctx: TEST_CTX,
        input: { provider: profile.provider, profile },
      });

      expect(mockUserService.createOAuthUser).toHaveBeenCalledWith({
        email: profile.email,
        name: profile.name,
        provider: "github",
        providerId: profile.id,
        avatar: undefined,
      });
      expect(mockUserService.createPersonalOrganizationForUser).toHaveBeenCalledWith(mockUser);
      expect(mockUserService.getUserById).toHaveBeenCalledWith(mockUser.id);
      expect(result.isNewUser).toBe(true);
    });
  });

  describe("generateTokens", () => {
    it("should generate access and refresh tokens", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        role: "USER",
      };

      const mockUserWithOrgs = {
        ...mockUser,
        organizations: [
          {
            id: "member-1",
            organizationId: "org-1",
            userId: "user-1",
            role: "OWNER",
          },
        ],
      };

      mockUserService.createUser.mockResolvedValue(mockUser);
      (jwt.sign as any)
        .mockReturnValueOnce("access-token")
        .mockReturnValueOnce("refresh-token");
      mockUserService.createPersonalOrganizationForUser.mockResolvedValue(undefined);
      mockUserService.getUserById.mockResolvedValue(mockUserWithOrgs);

      await service.register({
        input: {
          email: "test@example.com",
          password: "password",
        },
      });

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: expect.any(String),
          email: expect.any(String),
          role: expect.any(String),
          type: "access",
          iss: "watchapi",
          aud: "watchapi-app",
          iat: expect.any(Number),
          jti: expect.any(String),
        }),
        jwtSecret,
        expect.objectContaining({
          expiresIn: "7d",
          algorithm: "HS256",
        }),
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: expect.any(String),
          type: "refresh",
          iss: "watchapi",
          aud: "watchapi-app",
          iat: expect.any(Number),
          jti: expect.any(String),
        }),
        jwtSecret,
        expect.objectContaining({
          expiresIn: "30d",
          algorithm: "HS256",
        }),
      );
    });
  });
});
