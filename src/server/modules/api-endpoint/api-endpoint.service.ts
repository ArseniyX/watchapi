import { ApiEndpoint, HttpMethod } from "../../../generated/prisma";
import { ApiEndpointRepository } from "./api-endpoint.repository";

export interface CreateApiEndpointInput {
    name: string;
    url: string;
    method: HttpMethod;
    headers?: Record<string, string>;
    body?: string;
    expectedStatus: number;
    timeout: number;
    interval: number;
    collectionId?: string;
}

export interface UpdateApiEndpointInput {
    name?: string;
    url?: string;
    method?: HttpMethod;
    headers?: Record<string, string>;
    body?: string;
    expectedStatus?: number;
    timeout?: number;
    interval?: number;
    isActive?: boolean;
}

export class ApiEndpointService {
    constructor(
        private readonly apiEndpointRepository: ApiEndpointRepository
    ) {}

    async createApiEndpoint(
        userId: string,
        input: CreateApiEndpointInput,
        organizationId?: string | null
    ): Promise<ApiEndpoint> {
        // Validate input
        if (!input.name || input.name.trim() === "") {
            throw new Error("Endpoint name is required");
        }
        if (!input.url || input.url.trim() === "") {
            throw new Error("URL is required");
        }

        // Validate timeout and interval
        if (input.timeout <= 0) {
            throw new Error("Timeout must be greater than 0");
        }
        if (input.interval <= 0) {
            throw new Error("Interval must be greater than 0");
        }

        return this.apiEndpointRepository.create({
            name: input.name.trim(),
            url: input.url.trim(),
            method: input.method,
            headers: input.headers ? JSON.stringify(input.headers) : null,
            body: input.body?.trim() || null,
            expectedStatus: input.expectedStatus,
            timeout: input.timeout,
            interval: input.interval,
            userId,
            organizationId: organizationId || null,
            collectionId: input.collectionId || null,
            isActive: true,
        });
    }

    async getApiEndpoint(id: string): Promise<ApiEndpoint | null> {
        if (!id || id.trim() === "") {
            throw new Error("Endpoint ID is required");
        }
        return this.apiEndpointRepository.findById(id);
    }

    async getUserApiEndpoints(userId: string) {
        if (!userId || userId.trim() === "") {
            throw new Error("User ID is required");
        }
        return this.apiEndpointRepository.findByUserId(userId);
    }

    async getOrganizationApiEndpoints(
        organizationId: string
    ): Promise<ApiEndpoint[]> {
        if (!organizationId || organizationId.trim() === "") {
            throw new Error("Organization ID is required");
        }
        return this.apiEndpointRepository.findByOrganizationId(organizationId);
    }

    async updateApiEndpoint(
        userId: string,
        id: string,
        input: UpdateApiEndpointInput
    ): Promise<ApiEndpoint> {
        // Validate IDs
        if (!id || id.trim() === "") {
            throw new Error("Endpoint ID is required");
        }
        if (!userId || userId.trim() === "") {
            throw new Error("User ID is required");
        }

        // Verify endpoint exists and user owns it
        const endpoint = await this.apiEndpointRepository.findById(id);
        if (!endpoint) {
            throw new Error("API endpoint not found");
        }
        if (endpoint.userId !== userId) {
            throw new Error(
                "You do not have permission to update this endpoint"
            );
        }

        const updateData: Record<string, any> = {};

        if (input.name !== undefined) {
            if (input.name.trim() === "") {
                throw new Error("Endpoint name cannot be empty");
            }
            updateData.name = input.name.trim();
        }

        if (input.url !== undefined) {
            if (input.url.trim() === "") {
                throw new Error("URL cannot be empty");
            }
            updateData.url = input.url.trim();
        }

        if (input.method !== undefined) updateData.method = input.method;

        if (input.headers !== undefined) {
            updateData.headers = JSON.stringify(input.headers);
        }

        if (input.body !== undefined) {
            updateData.body = input.body?.trim() || null;
        }

        if (input.expectedStatus !== undefined) {
            updateData.expectedStatus = input.expectedStatus;
        }

        if (input.timeout !== undefined) {
            if (input.timeout <= 0) {
                throw new Error("Timeout must be greater than 0");
            }
            updateData.timeout = input.timeout;
        }

        if (input.interval !== undefined) {
            if (input.interval <= 0) {
                throw new Error("Interval must be greater than 0");
            }
            updateData.interval = input.interval;
        }

        if (input.isActive !== undefined) {
            updateData.isActive = input.isActive;
        }

        return this.apiEndpointRepository.update(id, updateData);
    }

    async deleteApiEndpoint(userId: string, id: string): Promise<void> {
        // Validate IDs
        if (!id || id.trim() === "") {
            throw new Error("Endpoint ID is required");
        }
        if (!userId || userId.trim() === "") {
            throw new Error("User ID is required");
        }

        // Verify endpoint exists and user owns it
        const endpoint = await this.apiEndpointRepository.findById(id);
        if (!endpoint) {
            throw new Error("API endpoint not found");
        }
        if (endpoint.userId !== userId) {
            throw new Error(
                "You do not have permission to delete this endpoint"
            );
        }

        return this.apiEndpointRepository.delete(id);
    }

    async getActiveEndpoints(): Promise<ApiEndpoint[]> {
        return this.apiEndpointRepository.findActive();
    }

    async searchEndpoints(
        userId: string,
        query: string
    ): Promise<ApiEndpoint[]> {
        if (!userId || userId.trim() === "") {
            throw new Error("User ID is required");
        }
        if (!query || query.trim() === "") {
            return [];
        }
        return this.apiEndpointRepository.search(query.trim(), userId);
    }
}
