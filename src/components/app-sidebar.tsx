"use client";

import {
    BarChart3,
    Bell,
    Database,
    Home,
    Users,
    Zap,
    LogOut,
    User,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
} from "@/components/ui/sidebar";
import { Logo } from "./logo";

const items = [
    {
        title: "Dashboard",
        url: "/app",
        icon: Home,
    },
    {
        title: "Collections",
        url: "/app/collections",
        icon: Database,
    },
    {
        title: "Monitoring",
        url: "/app/monitoring",
        icon: Zap,
    },
    {
        title: "Alerts",
        url: "/app/alerts",
        icon: Bell,
    },
    {
        title: "Analytics",
        url: "/app/analytics",
        icon: BarChart3,
    },
    // {
    //   title: "Team",
    //   url: "/app/team",
    //   icon: Users,
    // },
];

export function AppSidebar() {
    const pathname = usePathname();

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="border-b border-sidebar-border">
                <Logo />
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Platform</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === item.url}
                                        tooltip={item.title}
                                    >
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <div className="border-t p-4">
                <UserProfile />
            </div>
        </Sidebar>
    );
}

function UserProfile() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    if (!user) return null;

    return (
        <div className="flex items-center justify-between group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-2">
            <div className="flex items-center space-x-2 group-data-[collapsible=icon]:space-x-0">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                    <span className="text-sm font-medium">
                        {user.name || user.email}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {user.email}
                    </span>
                </div>
            </div>
            <button
                onClick={handleLogout}
                className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent transition-colors"
                title="Logout"
            >
                <LogOut className="h-4 w-4" />
            </button>
        </div>
    );
}
