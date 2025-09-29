import { z } from 'zod'
import { router, protectedProcedure } from '../../trpc'
import { CollectionService } from './collection.service'

export const createCollectionRouter = (collectionService: CollectionService) =>
  router({
    createCollection: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1, 'Collection name is required'),
          description: z.string().optional(),
          organizationId: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return collectionService.createCollection(input)
      }),

    getCollection: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return collectionService.getCollection(input.id)
      }),

    getMyCollections: protectedProcedure
      .query(async ({ ctx }) => {
        // For now, get all collections regardless of user
        // In a multi-tenant setup, you would filter by organization
        return collectionService.getCollections()
      }),

    updateCollection: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().min(1, 'Collection name is required').optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updateData } = input
        return collectionService.updateCollection(id, updateData)
      }),

    deleteCollection: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        return collectionService.deleteCollection(input.id)
      }),

    getCollectionStats: protectedProcedure
      .query(async () => {
        return collectionService.getCollectionStats()
      }),

    duplicateCollection: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        const originalCollection = await collectionService.getCollection(input.id)
        if (!originalCollection) {
          throw new Error('Collection not found')
        }

        return collectionService.createCollection({
          name: `${originalCollection.name} (Copy)`,
          description: originalCollection.description || undefined,
          organizationId: originalCollection.organizationId || undefined,
        })
      }),
  })