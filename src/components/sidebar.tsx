"use client";

import { useState, useEffect } from "react";
import {
    ChevronRight,
    ChevronDown,
    Folder,
    Plus,
    Search,
    Trash2,
    Database,
    Workflow,
    Box,
    Server,
    Clock,
    LayoutGrid,
    Lock,
    FolderOpen,
    DatabaseIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

interface CollectionItem {
    id: string;
    name: string;
    type: "folder" | "request";
    method?: "GET" | "POST" | "PUT" | "DELETE";
    children?: CollectionItem[];
}


function CollectionTree({
    items,
    level = 0,
    onAddRequest,
}: {
    items: CollectionItem[];
    level?: number;
    onAddRequest?: (collectionId: string) => void;
}) {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({
        "1": true,
        "1-1": true,
    });
    const [selected, setSelected] = useState("1-1-1");
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div>
            {items.map((item) => (
                <div key={item.id}>
                    <div
                        className={cn(
                            "group relative flex items-center gap-1 rounded px-2 py-1.5 text-sm hover:bg-sidebar-accent",
                            selected === item.id && "bg-sidebar-accent",
                            "cursor-pointer"
                        )}
                        style={{ paddingLeft: `${level * 12 + 8}px` }}
                        onMouseEnter={() => setHoveredItem(item.id)}
                        onMouseLeave={() => setHoveredItem(null)}
                        onClick={() => {
                            if (item.type === "folder") {
                                toggleExpand(item.id);
                            } else {
                                setSelected(item.id);
                            }
                        }}
                    >
                        {item.type === "folder" && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpand(item.id);
                                }}
                                className="p-0"
                            >
                                {expanded[item.id] ? (
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
                        {item.type === "folder" && level === 0 && hoveredItem === item.id && onAddRequest && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAddRequest(item.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-sidebar-accent rounded"
                            >
                                <Plus className="h-3 w-3 text-muted-foreground" />
                            </button>
                        )}
                    </div>
                    {item.children && expanded[item.id] && (
                        <CollectionTree
                            items={item.children}
                            level={level + 1}
                            onAddRequest={onAddRequest}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}

export function Sidebar({}: SidebarProps) {
    const [collections, setCollections] = useState<CollectionItem[]>([]);
    const { data: collectionsData, refetch } = trpc.collection.getMyCollections.useQuery();
    const createCollectionMutation = trpc.collection.createCollection.useMutation({
        onSuccess: () => {
            refetch();
        },
    });
    const createEndpointMutation = trpc.monitoring.createEndpoint.useMutation({
        onSuccess: () => {
            refetch();
        },
    });

    useEffect(() => {
        if (collectionsData) {
            // Transform API data to CollectionItem format
            const transformedCollections: CollectionItem[] = collectionsData.map((collection) => ({
                id: collection.id,
                name: collection.name,
                type: "folder" as const,
                children: collection.apiEndpoints?.map((endpoint) => ({
                    id: endpoint.id,
                    name: endpoint.name,
                    type: "request" as const,
                    method: endpoint.method as "GET" | "POST" | "PUT" | "DELETE",
                })) || [],
            }));
            setCollections(transformedCollections);
        }
    }, [collectionsData]);

    const handleAddCollection = () => {
        createCollectionMutation.mutate({
            name: "New Collection",
        });
    };

    const handleAddRequest = (collectionId: string) => {
        createEndpointMutation.mutate({
            name: "New Request",
            url: "https://api.example.com",
            method: "GET" as any,
            collectionId,
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
                            disabled={createCollectionMutation.isPending}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    <CollectionTree items={collections} onAddRequest={handleAddRequest} />
                </div>
            </div>
        </aside>
    );
}
