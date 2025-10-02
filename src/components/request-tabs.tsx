"use client";

import { useAppStore } from "@/store";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTabSync } from "@/hooks/useTabSync";

export function RequestTabs() {
    useTabSync(); // Sync tabs with URL

    const tabs = useAppStore((state) => state.tabs);
    const activeTabId = useAppStore((state) => state.activeTabId);
    const setActiveTab = useAppStore((state) => state.setActiveTab);
    const removeTab = useAppStore((state) => state.removeTab);

    const getMethodColor = (method?: string) => {
        switch (method?.toUpperCase()) {
            case "GET":
                return "text-green-500";
            case "POST":
                return "text-yellow-500";
            case "PUT":
                return "text-blue-500";
            case "PATCH":
                return "text-purple-500";
            case "DELETE":
                return "text-red-500";
            default:
                return "text-muted-foreground";
        }
    };

    return (
        <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-2 overflow-x-auto">
            {tabs.map((tab) => (
                <div
                    key={tab.id}
                    className={cn(
                        "group flex items-center gap-2 rounded-t px-3 py-1.5 cursor-pointer transition-all border-b-2 -mb-[9px] max-w-[200px]",
                        activeTabId === tab.id
                            ? "bg-card border-primary"
                            : "bg-muted border-transparent hover:bg-muted/80"
                    )}
                    onClick={() => setActiveTab(tab.id)}
                >
                    <span
                        className={cn(
                            "text-xs font-medium flex-shrink-0",
                            getMethodColor(
                                tab.type === "request" ? tab.method : undefined
                            )
                        )}
                    >
                        {tab.type === "request"
                            ? tab.method || "GET"
                            : "COLLECTION"}
                    </span>
                    <span className="text-xs text-foreground truncate">
                        {tab.name}
                        {tab.isDirty && " *"}
                    </span>
                    <button
                        className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                            e.stopPropagation();
                            removeTab(tab.id);
                        }}
                    >
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </button>
                </div>
            ))}
            <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 flex-shrink-0 invisible"
            >
                <Plus className="h-4 w-4" />
            </Button>
        </div>
    );
}
