import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export const AlertChannelDeleteButton = ({
  channel,
  deleteChannelMutation,
  handleDeleteChannel,
}: {
  channel: any;
  deleteChannelMutation: any;
  handleDeleteChannel: (channel: { id: string; name: string }) => void;
}) => {
  return (
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
  );
};
