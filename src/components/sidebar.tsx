"use client";

import { useState, useEffect, useMemo } from "react";
import {
    ChevronRight,
    ChevronDown,
    Folder,
    Plus,
    Search,
    DatabaseIcon,
    Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store";
import { trpc } from "@/lib/trpc";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface CollectionTreeItemFolder {
    id: string;
    name: string;
    type: "folder";
    children: CollectionTreeItem[];
}

interface CollectionTreeItemRequest {
    id: string;
    name: string;
    type: "request";
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    children?: never;
}

type CollectionTreeItem = CollectionTreeItemFolder | CollectionTreeItemRequest;

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

function DeleteConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    itemName,
    itemType,
    isDeleting,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    itemName: string;
    itemType: "collection" | "endpoint";
    isDeleting: boolean;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Delete{" "}
                        {itemType === "collection" ? "Collection" : "Endpoint"}
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete{" "}
                        <strong>{itemName}</strong>?
                        {itemType === "collection" &&
                            " This will also delete all endpoints in this collection."}{" "}
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function CollectionTree({
    items,
    level = 0,
    parentCollectionId,
}: {
    items: CollectionTreeItem[];
    level?: number;
    parentCollectionId?: string;
}) {
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        itemId: string | null;
        itemName: string;
        itemType: "collection" | "endpoint";
    }>({
        open: false,
        itemId: null,
        itemName: "",
        itemType: "collection",
    });

    const selectedItemId = useAppStore((state) => state.selectedItemId);
    const expandedItems = useAppStore((state) => state.expandedItems);
    const setSelectedItem = useAppStore((state) => state.setSelectedItem);
    const toggleExpanded = useAppStore((state) => state.toggleExpanded);
    const removeTab = useAppStore((state) => state.removeTab);

    const utils = trpc.useUtils();
    const createEndpointMutation = trpc.apiEndpoint.create.useMutation({
        onSuccess: () => {
            utils.collection.getMyCollections.invalidate();
        },
    });

    const deleteCollectionMutation =
        trpc.collection.deleteCollection.useMutation({
            onSuccess: () => {
                utils.collection.getMyCollections.invalidate();
                toast.success("Collection deleted successfully");
                setDeleteDialog({
                    open: false,
                    itemId: null,
                    itemName: "",
                    itemType: "collection",
                });
            },
            onError: (error) => {
                toast.error(error.message || "Failed to delete collection");
            },
        });

    const deleteEndpointMutation = trpc.apiEndpoint.delete.useMutation({
        onSuccess: () => {
            utils.collection.getMyCollections.invalidate();
            toast.success("Endpoint deleted successfully");
            setDeleteDialog({
                open: false,
                itemId: null,
                itemName: "",
                itemType: "endpoint",
            });
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete endpoint");
        },
    });

    const handleAddRequest = (collectionId: string) => {
        createEndpointMutation.mutate({
            name: "New Request",
            url: "https://api.example.com",
            method: "GET",
            collectionId,
        });
    };

    const handleDeleteClick = (
        item: CollectionTreeItem,
        e: React.MouseEvent
    ) => {
        e.stopPropagation();
        setDeleteDialog({
            open: true,
            itemId: item.id,
            itemName: item.name,
            itemType: item.type === "folder" ? "collection" : "endpoint",
        });
    };

    const handleConfirmDelete = () => {
        if (!deleteDialog.itemId) return;

        if (deleteDialog.itemType === "collection") {
            deleteCollectionMutation.mutate({ id: deleteDialog.itemId });
        } else {
            // Close tab if it's open
            removeTab(deleteDialog.itemId);
            deleteEndpointMutation.mutate({ id: deleteDialog.itemId });
        }
    };

    return (
        <>
            <DeleteConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) =>
                    setDeleteDialog({ ...deleteDialog, open })
                }
                onConfirm={handleConfirmDelete}
                itemName={deleteDialog.itemName}
                itemType={deleteDialog.itemType}
                isDeleting={
                    deleteCollectionMutation.isPending ||
                    deleteEndpointMutation.isPending
                }
            />
            {items.map((item) => (
                <div key={item.id}>
                    <div
                        className={cn(
                            "group relative flex items-center gap-1 rounded px-2 py-1.5 text-sm hover:bg-sidebar-accent",
                            selectedItemId === item.id && "bg-sidebar-accent",
                            "cursor-pointer"
                        )}
                        style={{ paddingLeft: `${level * 12 + 8}px` }}
                        onMouseEnter={() => setHoveredItem(item.id)}
                        onMouseLeave={() => setHoveredItem(null)}
                        onClick={() => {
                            if (item.type === "folder") {
                                toggleExpanded(item.id);
                            } else {
                                setSelectedItem(item.id);
                                // Open tab for request
                                const addTab = useAppStore.getState().addTab;
                                const collectionId =
                                    level === 0 ? item.id : parentCollectionId;
                                addTab({
                                    id: item.id,
                                    type: "request",
                                    name: item.name,
                                    collectionId: collectionId,
                                });
                            }
                        }}
                    >
                        {item.type === "folder" && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpanded(item.id);
                                }}
                                className="p-0"
                            >
                                {expandedItems[item.id] ? (
                                    <ChevronDown className="h-3 w-3" />
                                ) : (
                                    <ChevronRight className="h-3 w-3" />
                                )}
                            </button>
                        )}
                        {item.type === "folder" ? (
                            level === 0 ? (
                                <DatabaseIcon className="h-4 w-4 text-muted-foreground" />
                            ) : (
                                <Folder className="h-4 w-4 text-muted-foreground" />
                            )
                        ) : (
                            <span
                                className={cn(
                                    "rounded px-1.5 py-0.5 text-xs font-semibold",
                                    item.method === "GET" &&
                                        "bg-green-500/20 text-green-400",
                                    item.method === "POST" &&
                                        "bg-yellow-500/20 text-yellow-400",
                                    item.method === "PUT" &&
                                        "bg-blue-500/20 text-blue-400",
                                    item.method === "PATCH" &&
                                        "bg-purple-500/20 text-purple-400",
                                    item.method === "DELETE" &&
                                        "bg-red-500/20 text-red-400"
                                )}
                            >
                                {item.method}
                            </span>
                        )}
                        <span className="flex-1 truncate text-sidebar-foreground">
                            {item.name}
                        </span>
                        {hoveredItem === item.id && (
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                {item.type === "folder" && level === 0 && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddRequest(item.id);
                                        }}
                                        className="p-0.5 hover:bg-primary/20 rounded group/add"
                                        title="Add endpoint"
                                    >
                                        <Plus className="h-3 w-3 text-muted-foreground group-hover/add:text-primary transition-colors" />
                                    </button>
                                )}
                                <button
                                    onClick={(e) => handleDeleteClick(item, e)}
                                    className="p-0.5 hover:bg-destructive/20 rounded group/delete"
                                    title={`Delete ${
                                        item.type === "folder"
                                            ? "collection"
                                            : "endpoint"
                                    }`}
                                >
                                    <Trash2 className="h-3 w-3 text-muted-foreground group-hover/delete:text-destructive transition-colors" />
                                </button>
                            </div>
                        )}
                    </div>
                    {item.children && expandedItems[item.id] && (
                        <CollectionTree
                            items={item.children}
                            level={level + 1}
                            parentCollectionId={
                                level === 0 ? item.id : parentCollectionId
                            }
                        />
                    )}
                </div>
            ))}
        </>
    );
}

export function Sidebar({}: SidebarProps) {
    const [searchQuery, setSearchQuery] = useState("");

    // Use tRPC directly - don't duplicate in Zustand
    const utils = trpc.useUtils();
    const { data: collectionsData } =
        trpc.collection.getMyCollections.useQuery();
    const createCollectionMutation =
        trpc.collection.createCollection.useMutation({
            onSuccess: () => {
                utils.collection.getMyCollections.invalidate();
            },
        });

    // Transform server data to UI format and filter based on search
    const collections = useMemo(() => {
        if (!collectionsData) return [];

        const transformedCollections = collectionsData.map((collection) => ({
            id: collection.id,
            name: collection.name,
            type: "folder" as const,
            children:
                collection.apiEndpoints?.map((endpoint) => ({
                    id: endpoint.id,
                    name: endpoint.name,
                    type: "request" as const,
                    method: endpoint.method as
                        | "GET"
                        | "POST"
                        | "PUT"
                        | "PATCH"
                        | "DELETE",
                })) || [],
        }));

        // Filter collections and endpoints based on search query
        if (!searchQuery.trim()) {
            return transformedCollections;
        }

        const query = searchQuery.toLowerCase();
        return transformedCollections
            .map((collection) => {
                // Filter endpoints that match the search
                const matchingEndpoints =
                    collection.children?.filter((endpoint) =>
                        endpoint.name.toLowerCase().includes(query)
                    ) || [];

                // Check if collection name matches
                const collectionMatches = collection.name
                    .toLowerCase()
                    .includes(query);

                // Include collection if it matches OR if any of its endpoints match
                if (collectionMatches || matchingEndpoints.length > 0) {
                    return {
                        ...collection,
                        children: collectionMatches
                            ? collection.children
                            : matchingEndpoints,
                    };
                }
                return null;
            })
            .filter((collection) => collection !== null);
    }, [collectionsData, searchQuery]);

    const handleAddCollection = () => {
        createCollectionMutation.mutate({
            name: "New Collection",
        });
    };

    return (
        <aside className="flex h-full w-80 flex-col border-r border-border bg-sidebar">
            {/* <div className="border-b border-sidebar-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">My Workspace</span>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
              New
            </Button>
            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
              Import
            </Button>
          </div>
        </div>
      </div> */}

            <div className="flex flex-1 flex-col overflow-hidden">
                {/* <div className="flex border-b border-sidebar-border">
                    {navItems.slice(0, 7).map((item) => (
                        <button
                            key={item.label}
                            className={cn(
                                "flex flex-col items-center gap-1 border-b-2 border-transparent px-3 py-2 text-xs hover:bg-sidebar-accent",
                                item.active && "border-primary text-primary"
                            )}
                            title={item.label}
                        >
                            <item.icon className="h-4 w-4" />
                        </button>
                    ))}
                </div> */}

                <div className="flex-1 overflow-y-auto p-2">
                    <div className="mb-2 flex items-center gap-2 px-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search collections"
                                className="h-8 bg-muted pl-7 text-xs"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={handleAddCollection}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    <CollectionTree items={collections} />
                </div>
            </div>
        </aside>
    );
}
