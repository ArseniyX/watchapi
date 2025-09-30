import type React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AuthGuard } from "@/components/auth-guard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            <SidebarProvider defaultOpen={false}>
                <AppSidebar />
                <SidebarInset>
                    <div className="flex flex-1 flex-col gap-4 px-4 pt-0">
                        {children}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </AuthGuard>
    );
}
