import type React from "react";
import Link from "next/link";

import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AuthGuard } from "@/components/auth-guard";
import { Logo } from "@/components/logo";
import { SidebarUserProfile } from "@/components/sidebar-user-profile";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SidebarProvider defaultOpen={false}>
        <AppSidebar />
        <SidebarInset className="flex flex-col h-screen">
          <header className="flex items-center gap-2 border-b border-border bg-background px-4 py-3 md:hidden">
            <SidebarTrigger className="-ml-1" />
            <Link href="/app" className="flex items-center">
              <Logo />
            </Link>
            <div className="ml-auto">
              <SidebarUserProfile />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 px-4 pt-0 md:pt-0 overflow-auto">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
