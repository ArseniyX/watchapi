import { OrganizationRole, MemberStatus } from "../../../generated/prisma";
import { OrganizationRepository } from "./organization.repository";
import {
  CreateOrganizationInput,
  UpdateOrganizationInput,
  AddMemberInput,
  UpdateMemberRoleInput,
  RemoveMemberInput,
} from "./organization.schema";
import crypto from "crypto";
import { emailService } from "../shared/email.service";

export class OrganizationService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async createOrganization(userId: string, data: CreateOrganizationInput) {
    // Generate slug from name if not provided
    const slug = data.slug || this.generateSlug(data.name);

    // Check if slug already exists
    const existing =
      await this.organizationRepository.findOrganizationBySlug(slug);
    if (existing) {
      throw new Error("An organization with this slug already exists");
    }

    // Create organization
    const organization = await this.organizationRepository.createOrganization({
      name: data.name,
      slug,
      description: data.description,
    });

    // Add creator as owner
    await this.organizationRepository.addMember({
      userId,
      organizationId: organization.id,
      role: OrganizationRole.OWNER,
      status: MemberStatus.ACTIVE,
    });

    return organization;
  }

  async getOrganization(userId: string, id: string) {
    // User must be a member of the organization to view it
    const member = await this.organizationRepository.findMember(userId, id);
    if (!member) {
      throw new Error("You do not have access to this organization");
    }
    return this.organizationRepository.findOrganizationById(id);
  }

  async getUserOrganizations(userId: string) {
    return this.organizationRepository.findUserOrganizations(userId);
  }

  async updateOrganization(
    userId: string,
    id: string,
    data: UpdateOrganizationInput,
  ) {
    // Check if user is owner or admin
    const hasPermission = await this.checkMemberPermission(
      userId,
      id,
      OrganizationRole.ADMIN,
    );
    if (!hasPermission) {
      throw new Error("You do not have permission to update this organization");
    }

    return this.organizationRepository.updateOrganization(id, data);
  }

  async deleteOrganization(userId: string, id: string) {
    // Only owners can delete organizations
    const member = await this.organizationRepository.findMember(userId, id);
    if (!member || member.role !== OrganizationRole.OWNER) {
      throw new Error("Only organization owners can delete organizations");
    }

    return this.organizationRepository.deleteOrganization(id);
  }

  async getOrganizationMembers(userId: string, organizationId: string) {
    // User must be a member of the organization to view members
    const member = await this.organizationRepository.findMember(
      userId,
      organizationId,
    );
    if (!member) {
      throw new Error("You do not have access to this organization");
    }
    return this.organizationRepository.findOrganizationMembers(organizationId);
  }

  async inviteMember(data: {
    email: string;
    organizationId: string;
    role: OrganizationRole;
    invitedBy: string;
  }) {
    // Check if inviter has permission (must be admin or owner)
    const hasPermission = await this.checkMemberPermission(
      data.invitedBy,
      data.organizationId,
      OrganizationRole.ADMIN,
    );
    if (!hasPermission) {
      throw new Error(
        "You do not have permission to invite members to this organization",
      );
    }

    // Get organization and inviter details
    const organization = await this.organizationRepository.findOrganizationById(
      data.organizationId,
    );
    const inviter = await this.organizationRepository.findUserById(
      data.invitedBy,
    );

    if (!organization) {
      throw new Error("Organization not found");
    }

    if (!inviter) {
      throw new Error("Inviter not found");
    }

    // Check if user already exists
    const existingUser = await this.organizationRepository.findUserByEmail(
      data.email,
    );

    if (existingUser) {
      // Check if already a member
      const existingMember = await this.organizationRepository.findMember(
        existingUser.id,
        data.organizationId,
      );

      if (existingMember) {
        throw new Error("User is already a member of this organization");
      }

      // Add user directly as they already have an account
      // Set status to ACTIVE since they already have an account
      const member = await this.organizationRepository.addMember({
        userId: existingUser.id,
        organizationId: data.organizationId,
        role: data.role,
        status: MemberStatus.ACTIVE,
        invitedBy: data.invitedBy,
      });

      // Send invitation email
      const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/app?org=${data.organizationId}`;
      await emailService.sendInvitationEmail({
        to: data.email,
        organizationName: organization.name,
        inviterName: inviter.name || inviter.email,
        inviterEmail: inviter.email,
        role: data.role,
        invitationUrl,
      });

      return member;
    }

    // Create invitation for new user
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await this.organizationRepository.createInvitation({
      email: data.email,
      organizationId: data.organizationId,
      role: data.role,
      invitedBy: data.invitedBy,
      token,
      expiresAt,
    });

    // Send invitation email with signup link
    const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/signup?invitation=${token}`;
    await emailService.sendInvitationEmail({
      to: data.email,
      organizationName: organization.name,
      inviterName: inviter.name || inviter.email,
      inviterEmail: inviter.email,
      role: data.role,
      invitationUrl,
    });

    return invitation;
  }

  async acceptInvitation(token: string, userId: string) {
    const invitation =
      await this.organizationRepository.findInvitationByToken(token);

    if (!invitation) {
      throw new Error("Invitation not found");
    }

    if (invitation.expiresAt < new Date()) {
      throw new Error("Invitation has expired");
    }

    // Add user as member
    const member = await this.organizationRepository.addMember({
      userId,
      organizationId: invitation.organizationId,
      role: invitation.role,
      status: MemberStatus.ACTIVE,
      invitedBy: invitation.invitedBy,
    });

    // Delete invitation
    await this.organizationRepository.deleteInvitation(invitation.id);

    return member;
  }

  async updateMemberRole(
    requestorId: string,
    userId: string,
    organizationId: string,
    role: OrganizationRole,
  ) {
    // Check if requestor has permission (must be admin or owner)
    const hasPermission = await this.checkMemberPermission(
      requestorId,
      organizationId,
      OrganizationRole.ADMIN,
    );
    if (!hasPermission) {
      throw new Error("You do not have permission to update member roles");
    }

    // Cannot change owner role
    const targetMember = await this.organizationRepository.findMember(
      userId,
      organizationId,
    );
    if (targetMember?.role === OrganizationRole.OWNER) {
      throw new Error("Cannot change the role of an organization owner");
    }

    return this.organizationRepository.updateMemberRole(
      userId,
      organizationId,
      role,
    );
  }

  async removeMember(
    requestorId: string,
    userId: string,
    organizationId: string,
  ) {
    // Check if requestor has permission (must be admin or owner)
    const hasPermission = await this.checkMemberPermission(
      requestorId,
      organizationId,
      OrganizationRole.ADMIN,
    );
    if (!hasPermission) {
      throw new Error("You do not have permission to remove members");
    }

    // Cannot remove owner
    const targetMember = await this.organizationRepository.findMember(
      userId,
      organizationId,
    );
    if (targetMember?.role === OrganizationRole.OWNER) {
      throw new Error("Cannot remove an organization owner");
    }

    return this.organizationRepository.removeMember(userId, organizationId);
  }

  async getOrganizationInvitations(userId: string, organizationId: string) {
    // Only admins and owners can view invitations
    const hasPermission = await this.checkMemberPermission(
      userId,
      organizationId,
      OrganizationRole.ADMIN,
    );
    if (!hasPermission) {
      throw new Error(
        "You do not have permission to view invitations for this organization",
      );
    }
    return this.organizationRepository.findOrganizationInvitations(
      organizationId,
    );
  }

  async resendInvitation(invitationId: string) {
    const invitation =
      await this.organizationRepository.findInvitationById(invitationId);

    if (!invitation) {
      throw new Error("Invitation not found");
    }

    // Get organization and inviter details
    const organization = await this.organizationRepository.findOrganizationById(
      invitation.organizationId,
    );
    const inviter = await this.organizationRepository.findUserById(
      invitation.invitedBy,
    );

    if (!organization || !inviter) {
      throw new Error("Organization or inviter not found");
    }

    // Extend expiration by 7 days
    const newToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Delete old and create new
    await this.organizationRepository.deleteInvitation(invitation.id);

    const newInvitation = await this.organizationRepository.createInvitation({
      email: invitation.email,
      organizationId: invitation.organizationId,
      role: invitation.role,
      invitedBy: invitation.invitedBy,
      token: newToken,
      expiresAt,
    });

    // Send invitation email
    const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/signup?invitation=${newToken}`;
    await emailService.sendInvitationEmail({
      to: invitation.email,
      organizationName: organization.name,
      inviterName: inviter.name || inviter.email,
      inviterEmail: inviter.email,
      role: invitation.role,
      invitationUrl,
    });

    return newInvitation;
  }

  async checkMemberPermission(
    userId: string,
    organizationId: string,
    requiredRole: OrganizationRole,
  ) {
    const member = await this.organizationRepository.findMember(
      userId,
      organizationId,
    );

    if (!member) {
      return false;
    }

    // Owner has all permissions
    if (member.role === OrganizationRole.OWNER) {
      return true;
    }

    // Admin has admin permissions
    if (
      requiredRole === OrganizationRole.ADMIN &&
      member.role === OrganizationRole.ADMIN
    ) {
      return true;
    }

    // Member has member permissions
    if (requiredRole === OrganizationRole.MEMBER) {
      return true;
    }

    return false;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
  }
}
