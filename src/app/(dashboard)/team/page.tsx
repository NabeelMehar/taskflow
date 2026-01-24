'use client'

import { useState, useEffect, useCallback } from 'react'
import { Users, UserPlus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import {
  TeamMembersList,
  InviteMemberModal,
  PendingInvitations,
  RemoveMemberDialog,
} from '@/components/team'
import { useAppStore } from '@/lib/store'
import { createClient } from '@/lib/supabase/client'
import { User, WorkspaceMember, TeamInvitation, InvitationRole } from '@/types'

interface MemberWithRole {
  user: User
  role: WorkspaceMember['role']
}

export default function TeamPage() {
  const { toast } = useToast()
  const supabase = createClient()
  const { user, currentWorkspace } = useAppStore()

  const [members, setMembers] = useState<MemberWithRole[]>([])
  const [invitations, setInvitations] = useState<TeamInvitation[]>([])
  const [currentUserRole, setCurrentUserRole] = useState<WorkspaceMember['role']>('member')
  const [isLoading, setIsLoading] = useState(true)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<User | null>(null)

  const loadTeamData = useCallback(async () => {
    if (!currentWorkspace?.id) return

    setIsLoading(true)
    try {
      // Fetch workspace members with user data
      const { data: membersData, error: membersError } = await supabase
        .from('workspace_members')
        .select(`
          role,
          user:users(*)
        `)
        .eq('workspace_id', currentWorkspace.id)

      if (membersError) throw membersError

      const formattedMembers = (membersData || [])
        .filter((m: any) => m.user)
        .map((m: any) => ({
          user: m.user as User,
          role: m.role as WorkspaceMember['role'],
        }))

      setMembers(formattedMembers)

      // Find current user's role
      const currentMember = formattedMembers.find((m) => m.user.id === user?.id)
      if (currentMember) {
        setCurrentUserRole(currentMember.role)
      }

      // Fetch pending invitations
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .eq('status', 'pending')

      if (invitationsError) throw invitationsError

      setInvitations(invitationsData || [])
    } catch (error) {
      console.error('Error loading team data:', error)
      toast({
        title: 'Failed to load team',
        description: 'Please try refreshing the page.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [currentWorkspace?.id, user?.id, supabase, toast])

  useEffect(() => {
    loadTeamData()
  }, [loadTeamData])

  const handleInvite = async (email: string, role: InvitationRole) => {
    if (!currentWorkspace?.id || !user?.id) {
      throw new Error('No workspace selected')
    }

    // Check if user is already a member
    const existingMember = members.find(
      (m) => m.user.email.toLowerCase() === email.toLowerCase()
    )
    if (existingMember) {
      throw new Error('This user is already a team member')
    }

    // Check if there's already a pending invitation
    const existingInvitation = invitations.find(
      (inv) => inv.email.toLowerCase() === email.toLowerCase()
    )
    if (existingInvitation) {
      throw new Error('An invitation has already been sent to this email')
    }

    const { data, error } = await supabase
      .from('team_invitations')
      .insert({
        workspace_id: currentWorkspace.id,
        email: email.toLowerCase(),
        role,
        invited_by: user.id,
      })
      .select()
      .single()

    if (error) throw error

    setInvitations((prev) => [...prev, data])
  }

  const handleResendInvitation = async (invitation: TeamInvitation) => {
    // Update the invitation with a new token and expiry
    const { error } = await supabase
      .from('team_invitations')
      .update({
        token: crypto.randomUUID(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('id', invitation.id)

    if (error) {
      toast({
        title: 'Failed to resend invitation',
        description: 'Please try again.',
        variant: 'destructive',
      })
      return
    }

    toast({
      title: 'Invitation resent',
      description: `A new invitation has been sent to ${invitation.email}.`,
    })
  }

  const handleCancelInvitation = async (invitationId: string) => {
    const { error } = await supabase
      .from('team_invitations')
      .delete()
      .eq('id', invitationId)

    if (error) {
      toast({
        title: 'Failed to cancel invitation',
        description: 'Please try again.',
        variant: 'destructive',
      })
      return
    }

    setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId))
    toast({
      title: 'Invitation cancelled',
      description: 'The invitation has been removed.',
    })
  }

  const handleChangeRole = async (userId: string, newRole: WorkspaceMember['role']) => {
    if (!currentWorkspace?.id) return

    const { error } = await supabase
      .from('workspace_members')
      .update({ role: newRole })
      .eq('workspace_id', currentWorkspace.id)
      .eq('user_id', userId)

    if (error) {
      toast({
        title: 'Failed to change role',
        description: 'Please try again.',
        variant: 'destructive',
      })
      return
    }

    setMembers((prev) =>
      prev.map((m) => (m.user.id === userId ? { ...m, role: newRole } : m))
    )

    toast({
      title: 'Role updated',
      description: 'The member role has been changed.',
    })
  }

  const handleRemoveMember = async () => {
    if (!memberToRemove || !currentWorkspace?.id) return

    const { error } = await supabase
      .from('workspace_members')
      .delete()
      .eq('workspace_id', currentWorkspace.id)
      .eq('user_id', memberToRemove.id)

    if (error) {
      toast({
        title: 'Failed to remove member',
        description: 'Please try again.',
        variant: 'destructive',
      })
      return
    }

    setMembers((prev) => prev.filter((m) => m.user.id !== memberToRemove.id))
    setMemberToRemove(null)

    toast({
      title: 'Member removed',
      description: 'The team member has been removed.',
    })
  }

  const canManage = currentUserRole === 'owner' || currentUserRole === 'admin'

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Users className="h-6 w-6" />
            Team
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your team members and invitations
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setInviteModalOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        )}
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-lg font-semibold">
            Members ({members.length})
          </h2>
          <TeamMembersList
            members={members}
            currentUserId={user?.id || ''}
            currentUserRole={currentUserRole}
            onChangeRole={handleChangeRole}
            onRemove={(userId) => {
              const member = members.find((m) => m.user.id === userId)
              if (member) setMemberToRemove(member.user)
            }}
          />
        </section>

        {canManage && invitations.length > 0 && (
          <section>
            <PendingInvitations
              invitations={invitations}
              onResend={handleResendInvitation}
              onCancel={handleCancelInvitation}
            />
          </section>
        )}
      </div>

      <InviteMemberModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
        onInvite={handleInvite}
        teamName={currentWorkspace?.name}
      />

      <RemoveMemberDialog
        open={!!memberToRemove}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
        member={memberToRemove}
        onConfirm={handleRemoveMember}
      />
    </div>
  )
}
