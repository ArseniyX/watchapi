"use client";

export function TestsTab() {
    return (
        <div className="space-y-4 p-4">
            <div>
                <h3 className="mb-2 text-sm font-medium">Test Scripts</h3>
                <p className="mb-4 text-xs text-muted-foreground">
                    These scripts will execute after the request runs
                </p>
                <div className="rounded border border-border bg-muted p-4 font-mono text-xs">
                    <div className="text-muted-foreground">
                        // Add test scripts here
                    </div>
                    <div className="text-muted-foreground">
                        {`// Example: pm.test("Status code is 200", function () {`}
                    </div>
                    <div className="text-muted-foreground">
                        //   pm.response.to.have.status(200);
                    </div>
                    <div className="text-muted-foreground">
                        {`// });`}
                    </div>
                </div>
            </div>
        </div>
    );
}