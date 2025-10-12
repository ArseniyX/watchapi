import { router, orgProcedure } from "../../trpc";
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
    createCollection: orgProcedure
      .input(createCollectionSchema)
      .mutation(async ({ ctx, input }) => {
        return collectionService.createCollection({
          ctx,
          input,
        });
      }),

    getCollection: orgProcedure
      .input(getCollectionSchema)
      .query(async ({ ctx, input }) => {
        return collectionService.getCollection({
          ctx,
          input,
        });
      }),

    getMyCollections: orgProcedure.query(async ({ ctx }) => {
      return collectionService.getCollections({ ctx });
    }),

    updateCollection: orgProcedure
      .input(getCollectionSchema.merge(updateCollectionSchema))
      .mutation(async ({ ctx, input }) => {
        return collectionService.updateCollection({
          ctx,
          input,
        });
      }),

    deleteCollection: orgProcedure
      .input(deleteCollectionSchema)
      .mutation(async ({ ctx, input }) => {
        return collectionService.deleteCollection({
          ctx,
          input,
        });
      }),
    getCollectionStats: orgProcedure.query(async ({ ctx }) => {
      return collectionService.getCollectionStats({
        ctx,
      });
    }),

    duplicateCollection: orgProcedure
      .input(duplicateCollectionSchema)
      .mutation(async ({ ctx, input }) => {
        const originalCollection = await collectionService.getCollection({
          ctx,
          input,
        });
        if (!originalCollection) {
          throw new Error("Collection not found");
        }

        return collectionService.createCollection({
          ctx,
          input: {
            name: `${originalCollection.name} (Copy)`,
            description: originalCollection.description || undefined,
          },
        });
      }),

    searchCollections: orgProcedure
      .input(searchCollectionsSchema)
      .query(async ({ ctx, input }) => {
        return collectionService.searchCollections({
          ctx,
          input,
        });
      }),
  });
