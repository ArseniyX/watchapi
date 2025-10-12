import { describe, it, expect, beforeEach, vi } from "vitest";
import { ApiEndpointService } from "../api-endpoint.service";
import { ApiEndpointRepository } from "../api-endpoint.repository";
import { HttpMethod, PlanType } from "../../../../generated/prisma";

// Mock ApiEndpointRepository
const mockApiEndpointRepository = {
  findById: vi.fn(),
  findByUserId: vi.fn(),
  findByOrganizationId: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findActive: vi.fn(),
  findMany: vi.fn(),
};

describe("ApiEndpointService", () => {
  let service: ApiEndpointService;
  const TEST_CTX = {
    user: { id: "user-1", email: "test@example.com", role: "USER" as const },
    organizationId: "org-1",
    organizationPlan: PlanType.FREE,
  };

  beforeEach(() => {
    service = new ApiEndpointService(mockApiEndpointRepository as any);
    vi.clearAllMocks();
  });

  describe("createApiEndpoint", () => {
    it("should create endpoint successfully", async () => {
      const input = {
        name: "Test Endpoint",
        url: "https://api.example.com/test",
        method: HttpMethod.GET,
        expectedStatus: 200,
        timeout: 5000,
        interval: 1800000, // Use valid interval for FREE plan (30 minutes)
        isActive: false, // Default: monitoring disabled
      };

      const mockEndpoint = {
        id: "endpoint-1",
        ...input,
        userId: "user-1",
        isActive: false,
      };

      mockApiEndpointRepository.findByOrganizationId.mockResolvedValue([]);
      mockApiEndpointRepository.findByOrganizationId.mockResolvedValue([]);
      mockApiEndpointRepository.create.mockResolvedValue(mockEndpoint);

      const result = await service.createApiEndpoint({ ctx: TEST_CTX, input });

      expect(mockApiEndpointRepository.create).toHaveBeenCalledWith({
        name: input.name,
        url: input.url,
        method: input.method,
        headers: null,
        body: null,
        expectedStatus: input.expectedStatus,
        timeout: input.timeout,
        interval: input.interval, // Should use provided interval if above plan minimum
        userId: "user-1",
        organizationId: "org-1",
        collectionId: null,
        lastCheckedAt: null,
        isActive: false,
      });
      expect(result).toEqual(mockEndpoint);
    });

    it("should use plan minimum interval if provided interval is too low", async () => {
      mockApiEndpointRepository.findByOrganizationId.mockResolvedValue([]);
      mockApiEndpointRepository.create.mockResolvedValue({
        id: "endpoint-1",
        interval: 1800000, // Plan minimum (30 minutes for FREE)
      });

      await service.createApiEndpoint({
        ctx: TEST_CTX,
        input: {
          name: "Test",
          url: "https://api.example.com",
          method: HttpMethod.GET,
          expectedStatus: 200,
          timeout: 5000,
          interval: 60000, // 1 minute, less than FREE plan minimum
          isActive: false,
        },
      });

      // Should call create with plan's minimum interval (1800000ms = 30 minutes)
      expect(mockApiEndpointRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          interval: 1800000, // Clamped to FREE plan minimum
        }),
      );
    });

    it("should create endpoint with headers and body", async () => {
      const input = {
        name: "Test Endpoint",
        url: "https://api.example.com/test",
        method: HttpMethod.POST,
        headers: { Authorization: "Bearer token" },
        body: '{"test": "data"}',
        expectedStatus: 201,
        timeout: 5000,
        interval: 1800000, // Use valid interval for FREE plan (30 minutes)
        isActive: false, // Default: monitoring disabled
      };

      mockApiEndpointRepository.findByOrganizationId.mockResolvedValue([]);
      mockApiEndpointRepository.create.mockResolvedValue({});

      await service.createApiEndpoint({ ctx: TEST_CTX, input });

      expect(mockApiEndpointRepository.create).toHaveBeenCalledWith({
        name: input.name,
        url: input.url,
        method: input.method,
        headers: JSON.stringify(input.headers),
        body: input.body,
        expectedStatus: input.expectedStatus,
        timeout: input.timeout,
        interval: input.interval,
        userId: "user-1",
        organizationId: "org-1",
        collectionId: null,
        lastCheckedAt: null,
        isActive: false,
      });
    });

    it("should trim name and URL", async () => {
      const input = {
        name: "  Test Endpoint  ",
        url: "  https://api.example.com  ",
        method: HttpMethod.GET,
        expectedStatus: 200,
        timeout: 5000,
        interval: 300000,
        isActive: false,
      };

      mockApiEndpointRepository.findByOrganizationId.mockResolvedValue([]);
      mockApiEndpointRepository.create.mockResolvedValue({});

      await service.createApiEndpoint({ ctx: TEST_CTX, input });

      expect(mockApiEndpointRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Test Endpoint",
          url: "https://api.example.com",
        }),
      );
    });
  });

  describe("getApiEndpoint", () => {
    it("should return endpoint by id", async () => {
      const mockEndpoint = {
        id: "endpoint-1",
        name: "Test Endpoint",
        url: "https://api.example.com",
      };

      mockApiEndpointRepository.findById.mockResolvedValue(mockEndpoint);

      const result = await service.getApiEndpoint({
        ctx: TEST_CTX,
        input: { id: "endpoint-1" },
      });

      expect(mockApiEndpointRepository.findById).toHaveBeenCalledWith(
        "endpoint-1",
        "org-1",
      );
      expect(result).toEqual(mockEndpoint);
    });

    it("should throw error if endpoint ID is empty", async () => {
      await expect(
        service.getApiEndpoint({ ctx: TEST_CTX, input: { id: "" } }),
      ).rejects.toThrow("Endpoint ID is required");
    });

    it("should return null if endpoint not found", async () => {
      mockApiEndpointRepository.findById.mockResolvedValue(null);

      const result = await service.getApiEndpoint({
        ctx: TEST_CTX,
        input: { id: "nonexistent" },
      });

      expect(result).toBeNull();
    });
  });

  describe("getOrganizationApiEndpoints", () => {
    it("should return organization endpoints", async () => {
      const mockEndpoints = [
        { id: "endpoint-1", organizationId: "org-1" },
        { id: "endpoint-2", organizationId: "org-1" },
      ];

      mockApiEndpointRepository.findByOrganizationId.mockResolvedValue(
        mockEndpoints,
      );

      const result = await service.getOrganizationApiEndpoints({ ctx: TEST_CTX });

      expect(
        mockApiEndpointRepository.findByOrganizationId,
      ).toHaveBeenCalledWith("org-1");
      expect(result).toEqual(mockEndpoints);
    });

    it("should throw error if organization ID is empty", async () => {
      await expect(
        service.getOrganizationApiEndpoints({
          ctx: { ...TEST_CTX, organizationId: "" },
        }),
      ).rejects.toThrow("Organization ID is required");
    });
  });

  describe("updateApiEndpoint", () => {
    it("should update endpoint successfully", async () => {
      const existingEndpoint = {
        id: "endpoint-1",
        userId: "user-1",
        name: "Old Name",
      };

      const updateData = {
        name: "New Name",
        url: "https://api.example.com/new",
      };

      mockApiEndpointRepository.findById.mockResolvedValue(existingEndpoint);
      mockApiEndpointRepository.update.mockResolvedValue({
        ...existingEndpoint,
        ...updateData,
      });

      const result = await service.updateApiEndpoint({
        ctx: TEST_CTX,
        input: { id: "endpoint-1", ...updateData },
      });

      expect(mockApiEndpointRepository.findById).toHaveBeenCalledWith(
        "endpoint-1",
        "org-1",
      );
      expect(mockApiEndpointRepository.update).toHaveBeenCalledWith(
        "endpoint-1",
        "org-1",
        {
          name: updateData.name,
          url: updateData.url,
        },
      );
      expect(result.name).toBe("New Name");
    });

    it("should throw error if endpoint ID is empty", async () => {
      await expect(
        service.updateApiEndpoint({
          ctx: TEST_CTX,
          input: { id: "", name: "New Name" },
        }),
      ).rejects.toThrow("Endpoint ID is required");
    });

    it("should throw error if organizationId is empty", async () => {
      await expect(
        service.updateApiEndpoint({
          ctx: { ...TEST_CTX, organizationId: "" },
          input: { id: "endpoint-1", name: "New Name" },
        }),
      ).rejects.toThrow("Organization ID is required");
    });

    it("should throw error if endpoint not found", async () => {
      mockApiEndpointRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateApiEndpoint({
          ctx: TEST_CTX,
          input: { id: "nonexistent", name: "New Name" },
        }),
      ).rejects.toThrow("API endpoint");
    });

    it("should throw error if interval is below plan limit", async () => {
      const existingEndpoint = {
        id: "endpoint-1",
        userId: "user-1",
      };

      mockApiEndpointRepository.findById.mockResolvedValue(existingEndpoint);

      await expect(
        service.updateApiEndpoint({
          ctx: TEST_CTX,
          input: {
            id: "endpoint-1",
            interval: 60000, // 1 minute, less than FREE plan minimum
          },
        }),
      ).rejects.toThrow(
        "Check interval cannot be less than 1800 seconds for FREE plan",
      );
    });

    it("should update with partial data", async () => {
      const existingEndpoint = {
        id: "endpoint-1",
        userId: "user-1",
        name: "Old Name",
      };

      mockApiEndpointRepository.findById.mockResolvedValue(existingEndpoint);
      mockApiEndpointRepository.update.mockResolvedValue(existingEndpoint);

      await service.updateApiEndpoint({
        ctx: TEST_CTX,
        input: { id: "endpoint-1", isActive: false },
      });

      expect(mockApiEndpointRepository.update).toHaveBeenCalledWith(
        "endpoint-1",
        "org-1",
        {
          isActive: false,
        },
      );
    });

    it("should update headers", async () => {
      const existingEndpoint = {
        id: "endpoint-1",
        userId: "user-1",
      };

      mockApiEndpointRepository.findById.mockResolvedValue(existingEndpoint);
      mockApiEndpointRepository.update.mockResolvedValue(existingEndpoint);

      await service.updateApiEndpoint({
        ctx: TEST_CTX,
        input: {
          id: "endpoint-1",
          headers: { Authorization: "Bearer new-token" },
        },
      });

      expect(mockApiEndpointRepository.update).toHaveBeenCalledWith(
        "endpoint-1",
        "org-1",
        {
          headers: JSON.stringify({
            Authorization: "Bearer new-token",
          }),
        },
      );
    });
  });

  describe("deleteApiEndpoint", () => {
    it("should delete endpoint successfully", async () => {
      mockApiEndpointRepository.delete.mockResolvedValue(undefined);

      await service.deleteApiEndpoint({
        ctx: TEST_CTX,
        input: { id: "endpoint-1" },
      });

      expect(mockApiEndpointRepository.delete).toHaveBeenCalledWith(
        "endpoint-1",
        "org-1",
      );
    });

    it("should throw error if endpoint ID is empty", async () => {
      await expect(
        service.deleteApiEndpoint({ ctx: TEST_CTX, input: { id: "" } }),
      ).rejects.toThrow("Endpoint ID is required");
    });

    it("should throw error if organizationId is empty", async () => {
      await expect(
        service.deleteApiEndpoint({
          ctx: { ...TEST_CTX, organizationId: "" },
          input: { id: "endpoint-1" },
        }),
      ).rejects.toThrow("Organization ID is required");
    });
  });

  describe("getActiveEndpoints", () => {
    it("should return active endpoints", async () => {
      const mockEndpoints = [
        { id: "endpoint-1", isActive: true },
        { id: "endpoint-2", isActive: true },
      ];

      mockApiEndpointRepository.findActive.mockResolvedValue(mockEndpoints);

      const result = await service.getActiveEndpoints();

      expect(mockApiEndpointRepository.findActive).toHaveBeenCalled();
      expect(result).toEqual(mockEndpoints);
    });

    it("should return empty array if no active endpoints", async () => {
      mockApiEndpointRepository.findActive.mockResolvedValue([]);

      const result = await service.getActiveEndpoints();

      expect(result).toEqual([]);
    });
  });
});
