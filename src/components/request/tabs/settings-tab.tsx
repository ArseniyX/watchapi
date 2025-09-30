"use client";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export function SettingsTab() {
    return (
        <div className="space-y-6 p-4">
            <div className="space-y-2">
                <h3 className="text-sm font-medium">Request timeout</h3>
                <Input
                    type="number"
                    defaultValue="0"
                    className="w-32 text-xs"
                />
                <p className="text-xs text-muted-foreground">
                    0 means no timeout
                </p>
            </div>
            <div className="space-y-2">
                <h3 className="text-sm font-medium">Follow redirects</h3>
                <label className="flex items-center gap-2">
                    <Checkbox defaultChecked />
                    <span className="text-xs">Automatically follow redirects</span>
                </label>
            </div>
            <div className="space-y-2">
                <h3 className="text-sm font-medium">SSL certificate verification</h3>
                <label className="flex items-center gap-2">
                    <Checkbox defaultChecked />
                    <span className="text-xs">
                        Enable SSL certificate verification
                    </span>
                </label>
            </div>
        </div>
    );
}