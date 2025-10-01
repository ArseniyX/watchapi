import nodemailer from 'nodemailer'

export interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

export interface AlertEmailData {
  to: string
  endpointName: string
  endpointUrl: string
  status: string
  statusCode?: number
  errorMessage?: string
  responseTime?: number
  timestamp: Date
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    this.initializeTransporter()
  }

  async sendWebhookAlert(webhookUrl: string, data: AlertEmailData): Promise<boolean> {
    try {
      const payload = {
        type: 'endpoint_failure',
        endpoint: {
          name: data.endpointName,
          url: data.endpointUrl,
        },
        status: data.status,
        statusCode: data.statusCode,
        errorMessage: data.errorMessage,
        responseTime: data.responseTime,
        timestamp: data.timestamp.toISOString(),
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'API-Monitor/1.0',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        console.log(`Webhook alert sent to ${webhookUrl}`)
        return true
      } else {
        console.error(`Webhook alert failed: ${response.status} ${response.statusText}`)
        return false
      }
    } catch (error) {
      console.error('Failed to send webhook alert:', error)
      return false
    }
  }

  private initializeTransporter() {
    // Check if email is configured
    const emailHost = process.env.EMAIL_HOST
    const emailPort = process.env.EMAIL_PORT
    const emailUser = process.env.EMAIL_USER
    const emailPass = process.env.EMAIL_PASS

    if (!emailHost || !emailUser || !emailPass) {
      console.warn('Email not configured. Set EMAIL_HOST, EMAIL_USER, EMAIL_PASS env variables to enable alerts.')
      return
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: emailHost,
        port: parseInt(emailPort || '587'),
        secure: emailPort === '465',
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      })
      console.log('Email service initialized')
    } catch (error) {
      console.error('Failed to initialize email service:', error)
    }
  }

  async sendAlertEmail(data: AlertEmailData): Promise<boolean> {
    if (!this.transporter) {
      console.log('[Email Alert - Not Sent] Email not configured')
      console.log(`Alert: ${data.endpointName} (${data.endpointUrl}) is ${data.status}`)
      if (data.errorMessage) console.log(`Error: ${data.errorMessage}`)
      return false
    }

    try {
      const subject = `🚨 Alert: ${data.endpointName} - ${data.status.toUpperCase()}`

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .detail { margin: 10px 0; padding: 10px; background: white; border-left: 3px solid #dc2626; }
            .label { font-weight: bold; color: #6b7280; }
            .value { color: #111827; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">⚠️ API Endpoint Alert</h2>
            </div>
            <div class="content">
              <p>Your API endpoint has failed a monitoring check:</p>

              <div class="detail">
                <div><span class="label">Endpoint:</span> <span class="value">${data.endpointName}</span></div>
                <div><span class="label">URL:</span> <span class="value">${data.endpointUrl}</span></div>
              </div>

              <div class="detail">
                <div><span class="label">Status:</span> <span class="value">${data.status.toUpperCase()}</span></div>
                ${data.statusCode ? `<div><span class="label">Status Code:</span> <span class="value">${data.statusCode}</span></div>` : ''}
                ${data.errorMessage ? `<div><span class="label">Error:</span> <span class="value">${data.errorMessage}</span></div>` : ''}
                ${data.responseTime ? `<div><span class="label">Response Time:</span> <span class="value">${data.responseTime}ms</span></div>` : ''}
              </div>

              <div class="detail">
                <div><span class="label">Timestamp:</span> <span class="value">${data.timestamp.toLocaleString()}</span></div>
              </div>

              <p style="margin-top: 20px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/app/monitoring"
                   style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  View Monitoring Dashboard
                </a>
              </p>
            </div>
            <div class="footer">
              <p>This is an automated alert from your API Monitoring system.</p>
            </div>
          </div>
        </body>
        </html>
      `

      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: data.to,
        subject,
        html,
      })

      console.log(`Alert email sent to ${data.to} for endpoint: ${data.endpointName}`)
      return true
    } catch (error) {
      console.error('Failed to send alert email:', error)
      return false
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false
    }

    try {
      await this.transporter.verify()
      console.log('Email connection verified')
      return true
    } catch (error) {
      console.error('Email connection failed:', error)
      return false
    }
  }
}

export const emailService = new EmailService()
