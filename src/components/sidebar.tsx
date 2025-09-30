"use client";

import { useState, useEffect, useMemo } from "react";
import {
    ChevronRight,
    ChevronDown,
    Folder,
    Plus,
    Search,
    DatabaseIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
    useAppStore,
} from "@/store";
import type { CollectionItem } from "@/store/slices/collections.slice";
import { trpc } from "@/lib/trpc";

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

function CollectionTree({
    items,
    level = 0,
}: {
    items: CollectionItem[];
    level?: number;
}) {
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    const selectedItemId = useAppStore((state) => state.selectedItemId);
    const expandedItems = useAppStore((state) => state.expandedItems);
    const setSelectedItem = useAppStore((state) => state.setSelectedItem);
    const toggleExpanded = useAppStore((state) => state.toggleExpanded);

    const utils = trpc.useUtils();
    const createEndpointMutation = trpc.monitoring.createEndpoint.useMutation({
        onSuccess: () => {
            utils.collection.getMyCollections.invalidate();
        },
    });

    const handleAddRequest = (collectionId: string) => {
        createEndpointMutation.mutate({
            name: "New Request",
            url: "https://api.example.com",
            method: "GET" as any,
            collectionId,
        });
    };

    return (
        <div>
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
                                addTab({
                                    id: item.id,
                                    type: "request",
                                    name: item.name,
                                    collectionId: items.find(i => i.id === item.id)?.id,
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
                                    item.method === "POST" &&
                                        "bg-green-500/20 text-green-400",
                                    item.method === "GET" &&
                                        "bg-blue-500/20 text-blue-400",
                                    item.method === "PUT" &&
                                        "bg-yellow-500/20 text-yellow-400",
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
                        {item.type === "folder" &&
                            level === 0 &&
                            hoveredItem === item.id && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddRequest(item.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-sidebar-accent rounded"
                                >
                                    <Plus className="h-3 w-3 text-muted-foreground" />
                                </button>
                            )}
                    </div>
                    {item.children && expandedItems[item.id] && (
                        <CollectionTree
                            items={item.children}
                            level={level + 1}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}

export function Sidebar({}: SidebarProps) {
    // Use tRPC directly - don't duplicate in Zustand
    const utils = trpc.useUtils();
    const { data: collectionsData } = trpc.collection.getMyCollections.useQuery();
    const createCollectionMutation = trpc.collection.createCollection.useMutation({
        onSuccess: () => {
            utils.collection.getMyCollections.invalidate();
        },
    });

    // Transform server data to UI format
    const collections: CollectionItem[] = useMemo(() => {
        if (!collectionsData) return [];
        return collectionsData.map((collection: any) => ({
            id: collection.id,
            name: collection.name,
            type: "folder" as const,
            children: collection.apiEndpoints?.map((endpoint: any) => ({
                id: endpoint.id,
                name: endpoint.name,
                type: "request" as const,
                method: endpoint.method as "GET" | "POST" | "PUT" | "DELETE",
            })) || [],
        }));
    }, [collectionsData]);

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
