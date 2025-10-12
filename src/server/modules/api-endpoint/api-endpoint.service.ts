import { ApiEndpoint, PlanType } from "../../../generated/prisma";
import {
  ApiEndpointRepository,
  ApiEndpointWithRelations,
  ApiEndpointWithBasicRelations,
} from "./api-endpoint.repository";
import { getPlanLimits, isUnlimited } from "../../config/plan-limits";
import {
  CreateApiEndpointInput,
  UpdateApiEndpointInput,
} from "./api-endpoint.schema";
import {
  BadRequestError,
  NotFoundError,
  TooManyRequestsError,
  ForbiddenError,
} from "../../errors/custom-errors";
import type { Context } from "../../trpc";

export class ApiEndpointService {
  constructor(private readonly apiEndpointRepository: ApiEndpointRepository) {}

  async createApiEndpoint({
    ctx,
    input,
  }: {
    ctx: Context;
    input: CreateApiEndpointInput;
  }): Promise<ApiEndpoint> {
    const userPlan = ctx.organizationPlan || PlanType.FREE;
    const userId = ctx.user!.id;
    const organizationId = ctx.organizationId!;

    // Check plan limits only if enabling monitoring
    if (input.isActive) {
      const limits = getPlanLimits(userPlan);

      // Check max active endpoints (endpoints with monitoring enabled)
      const currentEndpoints =
        await this.apiEndpointRepository.findByOrganizationId(organizationId);
      const activeEndpoints = currentEndpoints.filter((ep) => ep.isActive);

      if (
        !isUnlimited(limits.maxEndpoints) &&
        activeEndpoints.length >= limits.maxEndpoints
      ) {
        throw new TooManyRequestsError(
          `Plan limit reached. ${userPlan} plan allows maximum ${limits.maxEndpoints} active monitors. You have ${activeEndpoints.length} active. Disable monitoring on other endpoints or upgrade your plan.`,
        );
      }
    }

    // Use plan's minimum interval if provided interval is too low
    // This allows endpoint creation to succeed, applying safe defaults
    const limits = getPlanLimits(userPlan);
    const safeInterval = Math.max(input.interval, limits.minCheckInterval);

    return this.apiEndpointRepository.create({
      name: input.name.trim(),
      url: input.url.trim(),
      method: input.method,
      headers: input.headers ? JSON.stringify(input.headers) : null,
      body: input.body?.trim() || null,
      expectedStatus: input.expectedStatus,
      timeout: input.timeout,
      interval: safeInterval, // Use safe interval instead of rejecting
      userId,
      organizationId,
      collectionId: input.collectionId || null,
      lastCheckedAt: null,
      isActive: input.isActive,
    });
  }

  async getApiEndpoint({
    ctx,
    input,
  }: {
    ctx: Context;
    input: { id: string };
  }): Promise<ApiEndpointWithRelations | null> {
    if (!input.id || input.id.trim() === "") {
      throw new BadRequestError("Endpoint ID is required");
    }
    const organizationId = ctx.organizationId!;
    if (!organizationId || organizationId.trim() === "") {
      throw new BadRequestError("Organization ID is required");
    }

    return this.apiEndpointRepository.findById(input.id, organizationId);
  }

  async getOrganizationApiEndpoints({
    ctx,
  }: {
    ctx: Context;
  }): Promise<ApiEndpointWithBasicRelations[]> {
    const organizationId = ctx.organizationId!;
    if (!organizationId || organizationId.trim() === "") {
      throw new BadRequestError("Organization ID is required");
    }
    return this.apiEndpointRepository.findByOrganizationId(organizationId);
  }

  async updateApiEndpoint({
    ctx,
    input,
  }: {
    ctx: Context;
    input: UpdateApiEndpointInput & { id: string };
  }): Promise<ApiEndpoint> {
    const userPlan = ctx.organizationPlan || PlanType.FREE;
    const organizationId = ctx.organizationId!;

    // Validate IDs
    if (!input.id || input.id.trim() === "") {
      throw new BadRequestError("Endpoint ID is required");
    }
    if (!organizationId || organizationId.trim() === "") {
      throw new BadRequestError("Organization ID is required");
    }

    // Verify endpoint exists in organization
    const endpoint = await this.apiEndpointRepository.findById(
      input.id,
      organizationId,
    );
    if (!endpoint) {
      throw new NotFoundError("API endpoint", input.id);
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
          `Check interval cannot be less than ${
            limits.minCheckInterval / 1000
          } seconds for ${userPlan} plan. Upgrade to reduce check interval.`,
        );
      }
      updateData.interval = input.interval;
    }

    if (input.isActive !== undefined) {
      // If enabling monitoring, check plan limits
      if (input.isActive && !endpoint.isActive) {
        const currentEndpoints =
          await this.apiEndpointRepository.findByOrganizationId(organizationId);
        const activeEndpoints = currentEndpoints.filter((ep) => ep.isActive);

        if (
          !isUnlimited(limits.maxEndpoints) &&
          activeEndpoints.length >= limits.maxEndpoints
        ) {
          throw new TooManyRequestsError(
            `Plan limit reached. ${userPlan} plan allows maximum ${limits.maxEndpoints} active monitors. You have ${activeEndpoints.length} active. Disable monitoring on other endpoints or upgrade your plan.`,
          );
        }
      }
      updateData.isActive = input.isActive;
    }

    return this.apiEndpointRepository.update(
      input.id,
      organizationId,
      updateData,
    );
  }

  async deleteApiEndpoint({
    ctx,
    input,
  }: {
    ctx: Context;
    input: { id: string };
  }): Promise<void> {
    const organizationId = ctx.organizationId!;

    // Validate IDs
    if (!input.id || input.id.trim() === "") {
      throw new BadRequestError("Endpoint ID is required");
    }
    if (!organizationId || organizationId.trim() === "") {
      throw new BadRequestError("Organization ID is required");
    }

    return this.apiEndpointRepository.delete(input.id, organizationId);
  }

  async getActiveEndpoints(): Promise<ApiEndpoint[]> {
    return this.apiEndpointRepository.findActive();
  }

  async searchEndpoints({
    ctx,
    input,
  }: {
    ctx: Context;
    input: { query: string };
  }): Promise<ApiEndpointWithBasicRelations[]> {
    const organizationId = ctx.organizationId!;

    if (!organizationId || organizationId.trim() === "") {
      throw new BadRequestError("Organization ID is required");
    }
    if (!input.query || input.query.trim() === "") {
      return [];
    }
    return this.apiEndpointRepository.search(
      input.query.trim(),
      organizationId,
    );
  }
}
