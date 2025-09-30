"use client"

import { Search, Settings, Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function TopBar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">Home</span>
          <span className="text-sm font-medium text-muted-foreground">Workspaces</span>
          <span className="text-sm font-medium text-muted-foreground">API Network</span>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-8">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input type="text" placeholder="Search Postman" className="w-full bg-muted pl-10 pr-16 text-sm" />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground">
            ⌘ K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
          Invite
        </Button>
        <Button size="icon" variant="ghost">
          <Settings className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost">
          <Bell className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" className="rounded-full">
          <User className="h-4 w-4" />
        </Button>
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
          Upgrade
        </Button>
      </div>
    </header>
  )
}
