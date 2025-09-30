"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";

export interface KeyValuePair {
    id: string;
    key: string;
    value: string;
    description?: string;
    enabled: boolean;
}

interface KeyValueTableProps {
    items: KeyValuePair[];
    onAdd: () => void;
    onUpdate: (id: string, field: keyof KeyValuePair, value: string | boolean) => void;
    onRemove: (id: string) => void;
    addButtonText?: string;
}

export function KeyValueTable({
    items,
    onAdd,
    onUpdate,
    onRemove,
    addButtonText = "+ Add item",
}: KeyValueTableProps) {
    return (
        <div className="flex flex-col h-full">
            <div className="grid grid-cols-[40px_1fr_1fr_1fr_40px] gap-2 border-b border-border bg-muted px-4 py-2 text-xs font-medium text-muted-foreground shrink-0">
                <div></div>
                <div>KEY</div>
                <div>VALUE</div>
                <div>DESCRIPTION</div>
                <div></div>
            </div>
            <div className="flex-1 overflow-y-auto">
            {items.map((item) => (
                <div
                    key={item.id}
                    className="grid grid-cols-[40px_1fr_1fr_1fr_40px] gap-2 border-b border-border px-4 py-2"
                >
                    <div className="flex items-center">
                        <Checkbox
                            checked={item.enabled}
                            onCheckedChange={(checked) =>
                                onUpdate(item.id, "enabled", checked as boolean)
                            }
                        />
                    </div>
                    <Input
                        value={item.key}
                        onChange={(e) => onUpdate(item.id, "key", e.target.value)}
                        className="h-8 text-xs"
                        placeholder="Key"
                    />
                    <Input
                        value={item.value}
                        onChange={(e) => onUpdate(item.id, "value", e.target.value)}
                        className="h-8 text-xs"
                        placeholder="Value"
                    />
                    <Input
                        value={item.description || ""}
                        onChange={(e) =>
                            onUpdate(item.id, "description", e.target.value)
                        }
                        className="h-8 text-xs"
                        placeholder="Description"
                    />
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => onRemove(item.id)}
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>
            ))}
            <div className="px-4 py-2">
                <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-primary"
                    onClick={onAdd}
                >
                    {addButtonText}
                </Button>
            </div>
            </div>
        </div>
    );
}