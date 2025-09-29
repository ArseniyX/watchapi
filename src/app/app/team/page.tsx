import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, Mail, MoreHorizontal, Crown, Shield, User } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const teamMembers = [
  {
    id: 1,
    name: "Sarah Chen",
    email: "sarah@company.com",
    role: "Owner",
    avatar: "/professional-woman-diverse.png",
    status: "active",
    lastActive: "Online now",
    joinedAt: "Jan 2024",
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    email: "marcus@company.com",
    role: "Admin",
    avatar: "/professional-man.jpg",
    status: "active",
    lastActive: "2 hours ago",
    joinedAt: "Feb 2024",
  },
  {
    id: 3,
    name: "Emily Watson",
    email: "emily@company.com",
    role: "Member",
    avatar: "/professional-woman-engineer.png",
    status: "active",
    lastActive: "1 day ago",
    joinedAt: "Mar 2024",
  },
  {
    id: 4,
    name: "David Kim",
    email: "david@company.com",
    role: "Member",
    avatar: null,
    status: "invited",
    lastActive: "Pending invitation",
    joinedAt: "Invited 2 days ago",
  },
]

const RoleIcon = ({ role }: { role: string }) => {
  switch (role) {
    case "Owner":
      return <Crown className="h-4 w-4 text-yellow-500" />
    case "Admin":
      return <Shield className="h-4 w-4 text-blue-500" />
    default:
      return <User className="h-4 w-4 text-gray-500" />
  }
}

const RoleBadge = ({ role }: { role: string }) => {
  const variants = {
    Owner: "default",
    Admin: "secondary",
    Member: "outline",
  } as const

  return <Badge variant={variants[role as keyof typeof variants] || "outline"}>{role}</Badge>
}

export default function TeamPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground">Manage your team members and permissions</p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Invite Team Member</CardTitle>
            <CardDescription>Send an invitation to join your team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="colleague@company.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select defaultValue="member">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Personal Message (Optional)</Label>
              <Input id="message" placeholder="Welcome to the team!" />
            </div>
            <Button className="w-full">
              <Mail className="mr-2 h-4 w-4" />
              Send Invitation
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Statistics</CardTitle>
            <CardDescription>Overview of your team composition</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Members</span>
                <span className="text-2xl font-bold">4</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Members</span>
                <span className="text-2xl font-bold">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending Invitations</span>
                <span className="text-2xl font-bold">1</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Admins</span>
                <span className="text-2xl font-bold">2</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Manage roles and permissions for your team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                    <AvatarFallback>
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{member.name}</p>
                      <RoleIcon role={member.role} />
                    </div>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    <p className="text-xs text-muted-foreground">{member.lastActive}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <RoleBadge role={member.role} />
                    <p className="text-xs text-muted-foreground mt-1">{member.joinedAt}</p>
                  </div>
                  <Badge variant={member.status === "active" ? "default" : "secondary"}>{member.status}</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Change Role</DropdownMenuItem>
                      <DropdownMenuItem>Resend Invitation</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Remove Member</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
