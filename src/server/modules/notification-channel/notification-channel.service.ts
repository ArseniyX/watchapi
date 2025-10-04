import { NotificationChannelRepository } from "./notification-channel.repository";
import {
  CreateNotificationChannelInput,
  UpdateNotificationChannelInput,
  DeleteNotificationChannelInput,
  GetNotificationChannelsInput,
  GetNotificationChannelInput,
  EmailConfig,
  WebhookConfig,
  SlackConfig,
  DiscordConfig,
} from "./notification-channel.schema";
import { NotFoundError } from "../../errors/custom-errors";
import { NotificationType } from "@/generated/prisma";
import { emailService } from "../shared/email.service";
import { logger, logInfo, logError } from "@/lib/logger";

export class NotificationChannelService {
  constructor(
    private readonly notificationChannelRepository: NotificationChannelRepository,
  ) {}

  async createNotificationChannel(input: CreateNotificationChannelInput) {
    // Validate config JSON
    try {
      JSON.parse(input.config);
    } catch (error) {
      throw new Error("Invalid configuration JSON");
    }

    return this.notificationChannelRepository.create({
      organizationId: input.organizationId,
      name: input.name,
      type: input.type,
      config: input.config,
    });
  }

  async updateNotificationChannel(input: UpdateNotificationChannelInput) {
    const existing = await this.notificationChannelRepository.findById(
      input.id,
      input.organizationId,
    );

    if (!existing) {
      throw new NotFoundError("NotificationChannel", input.id);
    }

    // Validate config JSON if provided
    if (input.config) {
      try {
        JSON.parse(input.config);
      } catch (error) {
        throw new Error("Invalid configuration JSON");
      }
    }

    await this.notificationChannelRepository.update(
      input.id,
      input.organizationId,
      {
        name: input.name,
        config: input.config,
        isActive: input.isActive,
      },
    );

    return this.notificationChannelRepository.findById(
      input.id,
      input.organizationId,
    );
  }

  async deleteNotificationChannel(input: DeleteNotificationChannelInput) {
    const existing = await this.notificationChannelRepository.findById(
      input.id,
      input.organizationId,
    );

    if (!existing) {
      throw new NotFoundError("NotificationChannel", input.id);
    }

    await this.notificationChannelRepository.delete(
      input.id,
      input.organizationId,
    );

    return { success: true };
  }

  async getNotificationChannels(input: GetNotificationChannelsInput) {
    return this.notificationChannelRepository.findByOrganizationId(
      input.organizationId,
    );
  }

  async getNotificationChannel(input: GetNotificationChannelInput) {
    const channel = await this.notificationChannelRepository.findById(
      input.id,
      input.organizationId,
    );

    if (!channel) {
      throw new NotFoundError("NotificationChannel", input.id);
    }

    return channel;
  }

  async sendNotifications(
    organizationId: string,
    alertData: {
      endpointName: string;
      endpointUrl: string;
      status: string;
      statusCode?: number;
      errorMessage?: string;
      responseTime?: number;
      timestamp: Date;
    },
  ) {
    const channels =
      await this.notificationChannelRepository.findActiveByOrganizationId(
        organizationId,
      );

    logInfo("Sending notifications", {
      organizationId,
      channelCount: channels.length,
      endpoint: alertData.endpointName,
    });

    const results = await Promise.allSettled(
      channels.map((channel) => this.sendNotification(channel, alertData)),
    );

    const successCount = results.filter(
      (r) => r.status === "fulfilled" && r.value,
    ).length;
    const failureCount = results.length - successCount;

    logInfo("Notifications sent", {
      organizationId,
      success: successCount,
      failed: failureCount,
    });

    return {
      total: channels.length,
      success: successCount,
      failed: failureCount,
    };
  }

  private async sendNotification(
    channel: {
      id: string;
      type: string;
      config: string;
      name: string;
    },
    alertData: {
      endpointName: string;
      endpointUrl: string;
      status: string;
      statusCode?: number;
      errorMessage?: string;
      responseTime?: number;
      timestamp: Date;
    },
  ): Promise<boolean> {
    try {
      const config = JSON.parse(channel.config);

      switch (channel.type) {
        case NotificationType.EMAIL:
          return this.sendEmailNotification(config as EmailConfig, alertData);

        case NotificationType.WEBHOOK:
          return this.sendWebhookNotification(
            config as WebhookConfig,
            alertData,
          );

        case NotificationType.SLACK:
          return this.sendSlackNotification(config as SlackConfig, alertData);

        case NotificationType.DISCORD:
          return this.sendDiscordNotification(
            config as DiscordConfig,
            alertData,
          );

        default:
          logger.warn("Unknown notification type", {
            channelId: channel.id,
            type: channel.type,
          });
          return false;
      }
    } catch (error) {
      logError(
        `Failed to send notification via channel ${channel.name}`,
        error,
        {
          channelId: channel.id,
          type: channel.type,
        },
      );
      return false;
    }
  }

  private async sendEmailNotification(
    config: EmailConfig,
    alertData: any,
  ): Promise<boolean> {
    const results = await Promise.allSettled(
      config.emails.map((email) =>
        emailService.sendAlertEmail({
          to: email,
          ...alertData,
        }),
      ),
    );

    return results.some((r) => r.status === "fulfilled" && r.value);
  }

  private async sendWebhookNotification(
    config: WebhookConfig,
    alertData: any,
  ): Promise<boolean> {
    try {
      const response = await fetch(config.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...config.headers,
        },
        body: JSON.stringify({
          type: "endpoint_failure",
          endpoint: {
            name: alertData.endpointName,
            url: alertData.endpointUrl,
          },
          status: alertData.status,
          statusCode: alertData.statusCode,
          errorMessage: alertData.errorMessage,
          responseTime: alertData.responseTime,
          timestamp: alertData.timestamp.toISOString(),
        }),
      });

      return response.ok;
    } catch (error) {
      logError("Webhook notification failed", error, {
        webhookUrl: config.url,
      });
      return false;
    }
  }

  private async sendSlackNotification(
    config: SlackConfig,
    alertData: any,
  ): Promise<boolean> {
    try {
      const statusEmoji =
        alertData.status === "TIMEOUT"
          ? ":clock:"
          : alertData.status === "ERROR"
            ? ":x:"
            : ":warning:";

      const response = await fetch(config.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: `${statusEmoji} API Endpoint Alert`,
          blocks: [
            {
              type: "header",
              text: {
                type: "plain_text",
                text: `${statusEmoji} API Endpoint Alert`,
              },
            },
            {
              type: "section",
              fields: [
                {
                  type: "mrkdwn",
                  text: `*Endpoint:*\n${alertData.endpointName}`,
                },
                {
                  type: "mrkdwn",
                  text: `*Status:*\n${alertData.status}`,
                },
                {
                  type: "mrkdwn",
                  text: `*URL:*\n${alertData.endpointUrl}`,
                },
                {
                  type: "mrkdwn",
                  text: `*Status Code:*\n${alertData.statusCode || "N/A"}`,
                },
              ],
            },
            ...(alertData.errorMessage
              ? [
                  {
                    type: "section",
                    text: {
                      type: "mrkdwn",
                      text: `*Error:*\n\`\`\`${alertData.errorMessage}\`\`\``,
                    },
                  },
                ]
              : []),
            {
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: `Response time: ${alertData.responseTime || "N/A"}ms | ${alertData.timestamp.toLocaleString()}`,
                },
              ],
            },
          ],
        }),
      });

      return response.ok;
    } catch (error) {
      logError("Slack notification failed", error);
      return false;
    }
  }

  private async sendDiscordNotification(
    config: DiscordConfig,
    alertData: any,
  ): Promise<boolean> {
    try {
      const color =
        alertData.status === "TIMEOUT"
          ? 0xffa500
          : alertData.status === "ERROR"
            ? 0xff0000
            : 0xff6b6b;

      const response = await fetch(config.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          embeds: [
            {
              title: "🚨 API Endpoint Alert",
              color,
              fields: [
                {
                  name: "Endpoint",
                  value: alertData.endpointName,
                  inline: true,
                },
                {
                  name: "Status",
                  value: alertData.status,
                  inline: true,
                },
                {
                  name: "URL",
                  value: alertData.endpointUrl,
                  inline: false,
                },
                {
                  name: "Status Code",
                  value: String(alertData.statusCode || "N/A"),
                  inline: true,
                },
                {
                  name: "Response Time",
                  value: `${alertData.responseTime || "N/A"}ms`,
                  inline: true,
                },
                ...(alertData.errorMessage
                  ? [
                      {
                        name: "Error",
                        value: `\`\`\`${alertData.errorMessage}\`\`\``,
                        inline: false,
                      },
                    ]
                  : []),
              ],
              timestamp: alertData.timestamp.toISOString(),
            },
          ],
        }),
      });

      return response.ok;
    } catch (error) {
      logError("Discord notification failed", error);
      return false;
    }
  }
}
