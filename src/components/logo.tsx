import { cn } from "@/lib/utils";
import Image from "next/image";

export const Logo = ({ className }: { className?: string }) => {
    return (
        <div className={cn("flex items-center space-x-2", className)}>
            <Image
                src="/logo.png"
                alt="WatchAPI logo"
                width={40}
                height={40}
                className="shrink-0 dark:invert-0 invert"
            />
            <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">
                WatchAPI
            </span>
        </div>
    );
};
