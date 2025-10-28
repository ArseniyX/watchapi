"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, HelpCircle, LifeBuoy, Mail } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SidebarHelpMenu() {
  const router = useRouter();

  const handleContactSupport = useCallback(() => {
    document.getElementById("crisp-chatbox-button")?.click();
  }, [router]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-testid="sidebar-help-dropdown"
          aria-label="Open help menu"
          className="cursor-pointer flex items-center w-full rounded-md transition-colors group-data-[collapsible=icon]:justify-center gap-2 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring p-2"
        >
          <HelpCircle className="h-4 w-4 shrink-0" />
          <span className="group-data-[collapsible=icon]:hidden">
            Help &amp; Support
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Need help?</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            handleContactSupport();
          }}
          className="flex cursor-pointer items-center gap-2"
        >
          <LifeBuoy className="h-4 w-4 text-current" />
          <span>Contact Support</span>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href="mailto:support@watchapi.dev"
            className="flex items-center gap-2"
          >
            <Mail className="h-4 w-4 text-current" />
            <span>Email Us</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href={`${process.env.NEXT_PUBLIC_DOMAIN}/docs`}
            className="flex items-center gap-2"
            target="_blank"
            rel="noreferrer"
          >
            <BookOpen className="h-4 w-4 text-current" />
            <span>Documentation</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
