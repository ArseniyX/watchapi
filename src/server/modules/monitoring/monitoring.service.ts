import { ApiEndpoint, HttpMethod, CheckStatus } from '../../../generated/prisma'
import { MonitoringRepository } from './monitoring.repository'

export interface CreateApiEndpointInput {
  name: string
  url: string
  method: HttpMethod
  headers?: Record<string, string>
  body?: string
  expectedStatus: number
  timeout: number
  interval: number
  collectionId?: string
}

export interface UpdateApiEndpointInput {
  name?: string
  url?: string
  method?: HttpMethod
  headers?: Record<string, string>
  body?: string
  expectedStatus?: number
  timeout?: number
  interval?: number
  isActive?: boolean
}

export interface MonitoringCheckResult {
  status: CheckStatus
  responseTime?: number
  statusCode?: number
  errorMessage?: string
  responseSize?: number
}

export class MonitoringService {
  constructor(private readonly monitoringRepository: MonitoringRepository) {}

  async createApiEndpoint(userId: string, input: CreateApiEndpointInput, organizationId?: string | null): Promise<ApiEndpoint> {
    return this.monitoringRepository.createApiEndpoint({
      name: input.name,
      url: input.url,
      method: input.method,
      headers: input.headers ? JSON.stringify(input.headers) : null,
      body: input.body || null,
      expectedStatus: input.expectedStatus,
      timeout: input.timeout,
      interval: input.interval,
      userId,
      organizationId: organizationId || null,
      collectionId: input.collectionId || null,
      isActive: true,
    })
  }

  async getApiEndpoint(id: string): Promise<ApiEndpoint | null> {
    return this.monitoringRepository.findApiEndpointById(id)
  }

  async getUserApiEndpoints(userId: string): Promise<ApiEndpoint[]> {
    return this.monitoringRepository.findApiEndpointsByUserId(userId)
  }

  async updateApiEndpoint(id: string, input: UpdateApiEndpointInput): Promise<ApiEndpoint> {
    const updateData: Record<string, any> = {}

    if (input.name !== undefined) updateData.name = input.name
    if (input.url !== undefined) updateData.url = input.url
    if (input.method !== undefined) updateData.method = input.method
    if (input.headers !== undefined) updateData.headers = JSON.stringify(input.headers)
    if (input.body !== undefined) updateData.body = input.body
    if (input.expectedStatus !== undefined) updateData.expectedStatus = input.expectedStatus
    if (input.timeout !== undefined) updateData.timeout = input.timeout
    if (input.interval !== undefined) updateData.interval = input.interval
    if (input.isActive !== undefined) updateData.isActive = input.isActive

    return this.monitoringRepository.updateApiEndpoint(id, updateData)
  }

  async deleteApiEndpoint(id: string): Promise<void> {
    return this.monitoringRepository.deleteApiEndpoint(id)
  }

  async checkApiEndpoint(apiEndpointId: string): Promise<MonitoringCheckResult> {
    const endpoint = await this.monitoringRepository.findApiEndpointById(apiEndpointId)
    if (!endpoint) {
      throw new Error('API endpoint not found')
    }

    const startTime = Date.now()

    try {
      const headers = endpoint.headers ? JSON.parse(endpoint.headers) : {}
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), endpoint.timeout)

      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: endpoint.body || undefined,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      const responseTime = Date.now() - startTime
      const responseText = await response.text()
      const responseSize = new TextEncoder().encode(responseText).length

      const result: MonitoringCheckResult = {
        status: response.status === endpoint.expectedStatus ? CheckStatus.SUCCESS : CheckStatus.FAILURE,
        responseTime,
        statusCode: response.status,
        responseSize,
      }

      if (response.status !== endpoint.expectedStatus) {
        result.errorMessage = `Expected status ${endpoint.expectedStatus}, got ${response.status}`
      }

      // Save the check result
      await this.monitoringRepository.createMonitoringCheck({
        apiEndpointId,
        userId: endpoint.userId,
        status: result.status,
        responseTime: result.responseTime || null,
        statusCode: result.statusCode || null,
        errorMessage: result.errorMessage || null,
        responseSize: result.responseSize || null,
      })

      return result
    } catch (error) {
      const responseTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      const result: MonitoringCheckResult = {
        status: (error as Error).name === 'AbortError' ? CheckStatus.TIMEOUT : CheckStatus.ERROR,
        responseTime: (error as Error).name === 'AbortError' ? endpoint.timeout : responseTime,
        errorMessage,
      }

      // Save the error result
      await this.monitoringRepository.createMonitoringCheck({
        apiEndpointId,
        userId: endpoint.userId,
        status: result.status,
        responseTime: result.responseTime || null,
        statusCode: null,
        errorMessage: result.errorMessage || null,
        responseSize: null,
      })

      return result
    }
  }

  async getMonitoringHistory(
    apiEndpointId: string,
    options: { skip?: number; take?: number } = {}
  ) {
    return this.monitoringRepository.findChecksByApiEndpointId(apiEndpointId, {
      ...options,
      orderBy: { checkedAt: 'desc' },
    })
  }

  async getUptimeStats(apiEndpointId: string, days: number = 30) {
    const to = new Date()
    const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000)

    return this.monitoringRepository.getUptimeStats(apiEndpointId, from, to)
  }

  async getAverageResponseTime(apiEndpointId: string, days: number = 30) {
    const to = new Date()
    const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000)

    return this.monitoringRepository.getAverageResponseTime(apiEndpointId, from, to)
  }

  async getResponseTimeHistory(apiEndpointId: string, days: number = 7) {
    const to = new Date()
    const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000)

    return this.monitoringRepository.getResponseTimeHistory(apiEndpointId, from, to)
  }

  async runActiveChecks(): Promise<void> {
    const activeEndpoints = await this.monitoringRepository.findActiveEndpoints()

    for (const endpoint of activeEndpoints) {
      try {
        await this.checkApiEndpoint(endpoint.id)
      } catch (error) {
        console.error(`Failed to check endpoint ${endpoint.id}:`, error)
      }
    }
  }
}