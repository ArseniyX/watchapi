import { BaseRepository } from "../shared/base.repository";
import {
  Alert,
  AlertTrigger,
  AlertNotification,
  Prisma,
} from "@/generated/prisma";

export class AlertRepository extends BaseRepository {
  async create(data: Prisma.AlertCreateInput): Promise<Alert> {
    return this.prisma.alert.create({ data });
  }

  async findById(id: string) {
    return this.prisma.alert.findUnique({
      where: { id },
      include: {
        notifications: true,
        apiEndpoint: {
          select: {
            id: true,
            name: true,
            url: true,
            organizationId: true,
          },
        },
      },
    });
  }

  async findByApiEndpoint(apiEndpointId: string): Promise<Alert[]> {
    return this.prisma.alert.findMany({
      where: { apiEndpointId },
      include: {
        notifications: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findActiveByApiEndpoint(apiEndpointId: string): Promise<Alert[]> {
    return this.prisma.alert.findMany({
      where: {
        apiEndpointId,
        isActive: true,
      },
      include: {
        notifications: {
          where: { isActive: true },
        },
      },
    });
  }

  async findByOrganization(organizationId: string): Promise<Alert[]> {
    return this.prisma.alert.findMany({
      where: {
        apiEndpoint: {
          organizationId,
        },
      },
      include: {
        notifications: true,
        apiEndpoint: {
          select: {
            id: true,
            name: true,
            url: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(id: string, data: Prisma.AlertUpdateInput): Promise<Alert> {
    return this.prisma.alert.update({
      where: { id },
      data,
      include: {
        notifications: true,
      },
    });
  }

  async delete(id: string): Promise<Alert> {
    return this.prisma.alert.delete({ where: { id } });
  }

  // Alert Trigger operations
  async createTrigger(
    data: Prisma.AlertTriggerCreateInput,
  ): Promise<AlertTrigger> {
    return this.prisma.alertTrigger.create({ data });
  }

  async findTriggersByAlert(
    alertId: string,
    limit: number = 50,
  ): Promise<AlertTrigger[]> {
    return this.prisma.alertTrigger.findMany({
      where: { alertId },
      orderBy: { triggeredAt: "desc" },
      take: limit,
    });
  }

  // Alert Notification operations
  async createNotification(
    data: Prisma.AlertNotificationCreateInput,
  ): Promise<AlertNotification> {
    return this.prisma.alertNotification.create({ data });
  }

  async findNotificationById(id: string) {
    return this.prisma.alertNotification.findUnique({
      where: { id },
      include: {
        alert: {
          include: {
            apiEndpoint: {
              select: { organizationId: true },
            },
          },
        },
      },
    });
  }

  async deleteNotification(id: string): Promise<AlertNotification> {
    return this.prisma.alertNotification.delete({ where: { id } });
  }

  async updateLastTriggered(alertId: string): Promise<void> {
    await this.prisma.alert.update({
      where: { id: alertId },
      data: { lastTriggered: new Date() },
    });
  }
}
