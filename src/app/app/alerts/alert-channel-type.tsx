import { DiscordIcon } from "@/components/icons/Discord";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NotificationType } from "@/generated/prisma";
import { Mail, SlackIcon, Webhook } from "lucide-react";

export const AlertChannelType = ({
  channelType,
  setChannelType,
}: {
  channelType: NotificationType;
  setChannelType: (value: NotificationType) => void;
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="channel-type">Channel Type</Label>
      <Select
        value={channelType}
        onValueChange={(value) => setChannelType(value as NotificationType)}
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
  );
};
