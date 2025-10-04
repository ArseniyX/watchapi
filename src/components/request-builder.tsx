"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { RequestTabs } from "@/components/request-tabs";
import { RequestUrlBar } from "@/components/request/request-url-bar";
import { RequestBreadcrumb } from "@/components/request/breadcrumb";
import { ResponseViewer } from "@/components/response-viewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { KeyValuePair } from "@/components/request/key-value-table";
import { useAppStore } from "@/store";
import { trpc } from "@/lib/trpc";
import { useForm } from "react-hook-form";

// Tab Components
import { ParamsTab } from "@/components/request/tabs/params-tab";
import { HeadersTab } from "@/components/request/tabs/headers-tab";
import { BodyTab } from "@/components/request/tabs/body-tab";
import Image from "next/image";

// Store form state per tab in memory only
const tabFormsCache = new Map<string, any>();

export function RequestBuilder() {
  // Get active tab and collections data
  const activeTabId = useAppStore((state) => state.activeTabId);
  const tabs = useAppStore((state) => state.tabs);
  const updateTab = useAppStore((state) => state.updateTab);
  const { data: collectionsData } = trpc.collection.getMyCollections.useQuery();
  const utils = trpc.useUtils();

  const activeTab = useMemo(
    () => tabs.find((tab) => tab.id === activeTabId),
    [tabs, activeTabId],
  );

  // Find collection and endpoint data
  const breadcrumbData = useMemo(() => {
    if (!activeTab || !collectionsData) {
      return {
        collection: "My Collection",
        request: "New Request",
        collectionId: null,
      };
    }

    // Find the collection
    const collection = collectionsData.find(
      (col: any) => col.id === activeTab.collectionId,
    );

    if (!collection) {
      return {
        collection: "My Collection",
        request: activeTab.name,
        collectionId: activeTab.collectionId,
      };
    }

    return {
      collection: collection.name,
      request: activeTab.name,
      collectionId: collection.id,
    };
  }, [activeTab, collectionsData]);

  // Get default values for current tab
  const getDefaultValues = useCallback(() => {
    if (activeTabId && tabFormsCache.has(activeTabId)) {
      return tabFormsCache.get(activeTabId);
    }

    // Try to load from collections data
    if (activeTabId && collectionsData) {
      for (const collection of collectionsData) {
        const endpoint = collection.apiEndpoints?.find(
          (e) => e.id === activeTabId,
        );
        if (endpoint) {
          // Parse headers from JSON string to array format
          const headersArray: KeyValuePair[] = endpoint.headers
            ? Object.entries(JSON.parse(endpoint.headers)).map(
                ([key, value]) => ({
                  id: Date.now().toString() + Math.random(),
                  key,
                  value: value as string,
                  enabled: true,
                }),
              )
            : [];

          return {
            method: endpoint.method,
            url: endpoint.url,
            queryParams: [] as KeyValuePair[],
            headers: headersArray,
            authType: "no-auth",
            authToken: "",
            bodyType: endpoint.body ? "raw" : "none",
            rawType: "JSON",
            formData: [] as KeyValuePair[],
            bodyContent: endpoint.body || "",
            responseData: null,
          };
        }
      }
    }

    return {
      method: "GET",
      url: "",
      queryParams: [] as KeyValuePair[],
      headers: [] as KeyValuePair[],
      authType: "no-auth",
      authToken: "",
      bodyType: "raw",
      rawType: "JSON",
      formData: [] as KeyValuePair[],
      bodyContent: "",
      responseData: null,
    };
  }, [activeTabId, collectionsData]);

  // Request State with React Hook Form
  const {
    watch,
    setValue,
    formState: { isDirty },
    reset,
  } = useForm({
    defaultValues: getDefaultValues(),
  });

  const method = watch("method");
  const url = watch("url");
  const queryParams = watch("queryParams");
  const headers = watch("headers");
  const authType = watch("authType");
  const authToken = watch("authToken");
  const bodyType = watch("bodyType");
  const rawType = watch("rawType");
  const formData = watch("formData");
  const bodyContent = watch("bodyContent");
  const responseData = watch("responseData");

  const [requestSent, setRequestSent] = useState(false);

  // Config Tab State (renamed to avoid conflict)
  const [activeConfigTab, setActiveConfigTab] = useState("body");

  // Track previous tab to save state before switching
  const prevTabIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Save previous tab's state before switching
    if (prevTabIdRef.current && prevTabIdRef.current !== activeTabId) {
      const currentValues = {
        method,
        url,
        queryParams,
        headers,
        authType,
        authToken,
        bodyType,
        rawType,
        formData,
        bodyContent,
        responseData,
      };
      tabFormsCache.set(prevTabIdRef.current, currentValues);
    }

    // Load new tab's state
    if (activeTabId) {
      if (tabFormsCache.has(activeTabId)) {
        const savedValues = tabFormsCache.get(activeTabId);
        // Reset with saved values and clear dirty state
        reset(savedValues, {
          keepDefaultValues: false,
          keepDirty: false,
        });
      } else {
        // First time opening this tab - use defaults
        const defaults = getDefaultValues();
        reset(defaults, { keepDefaultValues: false, keepDirty: false });
      }
      prevTabIdRef.current = activeTabId;
    }
  }, [activeTabId, reset, getDefaultValues]);

  // Update tab dirty state and method when form changes
  useEffect(() => {
    if (activeTabId) {
      updateTab(activeTabId, { isDirty, method });
    }
  }, [isDirty, method, activeTabId, updateTab]);

  // Generic handlers for key-value pairs using react-hook-form
  const handleAddQueryParam = useCallback(() => {
    const currentItems = watch("queryParams");
    setValue(
      "queryParams",
      [
        ...currentItems,
        {
          id: Date.now().toString(),
          key: "",
          value: "",
          enabled: true,
        },
      ],
      { shouldDirty: true },
    );
  }, [watch, setValue]);

  const handleUpdateQueryParam = useCallback(
    (id: string, field: keyof KeyValuePair, value: string | boolean) => {
      const currentItems = watch("queryParams");
      setValue(
        "queryParams",
        currentItems.map((item: KeyValuePair) =>
          item.id === id ? { ...item, [field]: value } : item,
        ),
        { shouldDirty: true },
      );
    },
    [watch, setValue],
  );

  const handleRemoveQueryParam = useCallback(
    (id: string) => {
      const currentItems = watch("queryParams");
      setValue(
        "queryParams",
        currentItems.filter((item: KeyValuePair) => item.id !== id),
        { shouldDirty: true },
      );
    },
    [watch, setValue],
  );

  const handleAddHeader = useCallback(() => {
    const currentItems = watch("headers");
    setValue(
      "headers",
      [
        ...currentItems,
        {
          id: Date.now().toString(),
          key: "",
          value: "",
          enabled: true,
        },
      ],
      { shouldDirty: true },
    );
  }, [watch, setValue]);

  const handleUpdateHeader = useCallback(
    (id: string, field: keyof KeyValuePair, value: string | boolean) => {
      const currentItems = watch("headers");
      setValue(
        "headers",
        currentItems.map((item: KeyValuePair) =>
          item.id === id ? { ...item, [field]: value } : item,
        ),
        { shouldDirty: true },
      );
    },
    [watch, setValue],
  );

  const handleRemoveHeader = useCallback(
    (id: string) => {
      const currentItems = watch("headers");
      setValue(
        "headers",
        currentItems.filter((item: KeyValuePair) => item.id !== id),
        { shouldDirty: true },
      );
    },
    [watch, setValue],
  );

  const handleAddFormData = useCallback(() => {
    const currentItems = watch("formData");
    setValue(
      "formData",
      [
        ...currentItems,
        {
          id: Date.now().toString(),
          key: "",
          value: "",
          enabled: true,
        },
      ],
      { shouldDirty: true },
    );
  }, [watch, setValue]);

  const handleUpdateFormData = useCallback(
    (id: string, field: keyof KeyValuePair, value: string | boolean) => {
      const currentItems = watch("formData");
      setValue(
        "formData",
        currentItems.map((item: KeyValuePair) =>
          item.id === id ? { ...item, [field]: value } : item,
        ),
        { shouldDirty: true },
      );
    },
    [watch, setValue],
  );

  const handleRemoveFormData = useCallback(
    (id: string) => {
      const currentItems = watch("formData");
      setValue(
        "formData",
        currentItems.filter((item: KeyValuePair) => item.id !== id),
        { shouldDirty: true },
      );
    },
    [watch, setValue],
  );

  const sendRequestMutation = trpc.monitoring.sendRequest.useMutation();

  const handleSend = useCallback(async () => {
    setRequestSent(true);

    try {
      // Build headers object
      const requestHeaders: Record<string, string> = {};
      headers
        .filter((h: KeyValuePair) => h.enabled && h.key)
        .forEach((h: KeyValuePair) => {
          requestHeaders[h.key] = h.value;
        });

      // Build query string from params
      const enabledParams = queryParams.filter(
        (p: KeyValuePair) => p.enabled && p.key,
      );
      const queryString =
        enabledParams.length > 0
          ? "?" +
            enabledParams
              .map(
                (p: KeyValuePair) =>
                  `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`,
              )
              .join("&")
          : "";

      const fullUrl = url + queryString;

      // Get body if applicable
      let requestBody: string | undefined;
      if (
        method !== "GET" &&
        method !== "HEAD" &&
        bodyType === "raw" &&
        bodyContent
      ) {
        requestBody = bodyContent;
      }

      const result = await sendRequestMutation.mutateAsync({
        url: fullUrl,
        method: method as any,
        headers: requestHeaders,
        body: requestBody,
      });

      console.log("Response:", result);
      setValue("responseData", result, { shouldDirty: false });
    } catch (error) {
      console.error("Request failed:", error);
    } finally {
      setTimeout(() => {
        setRequestSent(false);
      }, 1000);
    }
  }, [
    method,
    url,
    queryParams,
    headers,
    bodyType,
    bodyContent,
    sendRequestMutation,
  ]);

  // Mutation for updating endpoint
  const updateEndpointMutation = trpc.apiEndpoint.update.useMutation({
    onSuccess: async () => {
      await utils.collection.getMyCollections.invalidate();
      await utils.apiEndpoint.getMyEndpoints.invalidate();
    },
  });

  const handleSave = useCallback(async () => {
    if (!activeTabId || !activeTab) return;

    try {
      // Convert headers array to record format
      const headersRecord = headers
        .filter((h: KeyValuePair) => h.enabled && h.key)
        .reduce((acc: Record<string, string>, h: KeyValuePair) => {
          acc[h.key] = h.value;
          return acc;
        }, {} as Record<string, string>);

      // Save to API
      const updateData: any = {
        id: activeTabId,
        name: activeTab.name,
        url: url || "",
        method: method as any,
        headers: headersRecord,
      };

      // Include body field
      if (bodyType === "raw") {
        updateData.body = bodyContent || "";
      }

      console.log("Saving to DB:", updateData);
      await updateEndpointMutation.mutateAsync(updateData);

      // Wait for collections to refresh
      await utils.collection.getMyCollections.invalidate();

      // Save current values to cache
      const currentValues = {
        method,
        url,
        queryParams,
        headers,
        authType,
        authToken,
        bodyType,
        rawType,
        formData,
        bodyContent,
        responseData,
      };
      tabFormsCache.set(activeTabId, currentValues);

      // Reset form to mark as not dirty - update the default values
      reset(currentValues, { keepDefaultValues: false });

      // Update tab to mark as saved
      updateTab(activeTabId, { isDirty: false });
    } catch (error) {
      console.error("Failed to save endpoint:", error);
    }
  }, [
    activeTabId,
    activeTab,
    method,
    url,
    queryParams,
    headers,
    authType,
    authToken,
    bodyType,
    rawType,
    formData,
    bodyContent,
    responseData,
    reset,
    updateTab,
    updateEndpointMutation,
    utils,
  ]);

  const handleRequestNameChange = useCallback(
    async (newName: string) => {
      if (!activeTabId || !activeTab) return;

      try {
        // Update via API
        const updateData: any = {
          id: activeTabId,
          name: newName,
          url,
          method: method as any,
          headers: headers
            .filter((h: KeyValuePair) => h.enabled && h.key)
            .reduce((acc: Record<string, string>, h: KeyValuePair) => {
              acc[h.key] = h.value;
              return acc;
            }, {} as Record<string, string>),
        };

        // Only include body if it has content
        if (bodyType === "raw" && bodyContent) {
          updateData.body = bodyContent;
        }

        await updateEndpointMutation.mutateAsync(updateData);

        // Update tab name in store
        updateTab(activeTabId, { name: newName });
      } catch (error) {
        console.error("Failed to update request name:", error);
      }
    },
    [
      activeTabId,
      activeTab,
      url,
      method,
      headers,
      bodyType,
      bodyContent,
      updateTab,
      updateEndpointMutation,
    ],
  );

  const updateCollectionMutation = trpc.collection.updateCollection.useMutation(
    {
      onSuccess: () => {
        utils.collection.getMyCollections.invalidate();
      },
    },
  );

  const handleCollectionNameChange = useCallback(
    async (newName: string) => {
      if (!breadcrumbData.collectionId) return;

      try {
        await updateCollectionMutation.mutateAsync({
          id: breadcrumbData.collectionId,
          name: newName,
        });
      } catch (error) {
        console.error("Failed to update collection name:", error);
      }
    },
    [breadcrumbData.collectionId, updateCollectionMutation],
  );

  // Show empty state if no tabs
  if (!activeTabId || tabs.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <RequestTabs />
        <div className="flex flex-1 items-center justify-center">
          <Image
            priority
            src="/logo.png"
            alt="WatchAPI logo"
            width={400}
            height={400}
            className="shrink-0 opacity-30"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Tab Bar */}
      <RequestTabs />

      {/* Breadcrumb */}
      <RequestBreadcrumb
        collection={breadcrumbData.collection}
        request={breadcrumbData.request}
        onSave={handleSave}
        onShare={() => console.log("Share")}
        onCopyLink={() => console.log("Copy link")}
        onRequestNameChange={handleRequestNameChange}
        onCollectionNameChange={handleCollectionNameChange}
      />

      {/* Request URL Bar */}
      <RequestUrlBar
        method={method}
        url={url}
        onMethodChange={(value) =>
          setValue("method", value, { shouldDirty: true })
        }
        onUrlChange={(value) => setValue("url", value, { shouldDirty: true })}
        onSend={handleSend}
      />

      {/* Request Configuration */}
      <div className="flex flex-1 flex-col overflow-hidden min-h-0">
        <Tabs
          value={activeConfigTab}
          onValueChange={setActiveConfigTab}
          className="flex flex-1 flex-col min-h-0 gap-0"
        >
          <div className="border-b border-border bg-card px-4 shrink-0">
            <TabsList className="h-10 bg-transparent p-0 gap-1">
              <TabsTrigger
                value="params"
                className="text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:bg-transparent"
              >
                Params
              </TabsTrigger>
              <TabsTrigger
                value="headers"
                className="text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:bg-transparent"
              >
                Headers{" "}
                <span className="ml-1 text-muted-foreground">
                  ({headers.filter((h: KeyValuePair) => h.enabled).length})
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="body"
                className="text-xs data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:bg-transparent"
              >
                Body
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="params"
            className="flex-1 overflow-hidden p-0 m-0 h-full"
          >
            <ParamsTab
              queryParams={queryParams}
              onAdd={handleAddQueryParam}
              onUpdate={handleUpdateQueryParam}
              onRemove={handleRemoveQueryParam}
            />
          </TabsContent>

          <TabsContent
            value="headers"
            className="flex-1 overflow-hidden p-0 m-0 h-full"
          >
            <HeadersTab
              headers={headers}
              onAdd={handleAddHeader}
              onUpdate={handleUpdateHeader}
              onRemove={handleRemoveHeader}
            />
          </TabsContent>

          <TabsContent value="body" className="flex-1 overflow-hidden p-0">
            <BodyTab
              bodyType={bodyType}
              rawType={rawType}
              formData={formData}
              bodyContent={bodyContent}
              onBodyTypeChange={(value) =>
                setValue("bodyType", value, {
                  shouldDirty: true,
                })
              }
              onRawTypeChange={(value) =>
                setValue("rawType", value, {
                  shouldDirty: true,
                })
              }
              onBodyContentChange={(value) =>
                setValue("bodyContent", value, {
                  shouldDirty: true,
                })
              }
              onFormDataAdd={handleAddFormData}
              onFormDataUpdate={handleUpdateFormData}
              onFormDataRemove={handleRemoveFormData}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Response Section */}
      <ResponseViewer requestSent={requestSent} response={responseData} />
    </div>
  );
}
