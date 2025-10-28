"use client";

import { useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  LifeBuoy,
  LogOut,
  MessageCircle,
  MessageSquare,
  Moon,
  Sun,
  User,
} from "lucide-react";

import { useAuth } from "@/lib/auth";
import { useTheme } from "@/components/providers/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type CrispCommand = [string, ...unknown[]];

declare global {
  interface Window {
    $crisp?: CrispCommand[];
  }
}

export function SidebarUserProfile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const pushCrispCommand = useCallback((command: CrispCommand) => {
    if (typeof window === "undefined") {
      return;
    }

    if (!window.$crisp) {
      window.$crisp = [];
    }

    window.$crisp.push(command);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const hideChat = () => pushCrispCommand(["do", "chat:hide"]);

    const interval = window.setInterval(() => {
      if (window.$crisp) {
        hideChat();
        pushCrispCommand(["on", "chat:closed", hideChat]);
        window.clearInterval(interval);
      }
    }, 400);

    return () => {
      window.clearInterval(interval);
      pushCrispCommand(["off", "chat:closed", hideChat]);
      pushCrispCommand(["do", "chat:show"]);
    };
  }, [pushCrispCommand]);

  const openCrispChat = useCallback(() => {
    pushCrispCommand(["do", "chat:show"]);
    pushCrispCommand(["do", "chat:open"]);
  }, [pushCrispCommand]);

  const goToFeedback = useCallback(() => {
    router.push("/contact");
  }, [router]);

  const openDocs = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.open("https://docs.watchapi.com", "_blank", "noopener,noreferrer");
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="cursor-pointer flex items-center w-full rounded-md transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 gap-2"
          data-testid="user-profile-dropdown"
        >
          <div className="h-5 w-5 rounded-full bg-secondary flex items-center justify-center shrink-0 transition-all hover:bg-primary/10 overflow-hidden">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name || user.email || "User avatar"}
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-4 w-4" />
            )}
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden text-left">
            <span className="text-sm font-medium">{user.name || user.email}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <Link href="/app/profile" className="flex items-center">
            <User className="mr-2 h-4 w-4 text-current" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleTheme} className="flex items-center">
          {theme === "dark" ? (
            <Sun className="mr-2 h-4 w-4 text-current" />
          ) : (
            <Moon className="mr-2 h-4 w-4 text-current" />
          )}
          <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center">
            <LifeBuoy className="mr-2 h-4 w-4 text-current" />
            <span>Need help?</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-64">
            <DropdownMenuItem
              className="items-start"
              onSelect={(event) => {
                event.preventDefault();
                openCrispChat();
              }}
            >
              <MessageCircle className="mr-2 h-4 w-4 text-current" />
              <div className="flex flex-col">
                <span className="font-medium">Contact support</span>
                <span className="text-xs text-muted-foreground">
                  Start a Crisp conversation
                </span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="items-start"
              onSelect={(event) => {
                event.preventDefault();
                goToFeedback();
              }}
            >
              <MessageSquare className="mr-2 h-4 w-4 text-current" />
              <div className="flex flex-col">
                <span className="font-medium">Provide feedback</span>
                <span className="text-xs text-muted-foreground">
                  Share product ideas or report an issue
                </span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="items-start"
              onSelect={(event) => {
                event.preventDefault();
                openDocs();
              }}
            >
              <BookOpen className="mr-2 h-4 w-4 text-current" />
              <div className="flex flex-col">
                <span className="font-medium">View documentation</span>
                <span className="text-xs text-muted-foreground">
                  Browse implementation guides and FAQs
                </span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="flex items-center">
          <LogOut className="mr-2 h-4 w-4 text-current" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
