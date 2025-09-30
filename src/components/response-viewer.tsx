"use client"

import { Clock, Search, Copy, Download, Eye, Code, Filter, MoreHorizontal } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ResponseViewerProps {
  requestSent: boolean
}

export function ResponseViewer({ requestSent }: ResponseViewerProps) {
  const mockResponse = {
    status: 400,
    statusText: "Bad Request",
    time: "1.07 s",
    size: "689 B",
    body: {
      error: {
        code: 400,
        message: "INVALID_PASSWORD",
        errors: [
          {
            message: "INVALID_PASSWORD",
            domain: "global",
            reason: "invalid",
          },
        ],
      },
    },
    headers: [
      { key: "Content-Type", value: "application/json; charset=UTF-8" },
      { key: "Vary", value: "Origin, X-Origin, Referer" },
      { key: "Date", value: "Mon, 29 Sep 2025 12:34:56 GMT" },
      { key: "Server", value: "ESF" },
      { key: "Cache-Control", value: "private" },
      { key: "X-XSS-Protection", value: "0" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Alt-Svc", value: 'h3=":443"; ma=2592000,h3-29=":443"; ma=2592000' },
      { key: "Accept-Ranges", value: "none" },
      { key: "Transfer-Encoding", value: "chunked" },
    ],
    cookies: [],
  }

  return (
    <div className="flex h-80 flex-col border-t border-border bg-card">
      <Tabs defaultValue="response" className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-border px-4">
          <TabsList className="h-10 bg-transparent">
            <TabsTrigger value="response" className="text-xs">
              Body
            </TabsTrigger>
            <TabsTrigger value="cookies" className="text-xs">
              Cookies
            </TabsTrigger>
            <TabsTrigger value="headers" className="text-xs">
              Headers <span className="ml-1 text-muted-foreground">(15)</span>
            </TabsTrigger>
            <TabsTrigger value="test-results" className="text-xs">
              Test Results
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3" />
            </TabsTrigger>
          </TabsList>
          {!requestSent && (
            <div className="flex items-center gap-3 text-xs">
              <span className="rounded bg-red-500/10 px-2 py-1 font-medium text-red-500">
                {mockResponse.status} {mockResponse.statusText}
              </span>
              <span className="text-muted-foreground">{mockResponse.time}</span>
              <span className="text-muted-foreground">{mockResponse.size}</span>
              <Button size="icon" variant="ghost" className="h-7 w-7">
                <Download className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs">
                <Copy className="h-3 w-3" />
                Save Response
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        <TabsContent value="response" className="flex-1 overflow-auto p-0">
          {requestSent ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-sm text-muted-foreground">Sending request...</p>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2">
                <div className="flex items-center gap-2">
                  <Select defaultValue="json">
                    <SelectTrigger className="h-7 w-24 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">
                        <div className="flex items-center gap-1">
                          <Code className="h-3 w-3" />
                          JSON
                        </div>
                      </SelectItem>
                      <SelectItem value="preview">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          Preview
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs">
                    <Filter className="h-3 w-3" />
                    Debug with AI
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="ghost" className="h-7 w-7">
                    <Filter className="h-3 w-3" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7">
                    <Search className="h-3 w-3" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7">
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-1 overflow-auto">
                <div className="flex flex-col border-r border-border bg-muted px-2 py-3 text-right font-mono text-xs text-muted-foreground">
                  {JSON.stringify(mockResponse.body, null, 2)
                    .split("\n")
                    .map((_, i) => (
                      <div key={i} className="leading-6">
                        {i + 1}
                      </div>
                    ))}
                </div>
                <pre className="flex-1 overflow-auto p-3 font-mono text-xs text-foreground">
                  {JSON.stringify(mockResponse.body, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="cookies" className="flex-1 overflow-auto p-4">
          <p className="text-sm text-muted-foreground">No cookies in this response</p>
        </TabsContent>

        <TabsContent value="headers" className="flex-1 overflow-auto p-0">
          <div className="flex flex-col">
            <div className="grid grid-cols-[1fr_2fr] gap-2 border-b border-border bg-muted px-4 py-2 text-xs font-medium text-muted-foreground">
              <div>KEY</div>
              <div>VALUE</div>
            </div>
            {mockResponse.headers.map((header, i) => (
              <div key={i} className="grid grid-cols-[1fr_2fr] gap-2 border-b border-border px-4 py-2 text-xs">
                <div className="font-medium">{header.key}</div>
                <div className="font-mono text-muted-foreground">{header.value}</div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="test-results" className="flex-1 overflow-auto p-4">
          <p className="text-sm text-muted-foreground">No tests have been run for this request</p>
        </TabsContent>

        <TabsContent value="history" className="flex-1 overflow-auto p-4">
          <p className="text-sm text-muted-foreground">No request history yet</p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
