'use client'

import { useState } from 'react'
import { MoreHorizontal, Shield, ShieldCheck, Crown, UserMinus } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getInitials } from '@/lib/utils'
import { User, WorkspaceMember } from '@/types'

interface TeamMemberCardProps {
  member: User
  role: WorkspaceMember['role']
  isCurrentUser: boolean
  canManage: boolean
  onChangeRole?: (userId: string, newRole: WorkspaceMember['role']) => void
  onRemove?: (userId: string) => void
}

function getRoleBadgeVariant(role: WorkspaceMember['role']) {
  switch (role) {
    case 'owner':
      return 'default'
    case 'admin':
      return 'secondary'
    default:
      return 'outline'
  }
}

function getRoleIcon(role: WorkspaceMember['role']) {
  switch (role) {
    case 'owner':
      return <Crown className="h-3 w-3" />
    case 'admin':
      return <ShieldCheck className="h-3 w-3" />
    default:
      return <Shield className="h-3 w-3" />
  }
}

export function TeamMemberCard({
  member,
  role,
  isCurrentUser,
  canManage,
  onChangeRole,
  onRemove,
}: TeamMemberCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleChangeRole = async (newRole: WorkspaceMember['role']) => {
    if (!onChangeRole || newRole === role) return
    setIsLoading(true)
    try {
      await onChangeRole(member.id, newRole)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemove = async () => {
    if (!onRemove) return
    setIsLoading(true)
    try {
      await onRemove(member.id)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={member.avatar_url || ''} alt={member.full_name || ''} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {member.full_name ? getInitials(member.full_name) : 'U'}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">
              {member.full_name || 'Unknown User'}
              {isCurrentUser && (
                <span className="ml-1 text-xs text-muted-foreground">(you)</span>
              )}
            </p>
            <Badge variant={getRoleBadgeVariant(role)} className="gap-1">
              {getRoleIcon(role)}
              {role}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{member.email}</p>
        </div>
      </div>

      {canManage && !isCurrentUser && role !== 'owner' && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={isLoading}>
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Member actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => handleChangeRole('admin')}
              disabled={role === 'admin'}
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Make Admin
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleChangeRole('member')}
              disabled={role === 'member'}
            >
              <Shield className="mr-2 h-4 w-4" />
              Make Member
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleRemove}
              className="text-red-600 focus:text-red-600"
            >
              <UserMinus className="mr-2 h-4 w-4" />
              Remove from team
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
