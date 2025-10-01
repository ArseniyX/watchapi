import { vanillaTrpc } from "@/lib/trpc";

const transformCollectionsData = (collectionsData: any[]): any[] => {
    return collectionsData.map((collection) => ({
        id: collection.id,
        name: collection.name,
        type: "folder" as const,
        children:
            collection.apiEndpoints?.map((endpoint: any) => ({
                id: endpoint.id,
                name: endpoint.name,
                type: "request" as const,
                method: endpoint.method as "GET" | "POST" | "PUT" | "DELETE",
            })) || [],
    }));
};

export const createCollectionsActions = (getStore: () => any) => {
    return {
        fetchCollections: async () => {
            const store = getStore();
            store.setLoading(true);
            store.setError(null);

            try {
                const data = await vanillaTrpc.collection.getMyCollections.query();
                const transformed = transformCollectionsData(data as any);
                getStore().setCollections(transformed);
            } catch (error) {
                getStore().setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch collections"
                );
            } finally {
                getStore().setLoading(false);
            }
        },

        createCollection: async (name: string, description?: string) => {
            const store = getStore();
            store.setLoading(true);
            store.setError(null);

            // Optimistic update
            const tempId = `temp-${Date.now()}`;
            const tempCollection: any = {
                id: tempId,
                name,
                type: "folder",
                children: [],
            };
            store.addCollectionOptimistic(tempCollection);

            try {
                await vanillaTrpc.collection.createCollection.mutate({
                    name,
                    description,
                });

                // Replace temp collection with real one
                getStore().removeCollectionOptimistic(tempId);
                await getStore().fetchCollections?.();
            } catch (error) {
                // Revert optimistic update on error
                getStore().removeCollectionOptimistic(tempId);
                getStore().setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to create collection"
                );
            } finally {
                getStore().setLoading(false);
            }
        },

        deleteCollection: async (collectionId: string) => {
            const store = getStore();
            store.setLoading(true);
            store.setError(null);

            // Store backup for rollback
            const backup = store.collections.find((c) => c.id === collectionId);

            // Optimistic update
            store.removeCollectionOptimistic(collectionId);

            try {
                await vanillaTrpc.collection.deleteCollection.mutate({
                    id: collectionId,
                });
            } catch (error) {
                // Rollback on error
                if (backup) {
                    getStore().addCollectionOptimistic(backup);
                }
                getStore().setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to delete collection"
                );
            } finally {
                getStore().setLoading(false);
            }
        },

        createRequest: async (
            collectionId: string,
            name: string,
            url: string
        ) => {
            const store = getStore();
            store.setLoading(true);
            store.setError(null);

            // Optimistic update
            const tempId = `temp-${Date.now()}`;
            const tempRequest: any = {
                id: tempId,
                name,
                type: "request",
                method: "GET",
            };
            store.addRequestToCollectionOptimistic(collectionId, tempRequest);

            try {
                await vanillaTrpc.apiEndpoint.create.mutate({
                    name,
                    url,
                    method: "GET" as any,
                    collectionId,
                });

                // Replace temp request with real one
                getStore().removeRequestFromCollectionOptimistic(
                    collectionId,
                    tempId
                );
                await getStore().fetchCollections?.();
            } catch (error) {
                // Revert optimistic update on error
                getStore().removeRequestFromCollectionOptimistic(
                    collectionId,
                    tempId
                );
                getStore().setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to create request"
                );
            } finally {
                getStore().setLoading(false);
            }
        },

        deleteRequest: async (collectionId: string, requestId: string) => {
            const store = getStore();
            store.setLoading(true);
            store.setError(null);

            // Store backup for rollback
            const collection = store.collections.find(
                (c) => c.id === collectionId
            );
            const backup = collection?.children?.find(
                (r) => r.id === requestId
            );

            // Optimistic update
            store.removeRequestFromCollectionOptimistic(
                collectionId,
                requestId
            );

            try {
                await vanillaTrpc.apiEndpoint.delete.mutate({ id: requestId });
            } catch (error) {
                // Rollback on error
                if (backup) {
                    getStore().addRequestToCollectionOptimistic(
                        collectionId,
                        backup
                    );
                }
                getStore().setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to delete request"
                );
            } finally {
                getStore().setLoading(false);
            }
        },
    };
};
