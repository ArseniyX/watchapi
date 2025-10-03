import { PrismaClient, Organization, OrganizationMember, OrganizationInvitation, OrganizationRole, MemberStatus } from '../../../generated/prisma'

export class OrganizationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // Organization CRUD
  async createOrganization(data: { name: string; slug: string; description?: string }) {
    return this.prisma.organization.create({
      data,
    })
  }

  async findOrganizationById(id: string) {
    return this.prisma.organization.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    })
  }

  async findOrganizationBySlug(slug: string) {
    return this.prisma.organization.findUnique({
      where: { slug },
      include: {
        members: true,
      },
    })
  }

  async findUserOrganizations(userId: string) {
    const memberships = await this.prisma.organizationMember.findMany({
      where: { userId },
      include: {
        organization: true,
      },
    })

    return memberships.map(m => ({
      ...m.organization,
      role: m.role,
      status: m.status,
      joinedAt: m.joinedAt,
    }))
  }

  async updateOrganization(id: string, data: { name?: string; description?: string }) {
    return this.prisma.organization.update({
      where: { id },
      data,
    })
  }

  async deleteOrganization(id: string) {
    await this.prisma.organization.delete({
      where: { id },
    })
  }

  // Member management
  async addMember(data: {
    userId: string
    organizationId: string
    role: OrganizationRole
    status?: MemberStatus
    invitedBy?: string
  }) {
    return this.prisma.organizationMember.create({
      data,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    })
  }

  async findOrganizationMembers(organizationId: string) {
    return this.prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { joinedAt: 'desc' },
    })
  }

  async findMember(userId: string, organizationId: string) {
    return this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    })
  }

  async updateMemberRole(userId: string, organizationId: string, role: OrganizationRole) {
    return this.prisma.organizationMember.update({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
      data: { role },
    })
  }

  async updateMemberStatus(userId: string, organizationId: string, status: MemberStatus) {
    return this.prisma.organizationMember.update({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
      data: { status },
    })
  }

  async removeMember(userId: string, organizationId: string) {
    await this.prisma.organizationMember.delete({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    })
  }

  // Invitations
  async createInvitation(data: {
    email: string
    organizationId: string
    role: OrganizationRole
    invitedBy: string
    token: string
    expiresAt: Date
  }) {
    return this.prisma.organizationInvitation.create({
      data,
    })
  }

  async findInvitationByToken(token: string) {
    return this.prisma.organizationInvitation.findUnique({
      where: { token },
    })
  }

  async findOrganizationInvitations(organizationId: string) {
    return this.prisma.organizationInvitation.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async deleteInvitation(id: string) {
    await this.prisma.organizationInvitation.delete({
      where: { id },
    })
  }

  async deleteExpiredInvitations() {
    const result = await this.prisma.organizationInvitation.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    })
    return result.count
  }

  // User lookup
  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true },
    })
  }

  async findUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true },
    })
  }
}
