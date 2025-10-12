import { AlertRepository } from "./alert.repository";
import { ApiEndpointRepository } from "../api-endpoint/api-endpoint.repository";
import { MonitoringRepository } from "../monitoring/monitoring.repository";
import { NotificationChannelService } from "../notification-channel/notification-channel.service";
import {
  CreateAlertInput,
  UpdateAlertInput,
  CreateAlertNotificationInput,
  UpdateAlertPayload,
  GetAlertInput,
  GetAlertsByEndpointInput,
  DeleteAlertInput,
  DeleteAlertNotificationInput,
  GetAlertTriggersInput,
} from "./alert.schema";
import {
  NotFoundError,
  ForbiddenError,
  TooManyRequestsError,
} from "../../errors/custom-errors";
import { AlertCondition, CheckStatus, PlanType } from "@/generated/prisma";
import { logger, logInfo, logError } from "@/lib/logger";
import { getPlanLimits, isUnlimited } from "../../config/plan-limits";
import { Context } from "@/server/trpc";

export interface AlertEvaluationContext {
  apiEndpointId: string;
  status: CheckStatus;
  responseTime?: number;
  statusCode?: number;
  errorMessage?: string;
}

export class AlertService {
  // Track last alert time per alert to prevent spam
  private lastAlertTime: Map<string, number> = new Map();
  private readonly ALERT_THROTTLE_MS = 60 * 60 * 1000; // 1 hour

  constructor(
    private readonly alertRepository: AlertRepository,
    private readonly apiEndpointRepository: ApiEndpointRepository,
    private readonly monitoringRepository: MonitoringRepository,
    private readonly notificationChannelService: NotificationChannelService,
  ) {}

  async createAlert({ input, ctx }: { input: CreateAlertInput; ctx: Context }) {
    const organizationId = ctx.organizationId;
    const userId = ctx.user?.id;
    const userPlan = ctx.organizationPlan || PlanType.FREE;

    // Verify endpoint exists and user has access
    const endpoint = await this.apiEndpointRepository.findById(
      input.apiEndpointId,
      organizationId,
    );
    if (!endpoint) {
      throw new ForbiddenError("API endpoint not found or access denied");
    }

    // Check plan limits for alerts
    const limits = getPlanLimits(userPlan);
    const currentAlerts = await this.alertRepository.findByOrganization(
      organizationId,
    );

    if (
      !isUnlimited(limits.maxAlerts) &&
      currentAlerts.length >= limits.maxAlerts
    ) {
      throw new TooManyRequestsError(
        `Plan limit reached. ${userPlan} plan allows maximum ${limits.maxAlerts} active monitors/alerts. Upgrade your plan to add more.`,
      );
    }

    return this.alertRepository.create({
      name: input.name,
      description: input.description,
      condition: input.condition,
      threshold: input.threshold,
      isActive: input.isActive,
      apiEndpoint: {
        connect: { id: input.apiEndpointId },
      },
      user: {
        connect: { id: userId },
      },
    });
  }

  async getAlert({ input, ctx }: { input: GetAlertInput; ctx: Context }) {
    const organizationId = ctx.organizationId;

    const alert = await this.alertRepository.findById(input.id);
    if (!alert) {
      throw new NotFoundError("Alert", input.id);
    }

    // Verify organization access via endpoint
    if (alert.apiEndpoint.organizationId !== organizationId) {
      throw new ForbiddenError("Alert not found or access denied");
    }

    return alert;
  }

  async getAlertsByEndpoint({
    input,
    ctx,
  }: {
    input: GetAlertsByEndpointInput;
    ctx: Context;
  }) {
    const organizationId = ctx.organizationId;

    // Verify endpoint access
    const endpoint = await this.apiEndpointRepository.findById(
      input.apiEndpointId,
      organizationId,
    );
    if (!endpoint) {
      throw new ForbiddenError("API endpoint not found or access denied");
    }

    return this.alertRepository.findByApiEndpoint(input.apiEndpointId);
  }

  async getAlertsByOrganization({ ctx }: { input?: void; ctx: Context }) {
    const organizationId = ctx.organizationId;

    return this.alertRepository.findByOrganization(organizationId);
  }

  async updateAlert({
    input,
    ctx,
  }: {
    input: UpdateAlertPayload;
    ctx: Context;
  }) {
    const { id, ...updateData } = input;

    // Verify alert exists and user has access
    await this.getAlert({ input, ctx });

    return this.alertRepository.update(id, updateData as UpdateAlertInput);
  }

  async deleteAlert({ input, ctx }: { input: DeleteAlertInput; ctx: Context }) {
    const organizationId = ctx.organizationId;

    // Verify alert exists and user has access
    await this.getAlert({ input: { id: input.id }, ctx });

    return this.alertRepository.delete(input.id);
  }

  // Alert Notification management
  async createAlertNotification({
    input,
    ctx,
  }: {
    input: CreateAlertNotificationInput;
    ctx: Context;
  }) {
    const organizationId = ctx.organizationId;

    // Verify alert exists and user has access
    await this.getAlert({ input: { id: input.alertId }, ctx });

    return this.alertRepository.createNotification({
      type: input.type,
      recipient: input.recipient,
      isActive: input.isActive,
      alert: {
        connect: { id: input.alertId },
      },
    });
  }

  async deleteAlertNotification({
    input,
    ctx,
  }: {
    input: DeleteAlertNotificationInput;
    ctx: Context;
  }) {
    const organizationId = ctx.organizationId;

    // Fetch notification to get alertId, then verify org access
    const notification = await this.alertRepository.findNotificationById(
      input.id,
    );

    if (!notification) {
      throw new NotFoundError("Alert notification", input.id);
    }

    // Verify organization access via alert -> endpoint
    if (notification.alert.apiEndpoint.organizationId !== organizationId) {
      throw new ForbiddenError("Alert notification not found or access denied");
    }

    return this.alertRepository.deleteNotification(input.id);
  }

  async getAlertTriggers({
    input,
    ctx,
  }: {
    input: GetAlertTriggersInput;
    ctx: Context;
  }) {
    const organizationId = ctx.organizationId;

    // Verify alert exists and user has access
    await this.getAlert({ input: { id: input.alertId }, ctx });

    return this.alertRepository.findTriggersByAlert(input.alertId, input.limit);
  }

  /**
   * Evaluate alerts for an API endpoint after a monitoring check
   * This is called by the monitoring service after each check
   */
  async evaluateAlerts(context: AlertEvaluationContext): Promise<void> {
    const alerts = await this.alertRepository.findActiveByApiEndpoint(
      context.apiEndpointId,
    );

    if (alerts.length === 0) {
      logInfo("No active alerts found for endpoint", {
        endpointId: context.apiEndpointId,
        checkStatus: context.status,
      });
      return;
    }

    logInfo("Evaluating alerts", {
      endpointId: context.apiEndpointId,
      alertCount: alerts.length,
      checkStatus: context.status,
      responseTime: context.responseTime,
      statusCode: context.statusCode,
    });

    for (const alert of alerts) {
      try {
        const shouldTrigger = await this.shouldTriggerAlert(alert, context);

        logInfo(`Alert evaluation result`, {
          alertId: alert.id,
          alertName: alert.name,
          condition: alert.condition,
          threshold: alert.threshold,
          shouldTrigger,
          currentValue: this.getTriggerValue(alert.condition, context),
        });

        if (shouldTrigger) {
          await this.triggerAlert(alert, context);
        }
      } catch (error) {
        logError(`Failed to evaluate alert ${alert.id}`, error, {
          alertId: alert.id,
          alertName: alert.name,
          endpointId: context.apiEndpointId,
        });
      }
    }
  }

  /**
   * Determine if an alert should be triggered based on its condition
   */
  private async shouldTriggerAlert(
    alert: any,
    context: AlertEvaluationContext,
  ): Promise<boolean> {
    switch (alert.condition) {
      case AlertCondition.RESPONSE_TIME_ABOVE:
        return (
          context.responseTime !== undefined &&
          context.responseTime > alert.threshold
        );

      case AlertCondition.RESPONSE_TIME_BELOW:
        return (
          context.responseTime !== undefined &&
          context.responseTime < alert.threshold
        );

      case AlertCondition.STATUS_CODE_NOT:
        return (
          context.statusCode !== undefined &&
          context.statusCode !== alert.threshold
        );

      case AlertCondition.UPTIME_BELOW:
        // Calculate uptime percentage for the endpoint
        const uptimeStats = await this.monitoringRepository.getUptimeStats(
          context.apiEndpointId,
          new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          new Date(),
        );
        return uptimeStats.uptimePercentage < alert.threshold;

      case AlertCondition.ERROR_RATE_ABOVE:
        // Calculate error rate for the endpoint
        // Fetch endpoint to get organizationId
        const endpoint = await this.apiEndpointRepository.findByIdInternal(
          context.apiEndpointId,
        );
        if (!endpoint) {
          return false;
        }
        const stats = await this.monitoringRepository.getOverallStats(
          endpoint.organizationId,
          new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          new Date(),
        );
        return stats.errorRate > alert.threshold;

      default:
        logger.warn("Unknown alert condition", {
          alertId: alert.id,
          condition: alert.condition,
        });
        return false;
    }
  }

  /**
   * Trigger an alert and send notifications
   */
  private async triggerAlert(
    alert: any,
    context: AlertEvaluationContext,
  ): Promise<void> {
    const now = Date.now();
    const lastAlert = this.lastAlertTime.get(alert.id);

    // Check if we should throttle (skip alert if sent within throttle period)
    if (lastAlert && now - lastAlert < this.ALERT_THROTTLE_MS) {
      const minutesSinceLastAlert = Math.floor((now - lastAlert) / 60000);
      const throttleMinutes = this.ALERT_THROTTLE_MS / 60000;
      logInfo("Alert throttled - skipping notification", {
        alertId: alert.id,
        alertName: alert.name,
        lastAlertMinutesAgo: minutesSinceLastAlert,
        throttlePeriodMinutes: throttleMinutes,
        nextAllowedInMinutes: throttleMinutes - minutesSinceLastAlert,
      });
      return;
    }

    // Get endpoint details for notification
    const endpoint = await this.apiEndpointRepository.findByIdInternal(
      context.apiEndpointId,
    );

    if (!endpoint) {
      throw new NotFoundError("API endpoint", context.apiEndpointId);
    }

    logInfo("Triggering alert - preparing to send notifications", {
      alertId: alert.id,
      alertName: alert.name,
      endpointId: context.apiEndpointId,
      endpointName: endpoint.name,
      organizationId: endpoint.organizationId,
      condition: alert.condition,
      threshold: alert.threshold,
      triggerValue: this.getTriggerValue(alert.condition, context),
    });

    // Record the alert trigger
    await this.alertRepository.createTrigger({
      value: this.getTriggerValue(alert.condition, context),
      alert: {
        connect: { id: alert.id },
      },
    });

    // Update last triggered timestamp
    await this.alertRepository.updateLastTriggered(alert.id);

    // Prepare notification data
    const notificationData = {
      alertName: alert.name,
      alertCondition: alert.condition,
      threshold: alert.threshold,
      endpointName: endpoint.name,
      endpointUrl: endpoint.url,
      status: context.status,
      statusCode: context.statusCode,
      errorMessage: context.errorMessage,
      responseTime: context.responseTime,
      timestamp: new Date(),
    };

    // Send notifications via organization's configured channels
    const notificationResult =
      await this.notificationChannelService.sendNotifications(
        endpoint.organizationId,
        notificationData,
      );

    logInfo("Alert triggered and notifications sent", {
      alertId: alert.id,
      alertName: alert.name,
      endpointId: context.apiEndpointId,
      endpointName: endpoint.name,
      organizationId: endpoint.organizationId,
      condition: alert.condition,
      triggerValue: this.getTriggerValue(alert.condition, context),
      notificationsSent: notificationResult.success,
      notificationsFailed: notificationResult.failed,
      totalChannels: notificationResult.total,
    });

    // Mark alert as sent for throttling
    this.lastAlertTime.set(alert.id, now);
  }

  /**
   * Get the value that triggered the alert
   */
  private getTriggerValue(
    condition: AlertCondition,
    context: AlertEvaluationContext,
  ): number {
    switch (condition) {
      case AlertCondition.RESPONSE_TIME_ABOVE:
      case AlertCondition.RESPONSE_TIME_BELOW:
        return context.responseTime || 0;

      case AlertCondition.STATUS_CODE_NOT:
        return context.statusCode || 0;

      case AlertCondition.UPTIME_BELOW:
      case AlertCondition.ERROR_RATE_ABOVE:
        // These are calculated asynchronously, return 0 for now
        // In production, you might want to calculate and pass this value
        return 0;

      default:
        return 0;
    }
  }
}
