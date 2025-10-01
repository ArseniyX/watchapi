import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MonitoringService } from '../monitoring.service'
import { MonitoringRepository } from '../monitoring.repository'
import { ApiEndpointRepository } from '../../api-endpoint/api-endpoint.repository'
import { HttpMethod, CheckStatus } from '../../../../generated/prisma'

// Mock the repositories
const mockMonitoringRepository = {
  createMonitoringCheck: vi.fn(),
  findChecksByApiEndpointId: vi.fn(),
  getUptimeStats: vi.fn(),
  getAverageResponseTime: vi.fn(),
  getResponseTimeHistory: vi.fn(),
  findUserById: vi.fn(),
  getOverallStats: vi.fn(),
  getTopEndpoints: vi.fn(),
  getUptimeHistory: vi.fn(),
}

const mockApiEndpointRepository = {
  findById: vi.fn(),
  findByUserId: vi.fn(),
  findByOrganizationId: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findActive: vi.fn(),
  findMany: vi.fn(),
}

// Mock fetch
global.fetch = vi.fn()

describe('MonitoringService', () => {
  let service: MonitoringService

  beforeEach(() => {
    service = new MonitoringService(mockMonitoringRepository as any, mockApiEndpointRepository as any)
    vi.clearAllMocks()
  })

  describe('sendRequest', () => {
    it('should send HTTP request successfully', async () => {
      const mockResponse = {
        status: 200,
        statusText: 'OK',
        text: vi.fn().mockResolvedValue('{"result": "success"}'),
        headers: new Map([
          ['content-type', 'application/json'],
          ['content-length', '100'],
        ]),
      }

      ;(global.fetch as any).mockResolvedValue(mockResponse)

      const result = await service.sendRequest({
        url: 'https://api.example.com',
        method: HttpMethod.GET,
        headers: { Authorization: 'Bearer token' },
      })

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com',
        expect.objectContaining({
          method: HttpMethod.GET,
          headers: { Authorization: 'Bearer token' },
        })
      )
      expect(result.status).toBe(200)
      expect(result.statusText).toBe('OK')
      expect(result.body).toBe('{"result": "success"}')
      expect(result.responseTime).toBeGreaterThanOrEqual(0)
    })

    it('should throw error if URL is empty', async () => {
      await expect(
        service.sendRequest({
          url: '',
          method: HttpMethod.GET,
        })
      ).rejects.toThrow('URL is required')
    })

    it('should throw error if URL format is invalid', async () => {
      await expect(
        service.sendRequest({
          url: 'invalid-url',
          method: HttpMethod.GET,
        })
      ).rejects.toThrow('Invalid URL format')
    })

    it('should handle network errors', async () => {
      ;(global.fetch as any).mockRejectedValue(new Error('Network error'))

      const result = await service.sendRequest({
        url: 'https://api.example.com',
        method: HttpMethod.GET,
      })

      expect(result.status).toBe(0)
      expect(result.statusText).toBe('Error')
      expect(result.body).toContain('Network error')
    })
  })

  describe('checkApiEndpoint', () => {
    it('should perform successful check', async () => {
      const mockEndpoint = {
        id: 'endpoint-1',
        userId: 'user-1',
        url: 'https://api.example.com',
        method: HttpMethod.GET,
        headers: null,
        body: null,
        expectedStatus: 200,
        timeout: 5000,
      }

      const mockResponse = {
        status: 200,
        text: vi.fn().mockResolvedValue('OK'),
        headers: new Map(),
      }

      mockApiEndpointRepository.findById.mockResolvedValue(mockEndpoint)
      ;(global.fetch as any).mockResolvedValue(mockResponse)
      mockMonitoringRepository.createMonitoringCheck.mockResolvedValue({})
      mockMonitoringRepository.findUserById.mockResolvedValue({ email: null })

      const result = await service.checkApiEndpoint('endpoint-1')

      expect(result.status).toBe(CheckStatus.SUCCESS)
      expect(result.statusCode).toBe(200)
      expect(result.responseTime).toBeGreaterThanOrEqual(0)
      expect(mockMonitoringRepository.createMonitoringCheck).toHaveBeenCalledWith(
        expect.objectContaining({
          apiEndpointId: 'endpoint-1',
          userId: 'user-1',
          status: CheckStatus.SUCCESS,
          statusCode: 200,
        })
      )
    })

    it('should fail check when status does not match expected', async () => {
      const mockEndpoint = {
        id: 'endpoint-1',
        userId: 'user-1',
        url: 'https://api.example.com',
        method: HttpMethod.GET,
        headers: null,
        body: null,
        expectedStatus: 200,
        timeout: 5000,
      }

      const mockResponse = {
        status: 404,
        text: vi.fn().mockResolvedValue('Not Found'),
        headers: new Map(),
      }

      mockApiEndpointRepository.findById.mockResolvedValue(mockEndpoint)
      ;(global.fetch as any).mockResolvedValue(mockResponse)
      mockMonitoringRepository.createMonitoringCheck.mockResolvedValue({})
      mockMonitoringRepository.findUserById.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
      })

      // Add delay to ensure non-zero response time
      await new Promise(resolve => setTimeout(resolve, 10))

      const result = await service.checkApiEndpoint('endpoint-1')

      expect(result.status).toBe(CheckStatus.FAILURE)
      expect(result.statusCode).toBe(404)
      expect(result.errorMessage).toContain('Expected status 200, got 404')
    })

    it('should handle timeout errors', async () => {
      const mockEndpoint = {
        id: 'endpoint-1',
        userId: 'user-1',
        url: 'https://api.example.com',
        method: HttpMethod.GET,
        headers: null,
        body: null,
        expectedStatus: 200,
        timeout: 100,
      }

      mockApiEndpointRepository.findById.mockResolvedValue(mockEndpoint)
      const error = new Error('Timeout')
      error.name = 'AbortError'
      ;(global.fetch as any).mockRejectedValue(error)
      mockMonitoringRepository.createMonitoringCheck.mockResolvedValue({})
      mockMonitoringRepository.findUserById.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
      })

      const result = await service.checkApiEndpoint('endpoint-1')

      expect(result.status).toBe(CheckStatus.TIMEOUT)
      expect(result.responseTime).toBe(100)
    })

    it('should handle general errors', async () => {
      const mockEndpoint = {
        id: 'endpoint-1',
        userId: 'user-1',
        url: 'https://api.example.com',
        method: HttpMethod.GET,
        headers: null,
        body: null,
        expectedStatus: 200,
        timeout: 5000,
      }

      mockApiEndpointRepository.findById.mockResolvedValue(mockEndpoint)
      ;(global.fetch as any).mockRejectedValue(new Error('Network failure'))
      mockMonitoringRepository.createMonitoringCheck.mockResolvedValue({})
      mockMonitoringRepository.findUserById.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
      })

      const result = await service.checkApiEndpoint('endpoint-1')

      expect(result.status).toBe(CheckStatus.ERROR)
      expect(result.errorMessage).toBe('Network failure')
    })

    it('should throw error if endpoint not found', async () => {
      mockApiEndpointRepository.findById.mockResolvedValue(null)

      await expect(service.checkApiEndpoint('nonexistent')).rejects.toThrow(
        'API endpoint not found'
      )
    })
  })

  describe('getMonitoringHistory', () => {
    it('should return check history with pagination', async () => {
      const mockHistory = [
        { id: 'check-1', status: CheckStatus.SUCCESS },
        { id: 'check-2', status: CheckStatus.FAILURE },
      ]

      mockMonitoringRepository.findChecksByApiEndpointId.mockResolvedValue(mockHistory)

      const result = await service.getMonitoringHistory('endpoint-1', { skip: 0, take: 10 })

      expect(mockMonitoringRepository.findChecksByApiEndpointId).toHaveBeenCalledWith(
        'endpoint-1',
        expect.objectContaining({ skip: 0, take: 10, orderBy: { checkedAt: 'desc' } })
      )
      expect(result).toEqual(mockHistory)
    })
  })

  describe('getUptimeStats', () => {
    it('should return uptime statistics for specified period', async () => {
      const mockStats = {
        totalChecks: 100,
        successfulChecks: 95,
        uptimePercentage: 95,
      }

      mockMonitoringRepository.getUptimeStats.mockResolvedValue(mockStats)

      const result = await service.getUptimeStats('endpoint-1', 7)

      expect(mockMonitoringRepository.getUptimeStats).toHaveBeenCalledWith(
        'endpoint-1',
        expect.any(Date),
        expect.any(Date)
      )
      expect(result).toEqual(mockStats)
    })
  })

  describe('getAnalytics', () => {
    it('should return analytics with period comparison', async () => {
      const currentStats = {
        totalChecks: 100,
        successfulChecks: 95,
        failedChecks: 5,
        errorRate: 5,
        uptimePercentage: 95,
        avgResponseTime: 250,
      }

      const previousStats = {
        totalChecks: 80,
        successfulChecks: 70,
        failedChecks: 10,
        errorRate: 12.5,
        uptimePercentage: 87.5,
        avgResponseTime: 300,
      }

      mockMonitoringRepository.getOverallStats
        .mockResolvedValueOnce(currentStats)
        .mockResolvedValueOnce(previousStats)

      const result = await service.getAnalytics('user-1', 7)

      expect(result.current).toEqual(currentStats)
      expect(result.previous).toEqual(previousStats)
      expect(result.changes.totalChecks).toBe(25) // (100-80)/80 * 100
      expect(result.changes.errorRate).toBeCloseTo(-60, 0) // (5-12.5)/12.5 * 100
    })

    it('should handle zero previous values', async () => {
      const currentStats = {
        totalChecks: 10,
        successfulChecks: 10,
        failedChecks: 0,
        errorRate: 0,
        uptimePercentage: 100,
        avgResponseTime: 200,
      }

      const previousStats = {
        totalChecks: 0,
        successfulChecks: 0,
        failedChecks: 0,
        errorRate: 0,
        uptimePercentage: 0,
        avgResponseTime: 0,
      }

      mockMonitoringRepository.getOverallStats
        .mockResolvedValueOnce(currentStats)
        .mockResolvedValueOnce(previousStats)

      const result = await service.getAnalytics('user-1', 7)

      expect(result.changes.totalChecks).toBe(100)
      expect(result.changes.avgResponseTime).toBe(100)
    })
  })

  describe('getTopEndpoints', () => {
    it('should return top endpoints by check count', async () => {
      const mockEndpoints = [
        { id: 'endpoint-1', name: 'API 1', totalChecks: 100 },
        { id: 'endpoint-2', name: 'API 2', totalChecks: 80 },
      ]

      mockMonitoringRepository.getTopEndpoints.mockResolvedValue(mockEndpoints)

      const result = await service.getTopEndpoints('user-1', 7, 5)

      expect(mockMonitoringRepository.getTopEndpoints).toHaveBeenCalledWith(
        'user-1',
        expect.any(Date),
        expect.any(Date),
        5
      )
      expect(result).toEqual(mockEndpoints)
    })
  })

  describe('runActiveChecks', () => {
    it('should check all active endpoints', async () => {
      const mockEndpoints = [
        { id: 'endpoint-1', name: 'API 1' },
        { id: 'endpoint-2', name: 'API 2' },
      ]

      mockApiEndpointRepository.findActive.mockResolvedValue(mockEndpoints)
      mockApiEndpointRepository.findById.mockResolvedValue({
        id: 'endpoint-1',
        userId: 'user-1',
        url: 'https://api.example.com',
        method: HttpMethod.GET,
        headers: null,
        body: null,
        expectedStatus: 200,
        timeout: 5000,
      })
      ;(global.fetch as any).mockResolvedValue({
        status: 200,
        text: vi.fn().mockResolvedValue('OK'),
      })
      mockMonitoringRepository.createMonitoringCheck.mockResolvedValue({})

      await service.runActiveChecks()

      expect(mockApiEndpointRepository.findActive).toHaveBeenCalled()
      expect(mockApiEndpointRepository.findById).toHaveBeenCalledTimes(2)
    })

    it('should continue checking other endpoints if one fails', async () => {
      const mockEndpoints = [
        { id: 'endpoint-1', name: 'API 1' },
        { id: 'endpoint-2', name: 'API 2' },
      ]

      mockApiEndpointRepository.findActive.mockResolvedValue(mockEndpoints)
      mockApiEndpointRepository.findById
        .mockRejectedValueOnce(new Error('Endpoint 1 error'))
        .mockResolvedValueOnce({
          id: 'endpoint-2',
          userId: 'user-1',
          url: 'https://api.example.com',
          method: HttpMethod.GET,
          headers: null,
          body: null,
          expectedStatus: 200,
          timeout: 5000,
        })
      ;(global.fetch as any).mockResolvedValue({
        status: 200,
        text: vi.fn().mockResolvedValue('OK'),
      })
      mockMonitoringRepository.createMonitoringCheck.mockResolvedValue({})

      await service.runActiveChecks()

      expect(mockApiEndpointRepository.findById).toHaveBeenCalledTimes(2)
    })
  })
})
