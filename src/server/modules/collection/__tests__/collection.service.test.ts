import { describe, it, expect, beforeEach, vi } from "vitest";
import { CollectionService } from "../collection.service";
import { CollectionRepository } from "../collection.repository";

// Mock the repository
const mockRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findByOrganizationId: vi.fn(),
  findMany: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  count: vi.fn(),
};

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
        organizationId: "org-1",
      };

      const mockCollection = {
        id: "collection-1",
        ...input,
        apiEndpoints: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockResolvedValue(mockCollection);

      const result = await service.createCollection(input);

      expect(mockRepository.create).toHaveBeenCalledWith({
        name: "My Collection",
        description: "Test description",
        organizationId: "org-1",
      });
      expect(result).toEqual(mockCollection);
    });

    it("should create collection with required organizationId", async () => {
      const input = {
        name: "Simple Collection",
        organizationId: "org-1",
      };

      const mockCollection = {
        id: "collection-1",
        name: "Simple Collection",
        description: null,
        organizationId: "org-1",
        apiEndpoints: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockResolvedValue(mockCollection);

      const result = await service.createCollection(input);

      expect(mockRepository.create).toHaveBeenCalledWith({
        name: "Simple Collection",
        description: null,
        organizationId: "org-1",
      });
      expect(result).toEqual(mockCollection);
    });

    it("should trim whitespace from name and description", async () => {
      const input = {
        name: "  Test Collection  ",
        description: "  Test description  ",
        organizationId: "org-1",
      };

      mockRepository.create.mockResolvedValue({ id: "collection-1" });

      await service.createCollection(input);

      expect(mockRepository.create).toHaveBeenCalledWith({
        name: "Test Collection",
        description: "Test description",
        organizationId: "org-1",
      });
    });

    it("should throw error if organizationId is missing", async () => {
      await expect(
        service.createCollection({ name: "Test", organizationId: "" }),
      ).rejects.toThrow("Organization ID is required");

      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("getCollection", () => {
    it("should return collection by id", async () => {
      const mockCollection = {
        id: "collection-1",
        name: "Test Collection",
        apiEndpoints: [],
      };

      mockRepository.findById.mockResolvedValue(mockCollection);

      const result = await service.getCollection("collection-1");

      expect(mockRepository.findById).toHaveBeenCalledWith("collection-1");
      expect(result).toEqual(mockCollection);
    });

    it("should return null if collection not found", async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await service.getCollection("nonexistent");

      expect(result).toBeNull();
    });

    it("should throw error if id is empty", async () => {
      await expect(service.getCollection("")).rejects.toThrow(
        "Collection ID is required",
      );

      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw error if id is only whitespace", async () => {
      await expect(service.getCollection("   ")).rejects.toThrow(
        "Collection ID is required",
      );

      expect(mockRepository.findById).not.toHaveBeenCalled();
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

      mockRepository.findMany.mockResolvedValue(mockCollections);

      const result = await service.getCollections();

      expect(mockRepository.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty("requestCount", 2);
      expect(result[0]).toHaveProperty("lastModified");
      expect(result[1]).toHaveProperty("requestCount", 1);
    });

    it("should filter by organization id", async () => {
      const mockCollections = [
        {
          id: "collection-1",
          name: "Org Collection",
          organizationId: "org-1",
          updatedAt: new Date(),
          apiEndpoints: [],
        },
      ];

      mockRepository.findByOrganizationId.mockResolvedValue(mockCollections);

      const result = await service.getCollections("org-1");

      expect(mockRepository.findByOrganizationId).toHaveBeenCalledWith("org-1");
      expect(result).toHaveLength(1);
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

      mockRepository.findMany.mockResolvedValue(mockCollections);

      const result = await service.getCollections();

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

      const updateData = {
        name: "New Name",
        description: "New description",
      };

      const mockUpdated = {
        ...mockExisting,
        ...updateData,
      };

      mockRepository.findById.mockResolvedValue(mockExisting);
      mockRepository.update.mockResolvedValue(mockUpdated);

      const result = await service.updateCollection("collection-1", updateData);

      expect(mockRepository.findById).toHaveBeenCalledWith("collection-1");
      expect(mockRepository.update).toHaveBeenCalledWith("collection-1", {
        name: "New Name",
        description: "New description",
      });
      expect(result).toEqual(mockUpdated);
    });

    it("should update only name", async () => {
      mockRepository.findById.mockResolvedValue({ id: "collection-1" });
      mockRepository.update.mockResolvedValue({ id: "collection-1" });

      await service.updateCollection("collection-1", {
        name: "Updated Name",
      });

      expect(mockRepository.update).toHaveBeenCalledWith("collection-1", {
        name: "Updated Name",
      });
    });

    it("should update only description", async () => {
      mockRepository.findById.mockResolvedValue({ id: "collection-1" });
      mockRepository.update.mockResolvedValue({ id: "collection-1" });

      await service.updateCollection("collection-1", {
        description: "Updated description",
      });

      expect(mockRepository.update).toHaveBeenCalledWith("collection-1", {
        description: "Updated description",
      });
    });

    it("should trim whitespace from updated values", async () => {
      mockRepository.findById.mockResolvedValue({ id: "collection-1" });
      mockRepository.update.mockResolvedValue({ id: "collection-1" });

      await service.updateCollection("collection-1", {
        name: "  Trimmed Name  ",
        description: "  Trimmed description  ",
      });

      expect(mockRepository.update).toHaveBeenCalledWith("collection-1", {
        name: "Trimmed Name",
        description: "Trimmed description",
      });
    });

    it("should set description to null if empty string provided", async () => {
      mockRepository.findById.mockResolvedValue({ id: "collection-1" });
      mockRepository.update.mockResolvedValue({ id: "collection-1" });

      await service.updateCollection("collection-1", { description: "" });

      expect(mockRepository.update).toHaveBeenCalledWith("collection-1", {
        description: null,
      });
    });

    it("should throw error if collection not found", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateCollection("nonexistent", { name: "New Name" }),
      ).rejects.toThrow("Collection");

      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it("should throw error if id is empty", async () => {
      await expect(
        service.updateCollection("", { name: "New Name" }),
      ).rejects.toThrow("Collection ID is required");

      expect(mockRepository.findById).not.toHaveBeenCalled();
    });
  });

  describe("deleteCollection", () => {
    it("should delete existing collection", async () => {
      mockRepository.findById.mockResolvedValue({
        id: "collection-1",
        name: "Test Collection",
      });
      mockRepository.delete.mockResolvedValue(undefined);

      await service.deleteCollection("collection-1");

      expect(mockRepository.findById).toHaveBeenCalledWith("collection-1");
      expect(mockRepository.delete).toHaveBeenCalledWith("collection-1");
    });

    it("should throw error if collection not found", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.deleteCollection("nonexistent")).rejects.toThrow(
        "Collection",
      );

      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it("should throw error if id is empty", async () => {
      await expect(service.deleteCollection("")).rejects.toThrow(
        "Collection ID is required",
      );

      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it("should throw error if id is only whitespace", async () => {
      await expect(service.deleteCollection("   ")).rejects.toThrow(
        "Collection ID is required",
      );

      expect(mockRepository.findById).not.toHaveBeenCalled();
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
      mockRepository.findMany.mockResolvedValue(mockCollections);

      const result = await service.getCollectionStats();

      expect(result).toEqual({
        total: 2,
        totalRequests: 5,
        averageRequestsPerCollection: 3, // Rounded from 2.5
      });
    });

    it("should handle empty collections list", async () => {
      mockRepository.count.mockResolvedValue(0);
      mockRepository.findMany.mockResolvedValue([]);

      const result = await service.getCollectionStats();

      expect(result).toEqual({
        total: 0,
        totalRequests: 0,
        averageRequestsPerCollection: 0,
      });
    });

    it("should filter stats by organization", async () => {
      const mockCollections = [
        {
          id: "collection-1",
          name: "Org Collection",
          organizationId: "org-1",
          updatedAt: new Date(),
          apiEndpoints: [{ id: "e1" }],
        },
      ];

      mockRepository.count.mockResolvedValue(1);
      mockRepository.findByOrganizationId.mockResolvedValue(mockCollections);

      const result = await service.getCollectionStats("org-1");

      expect(mockRepository.count).toHaveBeenCalledWith("org-1");
      expect(result.total).toBe(1);
      expect(result.totalRequests).toBe(1);
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

      mockRepository.findMany.mockResolvedValue(mockCollections);

      const result = await service.getCollections();

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

      mockRepository.findMany.mockResolvedValue(mockCollections);

      const result = await service.getCollections();

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

      mockRepository.findMany.mockResolvedValue(mockCollections);

      const result = await service.getCollections();

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

      mockRepository.findMany.mockResolvedValue(mockCollections);

      const result = await service.getCollections();

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

      mockRepository.findMany.mockResolvedValue(mockCollections);

      const result = await service.getCollections();

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

      mockRepository.findMany.mockResolvedValue(mockCollections);

      const result = await service.getCollections();

      expect(result[0].lastModified).toMatch(/\d+mo ago/);
    });
  });
});
