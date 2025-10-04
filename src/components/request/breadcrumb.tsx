"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronRight, Save, Share2, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface RequestBreadcrumbProps {
  collection?: string;
  folder?: string;
  request?: string;
  onSave?: () => void;
  onShare?: () => void;
  onCopyLink?: () => void;
  onRequestNameChange?: (name: string) => void;
  onCollectionNameChange?: (name: string) => void;
}

export function RequestBreadcrumb({
  collection = "My Collection",
  folder,
  request = "New Request",
  onSave,
  onShare,
  onCopyLink,
  onRequestNameChange,
  onCollectionNameChange,
}: RequestBreadcrumbProps) {
  const [requestEditValue, setRequestEditValue] = useState(request);
  const [collectionEditValue, setCollectionEditValue] = useState(collection);
  const [requestWidth, setRequestWidth] = useState(0);
  const [collectionWidth, setCollectionWidth] = useState(0);
  const requestInputRef = useRef<HTMLInputElement>(null);
  const collectionInputRef = useRef<HTMLInputElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setRequestEditValue(request);
  }, [request]);

  useEffect(() => {
    setCollectionEditValue(collection);
  }, [collection]);

  // Measure text width with padding for px-1 (8px) + ring (2px) + buffer (6px) = 16px total
  useEffect(() => {
    if (measureRef.current) {
      measureRef.current.textContent = requestEditValue || "A";
      setRequestWidth(Math.max(measureRef.current.offsetWidth + 10, 20));
    }
  }, [requestEditValue]);

  useEffect(() => {
    if (measureRef.current) {
      measureRef.current.textContent = collectionEditValue || "A";
      setCollectionWidth(Math.max(measureRef.current.offsetWidth + 10, 20));
    }
  }, [collectionEditValue]);

  const handleFinishRequestEdit = () => {
    if (
      requestEditValue.trim() &&
      requestEditValue !== request &&
      onRequestNameChange
    ) {
      onRequestNameChange(requestEditValue.trim());
    } else {
      setRequestEditValue(request);
    }
  };

  const handleFinishCollectionEdit = () => {
    if (
      collectionEditValue.trim() &&
      collectionEditValue !== collection &&
      onCollectionNameChange
    ) {
      onCollectionNameChange(collectionEditValue.trim());
    } else {
      setCollectionEditValue(collection);
    }
  };

  const handleRequestKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      requestInputRef.current?.blur();
    } else if (e.key === "Escape") {
      setRequestEditValue(request);
      requestInputRef.current?.blur();
    }
  };

  const handleCollectionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      collectionInputRef.current?.blur();
    } else if (e.key === "Escape") {
      setCollectionEditValue(collection);
      collectionInputRef.current?.blur();
    }
  };
  return (
    <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
      {/* Hidden span for measuring text width */}
      <span
        ref={measureRef}
        className="absolute invisible text-sm whitespace-pre font-sans"
        style={{
          fontSize: "0.875rem",
          fontFamily: "var(--font-geist-sans)",
          letterSpacing: "normal",
        }}
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Input
              ref={collectionInputRef}
              value={collectionEditValue}
              onChange={(e) => setCollectionEditValue(e.target.value)}
              onBlur={handleFinishCollectionEdit}
              onKeyDown={handleCollectionKeyDown}
              onFocus={(e) => {
                setTimeout(() => {
                  e.target.select();
                }, 0);
              }}
              style={{ width: `${collectionWidth}px` }}
              className="h-6 min-w-[20px] px-1 text-sm text-primary border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/50 bg-transparent focus:bg-muted/30 rounded transition-colors"
            />
          </BreadcrumbItem>
          {folder && (
            <>
              <BreadcrumbSeparator>
                <ChevronRight className="h-3 w-3" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">{folder}</BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          <BreadcrumbSeparator>
            <ChevronRight className="h-3 w-3" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <Input
              ref={requestInputRef}
              value={requestEditValue}
              onChange={(e) => setRequestEditValue(e.target.value)}
              onBlur={handleFinishRequestEdit}
              onKeyDown={handleRequestKeyDown}
              onFocus={(e) => {
                setTimeout(() => {
                  e.target.select();
                }, 0);
              }}
              style={{ width: `${requestWidth}px` }}
              className="h-6 min-w-[10px] px-1 text-sm text-foreground border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/50 bg-transparent focus:bg-muted/30 rounded transition-colors"
            />
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 gap-1 text-xs"
          onClick={onSave}
        >
          <Save className="h-3 w-3" />
          Save
        </Button>
        {/* <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={onShare}
                >
                    <Share2 className="h-3 w-3" />
                    Share
                </Button> */}
        {/* <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={onCopyLink}
                >
                    <Link2 className="h-3 w-3" />
                </Button> */}
      </div>
    </div>
  );
}
