"use client";

import { ChevronDown, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface RequestUrlBarProps {
    method: string;
    url: string;
    onMethodChange: (method: string) => void;
    onUrlChange: (url: string) => void;
    onSend: () => void;
}

export function RequestUrlBar({
    method,
    url,
    onMethodChange,
    onUrlChange,
    onSend,
}: RequestUrlBarProps) {
    return (
        <div className="flex items-center gap-2 border-b border-border bg-card p-4">
            <Select value={method} onValueChange={onMethodChange}>
                <SelectTrigger className="w-32">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                </SelectContent>
            </Select>
            <Input
                type="text"
                value={url}
                onChange={(e) => onUrlChange(e.target.value)}
                className="flex-1 font-mono text-xs"
                placeholder="Enter request URL"
            />
            <Button onClick={onSend} className="bg-primary hover:bg-primary/90">
                <Send className="mr-2 h-4 w-4" />
                Send
            </Button>
            {/* <Button size="icon" variant="ghost">
                <ChevronDown className="h-4 w-4" />
            </Button> */}
        </div>
    );
}
