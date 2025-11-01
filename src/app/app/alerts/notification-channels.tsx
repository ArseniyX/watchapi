"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CodeEditor } from "@/components/code-editor";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  MessageSquare,
  Plus,
  Trash2,
  Webhook,
} from "lucide-react";
import { SlackIcon } from "@/components/icons/Slack";
import { DiscordIcon } from "@/components/icons/Discord";
import { trpc } from "@/lib/trpc";
import { NotificationType } from "@/generated/prisma";

type NotificationChannelsProps = {
  selectedOrgId: string | null;
};

const channelTypeOptions = [
  {
    value: NotificationType.EMAIL,
    label: "Email",
    icon: Mail,
    placeholder: '{"emails": ["ops@example.com", "team@example.com"]}',
    helperText: "Enter comma-separated emails in JSON format",
  },
  {
    value: NotificationType.WEBHOOK,
    label: "Webhook",
    icon: Webhook,
    placeholder:
      '{"url": "https://your-webhook.com/alerts", "headers": {"Authorization": "Bearer token"}}',
    helperText: "Configure your webhook URL and optional headers",
  },
  {
    value: NotificationType.SLACK,
    label: "Slack",
    icon: SlackIcon,
    placeholder:
      '{"webhookUrl": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"}',
    helperText: "Provide your Slack incoming webhook URL",
  },
  {
    value: NotificationType.DISCORD,
    label: "Discord",
    icon: DiscordIcon,
    placeholder:
      '{"webhookUrl": "https://discord.com/api/webhooks/YOUR/WEBHOOK"}',
    helperText: "Provide your Discord webhook URL",
  },
];

function NotificationChannelIcon({ type }: { type: string }) {
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
}

export function NotificationChannels({ selectedOrgId }: NotificationChannelsProps) {
  const [channelDialogOpen, setChannelDialogOpen] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [channelType, setChannelType] = useState<NotificationType>(
    NotificationType.EMAIL,
  );
  const [channelConfig, setChannelConfig] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const channelQueryEnabled = !!selectedOrgId;

  const resetChannelForm = () => {
    setChannelName("");
    setChannelType(NotificationType.EMAIL);
    setChannelConfig("");
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setChannelToDelete(null);
  };

  const { data: channels, refetch: refetchChannels } =
    trpc.notificationChannel.getAll.useQuery(
      { organizationId: selectedOrgId ?? "" },
      { enabled: channelQueryEnabled },
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

  const selectedChannelTypeOption = useMemo(
    () => channelTypeOptions.find((option) => option.value === channelType),
    [channelType],
  );

  const handleCreateChannel = () => {
    if (!selectedOrgId) return;

    try {
      JSON.parse(channelConfig);
    } catch {
      toast.error("Invalid JSON configuration");
      return;
    }

    createChannelMutation.mutate({
      organizationId: selectedOrgId,
      name: channelName,
      type: channelType,
      config: channelConfig,
    });
  };

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

      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <CardTitle>Notification Channels</CardTitle>
              <CardDescription>
                Configure how your team receives alerts when endpoints fail.
              </CardDescription>
            </div>

            <Dialog open={channelDialogOpen} onOpenChange={setChannelDialogOpen}>
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
                  <div className="space-y-2">
                    <Label htmlFor="channel-name">Channel Name</Label>
                    <Input
                      id="channel-name"
                      placeholder="e.g., Team Email, Ops Webhook"
                      value={channelName}
                      onChange={(e) => setChannelName(e.target.value)}
                    />
                  </div>

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
                        {channelTypeOptions.map(({ value, label, icon: Icon }) => (
                          <SelectItem key={value} value={value}>
                            <div className="flex items-center">
                              <Icon className="h-4 w-4 mr-2" />
                              {label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="channel-config">Configuration</Label>
                    <CodeEditor
                      id="channel-config"
                      value={channelConfig}
                      onChange={setChannelConfig}
                      language="json"
                      minLines={6}
                      maxLines={12}
                    />
                    <p className="text-sm text-muted-foreground">
                      {selectedChannelTypeOption?.helperText ??
                        "Provide configuration details in JSON format."}
                    </p>
                    {!channelConfig && (
                      <p className="text-xs text-muted-foreground font-mono">
                        {selectedChannelTypeOption?.placeholder ??
                          '{"webhookUrl": "https://example.com"}'}
                      </p>
                    )}
                  </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setChannelDialogOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateChannel}
                    disabled={
                      !channelName ||
                      !channelConfig ||
                      createChannelMutation.isPending
                    }
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
                  <div className="flex items-start gap-4 flex-1">
                    <NotificationChannelIcon type={channel.type} />

                    <div className="flex-1">
                      <h4 className="font-medium leading-none">{channel.name}</h4>
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
                              !selectedOrgId || updateChannelMutation.isPending
                            }
                          />
                          <span>{channel.isActive ? "Active" : "Paused"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end sm:justify-center mt-3 sm:mt-0 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                      onClick={() => handleDeleteChannel(channel)}
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
    </>
  );
}
