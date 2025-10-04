"use client";

import { KeyValueTable, type KeyValuePair } from "../key-value-table";
import { CodeEditor } from "@/components/code-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { toast } from "sonner";

interface BodyTabProps {
  bodyType: string;
  rawType: string;
  formData: KeyValuePair[];
  bodyContent: string;
  onBodyTypeChange: (type: string) => void;
  onRawTypeChange: (type: string) => void;
  onBodyContentChange: (content: string) => void;
  onFormDataAdd: () => void;
  onFormDataUpdate: (
    id: string,
    field: keyof KeyValuePair,
    value: string | boolean,
  ) => void;
  onFormDataRemove: (id: string) => void;
}

export function BodyTab({
  bodyType,
  rawType,
  formData,
  bodyContent,
  onBodyTypeChange,
  onRawTypeChange,
  onBodyContentChange,
  onFormDataAdd,
  onFormDataUpdate,
  onFormDataRemove,
}: BodyTabProps) {
  const handleFormatJSON = () => {
    if (rawType !== "JSON" || !bodyContent.trim()) {
      toast.error("No JSON content to format");
      return;
    }

    try {
      const parsed = JSON.parse(bodyContent);
      const formatted = JSON.stringify(parsed, null, 2);
      onBodyContentChange(formatted);
      toast.success("JSON formatted successfully");
    } catch (error) {
      toast.error("Invalid JSON: Unable to format");
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Body Type Selector */}
      <div className="flex items-center gap-4 border-b border-border bg-card px-4 py-2 min-h-[40px]">
        <div className="flex items-center gap-4 flex-1">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="bodyType"
              value="none"
              checked={bodyType === "none"}
              onChange={(e) => onBodyTypeChange(e.target.value)}
            />
            <span className="text-xs">none</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="bodyType"
              value="raw"
              checked={bodyType === "raw"}
              onChange={(e) => onBodyTypeChange(e.target.value)}
            />
            <span className="text-xs">raw</span>
          </label>
        </div>
        {bodyType === "raw" && rawType === "JSON" && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleFormatJSON}
            className="h-7 text-xs gap-1"
          >
            <Wand2 className="h-3 w-3" />
          </Button>
        )}
        <div className="w-24 shrink-0">
          <Select
            value={rawType}
            onValueChange={onRawTypeChange}
            disabled={bodyType !== "raw"}
          >
            <SelectTrigger
              className="h-7 w-24 text-xs"
              style={{
                visibility: bodyType === "raw" ? "visible" : "hidden",
              }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="JSON">JSON</SelectItem>
              <SelectItem value="Text">Text</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-hidden">
        {(bodyType === "form-data" || bodyType === "x-www-form-urlencoded") && (
          <KeyValueTable
            items={formData}
            onAdd={onFormDataAdd}
            onUpdate={onFormDataUpdate}
            onRemove={onFormDataRemove}
            addButtonText="+ Add field"
          />
        )}
        {bodyType === "raw" && (
          <CodeEditor
            value={bodyContent}
            onChange={onBodyContentChange}
            language={rawType === "Text" ? "plaintext" : "json"}
          />
        )}
        {bodyType === "none" && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">
              This request does not have a body
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
