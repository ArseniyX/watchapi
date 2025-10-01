import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { EmailService } from '../email.service'
import nodemailer from 'nodemailer'

// Mock nodemailer
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(),
  },
}))

// Mock fetch
global.fetch = vi.fn() as any

describe('EmailService', () => {
  let emailService: EmailService
  let mockTransporter: {
    sendMail: ReturnType<typeof vi.fn>
    verify: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    // Reset environment variables
    process.env.EMAIL_HOST = 'smtp.example.com'
    process.env.EMAIL_PORT = '587'
    process.env.EMAIL_USER = 'test@example.com'
    process.env.EMAIL_PASS = 'password123'
    process.env.EMAIL_FROM = 'noreply@example.com'

    // Mock transporter
    mockTransporter = {
      sendMail: vi.fn(),
      verify: vi.fn(),
    }

    ;(nodemailer.createTransport as ReturnType<typeof vi.fn>).mockReturnValue(mockTransporter)

    vi.clearAllMocks()
  })

  afterEach(() => {
    delete process.env.EMAIL_HOST
    delete process.env.EMAIL_PORT
    delete process.env.EMAIL_USER
    delete process.env.EMAIL_PASS
    delete process.env.EMAIL_FROM
  })

  describe('constructor', () => {
    it('should initialize transporter with env variables', () => {
      emailService = new EmailService()

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        auth: {
          user: 'test@example.com',
          pass: 'password123',
        },
      })
    })

    it('should use secure mode for port 465', () => {
      process.env.EMAIL_PORT = '465'

      emailService = new EmailService()

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.example.com',
        port: 465,
        secure: true,
        auth: {
          user: 'test@example.com',
          pass: 'password123',
        },
      })
    })

    it('should not initialize transporter when env variables are missing', () => {
      delete process.env.EMAIL_HOST
      delete process.env.EMAIL_USER
      delete process.env.EMAIL_PASS

      emailService = new EmailService()

      expect(nodemailer.createTransport).not.toHaveBeenCalled()
    })

    it('should use default port 587 if not specified', () => {
      delete process.env.EMAIL_PORT

      emailService = new EmailService()

      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          port: 587,
        })
      )
    })
  })

  describe('sendAlertEmail', () => {
    beforeEach(() => {
      emailService = new EmailService()
    })

    it('should send alert email successfully', async () => {
      const alertData = {
        to: 'user@example.com',
        endpointName: 'Test API',
        endpointUrl: 'https://api.example.com',
        status: 'failure',
        statusCode: 500,
        errorMessage: 'Internal Server Error',
        responseTime: 1500,
        timestamp: new Date('2024-01-01T12:00:00Z'),
      }

      mockTransporter.sendMail.mockResolvedValue({ messageId: 'msg-123' })

      const result = await emailService.sendAlertEmail(alertData)

      expect(result).toBe(true)
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: 'user@example.com',
        subject: '🚨 Alert: Test API - FAILURE',
        html: expect.stringContaining('Test API'),
      })
    })

    it('should include all alert details in email', async () => {
      const alertData = {
        to: 'user@example.com',
        endpointName: 'Test API',
        endpointUrl: 'https://api.example.com',
        status: 'error',
        statusCode: 404,
        errorMessage: 'Not Found',
        responseTime: 200,
        timestamp: new Date('2024-01-01T12:00:00Z'),
      }

      mockTransporter.sendMail.mockResolvedValue({ messageId: 'msg-123' })

      await emailService.sendAlertEmail(alertData)

      const callArgs = mockTransporter.sendMail.mock.calls[0][0]
      expect(callArgs.html).toContain('Test API')
      expect(callArgs.html).toContain('https://api.example.com')
      expect(callArgs.html).toContain('ERROR')
      expect(callArgs.html).toContain('404')
      expect(callArgs.html).toContain('Not Found')
      expect(callArgs.html).toContain('200ms')
    })

    it('should return false when transporter is not initialized', async () => {
      delete process.env.EMAIL_HOST
      const emailServiceNoConfig = new EmailService()

      const alertData = {
        to: 'user@example.com',
        endpointName: 'Test API',
        endpointUrl: 'https://api.example.com',
        status: 'failure',
        timestamp: new Date(),
      }

      const result = await emailServiceNoConfig.sendAlertEmail(alertData)

      expect(result).toBe(false)
      expect(mockTransporter.sendMail).not.toHaveBeenCalled()
    })

    it('should return false on send failure', async () => {
      const alertData = {
        to: 'user@example.com',
        endpointName: 'Test API',
        endpointUrl: 'https://api.example.com',
        status: 'failure',
        timestamp: new Date(),
      }

      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP error'))

      const result = await emailService.sendAlertEmail(alertData)

      expect(result).toBe(false)
    })

    it('should use EMAIL_USER as fallback for from address', async () => {
      delete process.env.EMAIL_FROM

      emailService = new EmailService()

      const alertData = {
        to: 'user@example.com',
        endpointName: 'Test API',
        endpointUrl: 'https://api.example.com',
        status: 'failure',
        timestamp: new Date(),
      }

      mockTransporter.sendMail.mockResolvedValue({ messageId: 'msg-123' })

      await emailService.sendAlertEmail(alertData)

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'test@example.com',
        })
      )
    })

    it('should handle optional fields correctly', async () => {
      const alertData = {
        to: 'user@example.com',
        endpointName: 'Test API',
        endpointUrl: 'https://api.example.com',
        status: 'failure',
        timestamp: new Date(),
      }

      mockTransporter.sendMail.mockResolvedValue({ messageId: 'msg-123' })

      const result = await emailService.sendAlertEmail(alertData)

      expect(result).toBe(true)
      const callArgs = mockTransporter.sendMail.mock.calls[0][0]
      expect(callArgs.html).not.toContain('Status Code:')
      expect(callArgs.html).not.toContain('Error:')
      expect(callArgs.html).not.toContain('Response Time:')
    })
  })

  describe('sendWebhookAlert', () => {
    beforeEach(() => {
      emailService = new EmailService()
    })

    it('should send webhook alert successfully', async () => {
      const webhookUrl = 'https://webhook.example.com/alerts'
      const alertData = {
        to: 'user@example.com',
        endpointName: 'Test API',
        endpointUrl: 'https://api.example.com',
        status: 'failure',
        statusCode: 500,
        errorMessage: 'Internal Server Error',
        responseTime: 1500,
        timestamp: new Date('2024-01-01T12:00:00Z'),
      }

      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
      } as Response)

      const result = await emailService.sendWebhookAlert(webhookUrl, alertData)

      expect(result).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'API-Monitor/1.0',
        },
        body: JSON.stringify({
          type: 'endpoint_failure',
          endpoint: {
            name: 'Test API',
            url: 'https://api.example.com',
          },
          status: 'failure',
          statusCode: 500,
          errorMessage: 'Internal Server Error',
          responseTime: 1500,
          timestamp: '2024-01-01T12:00:00.000Z',
        }),
      })
    })

    it('should return false when webhook returns non-ok response', async () => {
      const webhookUrl = 'https://webhook.example.com/alerts'
      const alertData = {
        to: 'user@example.com',
        endpointName: 'Test API',
        endpointUrl: 'https://api.example.com',
        status: 'failure',
        timestamp: new Date(),
      }

      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response)

      const result = await emailService.sendWebhookAlert(webhookUrl, alertData)

      expect(result).toBe(false)
    })

    it('should return false on fetch error', async () => {
      const webhookUrl = 'https://webhook.example.com/alerts'
      const alertData = {
        to: 'user@example.com',
        endpointName: 'Test API',
        endpointUrl: 'https://api.example.com',
        status: 'failure',
        timestamp: new Date(),
      }

      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockRejectedValue(new Error('Network error'))

      const result = await emailService.sendWebhookAlert(webhookUrl, alertData)

      expect(result).toBe(false)
    })

    it('should include all alert data in webhook payload', async () => {
      const webhookUrl = 'https://webhook.example.com/alerts'
      const alertData = {
        to: 'user@example.com',
        endpointName: 'Test API',
        endpointUrl: 'https://api.example.com',
        status: 'timeout',
        statusCode: 0,
        errorMessage: 'Request timeout',
        responseTime: 30000,
        timestamp: new Date('2024-01-01T12:00:00Z'),
      }

      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockResolvedValue({ ok: true } as Response)

      await emailService.sendWebhookAlert(webhookUrl, alertData)

      const fetchCall = mockFetch.mock.calls[0]
      const payload = JSON.parse(fetchCall[1].body)

      expect(payload).toEqual({
        type: 'endpoint_failure',
        endpoint: {
          name: 'Test API',
          url: 'https://api.example.com',
        },
        status: 'timeout',
        statusCode: 0,
        errorMessage: 'Request timeout',
        responseTime: 30000,
        timestamp: '2024-01-01T12:00:00.000Z',
      })
    })
  })

  describe('testConnection', () => {
    beforeEach(() => {
      emailService = new EmailService()
    })

    it('should return true when connection is verified', async () => {
      mockTransporter.verify.mockResolvedValue(true)

      const result = await emailService.testConnection()

      expect(result).toBe(true)
      expect(mockTransporter.verify).toHaveBeenCalled()
    })

    it('should return false when connection fails', async () => {
      mockTransporter.verify.mockRejectedValue(new Error('Connection failed'))

      const result = await emailService.testConnection()

      expect(result).toBe(false)
    })

    it('should return false when transporter is not initialized', async () => {
      delete process.env.EMAIL_HOST
      const emailServiceNoConfig = new EmailService()

      const result = await emailServiceNoConfig.testConnection()

      expect(result).toBe(false)
    })
  })
})
