"use client";

import type React from "react";

import { useState } from "react";
import { RequestTabs } from "@/components/request-tabs";
import {
    ChevronDown,
    Plus,
    X,
    Send,
    Link,
    Save,
    ChevronRight,
    Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CodeEditor } from "@/components/code-editor";
import { ResponseViewer } from "@/components/response-viewer";
import { Checkbox } from "@/components/ui/checkbox";

interface KeyValuePair {
    id: string;
    key: string;
    value: string;
    description?: string;
    enabled: boolean;
}

export function RequestBuilder() {
    const [method, setMethod] = useState("POST");
    const [url, setUrl] = useState(
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDoTEDZgM8whx1QUh7g3zAUADr_J1VCeGk"
    );
    const [activeTab, setActiveTab] = useState("body");
    const [bodyType, setBodyType] = useState("raw");
    const [rawType, setRawType] = useState("JSON");
    const [requestSent, setRequestSent] = useState(false);

    const [queryParams, setQueryParams] = useState<KeyValuePair[]>([
        {
            id: "1",
            key: "key",
            value: "AIzaSyDoTEDZgM8whx1QUh7g3zAUADr_J1VCeGk",
            enabled: true,
        },
    ]);

    const [headers, setHeaders] = useState<KeyValuePair[]>([
        {
            id: "1",
            key: "Content-Type",
            value: "application/json",
            enabled: true,
        },
        { id: "2", key: "Accept", value: "application/json", enabled: true },
        {
            id: "3",
            key: "User-Agent",
            value: "PostmanRuntime/7.32.3",
            enabled: true,
        },
        {
            id: "4",
            key: "Accept-Encoding",
            value: "gzip, deflate, br",
            enabled: true,
        },
        { id: "5", key: "Connection", value: "keep-alive", enabled: true },
    ]);

    const [authType, setAuthType] = useState("no-auth");
    const [authToken, setAuthToken] = useState("");

    const [formData, setFormData] = useState<KeyValuePair[]>([]);

    const addKeyValuePair = (
        items: KeyValuePair[],
        setItems: React.Dispatch<React.SetStateAction<KeyValuePair[]>>
    ) => {
        setItems([
            ...items,
            { id: Date.now().toString(), key: "", value: "", enabled: true },
        ]);
    };

    const updateKeyValuePair = (
        items: KeyValuePair[],
        setItems: React.Dispatch<React.SetStateAction<KeyValuePair[]>>,
        id: string,
        field: keyof KeyValuePair,
        value: string | boolean
    ) => {
        setItems(
            items.map((item) =>
                item.id === id ? { ...item, [field]: value } : item
            )
        );
    };

    const removeKeyValuePair = (
        items: KeyValuePair[],
        setItems: React.Dispatch<React.SetStateAction<KeyValuePair[]>>,
        id: string
    ) => {
        setItems(items.filter((item) => item.id !== id));
    };

    const handleSend = () => {
        setRequestSent(true);
        // Simulate API call
        setTimeout(() => {
            setRequestSent(false);
        }, 1000);
    };

    return (
        <div className="flex h-full flex-col">
            {/* Tab Bar */}
            <RequestTabs />
            {/* <div className="ml-auto flex items-center gap-2">
                    <Select defaultValue="no-environment">
                        <SelectTrigger className="h-7 w-40 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="no-environment">
                                No environment
                            </SelectItem>
                            <SelectItem value="development">
                                Development
                            </SelectItem>
                            <SelectItem value="production">
                                Production
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div> 
            </div>*/}

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-2 text-xs text-muted-foreground">
                <span className="text-primary">Bot builder</span>
                <ChevronRight className="h-3 w-3" />
                <span>User</span>
                <ChevronRight className="h-3 w-3" />
                <span>Retrieve token</span>
                <div className="ml-auto flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 gap-1 text-xs"
                    >
                        <Save className="h-3 w-3" />
                        Save
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs">
                        Share
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7">
                        <Link className="h-3 w-3" />
                    </Button>
                </div>
            </div>

            {/* Request URL Bar */}
            <div className="flex items-center gap-2 border-b border-border bg-card p-4">
                <Select value={method} onValueChange={setMethod}>
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
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 font-mono text-xs"
                    placeholder="Enter request URL"
                />
                <Button
                    onClick={handleSend}
                    className="bg-primary hover:bg-primary/90"
                >
                    <Send className="mr-2 h-4 w-4" />
                    Send
                </Button>
                <Button size="icon" variant="ghost">
                    <ChevronDown className="h-4 w-4" />
                </Button>
            </div>

            {/* Request Configuration */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="flex flex-1 flex-col"
                >
                    <div className="border-b border-border bg-card px-4">
                        <TabsList className="h-10 bg-transparent">
                            <TabsTrigger value="params" className="text-xs">
                                Params{" "}
                                <span className="ml-1 text-green-500">●</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="authorization"
                                className="text-xs"
                            >
                                Authorization
                            </TabsTrigger>
                            <TabsTrigger value="headers" className="text-xs">
                                Headers{" "}
                                <span className="ml-1 text-muted-foreground">
                                    ({headers.filter((h) => h.enabled).length})
                                </span>
                            </TabsTrigger>
                            <TabsTrigger value="body" className="text-xs">
                                Body{" "}
                                <span className="ml-1 text-green-500">●</span>
                            </TabsTrigger>
                            <TabsTrigger value="scripts" className="text-xs">
                                Scripts{" "}
                                <span className="ml-1 text-green-500">●</span>
                            </TabsTrigger>
                            <TabsTrigger value="tests" className="text-xs">
                                Tests{" "}
                                <span className="ml-1 text-green-500">●</span>
                            </TabsTrigger>
                            <TabsTrigger value="settings" className="text-xs">
                                Settings
                            </TabsTrigger>
                        </TabsList>
                        <div className="ml-auto flex items-center gap-2 text-xs">
                            <button className="text-primary hover:underline">
                                Cookies
                            </button>
                            <button className="text-primary hover:underline">
                                Schema
                            </button>
                            <button className="text-primary hover:underline">
                                Beautify
                            </button>
                        </div>
                    </div>

                    <TabsContent
                        value="params"
                        className="flex-1 overflow-auto p-0"
                    >
                        <div className="flex flex-col">
                            <div className="grid grid-cols-[40px_1fr_1fr_1fr_40px] gap-2 border-b border-border bg-muted px-4 py-2 text-xs font-medium text-muted-foreground">
                                <div></div>
                                <div>KEY</div>
                                <div>VALUE</div>
                                <div>DESCRIPTION</div>
                                <div></div>
                            </div>
                            {queryParams.map((param) => (
                                <div
                                    key={param.id}
                                    className="grid grid-cols-[40px_1fr_1fr_1fr_40px] gap-2 border-b border-border px-4 py-2"
                                >
                                    <div className="flex items-center">
                                        <Checkbox
                                            checked={param.enabled}
                                            onCheckedChange={(checked) =>
                                                updateKeyValuePair(
                                                    queryParams,
                                                    setQueryParams,
                                                    param.id,
                                                    "enabled",
                                                    checked as boolean
                                                )
                                            }
                                        />
                                    </div>
                                    <Input
                                        value={param.key}
                                        onChange={(e) =>
                                            updateKeyValuePair(
                                                queryParams,
                                                setQueryParams,
                                                param.id,
                                                "key",
                                                e.target.value
                                            )
                                        }
                                        className="h-8 text-xs"
                                        placeholder="Key"
                                    />
                                    <Input
                                        value={param.value}
                                        onChange={(e) =>
                                            updateKeyValuePair(
                                                queryParams,
                                                setQueryParams,
                                                param.id,
                                                "value",
                                                e.target.value
                                            )
                                        }
                                        className="h-8 text-xs"
                                        placeholder="Value"
                                    />
                                    <Input
                                        value={param.description || ""}
                                        onChange={(e) =>
                                            updateKeyValuePair(
                                                queryParams,
                                                setQueryParams,
                                                param.id,
                                                "description",
                                                e.target.value
                                            )
                                        }
                                        className="h-8 text-xs"
                                        placeholder="Description"
                                    />
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8"
                                        onClick={() =>
                                            removeKeyValuePair(
                                                queryParams,
                                                setQueryParams,
                                                param.id
                                            )
                                        }
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                            <div className="px-4 py-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-xs text-primary"
                                    onClick={() =>
                                        addKeyValuePair(
                                            queryParams,
                                            setQueryParams
                                        )
                                    }
                                >
                                    + Add query parameter
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent
                        value="authorization"
                        className="flex-1 overflow-auto p-4"
                    >
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-medium">
                                    Type:
                                </label>
                                <Select
                                    value={authType}
                                    onValueChange={setAuthType}
                                >
                                    <SelectTrigger className="w-48">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="no-auth">
                                            No Auth
                                        </SelectItem>
                                        <SelectItem value="bearer-token">
                                            Bearer Token
                                        </SelectItem>
                                        <SelectItem value="basic-auth">
                                            Basic Auth
                                        </SelectItem>
                                        <SelectItem value="api-key">
                                            API Key
                                        </SelectItem>
                                        <SelectItem value="oauth2">
                                            OAuth 2.0
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {authType === "bearer-token" && (
                                <div className="space-y-2">
                                    <label className="text-xs font-medium">
                                        Token:
                                    </label>
                                    <Input
                                        value={authToken}
                                        onChange={(e) =>
                                            setAuthToken(e.target.value)
                                        }
                                        placeholder="Enter bearer token"
                                        className="font-mono text-xs"
                                    />
                                </div>
                            )}
                            {authType === "basic-auth" && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium">
                                            Username:
                                        </label>
                                        <Input
                                            placeholder="Enter username"
                                            className="text-xs"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium">
                                            Password:
                                        </label>
                                        <Input
                                            type="password"
                                            placeholder="Enter password"
                                            className="text-xs"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent
                        value="headers"
                        className="flex-1 overflow-auto p-0"
                    >
                        <div className="flex flex-col">
                            <div className="grid grid-cols-[40px_1fr_1fr_1fr_40px] gap-2 border-b border-border bg-muted px-4 py-2 text-xs font-medium text-muted-foreground">
                                <div></div>
                                <div>KEY</div>
                                <div>VALUE</div>
                                <div>DESCRIPTION</div>
                                <div></div>
                            </div>
                            {headers.map((header) => (
                                <div
                                    key={header.id}
                                    className="grid grid-cols-[40px_1fr_1fr_1fr_40px] gap-2 border-b border-border px-4 py-2"
                                >
                                    <div className="flex items-center">
                                        <Checkbox
                                            checked={header.enabled}
                                            onCheckedChange={(checked) =>
                                                updateKeyValuePair(
                                                    headers,
                                                    setHeaders,
                                                    header.id,
                                                    "enabled",
                                                    checked as boolean
                                                )
                                            }
                                        />
                                    </div>
                                    <Input
                                        value={header.key}
                                        onChange={(e) =>
                                            updateKeyValuePair(
                                                headers,
                                                setHeaders,
                                                header.id,
                                                "key",
                                                e.target.value
                                            )
                                        }
                                        className="h-8 text-xs"
                                        placeholder="Key"
                                    />
                                    <Input
                                        value={header.value}
                                        onChange={(e) =>
                                            updateKeyValuePair(
                                                headers,
                                                setHeaders,
                                                header.id,
                                                "value",
                                                e.target.value
                                            )
                                        }
                                        className="h-8 text-xs"
                                        placeholder="Value"
                                    />
                                    <Input
                                        value={header.description || ""}
                                        onChange={(e) =>
                                            updateKeyValuePair(
                                                headers,
                                                setHeaders,
                                                header.id,
                                                "description",
                                                e.target.value
                                            )
                                        }
                                        className="h-8 text-xs"
                                        placeholder="Description"
                                    />
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8"
                                        onClick={() =>
                                            removeKeyValuePair(
                                                headers,
                                                setHeaders,
                                                header.id
                                            )
                                        }
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                            <div className="px-4 py-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-xs text-primary"
                                    onClick={() =>
                                        addKeyValuePair(headers, setHeaders)
                                    }
                                >
                                    + Add header
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent
                        value="body"
                        className="flex-1 overflow-hidden p-0"
                    >
                        <div className="flex h-full flex-col">
                            <div className="flex items-center gap-4 border-b border-border bg-card px-4 py-2">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="bodyType"
                                        value="none"
                                        checked={bodyType === "none"}
                                        onChange={(e) =>
                                            setBodyType(e.target.value)
                                        }
                                    />
                                    <span className="text-xs">none</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="bodyType"
                                        value="form-data"
                                        checked={bodyType === "form-data"}
                                        onChange={(e) =>
                                            setBodyType(e.target.value)
                                        }
                                    />
                                    <span className="text-xs">form-data</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="bodyType"
                                        value="x-www-form-urlencoded"
                                        checked={
                                            bodyType === "x-www-form-urlencoded"
                                        }
                                        onChange={(e) =>
                                            setBodyType(e.target.value)
                                        }
                                    />
                                    <span className="text-xs">
                                        x-www-form-urlencoded
                                    </span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="bodyType"
                                        value="raw"
                                        checked={bodyType === "raw"}
                                        onChange={(e) =>
                                            setBodyType(e.target.value)
                                        }
                                    />
                                    <span className="text-xs">raw</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="bodyType"
                                        value="binary"
                                        checked={bodyType === "binary"}
                                        onChange={(e) =>
                                            setBodyType(e.target.value)
                                        }
                                    />
                                    <span className="text-xs">binary</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="bodyType"
                                        value="GraphQL"
                                        checked={bodyType === "GraphQL"}
                                        onChange={(e) =>
                                            setBodyType(e.target.value)
                                        }
                                    />
                                    <span className="text-xs">GraphQL</span>
                                </label>
                                {bodyType === "raw" && (
                                    <Select
                                        value={rawType}
                                        onValueChange={setRawType}
                                    >
                                        <SelectTrigger className="ml-auto h-7 w-24 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Text">
                                                Text
                                            </SelectItem>
                                            <SelectItem value="JavaScript">
                                                JavaScript
                                            </SelectItem>
                                            <SelectItem value="JSON">
                                                JSON
                                            </SelectItem>
                                            <SelectItem value="HTML">
                                                HTML
                                            </SelectItem>
                                            <SelectItem value="XML">
                                                XML
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                {(bodyType === "form-data" ||
                                    bodyType === "x-www-form-urlencoded") && (
                                    <div className="flex flex-col">
                                        <div className="grid grid-cols-[40px_1fr_1fr_1fr_40px] gap-2 border-b border-border bg-muted px-4 py-2 text-xs font-medium text-muted-foreground">
                                            <div></div>
                                            <div>KEY</div>
                                            <div>VALUE</div>
                                            <div>DESCRIPTION</div>
                                            <div></div>
                                        </div>
                                        {formData.map((item) => (
                                            <div
                                                key={item.id}
                                                className="grid grid-cols-[40px_1fr_1fr_1fr_40px] gap-2 border-b border-border px-4 py-2"
                                            >
                                                <div className="flex items-center">
                                                    <Checkbox
                                                        checked={item.enabled}
                                                        onCheckedChange={(
                                                            checked
                                                        ) =>
                                                            updateKeyValuePair(
                                                                formData,
                                                                setFormData,
                                                                item.id,
                                                                "enabled",
                                                                checked as boolean
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <Input
                                                    value={item.key}
                                                    onChange={(e) =>
                                                        updateKeyValuePair(
                                                            formData,
                                                            setFormData,
                                                            item.id,
                                                            "key",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="h-8 text-xs"
                                                    placeholder="Key"
                                                />
                                                <Input
                                                    value={item.value}
                                                    onChange={(e) =>
                                                        updateKeyValuePair(
                                                            formData,
                                                            setFormData,
                                                            item.id,
                                                            "value",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="h-8 text-xs"
                                                    placeholder="Value"
                                                />
                                                <Input
                                                    value={
                                                        item.description || ""
                                                    }
                                                    onChange={(e) =>
                                                        updateKeyValuePair(
                                                            formData,
                                                            setFormData,
                                                            item.id,
                                                            "description",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="h-8 text-xs"
                                                    placeholder="Description"
                                                />
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8"
                                                    onClick={() =>
                                                        removeKeyValuePair(
                                                            formData,
                                                            setFormData,
                                                            item.id
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                        <div className="px-4 py-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-xs text-primary"
                                                onClick={() =>
                                                    addKeyValuePair(
                                                        formData,
                                                        setFormData
                                                    )
                                                }
                                            >
                                                + Add field
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                {bodyType === "raw" && <CodeEditor />}
                                {bodyType === "none" && (
                                    <div className="flex h-full items-center justify-center">
                                        <p className="text-sm text-muted-foreground">
                                            This request does not have a body
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent
                        value="scripts"
                        className="flex-1 overflow-auto p-4"
                    >
                        <div className="space-y-4">
                            <div>
                                <h3 className="mb-2 text-sm font-medium">
                                    Pre-request Script
                                </h3>
                                <p className="mb-4 text-xs text-muted-foreground">
                                    This script will execute before the request
                                    runs
                                </p>
                                <div className="rounded border border-border bg-muted p-4 font-mono text-xs">
                                    <div className="text-muted-foreground">
                                        // Add pre-request scripts here
                                    </div>
                                    <div className="text-muted-foreground">
                                        // Example:
                                        pm.environment.set("variable", "value");
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent
                        value="tests"
                        className="flex-1 overflow-auto p-4"
                    >
                        <div className="space-y-4">
                            <div>
                                <h3 className="mb-2 text-sm font-medium">
                                    Test Scripts
                                </h3>
                                <p className="mb-4 text-xs text-muted-foreground">
                                    These scripts will execute after the request
                                    runs
                                </p>
                                <div className="rounded border border-border bg-muted p-4 font-mono text-xs">
                                    <div className="text-muted-foreground">
                                        // Add test scripts here
                                    </div>
                                    <div className="text-muted-foreground">
                                        // Example: pm.test("Status code is
                                        200", function () {"{"}
                                    </div>
                                    <div className="text-muted-foreground">
                                        // pm.response.to.have.status(200);
                                    </div>
                                    <div className="text-muted-foreground">
                                        // {"}"});
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent
                        value="settings"
                        className="flex-1 overflow-auto p-4"
                    >
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium">
                                    Request timeout
                                </h3>
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
                                <h3 className="text-sm font-medium">
                                    Follow redirects
                                </h3>
                                <label className="flex items-center gap-2">
                                    <Checkbox defaultChecked />
                                    <span className="text-xs">
                                        Automatically follow redirects
                                    </span>
                                </label>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium">
                                    SSL certificate verification
                                </h3>
                                <label className="flex items-center gap-2">
                                    <Checkbox defaultChecked />
                                    <span className="text-xs">
                                        Enable SSL certificate verification
                                    </span>
                                </label>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Response Section */}
            <ResponseViewer requestSent={requestSent} />
        </div>
    );
}
