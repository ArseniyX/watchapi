import { describe, it, expect, beforeEach, vi } from 'vitest'
import { OrganizationService } from '../organization.service'
import { OrganizationRepository } from '../organization.repository'
import { OrganizationRole, MemberStatus } from '../../../../generated/prisma'

// Mock the repository
const mockRepository = {
  createOrganization: vi.fn(),
  findOrganizationById: vi.fn(),
  findOrganizationBySlug: vi.fn(),
  findUserOrganizations: vi.fn(),
  updateOrganization: vi.fn(),
  deleteOrganization: vi.fn(),
  addMember: vi.fn(),
  findOrganizationMembers: vi.fn(),
  findMember: vi.fn(),
  updateMemberRole: vi.fn(),
  updateMemberStatus: vi.fn(),
  removeMember: vi.fn(),
  createInvitation: vi.fn(),
  findInvitationByToken: vi.fn(),
  findOrganizationInvitations: vi.fn(),
  deleteInvitation: vi.fn(),
  deleteExpiredInvitations: vi.fn(),
  findUserByEmail: vi.fn(),
}

describe('OrganizationService', () => {
  let service: OrganizationService

  beforeEach(() => {
    service = new OrganizationService(mockRepository as any)
    vi.clearAllMocks()
  })

  describe('createOrganization', () => {
    it('should create organization and add creator as owner', async () => {
      const orgData = {
        name: 'Test Org',
        slug: 'test-org',
        description: 'Test description',
      }

      const mockOrg = { id: 'org-1', ...orgData }
      mockRepository.findOrganizationBySlug.mockResolvedValue(null)
      mockRepository.createOrganization.mockResolvedValue(mockOrg)
      mockRepository.addMember.mockResolvedValue({
        id: 'member-1',
        userId: 'user-1',
        organizationId: 'org-1',
        role: OrganizationRole.OWNER,
      })

      const result = await service.createOrganization('user-1', orgData)

      expect(mockRepository.findOrganizationBySlug).toHaveBeenCalledWith('test-org')
      expect(mockRepository.createOrganization).toHaveBeenCalledWith(orgData)
      expect(mockRepository.addMember).toHaveBeenCalledWith({
        userId: 'user-1',
        organizationId: 'org-1',
        role: OrganizationRole.OWNER,
        status: MemberStatus.ACTIVE,
      })
      expect(result).toEqual(mockOrg)
    })

    it('should throw error if slug already exists', async () => {
      mockRepository.findOrganizationBySlug.mockResolvedValue({ id: 'existing-org' })

      await expect(
        service.createOrganization('user-1', {
          name: 'Test',
          slug: 'existing-slug',
        })
      ).rejects.toThrow('An organization with this slug already exists')

      expect(mockRepository.createOrganization).not.toHaveBeenCalled()
    })
  })

  describe('updateOrganization', () => {
    it('should update organization if user has admin permission', async () => {
      const updateData = { name: 'Updated Name' }
      const mockUpdated = { id: 'org-1', ...updateData }

      mockRepository.findMember.mockResolvedValue({
        role: OrganizationRole.ADMIN,
        status: MemberStatus.ACTIVE,
      })
      mockRepository.updateOrganization.mockResolvedValue(mockUpdated)

      const result = await service.updateOrganization('user-1', 'org-1', updateData)

      expect(mockRepository.updateOrganization).toHaveBeenCalledWith('org-1', updateData)
      expect(result).toEqual(mockUpdated)
    })

    it('should throw error if user does not have permission', async () => {
      mockRepository.findMember.mockResolvedValue({
        role: OrganizationRole.MEMBER,
        status: MemberStatus.ACTIVE,
      })

      await expect(
        service.updateOrganization('user-1', 'org-1', { name: 'Updated' })
      ).rejects.toThrow('You do not have permission to update this organization')

      expect(mockRepository.updateOrganization).not.toHaveBeenCalled()
    })

    it('should allow owner to update organization', async () => {
      mockRepository.findMember.mockResolvedValue({
        role: OrganizationRole.OWNER,
        status: MemberStatus.ACTIVE,
      })
      mockRepository.updateOrganization.mockResolvedValue({ id: 'org-1' })

      await service.updateOrganization('user-1', 'org-1', { name: 'Updated' })

      expect(mockRepository.updateOrganization).toHaveBeenCalled()
    })
  })

  describe('deleteOrganization', () => {
    it('should delete organization if user is owner', async () => {
      mockRepository.findMember.mockResolvedValue({
        role: OrganizationRole.OWNER,
        status: MemberStatus.ACTIVE,
      })
      mockRepository.deleteOrganization.mockResolvedValue(undefined)

      await service.deleteOrganization('user-1', 'org-1')

      expect(mockRepository.deleteOrganization).toHaveBeenCalledWith('org-1')
    })

    it('should throw error if user is not owner', async () => {
      mockRepository.findMember.mockResolvedValue({
        role: OrganizationRole.ADMIN,
        status: MemberStatus.ACTIVE,
      })

      await expect(
        service.deleteOrganization('user-1', 'org-1')
      ).rejects.toThrow('Only organization owners can delete organizations')

      expect(mockRepository.deleteOrganization).not.toHaveBeenCalled()
    })

    it('should throw error if user is not a member', async () => {
      mockRepository.findMember.mockResolvedValue(null)

      await expect(
        service.deleteOrganization('user-1', 'org-1')
      ).rejects.toThrow('Only organization owners can delete organizations')
    })
  })

  describe('inviteMember', () => {
    it('should add existing user directly as invited member', async () => {
      const inviteData = {
        email: 'existing@example.com',
        organizationId: 'org-1',
        role: OrganizationRole.MEMBER,
        invitedBy: 'user-1',
      }

      mockRepository.findMember.mockResolvedValue({
        role: OrganizationRole.OWNER,
        status: MemberStatus.ACTIVE,
      })
      mockRepository.findUserByEmail.mockResolvedValue({
        id: 'user-2',
        email: 'existing@example.com',
      })
      mockRepository.findMember.mockResolvedValueOnce({
        role: OrganizationRole.OWNER,
        status: MemberStatus.ACTIVE,
      }).mockResolvedValueOnce(null)
      mockRepository.addMember.mockResolvedValue({
        id: 'member-1',
        userId: 'user-2',
        organizationId: 'org-1',
        role: OrganizationRole.MEMBER,
        status: MemberStatus.INVITED,
      })

      const result = await service.inviteMember(inviteData)

      expect(mockRepository.findUserByEmail).toHaveBeenCalledWith('existing@example.com')
      expect(mockRepository.addMember).toHaveBeenCalledWith({
        userId: 'user-2',
        organizationId: 'org-1',
        role: OrganizationRole.MEMBER,
        status: MemberStatus.INVITED,
        invitedBy: 'user-1',
      })
      expect(result).toBeDefined()
    })

    it('should create invitation for new user', async () => {
      const inviteData = {
        email: 'newuser@example.com',
        organizationId: 'org-1',
        role: OrganizationRole.MEMBER,
        invitedBy: 'user-1',
      }

      mockRepository.findMember.mockResolvedValue({
        role: OrganizationRole.ADMIN,
        status: MemberStatus.ACTIVE,
      })
      mockRepository.findUserByEmail.mockResolvedValue(null)
      mockRepository.createInvitation.mockResolvedValue({
        id: 'invite-1',
        ...inviteData,
        token: 'test-token',
        expiresAt: new Date(),
      })

      const result = await service.inviteMember(inviteData)

      expect(mockRepository.createInvitation).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        organizationId: 'org-1',
        role: OrganizationRole.MEMBER,
        invitedBy: 'user-1',
        token: expect.any(String),
        expiresAt: expect.any(Date),
      })
      expect(result).toBeDefined()
    })

    it('should throw error if user already a member', async () => {
      mockRepository.findMember.mockResolvedValueOnce({
        role: OrganizationRole.OWNER,
        status: MemberStatus.ACTIVE,
      }).mockResolvedValueOnce({
        role: OrganizationRole.MEMBER,
        status: MemberStatus.ACTIVE,
      })
      mockRepository.findUserByEmail.mockResolvedValue({ id: 'user-2' })

      await expect(
        service.inviteMember({
          email: 'existing@example.com',
          organizationId: 'org-1',
          role: OrganizationRole.MEMBER,
          invitedBy: 'user-1',
        })
      ).rejects.toThrow('User is already a member of this organization')
    })

    it('should throw error if inviter does not have permission', async () => {
      mockRepository.findMember.mockResolvedValue({
        role: OrganizationRole.MEMBER,
        status: MemberStatus.ACTIVE,
      })

      await expect(
        service.inviteMember({
          email: 'test@example.com',
          organizationId: 'org-1',
          role: OrganizationRole.MEMBER,
          invitedBy: 'user-1',
        })
      ).rejects.toThrow('You do not have permission to invite members to this organization')
    })
  })

  describe('acceptInvitation', () => {
    it('should accept valid invitation and add user as member', async () => {
      const mockInvitation = {
        id: 'invite-1',
        email: 'test@example.com',
        organizationId: 'org-1',
        role: OrganizationRole.MEMBER,
        invitedBy: 'user-1',
        token: 'valid-token',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }

      mockRepository.findInvitationByToken.mockResolvedValue(mockInvitation)
      mockRepository.addMember.mockResolvedValue({
        id: 'member-1',
        userId: 'user-2',
        organizationId: 'org-1',
        role: OrganizationRole.MEMBER,
      })
      mockRepository.deleteInvitation.mockResolvedValue(undefined)

      const result = await service.acceptInvitation('valid-token', 'user-2')

      expect(mockRepository.addMember).toHaveBeenCalledWith({
        userId: 'user-2',
        organizationId: 'org-1',
        role: OrganizationRole.MEMBER,
        status: MemberStatus.ACTIVE,
        invitedBy: 'user-1',
      })
      expect(mockRepository.deleteInvitation).toHaveBeenCalledWith('invite-1')
      expect(result).toBeDefined()
    })

    it('should throw error if invitation not found', async () => {
      mockRepository.findInvitationByToken.mockResolvedValue(null)

      await expect(
        service.acceptInvitation('invalid-token', 'user-2')
      ).rejects.toThrow('Invitation not found')
    })

    it('should throw error if invitation expired', async () => {
      mockRepository.findInvitationByToken.mockResolvedValue({
        id: 'invite-1',
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      })

      await expect(
        service.acceptInvitation('expired-token', 'user-2')
      ).rejects.toThrow('Invitation has expired')
    })
  })

  describe('updateMemberRole', () => {
    it('should update member role if requestor has permission', async () => {
      mockRepository.findMember.mockResolvedValueOnce({
        role: OrganizationRole.OWNER,
        status: MemberStatus.ACTIVE,
      }).mockResolvedValueOnce({
        role: OrganizationRole.MEMBER,
        status: MemberStatus.ACTIVE,
      })
      mockRepository.updateMemberRole.mockResolvedValue({
        id: 'member-1',
        role: OrganizationRole.ADMIN,
      })

      await service.updateMemberRole('user-1', 'user-2', 'org-1', OrganizationRole.ADMIN)

      expect(mockRepository.updateMemberRole).toHaveBeenCalledWith('user-2', 'org-1', OrganizationRole.ADMIN)
    })

    it('should throw error if requestor does not have permission', async () => {
      mockRepository.findMember.mockResolvedValue({
        role: OrganizationRole.MEMBER,
        status: MemberStatus.ACTIVE,
      })

      await expect(
        service.updateMemberRole('user-1', 'user-2', 'org-1', OrganizationRole.ADMIN)
      ).rejects.toThrow('You do not have permission to update member roles')
    })

    it('should throw error if trying to change owner role', async () => {
      mockRepository.findMember.mockResolvedValueOnce({
        role: OrganizationRole.OWNER,
        status: MemberStatus.ACTIVE,
      }).mockResolvedValueOnce({
        role: OrganizationRole.OWNER,
        status: MemberStatus.ACTIVE,
      })

      await expect(
        service.updateMemberRole('user-1', 'user-2', 'org-1', OrganizationRole.MEMBER)
      ).rejects.toThrow('Cannot change the role of an organization owner')
    })
  })

  describe('removeMember', () => {
    it('should remove member if requestor has permission', async () => {
      mockRepository.findMember.mockResolvedValueOnce({
        role: OrganizationRole.ADMIN,
        status: MemberStatus.ACTIVE,
      }).mockResolvedValueOnce({
        role: OrganizationRole.MEMBER,
        status: MemberStatus.ACTIVE,
      })
      mockRepository.removeMember.mockResolvedValue(undefined)

      await service.removeMember('user-1', 'user-2', 'org-1')

      expect(mockRepository.removeMember).toHaveBeenCalledWith('user-2', 'org-1')
    })

    it('should throw error if requestor does not have permission', async () => {
      mockRepository.findMember.mockResolvedValue({
        role: OrganizationRole.MEMBER,
        status: MemberStatus.ACTIVE,
      })

      await expect(
        service.removeMember('user-1', 'user-2', 'org-1')
      ).rejects.toThrow('You do not have permission to remove members')
    })

    it('should throw error if trying to remove owner', async () => {
      mockRepository.findMember.mockResolvedValueOnce({
        role: OrganizationRole.OWNER,
        status: MemberStatus.ACTIVE,
      }).mockResolvedValueOnce({
        role: OrganizationRole.OWNER,
        status: MemberStatus.ACTIVE,
      })

      await expect(
        service.removeMember('user-1', 'user-2', 'org-1')
      ).rejects.toThrow('Cannot remove an organization owner')
    })
  })

  describe('checkMemberPermission', () => {
    it('should return true for owner with any permission', async () => {
      mockRepository.findMember.mockResolvedValue({
        role: OrganizationRole.OWNER,
        status: MemberStatus.ACTIVE,
      })

      const result = await service.checkMemberPermission('user-1', 'org-1', OrganizationRole.MEMBER)

      expect(result).toBe(true)
    })

    it('should return true for admin requesting admin permission', async () => {
      mockRepository.findMember.mockResolvedValue({
        role: OrganizationRole.ADMIN,
        status: MemberStatus.ACTIVE,
      })

      const result = await service.checkMemberPermission('user-1', 'org-1', OrganizationRole.ADMIN)

      expect(result).toBe(true)
    })

    it('should return true for member requesting member permission', async () => {
      mockRepository.findMember.mockResolvedValue({
        role: OrganizationRole.MEMBER,
        status: MemberStatus.ACTIVE,
      })

      const result = await service.checkMemberPermission('user-1', 'org-1', OrganizationRole.MEMBER)

      expect(result).toBe(true)
    })

    it('should return false for member requesting admin permission', async () => {
      mockRepository.findMember.mockResolvedValue({
        role: OrganizationRole.MEMBER,
        status: MemberStatus.ACTIVE,
      })

      const result = await service.checkMemberPermission('user-1', 'org-1', OrganizationRole.ADMIN)

      expect(result).toBe(false)
    })

    it('should return false if not a member', async () => {
      mockRepository.findMember.mockResolvedValue(null)

      const result = await service.checkMemberPermission('user-1', 'org-1', OrganizationRole.MEMBER)

      expect(result).toBe(false)
    })
  })

  describe('getOrganization', () => {
    it('should return organization by id', async () => {
      const mockOrg = { id: 'org-1', name: 'Test Org' }
      mockRepository.findOrganizationById.mockResolvedValue(mockOrg)

      const result = await service.getOrganization('org-1')

      expect(mockRepository.findOrganizationById).toHaveBeenCalledWith('org-1')
      expect(result).toEqual(mockOrg)
    })
  })

  describe('getUserOrganizations', () => {
    it('should return all organizations for user', async () => {
      const mockOrgs = [
        { id: 'org-1', name: 'Org 1' },
        { id: 'org-2', name: 'Org 2' },
      ]
      mockRepository.findUserOrganizations.mockResolvedValue(mockOrgs)

      const result = await service.getUserOrganizations('user-1')

      expect(mockRepository.findUserOrganizations).toHaveBeenCalledWith('user-1')
      expect(result).toEqual(mockOrgs)
    })
  })

  describe('getOrganizationMembers', () => {
    it('should return all members of organization', async () => {
      const mockMembers = [
        { id: 'member-1', userId: 'user-1' },
        { id: 'member-2', userId: 'user-2' },
      ]
      mockRepository.findOrganizationMembers.mockResolvedValue(mockMembers)

      const result = await service.getOrganizationMembers('org-1')

      expect(mockRepository.findOrganizationMembers).toHaveBeenCalledWith('org-1')
      expect(result).toEqual(mockMembers)
    })
  })

  describe('getOrganizationInvitations', () => {
    it('should return all invitations for organization', async () => {
      const mockInvitations = [
        { id: 'invite-1', email: 'test1@example.com' },
        { id: 'invite-2', email: 'test2@example.com' },
      ]
      mockRepository.findOrganizationInvitations.mockResolvedValue(mockInvitations)

      const result = await service.getOrganizationInvitations('org-1')

      expect(mockRepository.findOrganizationInvitations).toHaveBeenCalledWith('org-1')
      expect(result).toEqual(mockInvitations)
    })
  })
})
