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
import { ForbiddenError, NotFoundError } from "../../errors/custom-errors";
import { NotificationType } from "@/generated/prisma";
import { emailService } from "../shared/email.service";
import { logger, logInfo, logError } from "@/lib/logger";
import { Context } from "@/server/trpc";

export class NotificationChannelService {
  constructor(
    private readonly notificationChannelRepository: NotificationChannelRepository,
  ) {}

  async createNotificationChannel({
    input,
    ctx,
  }: {
    input: CreateNotificationChannelInput;
    ctx: Context;
  }) {
    const { organizationId } = ctx;
    if (!organizationId) {
      throw new ForbiddenError("Organization context is required");
    }
    if (input.organizationId !== organizationId) {
      throw new ForbiddenError("Organization access denied");
    }

    // Validate config JSON
    try {
      JSON.parse(input.config);
    } catch {
      throw new Error("Invalid configuration JSON");
    }

    return this.notificationChannelRepository.create({
      organizationId,
      name: input.name,
      type: input.type,
      config: input.config,
    });
  }

  async updateNotificationChannel({
    input,
    ctx,
  }: {
    input: UpdateNotificationChannelInput;
    ctx: Context;
  }) {
    const { organizationId } = ctx;
    if (!organizationId) {
      throw new ForbiddenError("Organization context is required");
    }
    if (input.organizationId !== organizationId) {
      throw new ForbiddenError("Organization access denied");
    }

    const existing = await this.notificationChannelRepository.findById(
      input.id,
      organizationId,
    );

    if (!existing) {
      throw new NotFoundError("NotificationChannel", input.id);
    }

    // Validate config JSON if provided
    if (input.config) {
      try {
        JSON.parse(input.config);
      } catch {
        throw new Error("Invalid configuration JSON");
      }
    }

    await this.notificationChannelRepository.update(
      input.id,
      organizationId,
      {
        name: input.name,
        config: input.config,
        isActive: input.isActive,
      },
    );

    return this.notificationChannelRepository.findById(
      input.id,
      organizationId,
    );
  }

  async deleteNotificationChannel({
    input,
    ctx,
  }: {
    input: DeleteNotificationChannelInput;
    ctx: Context;
  }) {
    const { organizationId } = ctx;
    if (!organizationId) {
      throw new ForbiddenError("Organization context is required");
    }
    if (input.organizationId !== organizationId) {
      throw new ForbiddenError("Organization access denied");
    }

    const existing = await this.notificationChannelRepository.findById(
      input.id,
      organizationId,
    );

    if (!existing) {
      throw new NotFoundError("NotificationChannel", input.id);
    }

    await this.notificationChannelRepository.delete(
      input.id,
      organizationId,
    );

    return { success: true };
  }

  async getNotificationChannels({
    input,
    ctx,
  }: {
    input: GetNotificationChannelsInput;
    ctx: Context;
  }) {
    const { organizationId } = ctx;
    if (!organizationId) {
      throw new ForbiddenError("Organization context is required");
    }
    if (input.organizationId !== organizationId) {
      throw new ForbiddenError("Organization access denied");
    }

    return this.notificationChannelRepository.findByOrganizationId(
      organizationId,
    );
  }

  async getNotificationChannel({
    input,
    ctx,
  }: {
    input: GetNotificationChannelInput;
    ctx: Context;
  }) {
    const { organizationId } = ctx;
    if (!organizationId) {
      throw new ForbiddenError("Organization context is required");
    }
    if (input.organizationId !== organizationId) {
      throw new ForbiddenError("Organization access denied");
    }

    const channel = await this.notificationChannelRepository.findById(
      input.id,
      organizationId,
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

    if (channels.length === 0) {
      logInfo("No active notification channels configured for organization", {
        organizationId,
        endpoint: alertData.endpointName,
        message: "Alerts are triggered but no channels are set up to receive notifications",
      });
      return {
        total: 0,
        success: 0,
        failed: 0,
      };
    }

    logInfo("Sending notifications", {
      organizationId,
      channelCount: channels.length,
      channels: channels.map(c => ({ id: c.id, name: c.name, type: c.type })),
      endpoint: alertData.endpointName,
    });

    const results = await Promise.allSettled(
      channels.map((channel) => this.sendNotification(channel, alertData)),
    );

    const successCount = results.filter(
      (r) => r.status === "fulfilled" && r.value,
    ).length;
    const failureCount = results.length - successCount;

    // Log detailed results
    results.forEach((result, index) => {
      const channel = channels[index];
      if (result.status === "fulfilled") {
        if (result.value) {
          logInfo("Notification sent successfully", {
            channelId: channel.id,
            channelName: channel.name,
            channelType: channel.type,
            organizationId,
          });
        } else {
          logError("Notification failed to send", new Error("Send returned false"), {
            channelId: channel.id,
            channelName: channel.name,
            channelType: channel.type,
            organizationId,
          });
        }
      } else {
        logError("Notification promise rejected", result.reason, {
          channelId: channel.id,
          channelName: channel.name,
          channelType: channel.type,
          organizationId,
        });
      }
    });

    logInfo("Notifications sent - summary", {
      organizationId,
      success: successCount,
      failed: failureCount,
      total: channels.length,
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
      logInfo("Attempting to send notification", {
        channelId: channel.id,
        channelName: channel.name,
        channelType: channel.type,
        endpoint: alertData.endpointName,
      });

      const config = JSON.parse(channel.config);

      let result = false;
      switch (channel.type) {
        case NotificationType.EMAIL:
          result = await this.sendEmailNotification(config as EmailConfig, alertData);
          break;

        case NotificationType.WEBHOOK:
          result = await this.sendWebhookNotification(
            config as WebhookConfig,
            alertData,
          );
          break;

        case NotificationType.SLACK:
          result = await this.sendSlackNotification(config as SlackConfig, alertData);
          break;

        case NotificationType.DISCORD:
          result = await this.sendDiscordNotification(
            config as DiscordConfig,
            alertData,
          );
          break;

        default:
          logger.warn("Unknown notification type", {
            channelId: channel.id,
            type: channel.type,
          });
          return false;
      }

      logInfo(`Notification ${result ? 'succeeded' : 'failed'}`, {
        channelId: channel.id,
        channelName: channel.name,
        channelType: channel.type,
        result,
      });

      return result;
    } catch (error) {
      logError(
        `Failed to send notification via channel ${channel.name}`,
        error,
        {
          channelId: channel.id,
          channelName: channel.name,
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
    logInfo("Sending email notifications", {
      recipientCount: config.emails.length,
      recipients: config.emails,
    });

    const results = await Promise.allSettled(
      config.emails.map((email) =>
        emailService.sendAlertEmail({
          to: email,
          ...alertData,
        }),
      ),
    );

    const successCount = results.filter(
      (r) => r.status === "fulfilled" && r.value,
    ).length;

    logInfo("Email notifications completed", {
      total: config.emails.length,
      success: successCount,
      failed: config.emails.length - successCount,
    });

    return results.some((r) => r.status === "fulfilled" && r.value);
  }

  private async sendWebhookNotification(
    config: WebhookConfig,
    alertData: any,
  ): Promise<boolean> {
    try {
      logInfo("Sending webhook notification", {
        webhookUrl: config.url,
      });

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

      logInfo("Webhook notification response", {
        webhookUrl: config.url,
        statusCode: response.status,
        ok: response.ok,
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
      logInfo("Sending Slack notification", {
        webhookUrl: config.webhookUrl.substring(0, 50) + "...",
      });

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

      logInfo("Slack notification response", {
        statusCode: response.status,
        ok: response.ok,
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
      logInfo("Sending Discord notification", {
        webhookUrl: config.webhookUrl.substring(0, 50) + "...",
      });

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

      logInfo("Discord notification response", {
        statusCode: response.status,
        ok: response.ok,
      });

      return response.ok;
    } catch (error) {
      logError("Discord notification failed", error);
      return false;
    }
  }
}
