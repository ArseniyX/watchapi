"use client";

export function ScriptsTab() {
  return (
    <div className="space-y-4 p-4">
      <div>
        <h3 className="mb-2 text-sm font-medium">Pre-request Script</h3>
        <p className="mb-4 text-xs text-muted-foreground">
          This script will execute before the request runs
        </p>
        <div className="rounded border border-border bg-muted p-4 font-mono text-xs">
          <div className="text-muted-foreground">
            // Add pre-request scripts here
          </div>
          <div className="text-muted-foreground">
            // Example: pm.environment.set("variable", "value");
          </div>
        </div>
      </div>
    </div>
  );
}
