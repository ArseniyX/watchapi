"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, Mail, MoreHorizontal, Crown, Shield, User } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { trpc } from "@/lib/trpc"
import { OrganizationRole } from "@/generated/prisma"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth"

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
  const { user: currentUser } = useAuth()
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<OrganizationRole>(OrganizationRole.MEMBER)
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)

  const { data: organizations } = trpc.organization.getMyOrganizations.useQuery()
  const { data: members, refetch: refetchMembers } = trpc.organization.getMembers.useQuery(
    { organizationId: selectedOrgId! },
    { enabled: !!selectedOrgId }
  )
  const { data: invitations } = trpc.organization.getInvitations.useQuery(
    { organizationId: selectedOrgId! },
    { enabled: !!selectedOrgId }
  )

  const inviteMember = trpc.organization.inviteMember.useMutation({
    onSuccess: () => {
      toast.success("Member invited successfully")
      setEmail("")
      refetchMembers()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const removeMember = trpc.organization.removeMember.useMutation({
    onSuccess: () => {
      toast.success("Member removed successfully")
      refetchMembers()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const updateRole = trpc.organization.updateMemberRole.useMutation({
    onSuccess: () => {
      toast.success("Role updated successfully")
      refetchMembers()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  // Select first organization by default
  if (organizations && organizations.length > 0 && !selectedOrgId) {
    setSelectedOrgId(organizations[0].id)
  }

  const handleInvite = () => {
    if (!selectedOrgId || !email) return

    inviteMember.mutate({
      email,
      organizationId: selectedOrgId,
      role,
    })
  }

  const activeMembers = members?.filter(m => m.status === "ACTIVE").length || 0
  const pendingInvitations = (invitations?.length || 0) + (members?.filter(m => m.status === "INVITED").length || 0)
  const admins = members?.filter(m => m.role === "ADMIN" || m.role === "OWNER").length || 0

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground">Manage your team members and permissions</p>
        </div>
        {organizations && organizations.length > 0 && (
          <Select value={selectedOrgId || undefined} onValueChange={setSelectedOrgId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select organization" />
            </SelectTrigger>
            <SelectContent>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
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
              <Input
                id="email"
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as OrganizationRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={OrganizationRole.MEMBER}>Member</SelectItem>
                  <SelectItem value={OrganizationRole.ADMIN}>Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full"
              onClick={handleInvite}
              disabled={!email || !selectedOrgId || inviteMember.isPending}
            >
              <Mail className="mr-2 h-4 w-4" />
              {inviteMember.isPending ? "Sending..." : "Send Invitation"}
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
                <span className="text-2xl font-bold">{members?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Members</span>
                <span className="text-2xl font-bold">{activeMembers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending Invitations</span>
                <span className="text-2xl font-bold">{pendingInvitations}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Admins</span>
                <span className="text-2xl font-bold">{admins}</span>
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
          {!members || members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No team members yet. Invite your first member to get started!
            </div>
          ) : (
            <div className="space-y-4">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback>
                        {member.user.name
                          ? member.user.name.split(" ").map((n) => n[0]).join("")
                          : member.user.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{member.user.name || member.user.email}</p>
                        <RoleIcon role={member.role} />
                      </div>
                      <p className="text-sm text-muted-foreground">{member.user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.status === "ACTIVE" ? "Active" : "Pending invitation"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <RoleBadge role={member.role} />
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={member.status === "ACTIVE" ? "default" : "secondary"}>
                      {member.status.toLowerCase()}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={member.user.id === currentUser?.id && member.role === "OWNER"}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {member.role !== "OWNER" && member.user.id !== currentUser?.id && (
                          <>
                            <DropdownMenuItem
                              onClick={() => {
                                const newRole = member.role === "ADMIN" ? OrganizationRole.MEMBER : OrganizationRole.ADMIN
                                updateRole.mutate({
                                  userId: member.user.id,
                                  organizationId: selectedOrgId!,
                                  role: newRole,
                                })
                              }}
                              disabled={updateRole.isPending}
                            >
                              {updateRole.isPending ? "Updating..." : `Change to ${member.role === "ADMIN" ? "Member" : "Admin"}`}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        {member.user.id !== currentUser?.id && member.role !== "OWNER" && (
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              if (confirm(`Are you sure you want to remove ${member.user.name || member.user.email} from this organization?`)) {
                                removeMember.mutate({
                                  userId: member.user.id,
                                  organizationId: selectedOrgId!,
                                })
                              }
                            }}
                            disabled={removeMember.isPending}
                          >
                            {removeMember.isPending ? "Removing..." : "Remove from Team"}
                          </DropdownMenuItem>
                        )}
                        {member.user.id === currentUser?.id && (
                          <DropdownMenuItem disabled className="text-muted-foreground">
                            You cannot modify your own membership
                          </DropdownMenuItem>
                        )}
                        {member.role === "OWNER" && member.user.id !== currentUser?.id && (
                          <DropdownMenuItem disabled className="text-muted-foreground">
                            Owner cannot be modified
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
