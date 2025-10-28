import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Logo } from "./logo";
import { SidebarNav } from "./sidebar-nav";
import { SidebarUserProfile } from "./sidebar-user-profile";
import { SidebarHelpMenu } from "./sidebar-help-menu";

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" data-testid="app-sidebar">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link href="/app">
          <Logo />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarNav />
      </SidebarContent>

      <div className="border-t py-4 flex flex-col gap-4 text-sm text-muted-foreground">
        <SidebarHelpMenu />
        <SidebarUserProfile />
      </div>
    </Sidebar>
  );
}
