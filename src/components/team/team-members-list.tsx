'use client'

import { User, WorkspaceMember } from '@/types'
import { TeamMemberCard } from './team-member-card'

interface TeamMembersListProps {
  members: Array<{
    user: User
    role: WorkspaceMember['role']
  }>
  currentUserId: string
  currentUserRole: WorkspaceMember['role']
  onChangeRole?: (userId: string, newRole: WorkspaceMember['role']) => void
  onRemove?: (userId: string) => void
}

export function TeamMembersList({
  members,
  currentUserId,
  currentUserRole,
  onChangeRole,
  onRemove,
}: TeamMembersListProps) {
  const canManage = currentUserRole === 'owner' || currentUserRole === 'admin'

  // Sort members: owner first, then admins, then members
  const sortedMembers = [...members].sort((a, b) => {
    const roleOrder = { owner: 0, admin: 1, member: 2 }
    return roleOrder[a.role] - roleOrder[b.role]
  })

  if (sortedMembers.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">No team members found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sortedMembers.map(({ user, role }) => (
        <TeamMemberCard
          key={user.id}
          member={user}
          role={role}
          isCurrentUser={user.id === currentUserId}
          canManage={canManage}
          onChangeRole={onChangeRole}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}
