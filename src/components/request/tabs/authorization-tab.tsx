"use client";

import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface AuthorizationTabProps {
    authType: string;
    authToken: string;
    onAuthTypeChange: (type: string) => void;
    onAuthTokenChange: (token: string) => void;
}

export function AuthorizationTab({
    authType,
    authToken,
    onAuthTypeChange,
    onAuthTokenChange,
}: AuthorizationTabProps) {
    return (
        <div className="space-y-4 p-4">
            <div className="flex items-center gap-2">
                <label className="text-xs font-medium">Type:</label>
                <Select value={authType} onValueChange={onAuthTypeChange}>
                    <SelectTrigger className="w-48">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="no-auth">No Auth</SelectItem>
                        <SelectItem value="bearer-token">Bearer Token</SelectItem>
                        <SelectItem value="basic-auth">Basic Auth</SelectItem>
                        <SelectItem value="api-key">API Key</SelectItem>
                        <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {authType === "bearer-token" && (
                <div className="space-y-2">
                    <label className="text-xs font-medium">Token:</label>
                    <Input
                        value={authToken}
                        onChange={(e) => onAuthTokenChange(e.target.value)}
                        placeholder="Enter bearer token"
                        className="font-mono text-xs"
                    />
                </div>
            )}

            {authType === "basic-auth" && (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium">Username:</label>
                        <Input placeholder="Enter username" className="text-xs" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium">Password:</label>
                        <Input
                            type="password"
                            placeholder="Enter password"
                            className="text-xs"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}