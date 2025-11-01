"use client";

import { KeyboardEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Mail, Webhook, MessageSquare, Trash2, X } from "lucide-react";
import { SlackIcon } from "@/components/icons/Slack";
import { DiscordIcon } from "@/components/icons/Discord";
import { trpc } from "@/lib/trpc";
import { NotificationType } from "@/generated/prisma";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard-header";
import { ZodError, z } from "zod";
import { AlertStatistics } from "./alert-statistics";
import { AlertHistory } from "./alert-history";

const emailConfigSchema = z.object({
  emails: z
    .array(z.string().email("Enter a valid email address"))
    .min(1, "Add at least one email address"),
});

const webhookConfigSchema = z.object({
  url: z.string().url("Enter a valid webhook URL"),
  headers: z.record(z.string(), z.string()).optional(),
});

const slackConfigSchema = z.object({
  webhookUrl: z.string().url("Enter a valid Slack webhook URL"),
});

const discordConfigSchema = z.object({
  webhookUrl: z.string().url("Enter a valid Discord webhook URL"),
});

const NotificationChannelIcon = ({ type }: { type: string }) => {
  switch (type) {
    case NotificationType.EMAIL:
      return <Mail className="h-4 w-4" />;
    case NotificationType.WEBHOOK:
      return <Webhook className="h-4 w-4" />;
    case NotificationType.SLACK:
      return <SlackIcon className="h-4 w-4" />;
    case NotificationType.DISCORD:
      return <DiscordIcon className="h-4 w-4" />;
    default:
      return null;
  }
};

export default function AlertsPage() {
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [channelDialogOpen, setChannelDialogOpen] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [channelType, setChannelType] = useState<NotificationType>(
    NotificationType.EMAIL,
  );
  const [emailInput, setEmailInput] = useState("");
  const [emailRecipients, setEmailRecipients] = useState<string[]>([]);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookHeaders, setWebhookHeaders] = useState<
    { key: string; value: string }[]
  >([{ key: "", value: "" }]);
  const [slackWebhookUrl, setSlackWebhookUrl] = useState("");
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data: organizations } =
    trpc.organization.getMyOrganizations.useQuery();
  const { data: endpoints } = trpc.apiEndpoint.getMyEndpoints.useQuery(
    undefined,
    {
      refetchOnWindowFocus: true,
      refetchInterval: 60000,
    },
  );

  const { data: channels, refetch: refetchChannels } =
    trpc.notificationChannel.getAll.useQuery(
      { organizationId: selectedOrgId! },
      { enabled: !!selectedOrgId },
    );

  const { data: recentFailures } = trpc.monitoring.getRecentFailures.useQuery(
    { organizationId: selectedOrgId!, limit: 50 },
    { enabled: !!selectedOrgId, refetchInterval: 60000 },
  );

  const createChannelMutation = trpc.notificationChannel.create.useMutation({
    onSuccess: () => {
      toast.success("Notification channel created successfully");
      refetchChannels();
      setChannelDialogOpen(false);
      resetChannelForm();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setChannelToDelete(null);
  };

  const deleteChannelMutation = trpc.notificationChannel.delete.useMutation({
    onSuccess: () => {
      toast.success("Notification channel deleted");
      refetchChannels();
      closeDeleteDialog();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateChannelMutation = trpc.notificationChannel.update.useMutation({
    onSuccess: () => {
      toast.success("Notification channel updated");
      refetchChannels();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Set initial org if available
  if (!selectedOrgId && organizations && organizations.length > 0) {
    setSelectedOrgId(organizations[0].id);
  }

  const resetChannelForm = () => {
    setChannelName("");
    setChannelType(NotificationType.EMAIL);
    setEmailInput("");
    setEmailRecipients([]);
    setWebhookUrl("");
    setWebhookHeaders([{ key: "", value: "" }]);
    setSlackWebhookUrl("");
    setDiscordWebhookUrl("");
  };

  const handleCreateChannel = () => {
    if (!selectedOrgId) return;

    try {
      let configString = "";
      const trimmedName = channelName.trim();

      switch (channelType) {
        case NotificationType.EMAIL: {
          const config = emailConfigSchema.parse({
            emails: emailRecipients,
          });
          configString = JSON.stringify(config);
          break;
        }
        case NotificationType.WEBHOOK: {
          const trimmedWebhookUrl = webhookUrl.trim();
          const headers = webhookHeaders.reduce<Record<string, string>>(
            (acc, header) => {
              const key = header.key.trim();
              const value = header.value.trim();
              if (key && value) {
                acc[key] = value;
              }
              return acc;
            },
            {},
          );

          const config = webhookConfigSchema.parse({
            url: trimmedWebhookUrl,
            headers: Object.keys(headers).length > 0 ? headers : undefined,
          });
          configString = JSON.stringify(config);
          break;
        }
        case NotificationType.SLACK: {
          const config = slackConfigSchema.parse({
            webhookUrl: slackWebhookUrl.trim(),
          });
          configString = JSON.stringify(config);
          break;
        }
        case NotificationType.DISCORD: {
          const config = discordConfigSchema.parse({
            webhookUrl: discordWebhookUrl.trim(),
          });
          configString = JSON.stringify(config);
          break;
        }
        default:
          throw new Error("Unsupported notification channel type");
      }

      createChannelMutation.mutate({
        organizationId: selectedOrgId,
        name: trimmedName,
        type: channelType,
        config: configString,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        toast.error(
          (error as any).errors[0]?.message ?? "Invalid configuration",
        );
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(
          "Failed to create channel. Check the configuration values.",
        );
      }
    }
  };

  const handleAddEmailRecipient = () => {
    const trimmed = emailInput.trim();
    if (!trimmed) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Enter a valid email address");
      return;
    }

    if (emailRecipients.includes(trimmed)) {
      toast.error("Email already added");
      return;
    }

    setEmailRecipients((prev) => [...prev, trimmed]);
    setEmailInput("");
  };

  const handleEmailInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      handleAddEmailRecipient();
    }
  };

  const removeEmailRecipient = (email: string) => {
    setEmailRecipients((prev) => prev.filter((item) => item !== email));
  };

  const updateWebhookHeader = (
    index: number,
    field: "key" | "value",
    value: string,
  ) => {
    setWebhookHeaders((prev) =>
      prev.map((header, i) =>
        i === index ? { ...header, [field]: value } : header,
      ),
    );
  };

  const addWebhookHeaderRow = () => {
    setWebhookHeaders((prev) => [...prev, { key: "", value: "" }]);
  };

  const removeWebhookHeaderRow = (index: number) => {
    setWebhookHeaders((prev) =>
      prev.filter((_, headerIndex) => headerIndex !== index),
    );
  };

  const isCreateDisabled =
    createChannelMutation.isPending ||
    !channelName.trim() ||
    (channelType === NotificationType.EMAIL && emailRecipients.length === 0) ||
    (channelType === NotificationType.WEBHOOK && !webhookUrl.trim()) ||
    (channelType === NotificationType.SLACK && !slackWebhookUrl.trim()) ||
    (channelType === NotificationType.DISCORD && !discordWebhookUrl.trim());

  const handleDeleteChannel = (channel: { id: string; name: string }) => {
    setChannelToDelete({ id: channel.id, name: channel.name });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDeleteChannel = () => {
    if (!selectedOrgId || !channelToDelete) return;

    deleteChannelMutation.mutate({
      id: channelToDelete.id,
      organizationId: selectedOrgId,
    });
  };

  // Use the dedicated failed checks query or fall back to endpoint checks
  const failedChecks =
    recentFailures?.map((check) => ({
      id: check.id,
      status: check.status,
      statusCode: check.statusCode,
      errorMessage: check.errorMessage,
      responseTime: check.responseTime,
      checkedAt: check.checkedAt,
      endpointName: check.apiEndpoint.name,
      endpointUrl: check.apiEndpoint.url,
    })) || [];

  // Calculate stats
  const totalEndpoints = endpoints?.length || 0;
  const activeAlerts = endpoints?.filter((e) => e.isActive).length || 0;
  const todayFailed = failedChecks.filter((c) => {
    const diff = Date.now() - new Date(c.checkedAt).getTime();
    return diff < 24 * 60 * 60 * 1000;
  }).length;
  const weekFailed = failedChecks.filter((c) => {
    const diff = Date.now() - new Date(c.checkedAt).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <>
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (open) {
            setDeleteDialogOpen(true);
          } else {
            closeDeleteDialog();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Notification Channel</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {channelToDelete?.name ?? "this channel"}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-end">
            <Button
              variant="outline"
              onClick={closeDeleteDialog}
              disabled={deleteChannelMutation.isPending}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteChannel}
              disabled={
                deleteChannelMutation.isPending ||
                !channelToDelete ||
                !selectedOrgId
              }
              className="w-full sm:w-auto"
            >
              {deleteChannelMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <DashboardHeader
          title="Alerts"
          description="Failed endpoint checks and alerts"
        />

        <AlertStatistics
          totalEndpoints={totalEndpoints}
          activeMonitoring={activeAlerts}
          failedToday={todayFailed}
          failedThisWeek={weekFailed}
        />
        <AlertHistory failedChecks={failedChecks} />

        <Card className="w-full">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <CardTitle>Notification Channels</CardTitle>
                <CardDescription>
                  Configure how your team receives alerts when endpoints fail.
                </CardDescription>
              </div>

              <Dialog
                open={channelDialogOpen}
                onOpenChange={(open) => {
                  setChannelDialogOpen(open);
                  if (!open) {
                    resetChannelForm();
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    disabled={!selectedOrgId}
                    className="w-full sm:w-auto justify-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Channel
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Notification Channel</DialogTitle>
                    <DialogDescription>
                      Set up a new channel to receive alerts when API endpoints
                      fail.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    {/* Channel Name */}
                    <div className="space-y-2">
                      <Label htmlFor="channel-name">Channel Name</Label>
                      <Input
                        id="channel-name"
                        placeholder="e.g., Team Email, Ops Webhook"
                        value={channelName}
                        onChange={(e) => setChannelName(e.target.value)}
                      />
                    </div>

                    {/* Channel Type */}
                    <div className="space-y-2">
                      <Label htmlFor="channel-type">Channel Type</Label>
                      <Select
                        value={channelType}
                        onValueChange={(value) =>
                          setChannelType(value as NotificationType)
                        }
                      >
                        <SelectTrigger id="channel-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NotificationType.EMAIL}>
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-2" />
                              Email
                            </div>
                          </SelectItem>
                          <SelectItem value={NotificationType.WEBHOOK}>
                            <div className="flex items-center">
                              <Webhook className="h-4 w-4 mr-2" />
                              Webhook
                            </div>
                          </SelectItem>
                          <SelectItem value={NotificationType.SLACK}>
                            <div className="flex items-center">
                              <SlackIcon className="h-4 w-4 mr-2" />
                              Slack
                            </div>
                          </SelectItem>
                          <SelectItem value={NotificationType.DISCORD}>
                            <div className="flex items-center">
                              <DiscordIcon className="h-4 w-4 mr-2" />
                              Discord
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Channel configuration */}
                    <div className="space-y-4">
                      {channelType === NotificationType.EMAIL && (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label>Email recipients</Label>
                            {emailRecipients.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {emailRecipients.map((email) => (
                                  <Badge
                                    key={email}
                                    variant="secondary"
                                    className="flex items-center gap-1"
                                  >
                                    {email}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeEmailRecipient(email)
                                      }
                                      className="ml-1 rounded-full p-0.5 hover:bg-muted transition"
                                      aria-label={`Remove ${email}`}
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            )}
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Input
                                id="email-recipient"
                                placeholder="alerts@example.com"
                                value={emailInput}
                                onChange={(event) =>
                                  setEmailInput(event.target.value)
                                }
                                onKeyDown={handleEmailInputKeyDown}
                                aria-describedby="email-recipient-help"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddEmailRecipient}
                                disabled={!emailInput.trim()}
                              >
                                Add email
                              </Button>
                            </div>
                          </div>
                          <p
                            id="email-recipient-help"
                            className="text-xs text-muted-foreground"
                          >
                            Add one or more email addresses to notify.
                          </p>
                        </div>
                      )}

                      {channelType === NotificationType.WEBHOOK && (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="webhook-url">Webhook URL</Label>
                            <Input
                              id="webhook-url"
                              placeholder="https://your-webhook.com/alerts"
                              value={webhookUrl}
                              onChange={(event) =>
                                setWebhookUrl(event.target.value)
                              }
                              aria-describedby="webhook-url-help"
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <Label>Headers (optional)</Label>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={addWebhookHeaderRow}
                              >
                                <Plus className="h-4 w-4 mr-1" /> Add header
                              </Button>
                            </div>

                            <div className="space-y-2">
                              {webhookHeaders.length === 0 && (
                                <p className="text-xs text-muted-foreground">
                                  No headers added yet.
                                </p>
                              )}
                              {webhookHeaders.map((header, index) => (
                                <div
                                  key={`webhook-header-${index}`}
                                  className="flex flex-col sm:flex-row gap-2"
                                >
                                  <Input
                                    placeholder="Header name"
                                    value={header.key}
                                    onChange={(event) =>
                                      updateWebhookHeader(
                                        index,
                                        "key",
                                        event.target.value,
                                      )
                                    }
                                  />
                                  <Input
                                    placeholder="Header value"
                                    value={header.value}
                                    onChange={(event) =>
                                      updateWebhookHeader(
                                        index,
                                        "value",
                                        event.target.value,
                                      )
                                    }
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      removeWebhookHeaderRow(index)
                                    }
                                    aria-label="Remove header"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>

                          <p
                            id="webhook-url-help"
                            className="text-xs text-muted-foreground"
                          >
                            Provide the webhook URL and any custom headers
                            required for authentication.
                          </p>
                        </div>
                      )}

                      {channelType === NotificationType.SLACK && (
                        <div className="space-y-2">
                          <Label htmlFor="slack-webhook-url">
                            Slack webhook URL
                          </Label>
                          <Input
                            id="slack-webhook-url"
                            placeholder="https://hooks.slack.com/services/..."
                            value={slackWebhookUrl}
                            onChange={(event) =>
                              setSlackWebhookUrl(event.target.value)
                            }
                            aria-describedby="slack-webhook-help"
                          />
                          <p
                            id="slack-webhook-help"
                            className="text-xs text-muted-foreground"
                          >
                            Paste the Slack incoming webhook URL for your
                            channel.
                          </p>
                        </div>
                      )}

                      {channelType === NotificationType.DISCORD && (
                        <div className="space-y-2">
                          <Label htmlFor="discord-webhook-url">
                            Discord webhook URL
                          </Label>
                          <Input
                            id="discord-webhook-url"
                            placeholder="https://discord.com/api/webhooks/..."
                            value={discordWebhookUrl}
                            onChange={(event) =>
                              setDiscordWebhookUrl(event.target.value)
                            }
                            aria-describedby="discord-webhook-help"
                          />
                          <p
                            id="discord-webhook-help"
                            className="text-xs text-muted-foreground"
                          >
                            Paste the Discord webhook URL for the destination
                            channel.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setChannelDialogOpen(false);
                        resetChannelForm();
                      }}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateChannel}
                      disabled={isCreateDisabled}
                      className="w-full sm:w-auto"
                    >
                      {createChannelMutation.isPending
                        ? "Creating..."
                        : "Create Channel"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>

          <CardContent>
            {!selectedOrgId ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Select an organization to manage notification channels.
                </p>
              </div>
            ) : channels && channels.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">
                  No notification channels configured.
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Add a channel to start receiving alerts.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {channels?.map((channel) => (
                  <div
                    key={channel.id}
                    className="flex sm:flex-row sm:items-center sm:justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-accent/5"
                  >
                    {/* Left section */}
                    <div className="flex items-start gap-4 flex-1">
                      <NotificationChannelIcon type={channel.type} />

                      <div className="flex-1">
                        <h4 className="font-medium leading-none">
                          {channel.name}
                        </h4>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground mt-1">
                          {channel.type}
                        </p>

                        <div className="mt-3 flex items-center gap-3">
                          <Badge
                            variant={channel.isActive ? "default" : "secondary"}
                            className="text-xs px-2 py-0.5"
                          >
                            {channel.isActive ? "Active" : "Inactive"}
                          </Badge>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Switch
                              checked={channel.isActive}
                              onCheckedChange={(value) => {
                                if (!selectedOrgId) return;
                                updateChannelMutation.mutate({
                                  id: channel.id,
                                  organizationId: selectedOrgId,
                                  isActive: value,
                                });
                              }}
                              disabled={
                                !selectedOrgId ||
                                updateChannelMutation.isPending
                              }
                            />
                            <span>
                              {channel.isActive ? "Active" : "Paused"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right section (delete button) */}
                    <div className="flex justify-end sm:justify-center mt-3 sm:mt-0 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                        onClick={() => handleDeleteChannel(channel as any)}
                        disabled={deleteChannelMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
