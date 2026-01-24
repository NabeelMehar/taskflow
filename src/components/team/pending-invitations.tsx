'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Clock, Mail, MoreHorizontal, RefreshCw, Trash2, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TeamInvitation } from '@/types'

interface PendingInvitationsProps {
  invitations: TeamInvitation[]
  onResend?: (invitation: TeamInvitation) => Promise<void>
  onCancel?: (invitationId: string) => Promise<void>
}

export function PendingInvitations({
  invitations,
  onResend,
  onCancel,
}: PendingInvitationsProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const pendingInvitations = invitations.filter((inv) => inv.status === 'pending')

  const handleResend = async (invitation: TeamInvitation) => {
    if (!onResend) return
    setLoadingId(invitation.id)
    try {
      await onResend(invitation)
    } finally {
      setLoadingId(null)
    }
  }

  const handleCancel = async (invitationId: string) => {
    if (!onCancel) return
    setLoadingId(invitationId)
    try {
      await onCancel(invitationId)
    } finally {
      setLoadingId(null)
    }
  }

  if (pendingInvitations.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">
        Pending Invitations ({pendingInvitations.length})
      </h3>
      <div className="space-y-2">
        {pendingInvitations.map((invitation) => {
          const isExpired = new Date(invitation.expires_at) < new Date()
          const isLoading = loadingId === invitation.id
          const expiresIn = formatDistanceToNow(new Date(invitation.expires_at), {
            addSuffix: true,
          })

          return (
            <div
              key={invitation.id}
              className="flex items-center justify-between rounded-lg border bg-muted/30 p-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{invitation.email}</p>
                    <Badge variant="outline" className="text-xs">
                      {invitation.role}
                    </Badge>
                    {isExpired && (
                      <Badge variant="destructive" className="text-xs">
                        Expired
                      </Badge>
                    )}
                  </div>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {isExpired ? 'Expired' : `Expires ${expiresIn}`}
                  </p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={isLoading}>
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Invitation actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleResend(invitation)}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend invitation
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleCancel(invitation.id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Cancel invitation
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        })}
      </div>
    </div>
  )
}
