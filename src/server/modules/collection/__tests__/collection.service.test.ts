import { describe, it, expect, beforeEach, vi } from "vitest";
import { CollectionService } from "../collection.service";

// Mock the repository
const mockRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findByIdAndOrganization: vi.fn(),
  findByOrganizationId: vi.fn(),
  findMany: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  count: vi.fn(),
  search: vi.fn(),
};

const TEST_ORG_ID = "org-test-123";
const TEST_CTX = { organizationId: TEST_ORG_ID };

describe("CollectionService", () => {
  let service: CollectionService;

  beforeEach(() => {
    service = new CollectionService(mockRepository as any);
    vi.clearAllMocks();
  });

  describe("createCollection", () => {
    it("should create collection with valid input", async () => {
      const input = {
        name: "My Collection",
        description: "Test description",
      };

      const mockCollection = {
        id: "collection-1",
        name: input.name,
        description: input.description,
        organizationId: TEST_ORG_ID,
        apiEndpoints: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockResolvedValue(mockCollection);

      const result = await service.createCollection({ ctx: TEST_CTX, input });

      expect(mockRepository.create).toHaveBeenCalledWith({
        name: "My Collection",
        description: "Test description",
        organizationId: TEST_ORG_ID,
      });
      expect(result).toEqual(mockCollection);
    });

    it("should create collection without description", async () => {
      const input = {
        name: "Simple Collection",
      };

      const mockCollection = {
        id: "collection-1",
        name: "Simple Collection",
        description: null,
        organizationId: TEST_ORG_ID,
        apiEndpoints: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockResolvedValue(mockCollection);

      const result = await service.createCollection({ ctx: TEST_CTX, input });

      expect(mockRepository.create).toHaveBeenCalledWith({
        name: "Simple Collection",
        description: null,
        organizationId: TEST_ORG_ID,
      });
      expect(result).toEqual(mockCollection);
    });

    it("should trim whitespace from name and description", async () => {
      const input = {
        name: "  Test Collection  ",
        description: "  Test description  ",
      };

      mockRepository.create.mockResolvedValue({ id: "collection-1" });

      await service.createCollection({ ctx: TEST_CTX, input });

      expect(mockRepository.create).toHaveBeenCalledWith({
        name: "Test Collection",
        description: "Test description",
        organizationId: TEST_ORG_ID,
      });
    });
  });

  describe("getCollection", () => {
    it("should return collection by id", async () => {
      const mockCollection = {
        id: "collection-1",
        name: "Test Collection",
        apiEndpoints: [],
      };

      mockRepository.findByIdAndOrganization.mockResolvedValue(mockCollection);

      const result = await service.getCollection({
        ctx: TEST_CTX,
        input: { id: "collection-1" },
      });

      expect(mockRepository.findByIdAndOrganization).toHaveBeenCalledWith(
        "collection-1",
        TEST_ORG_ID,
      );
      expect(result).toEqual(mockCollection);
    });

    it("should return null if collection not found", async () => {
      mockRepository.findByIdAndOrganization.mockResolvedValue(null);

      const result = await service.getCollection({
        ctx: TEST_CTX,
        input: { id: "nonexistent" },
      });

      expect(result).toBeNull();
    });

    it("should throw error if id is empty", async () => {
      await expect(
        service.getCollection({ ctx: TEST_CTX, input: { id: "" } }),
      ).rejects.toThrow("Collection ID is required");

      expect(mockRepository.findByIdAndOrganization).not.toHaveBeenCalled();
    });

    it("should throw error if id is only whitespace", async () => {
      await expect(
        service.getCollection({ ctx: TEST_CTX, input: { id: "   " } }),
      ).rejects.toThrow("Collection ID is required");

      expect(mockRepository.findByIdAndOrganization).not.toHaveBeenCalled();
    });
  });

  describe("getCollections", () => {
    it("should return all collections with stats", async () => {
      const now = new Date();
      const mockCollections = [
        {
          id: "collection-1",
          name: "Collection 1",
          updatedAt: now,
          apiEndpoints: [{ id: "endpoint-1" }, { id: "endpoint-2" }],
        },
        {
          id: "collection-2",
          name: "Collection 2",
          updatedAt: new Date(now.getTime() - 60000), // 1 minute ago
          apiEndpoints: [{ id: "endpoint-3" }],
        },
      ];

      mockRepository.findByOrganizationId.mockResolvedValue(mockCollections);

      const result = await service.getCollections({ ctx: TEST_CTX });

      expect(mockRepository.findByOrganizationId).toHaveBeenCalledWith(TEST_ORG_ID);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty("requestCount", 2);
      expect(result[0]).toHaveProperty("lastModified");
      expect(result[1]).toHaveProperty("requestCount", 1);
    });

    it("should calculate correct stats for empty collections", async () => {
      const mockCollections = [
        {
          id: "collection-1",
          name: "Empty Collection",
          updatedAt: new Date(),
          apiEndpoints: [],
        },
      ];

      mockRepository.findByOrganizationId.mockResolvedValue(mockCollections);

      const result = await service.getCollections({ ctx: TEST_CTX });

      expect(result[0].requestCount).toBe(0);
    });
  });

  describe("updateCollection", () => {
    it("should update collection with valid input", async () => {
      const mockExisting = {
        id: "collection-1",
        name: "Old Name",
        description: "Old description",
        apiEndpoints: [],
      };

      const input = {
        id: "collection-1",
        name: "New Name",
        description: "New description",
      };

      const mockUpdated = {
        ...mockExisting,
        name: input.name,
        description: input.description,
      };

      mockRepository.findByIdAndOrganization.mockResolvedValue(mockExisting);
      mockRepository.update.mockResolvedValue(mockUpdated);

      const result = await service.updateCollection({ ctx: TEST_CTX, input });

      expect(mockRepository.findByIdAndOrganization).toHaveBeenCalledWith(
        "collection-1",
        TEST_ORG_ID,
      );
      expect(mockRepository.update).toHaveBeenCalledWith("collection-1", {
        name: "New Name",
        description: "New description",
      });
      expect(result).toEqual(mockUpdated);
    });

    it("should update only name", async () => {
      mockRepository.findByIdAndOrganization.mockResolvedValue({ id: "collection-1" });
      mockRepository.update.mockResolvedValue({ id: "collection-1" });

      await service.updateCollection({
        ctx: TEST_CTX,
        input: { id: "collection-1", name: "Updated Name" },
      });

      expect(mockRepository.update).toHaveBeenCalledWith("collection-1", {
        name: "Updated Name",
      });
    });

    it("should update only description", async () => {
      mockRepository.findByIdAndOrganization.mockResolvedValue({ id: "collection-1" });
      mockRepository.update.mockResolvedValue({ id: "collection-1" });

      await service.updateCollection({
        ctx: TEST_CTX,
        input: { id: "collection-1", description: "Updated description" },
      });

      expect(mockRepository.update).toHaveBeenCalledWith("collection-1", {
        description: "Updated description",
      });
    });

    it("should trim whitespace from updated values", async () => {
      mockRepository.findByIdAndOrganization.mockResolvedValue({ id: "collection-1" });
      mockRepository.update.mockResolvedValue({ id: "collection-1" });

      await service.updateCollection({
        ctx: TEST_CTX,
        input: {
          id: "collection-1",
          name: "  Trimmed Name  ",
          description: "  Trimmed description  ",
        },
      });

      expect(mockRepository.update).toHaveBeenCalledWith("collection-1", {
        name: "Trimmed Name",
        description: "Trimmed description",
      });
    });

    it("should set description to null if empty string provided", async () => {
      mockRepository.findByIdAndOrganization.mockResolvedValue({ id: "collection-1" });
      mockRepository.update.mockResolvedValue({ id: "collection-1" });

      await service.updateCollection({
        ctx: TEST_CTX,
        input: { id: "collection-1", description: "" },
      });

      expect(mockRepository.update).toHaveBeenCalledWith("collection-1", {
        description: null,
      });
    });

    it("should throw error if collection not found", async () => {
      mockRepository.findByIdAndOrganization.mockResolvedValue(null);

      await expect(
        service.updateCollection({
          ctx: TEST_CTX,
          input: { id: "nonexistent", name: "New Name" },
        }),
      ).rejects.toThrow("Collection");

      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it("should throw error if id is empty", async () => {
      await expect(
        service.updateCollection({
          ctx: TEST_CTX,
          input: { id: "", name: "New Name" },
        }),
      ).rejects.toThrow("Collection ID is required");

      expect(mockRepository.findByIdAndOrganization).not.toHaveBeenCalled();
    });
  });

  describe("deleteCollection", () => {
    it("should delete existing collection", async () => {
      mockRepository.findByIdAndOrganization.mockResolvedValue({
        id: "collection-1",
        name: "Test Collection",
      });
      mockRepository.delete.mockResolvedValue(undefined);

      await service.deleteCollection({
        ctx: TEST_CTX,
        input: { id: "collection-1" },
      });

      expect(mockRepository.findByIdAndOrganization).toHaveBeenCalledWith(
        "collection-1",
        TEST_ORG_ID,
      );
      expect(mockRepository.delete).toHaveBeenCalledWith("collection-1");
    });

    it("should throw error if collection not found", async () => {
      mockRepository.findByIdAndOrganization.mockResolvedValue(null);

      await expect(
        service.deleteCollection({ ctx: TEST_CTX, input: { id: "nonexistent" } }),
      ).rejects.toThrow("Collection");

      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it("should throw error if id is empty", async () => {
      await expect(
        service.deleteCollection({ ctx: TEST_CTX, input: { id: "" } }),
      ).rejects.toThrow("Collection ID is required");

      expect(mockRepository.findByIdAndOrganization).not.toHaveBeenCalled();
    });

    it("should throw error if id is only whitespace", async () => {
      await expect(
        service.deleteCollection({ ctx: TEST_CTX, input: { id: "   " } }),
      ).rejects.toThrow("Collection ID is required");

      expect(mockRepository.findByIdAndOrganization).not.toHaveBeenCalled();
    });
  });

  describe("getCollectionStats", () => {
    it("should calculate stats for collections", async () => {
      const mockCollections = [
        {
          id: "collection-1",
          name: "Collection 1",
          updatedAt: new Date(),
          apiEndpoints: [{ id: "e1" }, { id: "e2" }, { id: "e3" }],
        },
        {
          id: "collection-2",
          name: "Collection 2",
          updatedAt: new Date(),
          apiEndpoints: [{ id: "e4" }, { id: "e5" }],
        },
      ];

      mockRepository.count.mockResolvedValue(2);
      mockRepository.findByOrganizationId.mockResolvedValue(mockCollections);

      const result = await service.getCollectionStats({ ctx: TEST_CTX });

      expect(result).toEqual({
        total: 2,
        totalRequests: 5,
        averageRequestsPerCollection: 3, // Rounded from 2.5
      });
    });

    it("should handle empty collections list", async () => {
      mockRepository.count.mockResolvedValue(0);
      mockRepository.findByOrganizationId.mockResolvedValue([]);

      const result = await service.getCollectionStats({ ctx: TEST_CTX });

      expect(result).toEqual({
        total: 0,
        totalRequests: 0,
        averageRequestsPerCollection: 0,
      });
    });
  });

  describe("formatLastModified", () => {
    it('should format "just now" for very recent updates', async () => {
      const now = new Date();
      const mockCollections = [
        {
          id: "collection-1",
          name: "Collection",
          updatedAt: now,
          apiEndpoints: [],
        },
      ];

      mockRepository.findByOrganizationId.mockResolvedValue(mockCollections);

      const result = await service.getCollections({ ctx: TEST_CTX });

      expect(result[0].lastModified).toBe("just now");
    });

    it("should format minutes ago", async () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const mockCollections = [
        {
          id: "collection-1",
          name: "Collection",
          updatedAt: fiveMinutesAgo,
          apiEndpoints: [],
        },
      ];

      mockRepository.findByOrganizationId.mockResolvedValue(mockCollections);

      const result = await service.getCollections({ ctx: TEST_CTX });

      expect(result[0].lastModified).toMatch(/\d+m ago/);
    });

    it("should format hours ago", async () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const mockCollections = [
        {
          id: "collection-1",
          name: "Collection",
          updatedAt: twoHoursAgo,
          apiEndpoints: [],
        },
      ];

      mockRepository.findByOrganizationId.mockResolvedValue(mockCollections);

      const result = await service.getCollections({ ctx: TEST_CTX });

      expect(result[0].lastModified).toMatch(/\d+h ago/);
    });

    it("should format days ago", async () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const mockCollections = [
        {
          id: "collection-1",
          name: "Collection",
          updatedAt: threeDaysAgo,
          apiEndpoints: [],
        },
      ];

      mockRepository.findByOrganizationId.mockResolvedValue(mockCollections);

      const result = await service.getCollections({ ctx: TEST_CTX });

      expect(result[0].lastModified).toMatch(/\d+d ago/);
    });

    it("should format weeks ago", async () => {
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      const mockCollections = [
        {
          id: "collection-1",
          name: "Collection",
          updatedAt: twoWeeksAgo,
          apiEndpoints: [],
        },
      ];

      mockRepository.findByOrganizationId.mockResolvedValue(mockCollections);

      const result = await service.getCollections({ ctx: TEST_CTX });

      expect(result[0].lastModified).toMatch(/\d+w ago/);
    });

    it("should format months ago", async () => {
      const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      const mockCollections = [
        {
          id: "collection-1",
          name: "Collection",
          updatedAt: twoMonthsAgo,
          apiEndpoints: [],
        },
      ];

      mockRepository.findByOrganizationId.mockResolvedValue(mockCollections);

      const result = await service.getCollections({ ctx: TEST_CTX });

      expect(result[0].lastModified).toMatch(/\d+mo ago/);
    });
  });
});
