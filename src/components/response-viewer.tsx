"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeEditor } from "@/components/code-editor";

interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  responseTime: number;
  responseSize: number;
}

interface ResponseViewerProps {
  requestSent: boolean;
  response?: ResponseData | null;
}

export function ResponseViewer({ requestSent, response }: ResponseViewerProps) {
  // Parse response body
  let parsedBody: any = null;
  let bodyText = "";

  if (response?.body) {
    bodyText = response.body;
    try {
      parsedBody = JSON.parse(response.body);
    } catch {
      parsedBody = null;
    }
  }

  // Convert headers object to array
  const headersArray = response?.headers
    ? Object.entries(response.headers).map(([key, value]) => ({
        key,
        value,
      }))
    : [];

  // Format time and size
  const formattedTime = response?.responseTime
    ? `${(response.responseTime / 1000).toFixed(2)} s`
    : "";
  const formattedSize = response?.responseSize
    ? `${(response.responseSize / 1024).toFixed(2)} KB`
    : "";

  const hasResponse = !!response;

  return (
    <div className="flex h-80 flex-col border-t border-border bg-card">
      <Tabs defaultValue="response" className="flex flex-1 flex-col min-h-0">
        <div className="flex items-center justify-between border-b border-border px-4">
          <TabsList className="h-10 bg-transparent">
            <TabsTrigger value="response" className="text-xs">
              Body
            </TabsTrigger>
            <TabsTrigger value="cookies" className="text-xs">
              Cookies
            </TabsTrigger>
            <TabsTrigger value="headers" className="text-xs">
              Headers{" "}
              <span className="ml-1 text-muted-foreground">
                ({headersArray.length})
              </span>
            </TabsTrigger>
            {/* <TabsTrigger value="test-results" className="text-xs">
              Test Results
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3" />
            </TabsTrigger> */}
          </TabsList>
          {hasResponse && !requestSent && (
            <div className="flex items-center gap-3 text-xs">
              <span
                className={`rounded px-2 py-1 font-medium ${
                  response.status >= 200 && response.status < 300
                    ? "bg-green-500/10 text-green-500"
                    : response.status >= 400
                      ? "bg-red-500/10 text-red-500"
                      : "bg-yellow-500/10 text-yellow-500"
                }`}
              >
                {response.status} {response.statusText}
              </span>
              <span className="text-muted-foreground">{formattedTime}</span>
              <span className="text-muted-foreground">{formattedSize}</span>
            </div>
          )}
        </div>

        <TabsContent
          value="response"
          className="flex-1 overflow-auto p-0 min-h-0"
        >
          {requestSent ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-sm text-muted-foreground">
                  Sending request...
                </p>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col">
              {parsedBody ? (
                <CodeEditor
                  value={JSON.stringify(parsedBody, null, 2)}
                  language="json"
                  readOnly
                />
              ) : (
                <CodeEditor
                  value={bodyText || "No response body"}
                  language="plaintext"
                  readOnly
                />
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent
          value="cookies"
          className="flex-1 overflow-auto p-4 min-h-0"
        >
          <p className="text-sm text-muted-foreground">
            No cookies in this response
          </p>
        </TabsContent>

        <TabsContent
          value="headers"
          className="flex-1 overflow-auto p-0 min-h-0"
        >
          <div className="flex flex-col">
            <div className="grid grid-cols-[1fr_2fr] gap-2 border-b border-border bg-muted px-4 py-2 text-xs font-medium text-muted-foreground">
              <div>KEY</div>
              <div>VALUE</div>
            </div>
            {headersArray.length > 0 ? (
              headersArray.map((header, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_2fr] gap-2 border-b border-border px-4 py-2 text-xs"
                >
                  <div className="font-medium">{header.key}</div>
                  <div className="font-mono text-muted-foreground">
                    {header.value}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-sm text-muted-foreground">
                No headers in this response
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="test-results" className="flex-1 overflow-auto p-4">
          <p className="text-sm text-muted-foreground">
            No tests have been run for this request
          </p>
        </TabsContent>

        <TabsContent value="history" className="flex-1 overflow-auto p-4">
          <p className="text-sm text-muted-foreground">
            No request history yet
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
