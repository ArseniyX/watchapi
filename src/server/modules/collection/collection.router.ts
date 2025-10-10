import { router, protectedProcedure } from "../../trpc";
import { CollectionService } from "./collection.service";
import {
  createCollectionSchema,
  updateCollectionSchema,
  getCollectionSchema,
  deleteCollectionSchema,
  duplicateCollectionSchema,
  searchCollectionsSchema,
} from "./collection.schema";

export const createCollectionRouter = (collectionService: CollectionService) =>
  router({
    createCollection: protectedProcedure
      .input(createCollectionSchema)
      .mutation(async ({ input, ctx }) => {
        if (!ctx.organizationId) {
          throw new Error("No organization context");
        }
        return collectionService.createCollection({
          ...input,
          organizationId: input.organizationId || ctx.organizationId,
        });
      }),

    getCollection: protectedProcedure
      .input(getCollectionSchema)
      .query(async ({ input, ctx }) => {
        if (!ctx.organizationId) {
          throw new Error("No organization context");
        }
        return collectionService.getCollection(input.id, ctx.organizationId);
      }),

    getMyCollections: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.organizationId) {
        throw new Error("No organization context");
      }
      return collectionService.getCollections(ctx.organizationId);
    }),

    updateCollection: protectedProcedure
      .input(getCollectionSchema.merge(updateCollectionSchema))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.organizationId) {
          throw new Error("No organization context");
        }
        const { id, ...updateData } = input;
        return collectionService.updateCollection(id, ctx.organizationId, updateData);
      }),

    deleteCollection: protectedProcedure
      .input(deleteCollectionSchema)
      .mutation(async ({ input, ctx }) => {
        if (!ctx.organizationId) {
          throw new Error("No organization context");
        }
        return collectionService.deleteCollection(input.id, ctx.organizationId);
      }),

    getCollectionStats: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.organizationId) {
        throw new Error("No organization context");
      }
      return collectionService.getCollectionStats(ctx.organizationId);
    }),

    duplicateCollection: protectedProcedure
      .input(duplicateCollectionSchema)
      .mutation(async ({ input, ctx }) => {
        if (!ctx.organizationId) {
          throw new Error("No organization context");
        }
        const originalCollection = await collectionService.getCollection(
          input.id,
          ctx.organizationId,
        );
        if (!originalCollection) {
          throw new Error("Collection not found");
        }

        return collectionService.createCollection({
          name: `${originalCollection.name} (Copy)`,
          description: originalCollection.description || undefined,
          organizationId: originalCollection.organizationId || undefined,
        });
      }),

    searchCollections: protectedProcedure
      .input(searchCollectionsSchema)
      .query(async ({ input, ctx }) => {
        if (!ctx.organizationId) {
          throw new Error("No organization context");
        }
        return collectionService.searchCollections(input.query, ctx.organizationId);
      }),
  });
