import { z } from "zod";

// Collection creation schemas
export const createCollectionSchema = z.object({
  name: z.string().min(1, "Collection name is required"),
  description: z.string().optional(),
  organizationId: z.string().optional(),
});

// Collection update schemas
export const updateCollectionSchema = z.object({
  name: z.string().min(1, "Collection name is required").optional(),
  description: z.string().optional(),
});

// Query schemas
export const getCollectionSchema = z.object({
  id: z.string().min(1, "Collection ID is required"),
});

export const deleteCollectionSchema = z.object({
  id: z.string().min(1, "Collection ID is required"),
});

export const duplicateCollectionSchema = z.object({
  id: z.string().min(1, "Collection ID is required"),
});

export const searchCollectionsSchema = z.object({
  query: z.string().min(1, "Search query is required"),
});

// Infer types from schemas
export type CreateCollectionInput = z.infer<typeof createCollectionSchema> & {
  organizationId: string; // Make required in the service layer
};
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;
export type GetCollectionInput = z.infer<typeof getCollectionSchema>;
export type DeleteCollectionInput = z.infer<typeof deleteCollectionSchema>;
export type DuplicateCollectionInput = z.infer<
  typeof duplicateCollectionSchema
>;
export type SearchCollectionsInput = z.infer<typeof searchCollectionsSchema>;
