import { prisma } from "@/server/database";
import { BaseRepository } from "../shared/base.repository";
import { NotificationChannel } from "@/generated/prisma";

export class NotificationChannelRepository extends BaseRepository<NotificationChannel> {
  constructor() {
    super(prisma.notificationChannel, "NotificationChannel");
  }

  async findByOrganizationId(organizationId: string) {
    return this.model.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findActiveByOrganizationId(organizationId: string) {
    return this.model.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string, organizationId: string) {
    return this.model.findFirst({
      where: {
        id,
        organizationId,
      },
    });
  }

  async create(data: {
    organizationId: string;
    name: string;
    type: string;
    config: string;
  }) {
    return this.model.create({
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
    }
  ) {
    return this.model.updateMany({
      where: {
        id,
        organizationId,
      },
      data,
    });
  }

  async delete(id: string, organizationId: string) {
    return this.model.deleteMany({
      where: {
        id,
        organizationId,
      },
    });
  }
}
