"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ToastProps {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive";
  onDismiss?: () => void;
}

export function Toast({
  id,
  title,
  description,
  variant = "default",
  onDismiss,
}: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss?.();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={cn(
        "pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-4 pr-8 shadow-lg transition-all backdrop-blur-sm",
        variant === "destructive"
          ? "border-red-500/50 bg-red-500/10 text-foreground"
          : "border-border bg-background/95 text-foreground",
      )}
      data-toast-id={id}
    >
      <div className="grid gap-1">
        {title && (
          <div
            className={cn(
              "text-sm font-semibold",
              variant === "destructive" && "text-red-500",
            )}
          >
            {title}
          </div>
        )}
        {description && (
          <div className="text-sm text-muted-foreground">{description}</div>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground opacity-70 transition-opacity hover:text-foreground hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-4 right-4 z-[100] flex max-h-screen w-full max-w-[420px] flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onDismiss={() => dismiss(toast.id)} />
      ))}
    </div>
  );
}
