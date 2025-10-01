import { describe, it, expect, beforeEach, vi } from "vitest";
import { ApiEndpointService } from "../api-endpoint.service";
import { ApiEndpointRepository } from "../api-endpoint.repository";
import { HttpMethod } from "../../../../generated/prisma";

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
                interval: 60000,
            };

            const mockEndpoint = {
                id: "endpoint-1",
                ...input,
                userId: "user-1",
                isActive: true,
            };

            mockApiEndpointRepository.create.mockResolvedValue(mockEndpoint);

            const result = await service.createApiEndpoint("user-1", input);

            expect(mockApiEndpointRepository.create).toHaveBeenCalledWith({
                name: input.name,
                url: input.url,
                method: input.method,
                headers: null,
                body: null,
                expectedStatus: input.expectedStatus,
                timeout: input.timeout,
                interval: input.interval,
                userId: "user-1",
                organizationId: null,
                collectionId: null,
                isActive: true,
            });
            expect(result).toEqual(mockEndpoint);
        });

        it("should throw error if name is empty", async () => {
            await expect(
                service.createApiEndpoint("user-1", {
                    name: "",
                    url: "https://api.example.com",
                    method: HttpMethod.GET,
                    expectedStatus: 200,
                    timeout: 5000,
                    interval: 60000,
                })
            ).rejects.toThrow("Endpoint name is required");
        });

        it("should throw error if URL is empty", async () => {
            await expect(
                service.createApiEndpoint("user-1", {
                    name: "Test",
                    url: "",
                    method: HttpMethod.GET,
                    expectedStatus: 200,
                    timeout: 5000,
                    interval: 60000,
                })
            ).rejects.toThrow("URL is required");
        });

        it("should throw error if timeout is invalid", async () => {
            await expect(
                service.createApiEndpoint("user-1", {
                    name: "Test",
                    url: "https://api.example.com",
                    method: HttpMethod.GET,
                    expectedStatus: 200,
                    timeout: 0,
                    interval: 60000,
                })
            ).rejects.toThrow("Timeout must be greater than 0");
        });

        it("should throw error if interval is invalid", async () => {
            await expect(
                service.createApiEndpoint("user-1", {
                    name: "Test",
                    url: "https://api.example.com",
                    method: HttpMethod.GET,
                    expectedStatus: 200,
                    timeout: 5000,
                    interval: -1,
                })
            ).rejects.toThrow("Interval must be greater than 0");
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
                interval: 60000,
            };

            mockApiEndpointRepository.create.mockResolvedValue({});

            await service.createApiEndpoint("user-1", input);

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
                organizationId: null,
                collectionId: null,
                isActive: true,
            });
        });

        it("should trim name and URL", async () => {
            const input = {
                name: "  Test Endpoint  ",
                url: "  https://api.example.com  ",
                method: HttpMethod.GET,
                expectedStatus: 200,
                timeout: 5000,
                interval: 60000,
            };

            mockApiEndpointRepository.create.mockResolvedValue({});

            await service.createApiEndpoint("user-1", input);

            expect(mockApiEndpointRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: "Test Endpoint",
                    url: "https://api.example.com",
                })
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

            const result = await service.getApiEndpoint("endpoint-1");

            expect(mockApiEndpointRepository.findById).toHaveBeenCalledWith(
                "endpoint-1"
            );
            expect(result).toEqual(mockEndpoint);
        });

        it("should throw error if endpoint ID is empty", async () => {
            await expect(service.getApiEndpoint("")).rejects.toThrow(
                "Endpoint ID is required"
            );
        });

        it("should return null if endpoint not found", async () => {
            mockApiEndpointRepository.findById.mockResolvedValue(null);

            const result = await service.getApiEndpoint("nonexistent");

            expect(result).toBeNull();
        });
    });

    describe("getUserApiEndpoints", () => {
        it("should return user endpoints", async () => {
            const mockEndpoints = [
                { id: "endpoint-1", userId: "user-1" },
                { id: "endpoint-2", userId: "user-1" },
            ];

            mockApiEndpointRepository.findByUserId.mockResolvedValue(
                mockEndpoints
            );

            const result = await service.getUserApiEndpoints("user-1");

            expect(mockApiEndpointRepository.findByUserId).toHaveBeenCalledWith(
                "user-1"
            );
            expect(result).toEqual(mockEndpoints);
        });

        it("should throw error if user ID is empty", async () => {
            await expect(service.getUserApiEndpoints("")).rejects.toThrow(
                "User ID is required"
            );
        });
    });

    describe("getOrganizationApiEndpoints", () => {
        it("should return organization endpoints", async () => {
            const mockEndpoints = [
                { id: "endpoint-1", organizationId: "org-1" },
                { id: "endpoint-2", organizationId: "org-1" },
            ];

            mockApiEndpointRepository.findByOrganizationId.mockResolvedValue(
                mockEndpoints
            );

            const result = await service.getOrganizationApiEndpoints("org-1");

            expect(
                mockApiEndpointRepository.findByOrganizationId
            ).toHaveBeenCalledWith("org-1");
            expect(result).toEqual(mockEndpoints);
        });

        it("should throw error if organization ID is empty", async () => {
            await expect(
                service.getOrganizationApiEndpoints("")
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

            mockApiEndpointRepository.findById.mockResolvedValue(
                existingEndpoint
            );
            mockApiEndpointRepository.update.mockResolvedValue({
                ...existingEndpoint,
                ...updateData,
            });

            const result = await service.updateApiEndpoint(
                "user-1",
                "endpoint-1",
                updateData
            );

            expect(mockApiEndpointRepository.findById).toHaveBeenCalledWith(
                "endpoint-1"
            );
            expect(mockApiEndpointRepository.update).toHaveBeenCalledWith(
                "endpoint-1",
                {
                    name: updateData.name,
                    url: updateData.url,
                }
            );
            expect(result.name).toBe("New Name");
        });

        it("should throw error if endpoint ID is empty", async () => {
            await expect(
                service.updateApiEndpoint("user-1", "", { name: "New Name" })
            ).rejects.toThrow("Endpoint ID is required");
        });

        it("should throw error if user ID is empty", async () => {
            await expect(
                service.updateApiEndpoint("", "endpoint-1", {
                    name: "New Name",
                })
            ).rejects.toThrow("User ID is required");
        });

        it("should throw error if endpoint not found", async () => {
            mockApiEndpointRepository.findById.mockResolvedValue(null);

            await expect(
                service.updateApiEndpoint("user-1", "nonexistent", {
                    name: "New Name",
                })
            ).rejects.toThrow("API endpoint not found");
        });

        it("should throw error if user does not own endpoint", async () => {
            const existingEndpoint = {
                id: "endpoint-1",
                userId: "user-2",
            };

            mockApiEndpointRepository.findById.mockResolvedValue(
                existingEndpoint
            );

            await expect(
                service.updateApiEndpoint("user-1", "endpoint-1", {
                    name: "New Name",
                })
            ).rejects.toThrow(
                "You do not have permission to update this endpoint"
            );
        });

        it("should throw error if name is empty string", async () => {
            const existingEndpoint = {
                id: "endpoint-1",
                userId: "user-1",
            };

            mockApiEndpointRepository.findById.mockResolvedValue(
                existingEndpoint
            );

            await expect(
                service.updateApiEndpoint("user-1", "endpoint-1", {
                    name: "  ",
                })
            ).rejects.toThrow("Endpoint name cannot be empty");
        });

        it("should throw error if timeout is invalid", async () => {
            const existingEndpoint = {
                id: "endpoint-1",
                userId: "user-1",
            };

            mockApiEndpointRepository.findById.mockResolvedValue(
                existingEndpoint
            );

            await expect(
                service.updateApiEndpoint("user-1", "endpoint-1", {
                    timeout: 0,
                })
            ).rejects.toThrow("Timeout must be greater than 0");
        });

        it("should throw error if interval is invalid", async () => {
            const existingEndpoint = {
                id: "endpoint-1",
                userId: "user-1",
            };

            mockApiEndpointRepository.findById.mockResolvedValue(
                existingEndpoint
            );

            await expect(
                service.updateApiEndpoint("user-1", "endpoint-1", {
                    interval: -5,
                })
            ).rejects.toThrow("Interval must be greater than 0");
        });

        it("should update with partial data", async () => {
            const existingEndpoint = {
                id: "endpoint-1",
                userId: "user-1",
                name: "Old Name",
            };

            mockApiEndpointRepository.findById.mockResolvedValue(
                existingEndpoint
            );
            mockApiEndpointRepository.update.mockResolvedValue(
                existingEndpoint
            );

            await service.updateApiEndpoint("user-1", "endpoint-1", {
                isActive: false,
            });

            expect(mockApiEndpointRepository.update).toHaveBeenCalledWith(
                "endpoint-1",
                {
                    isActive: false,
                }
            );
        });

        it("should update headers", async () => {
            const existingEndpoint = {
                id: "endpoint-1",
                userId: "user-1",
            };

            mockApiEndpointRepository.findById.mockResolvedValue(
                existingEndpoint
            );
            mockApiEndpointRepository.update.mockResolvedValue(
                existingEndpoint
            );

            await service.updateApiEndpoint("user-1", "endpoint-1", {
                headers: { Authorization: "Bearer new-token" },
            });

            expect(mockApiEndpointRepository.update).toHaveBeenCalledWith(
                "endpoint-1",
                {
                    headers: JSON.stringify({
                        Authorization: "Bearer new-token",
                    }),
                }
            );
        });
    });

    describe("deleteApiEndpoint", () => {
        it("should delete endpoint successfully", async () => {
            const existingEndpoint = {
                id: "endpoint-1",
                userId: "user-1",
            };

            mockApiEndpointRepository.findById.mockResolvedValue(
                existingEndpoint
            );
            mockApiEndpointRepository.delete.mockResolvedValue(undefined);

            await service.deleteApiEndpoint("user-1", "endpoint-1");

            expect(mockApiEndpointRepository.findById).toHaveBeenCalledWith(
                "endpoint-1"
            );
            expect(mockApiEndpointRepository.delete).toHaveBeenCalledWith(
                "endpoint-1"
            );
        });

        it("should throw error if endpoint ID is empty", async () => {
            await expect(
                service.deleteApiEndpoint("user-1", "")
            ).rejects.toThrow("Endpoint ID is required");
        });

        it("should throw error if user ID is empty", async () => {
            await expect(
                service.deleteApiEndpoint("", "endpoint-1")
            ).rejects.toThrow("User ID is required");
        });

        it("should throw error if endpoint not found", async () => {
            mockApiEndpointRepository.findById.mockResolvedValue(null);

            await expect(
                service.deleteApiEndpoint("user-1", "nonexistent")
            ).rejects.toThrow("API endpoint not found");
        });

        it("should throw error if user does not own endpoint", async () => {
            const existingEndpoint = {
                id: "endpoint-1",
                userId: "user-2",
            };

            mockApiEndpointRepository.findById.mockResolvedValue(
                existingEndpoint
            );

            await expect(
                service.deleteApiEndpoint("user-1", "endpoint-1")
            ).rejects.toThrow(
                "You do not have permission to delete this endpoint"
            );
        });
    });

    describe("getActiveEndpoints", () => {
        it("should return active endpoints", async () => {
            const mockEndpoints = [
                { id: "endpoint-1", isActive: true },
                { id: "endpoint-2", isActive: true },
            ];

            mockApiEndpointRepository.findActive.mockResolvedValue(
                mockEndpoints
            );

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
