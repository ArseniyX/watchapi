import { PrismaClient } from "@/generated/prisma";
import { CreateNotificationChannelInput } from "./notification-channel.schema";

export class NotificationChannelRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByOrganizationId(organizationId: string) {
    return this.prisma.notificationChannel.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findActiveByOrganizationId(organizationId: string) {
    return this.prisma.notificationChannel.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string, organizationId: string) {
    return this.prisma.notificationChannel.findFirst({
      where: {
        id,
        organizationId,
      },
    });
  }

  async create(data: CreateNotificationChannelInput) {
    return this.prisma.notificationChannel.create({
      data,
    });
  }

  async update(
    id: string,
    organizationId: string,
    data: {
      name?: string;
      config?: string;
      isActive?: boolean;
    },
  ) {
    return this.prisma.notificationChannel.updateMany({
      where: {
        id,
        organizationId,
      },
      data,
    });
  }

  async delete(id: string, organizationId: string) {
    return this.prisma.notificationChannel.deleteMany({
      where: {
        id,
        organizationId,
      },
    });
  }
}
