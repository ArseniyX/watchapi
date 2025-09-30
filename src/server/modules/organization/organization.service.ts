import { OrganizationRole, MemberStatus } from '../../../generated/prisma'
import { OrganizationRepository } from './organization.repository'
import crypto from 'crypto'

export class OrganizationService {
  constructor(private readonly organizationRepository: OrganizationRepository) {}

  async createOrganization(userId: string, data: { name: string; slug: string; description?: string }) {
    // Create organization
    const organization = await this.organizationRepository.createOrganization(data)

    // Add creator as owner
    await this.organizationRepository.addMember({
      userId,
      organizationId: organization.id,
      role: OrganizationRole.OWNER,
      status: MemberStatus.ACTIVE,
    })

    return organization
  }

  async getOrganization(id: string) {
    return this.organizationRepository.findOrganizationById(id)
  }

  async getUserOrganizations(userId: string) {
    return this.organizationRepository.findUserOrganizations(userId)
  }

  async updateOrganization(id: string, data: { name?: string; description?: string }) {
    return this.organizationRepository.updateOrganization(id, data)
  }

  async deleteOrganization(id: string) {
    return this.organizationRepository.deleteOrganization(id)
  }

  async getOrganizationMembers(organizationId: string) {
    return this.organizationRepository.findOrganizationMembers(organizationId)
  }

  async inviteMember(data: {
    email: string
    organizationId: string
    role: OrganizationRole
    invitedBy: string
  }) {
    // Check if user already exists
    const existingUser = await this.organizationRepository.findUserByEmail(data.email)

    if (existingUser) {
      // Check if already a member
      const existingMember = await this.organizationRepository.findMember(
        existingUser.id,
        data.organizationId
      )

      if (existingMember) {
        throw new Error('User is already a member of this organization')
      }

      // Add user directly as they already have an account
      return this.organizationRepository.addMember({
        userId: existingUser.id,
        organizationId: data.organizationId,
        role: data.role,
        status: MemberStatus.INVITED,
        invitedBy: data.invitedBy,
      })
    }

    // Create invitation for new user
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    return this.organizationRepository.createInvitation({
      email: data.email,
      organizationId: data.organizationId,
      role: data.role,
      invitedBy: data.invitedBy,
      token,
      expiresAt,
    })
  }

  async acceptInvitation(token: string, userId: string) {
    const invitation = await this.organizationRepository.findInvitationByToken(token)

    if (!invitation) {
      throw new Error('Invitation not found')
    }

    if (invitation.expiresAt < new Date()) {
      throw new Error('Invitation has expired')
    }

    // Add user as member
    const member = await this.organizationRepository.addMember({
      userId,
      organizationId: invitation.organizationId,
      role: invitation.role,
      status: MemberStatus.ACTIVE,
      invitedBy: invitation.invitedBy,
    })

    // Delete invitation
    await this.organizationRepository.deleteInvitation(invitation.id)

    return member
  }

  async updateMemberRole(userId: string, organizationId: string, role: OrganizationRole) {
    return this.organizationRepository.updateMemberRole(userId, organizationId, role)
  }

  async removeMember(userId: string, organizationId: string) {
    return this.organizationRepository.removeMember(userId, organizationId)
  }

  async getOrganizationInvitations(organizationId: string) {
    return this.organizationRepository.findOrganizationInvitations(organizationId)
  }

  async resendInvitation(invitationId: string) {
    // In a real app, this would send an email
    // For MVP, we just update the expiration date
    const invitation = await this.organizationRepository.findInvitationByToken(invitationId)

    if (!invitation) {
      throw new Error('Invitation not found')
    }

    // Extend expiration by 7 days
    const newToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    // Delete old and create new
    await this.organizationRepository.deleteInvitation(invitation.id)

    return this.organizationRepository.createInvitation({
      email: invitation.email,
      organizationId: invitation.organizationId,
      role: invitation.role,
      invitedBy: invitation.invitedBy,
      token: newToken,
      expiresAt,
    })
  }

  async checkMemberPermission(userId: string, organizationId: string, requiredRole: OrganizationRole) {
    const member = await this.organizationRepository.findMember(userId, organizationId)

    if (!member) {
      return false
    }

    // Owner has all permissions
    if (member.role === OrganizationRole.OWNER) {
      return true
    }

    // Admin has admin permissions
    if (requiredRole === OrganizationRole.ADMIN && member.role === OrganizationRole.ADMIN) {
      return true
    }

    // Member has member permissions
    if (requiredRole === OrganizationRole.MEMBER) {
      return true
    }

    return false
  }
}
