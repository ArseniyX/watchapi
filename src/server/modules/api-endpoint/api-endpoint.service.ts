import { ApiEndpoint, PlanType } from "../../../generated/prisma";
import { ApiEndpointRepository, ApiEndpointWithRelations, ApiEndpointWithBasicRelations } from "./api-endpoint.repository";
import { getPlanLimits, isUnlimited } from "../../config/plan-limits";
import {
    CreateApiEndpointInput,
    UpdateApiEndpointInput,
} from "./api-endpoint.schema";

export class ApiEndpointService {
    constructor(
        private readonly apiEndpointRepository: ApiEndpointRepository
    ) {}

    async createApiEndpoint(
        userId: string,
        userPlan: PlanType,
        organizationId: string,
        input: CreateApiEndpointInput
    ): Promise<ApiEndpoint> {
        // Check plan limits
        const limits = getPlanLimits(userPlan);

        // Check max endpoints limit (per organization)
        const currentEndpoints = await this.apiEndpointRepository.findByOrganizationId(organizationId);
        if (!isUnlimited(limits.maxEndpoints) && currentEndpoints.length >= limits.maxEndpoints) {
            throw new Error(
                `Plan limit reached. ${userPlan} plan allows maximum ${limits.maxEndpoints} endpoints. Upgrade your plan to add more.`
            );
        }

        // Check minimum check interval
        if (input.interval < limits.minCheckInterval) {
            throw new Error(
                `Check interval cannot be less than ${limits.minCheckInterval / 1000} seconds for ${userPlan} plan. Upgrade to reduce check interval.`
            );
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
            organizationId,
            collectionId: input.collectionId || null,
            isActive: true,
        });
    }

    async getApiEndpoint(id: string, organizationId: string): Promise<ApiEndpointWithRelations | null> {
        if (!id || id.trim() === "") {
            throw new Error("Endpoint ID is required");
        }
        if (!organizationId || organizationId.trim() === "") {
            throw new Error("Organization ID is required");
        }

        return this.apiEndpointRepository.findById(id, organizationId);
    }

    async getOrganizationApiEndpoints(
        organizationId: string
    ): Promise<ApiEndpointWithBasicRelations[]> {
        if (!organizationId || organizationId.trim() === "") {
            throw new Error("Organization ID is required");
        }
        return this.apiEndpointRepository.findByOrganizationId(organizationId);
    }

    async updateApiEndpoint(
        userId: string,
        userPlan: PlanType,
        organizationId: string,
        id: string,
        input: UpdateApiEndpointInput
    ): Promise<ApiEndpoint> {
        // Validate IDs
        if (!id || id.trim() === "") {
            throw new Error("Endpoint ID is required");
        }
        if (!organizationId || organizationId.trim() === "") {
            throw new Error("Organization ID is required");
        }

        // Verify endpoint exists in organization
        const endpoint = await this.apiEndpointRepository.findById(id, organizationId);
        if (!endpoint) {
            throw new Error("API endpoint not found or access denied");
        }

        const updateData: Record<string, any> = {};
        const limits = getPlanLimits(userPlan);

        if (input.name !== undefined) {
            updateData.name = input.name.trim();
        }

        if (input.url !== undefined) {
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
            updateData.timeout = input.timeout;
        }

        if (input.interval !== undefined) {
            // Check minimum check interval for plan
            if (input.interval < limits.minCheckInterval) {
                throw new Error(
                    `Check interval cannot be less than ${limits.minCheckInterval / 1000} seconds for ${userPlan} plan. Upgrade to reduce check interval.`
                );
            }
            updateData.interval = input.interval;
        }

        if (input.isActive !== undefined) {
            updateData.isActive = input.isActive;
        }

        return this.apiEndpointRepository.update(id, organizationId, updateData);
    }

    async deleteApiEndpoint(organizationId: string, id: string): Promise<void> {
        // Validate IDs
        if (!id || id.trim() === "") {
            throw new Error("Endpoint ID is required");
        }
        if (!organizationId || organizationId.trim() === "") {
            throw new Error("Organization ID is required");
        }

        return this.apiEndpointRepository.delete(id, organizationId);
    }

    async getActiveEndpoints(): Promise<ApiEndpoint[]> {
        return this.apiEndpointRepository.findActive();
    }

    async searchEndpoints(
        organizationId: string,
        query: string
    ): Promise<ApiEndpointWithBasicRelations[]> {
        if (!organizationId || organizationId.trim() === "") {
            throw new Error("Organization ID is required");
        }
        if (!query || query.trim() === "") {
            return [];
        }
        return this.apiEndpointRepository.search(query.trim(), organizationId);
    }
}
