"use client";

type DashboardLoadingStateProps = {
  message?: string;
};

export function DashboardLoadingState({
  message = "Loading dashboard...",
}: DashboardLoadingStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4 min-h-[400px]">
      <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
      <p className="mt-4 text-muted-foreground">{message}</p>
    </div>
  );
}
