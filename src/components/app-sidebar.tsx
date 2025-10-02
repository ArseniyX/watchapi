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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    {
        title: "Team",
        url: "/app/team",
        icon: Users,
    },
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
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="cursor-pointer flex items-center w-full rounded-md transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0">
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0 transition-all hover:bg-primary/80">
                        <User className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col group-data-[collapsible=icon]:hidden text-left">
                        <span className="text-sm font-medium">
                            {user.name || user.email}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {user.email}
                        </span>
                    </div>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
