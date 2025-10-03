import { z } from 'zod'
import { router, protectedProcedure } from '../../trpc'
import { OrganizationService } from './organization.service'
import { OrganizationRole } from '@/generated/prisma'
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  updateMemberRoleSchema,
  removeMemberSchema,
} from './organization.schema'

export const createOrganizationRouter = (organizationService: OrganizationService) =>
  router({
    create: protectedProcedure
      .input(createOrganizationSchema)
      .mutation(async ({ input, ctx }) => {
        return organizationService.createOrganization(ctx.user.id, input)
      }),

    getOrganization: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return organizationService.getOrganization(input.id)
      }),

    getMyOrganizations: protectedProcedure
      .query(async ({ ctx }) => {
        return organizationService.getUserOrganizations(ctx.user.id)
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.string(),
        }).merge(updateOrganizationSchema)
      )
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input
        return organizationService.updateOrganization(ctx.user.id, id, data)
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        return organizationService.deleteOrganization(ctx.user.id, input.id)
      }),

    getMembers: protectedProcedure
      .input(z.object({ organizationId: z.string() }))
      .query(async ({ input }) => {
        return organizationService.getOrganizationMembers(input.organizationId)
      }),

    inviteMember: protectedProcedure
      .input(
        z.object({
          email: z.string().email(),
          organizationId: z.string(),
          role: z.nativeEnum(OrganizationRole).default(OrganizationRole.MEMBER),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return organizationService.inviteMember({
          ...input,
          invitedBy: ctx.user.id,
        })
      }),

    acceptInvitation: protectedProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input, ctx }) => {
        return organizationService.acceptInvitation(input.token, ctx.user.id)
      }),

    updateMemberRole: protectedProcedure
      .input(updateMemberRoleSchema)
      .mutation(async ({ input, ctx }) => {
        return organizationService.updateMemberRole(ctx.user.id, input.userId, input.organizationId, input.role)
      }),

    removeMember: protectedProcedure
      .input(removeMemberSchema)
      .mutation(async ({ input, ctx }) => {
        return organizationService.removeMember(ctx.user.id, input.userId, input.organizationId)
      }),

    getInvitations: protectedProcedure
      .input(z.object({ organizationId: z.string() }))
      .query(async ({ input }) => {
        return organizationService.getOrganizationInvitations(input.organizationId)
      }),

    resendInvitation: protectedProcedure
      .input(z.object({ invitationId: z.string() }))
      .mutation(async ({ input }) => {
        return organizationService.resendInvitation(input.invitationId)
      }),
  })
