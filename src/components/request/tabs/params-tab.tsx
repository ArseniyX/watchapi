"use client";

import { KeyValueTable, type KeyValuePair } from "../key-value-table";

interface ParamsTabProps {
  queryParams: KeyValuePair[];
  onAdd: () => void;
  onUpdate: (
    id: string,
    field: keyof KeyValuePair,
    value: string | boolean,
  ) => void;
  onRemove: (id: string) => void;
}

export function ParamsTab({
  queryParams,
  onAdd,
  onUpdate,
  onRemove,
}: ParamsTabProps) {
  return (
    <div className="h-full">
      <KeyValueTable
        items={queryParams}
        onAdd={onAdd}
        onUpdate={onUpdate}
        onRemove={onRemove}
        addButtonText="+ Add query parameter"
      />
    </div>
  );
}
