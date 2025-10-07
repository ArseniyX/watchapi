"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserPlus,
  Mail,
  MoreHorizontal,
  Crown,
  Shield,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { trpc } from "@/lib/trpc";
import { OrganizationRole } from "@/generated/prisma";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useOrganizationStore } from "@/stores/organization-store";

const RoleIcon = ({ role }: { role: string }) => {
  switch (role) {
    case "Owner":
      return <Crown className="h-4 w-4 text-yellow-500" />;
    case "Admin":
      return <Shield className="h-4 w-4 text-blue-500" />;
    default:
      return <User className="h-4 w-4 text-gray-500" />;
  }
};

const RoleBadge = ({ role }: { role: string }) => {
  const variants = {
    Owner: "default",
    Admin: "secondary",
    Member: "outline",
  } as const;

  return (
    <Badge variant={variants[role as keyof typeof variants] || "outline"}>
      {role}
    </Badge>
  );
};

export default function TeamPage() {
  const { user: currentUser } = useAuth();
  const { selectedOrgId, setSelectedOrgId } = useOrganizationStore();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<OrganizationRole>(OrganizationRole.MEMBER);
  const [memberToRemove, setMemberToRemove] = useState<{
    userId: string;
    name: string;
    email: string;
  } | null>(null);

  const { data: organizations } =
    trpc.organization.getMyOrganizations.useQuery();
  const { data: members, refetch: refetchMembers } =
    trpc.organization.getMembers.useQuery(
      { organizationId: selectedOrgId! },
      { enabled: !!selectedOrgId },
    );
  const { data: invitations, refetch: refetchInvitations } =
    trpc.organization.getInvitations.useQuery(
      { organizationId: selectedOrgId! },
      { enabled: !!selectedOrgId },
    );

  const inviteMember = trpc.organization.inviteMember.useMutation({
    onSuccess: () => {
      toast.success("Member invited successfully");
      setEmail("");
      refetchMembers();
      refetchInvitations();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const removeMember = trpc.organization.removeMember.useMutation({
    onSuccess: () => {
      toast.success("Member removed successfully");
      refetchMembers();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateRole = trpc.organization.updateMemberRole.useMutation({
    onSuccess: () => {
      toast.success("Role updated successfully");
      refetchMembers();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resendInvitation = trpc.organization.resendInvitation.useMutation({
    onSuccess: () => {
      toast.success("Invitation resent successfully");
      refetchInvitations();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Select first organization by default if none selected
  useEffect(() => {
    if (organizations && organizations.length > 0 && !selectedOrgId) {
      setSelectedOrgId(organizations[0].id);
    }
  }, [organizations, selectedOrgId, setSelectedOrgId]);

  const handleInvite = () => {
    if (!selectedOrgId || !email) return;

    inviteMember.mutate({
      email,
      organizationId: selectedOrgId,
      role,
    });
  };

  const currentUserMember = members?.find((m) => m.user.id === currentUser?.id);
  const currentUserRole = currentUserMember?.role;
  const isAdminOrOwner =
    currentUserRole === "ADMIN" || currentUserRole === "OWNER";

  const activeMembers =
    members?.filter((m) => m.status === "ACTIVE").length || 0;
  const pendingInvitations =
    (invitations?.length || 0) +
    (members?.filter((m) => m.status === "INVITED").length || 0);
  const admins =
    members?.filter((m) => m.role === "ADMIN" || m.role === "OWNER").length ||
    0;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground">
            Manage your team members and permissions
          </p>
        </div>
        {organizations && organizations.length > 0 && (
          <Select
            value={selectedOrgId || undefined}
            onValueChange={setSelectedOrgId}
          >
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
            <CardDescription>
              Send an invitation to join your team
            </CardDescription>
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
              <Select
                value={role}
                onValueChange={(v) => setRole(v as OrganizationRole)}
              >
                <SelectTrigger className="border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={OrganizationRole.MEMBER}>
                    Member
                  </SelectItem>
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
                <span className="text-sm text-muted-foreground">
                  Total Members
                </span>
                <span className="text-2xl font-bold">
                  {members?.length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Active Members
                </span>
                <span className="text-2xl font-bold">{activeMembers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Pending Invitations
                </span>
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

      {invitations && invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>
              Invitations sent to people who haven't registered yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-muted/50"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback>
                        {invitation.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{invitation.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Invited{" "}
                        {new Date(invitation.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Expires{" "}
                        {new Date(invitation.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <RoleBadge role={invitation.role} />
                    <Badge variant="secondary">Pending</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        resendInvitation.mutate({
                          invitationId: invitation.id,
                        });
                      }}
                      disabled={resendInvitation.isPending}
                    >
                      {resendInvitation.isPending ? "Sending..." : "Resend"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage roles and permissions for your team
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!members || members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No team members yet. Invite your first member to get started!
            </div>
          ) : (
            <div className="space-y-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback>
                        {member.user.name
                          ? member.user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                          : member.user.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">
                          {member.user.name || member.user.email}
                        </p>
                        <RoleIcon role={member.role} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {member.user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.status === "ACTIVE"
                          ? "Active"
                          : "Pending invitation"}
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
                    <Badge
                      variant={
                        member.status === "ACTIVE" ? "default" : "secondary"
                      }
                    >
                      {member.status.toLowerCase()}
                    </Badge>
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={
                            member.user.id === currentUser?.id &&
                            member.role === "OWNER"
                          }
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="z-[9999]"
                        side="bottom"
                        sideOffset={5}
                        avoidCollisions={true}
                        collisionPadding={10}
                      >
                        {member.user.id === currentUser?.id ? (
                          <DropdownMenuItem
                            disabled
                            className="text-muted-foreground"
                          >
                            You cannot modify your own membership
                          </DropdownMenuItem>
                        ) : member.role === "OWNER" ? (
                          <DropdownMenuItem
                            disabled
                            className="text-muted-foreground"
                          >
                            Owner cannot be modified
                          </DropdownMenuItem>
                        ) : !isAdminOrOwner ? (
                          <DropdownMenuItem
                            disabled
                            className="text-muted-foreground"
                          >
                            Only admins and owners can modify members
                          </DropdownMenuItem>
                        ) : (
                          <>
                            <DropdownMenuItem
                              onClick={() => {
                                const newRole =
                                  member.role === "ADMIN"
                                    ? OrganizationRole.MEMBER
                                    : OrganizationRole.ADMIN;
                                updateRole.mutate({
                                  userId: member.user.id,
                                  organizationId: selectedOrgId!,
                                  role: newRole,
                                });
                              }}
                              disabled={updateRole.isPending}
                            >
                              {updateRole.isPending
                                ? "Updating..."
                                : `Change to ${
                                    member.role === "ADMIN" ? "Member" : "Admin"
                                  }`}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => {
                                setMemberToRemove({
                                  userId: member.user.id,
                                  name: member.user.name || member.user.email,
                                  email: member.user.email,
                                });
                              }}
                              disabled={removeMember.isPending}
                            >
                              {removeMember.isPending
                                ? "Removing..."
                                : "Remove from Team"}
                            </DropdownMenuItem>
                          </>
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

      <AlertDialog
        open={!!memberToRemove}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-semibold">{memberToRemove?.name}</span> (
              {memberToRemove?.email}) from this organization? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (memberToRemove && selectedOrgId) {
                  removeMember.mutate({
                    userId: memberToRemove.userId,
                    organizationId: selectedOrgId,
                  });
                  setMemberToRemove(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
