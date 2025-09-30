"use client";

import { KeyValueTable, type KeyValuePair } from "../key-value-table";

interface HeadersTabProps {
    headers: KeyValuePair[];
    onAdd: () => void;
    onUpdate: (id: string, field: keyof KeyValuePair, value: string | boolean) => void;
    onRemove: (id: string) => void;
}

export function HeadersTab({
    headers,
    onAdd,
    onUpdate,
    onRemove,
}: HeadersTabProps) {
    return (
        <div className="h-full">
            <KeyValueTable
                items={headers}
                onAdd={onAdd}
                onUpdate={onUpdate}
                onRemove={onRemove}
                addButtonText="+ Add header"
            />
        </div>
    );
}