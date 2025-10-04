"use client";

import { LogOut, User, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/components/providers/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <DropdownMenuItem onClick={toggleTheme} className="flex items-center">
      {theme === "dark" ? (
        <Sun className="mr-2 h-4 w-4 text-current" />
      ) : (
        <Moon className="mr-2 h-4 w-4 text-current" />
      )}
      <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
    </DropdownMenuItem>
  );
}

export function SidebarUserProfile() {
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
          <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0 transition-all hover:bg-primary/10">
            <User className="h-4 w-4" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden text-left">
            <span className="text-sm font-medium">
              {user.name || user.email}
            </span>
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
        <ThemeToggle />
        <DropdownMenuItem onClick={handleLogout} className="flex items-center">
          <LogOut className="mr-2 h-4 w-4 text-current" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
