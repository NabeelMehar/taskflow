'use client'

import { formatDistanceToNow } from 'date-fns'
import { CheckCircle2, MessageSquare, UserPlus, AtSign, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Notification, NotificationType } from '@/types'

interface NotificationItemProps {
  notification: Notification
  onClick?: (notification: Notification) => void
}

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'task_assigned':
      return <CheckCircle2 className="h-4 w-4 text-blue-500" />
    case 'mentioned_in_comment':
      return <AtSign className="h-4 w-4 text-purple-500" />
    case 'comment_on_task':
      return <MessageSquare className="h-4 w-4 text-green-500" />
    case 'team_invitation':
      return <UserPlus className="h-4 w-4 text-orange-500" />
    case 'invitation_accepted':
      return <UserPlus className="h-4 w-4 text-emerald-500" />
    default:
      return <Bell className="h-4 w-4 text-gray-500" />
  }
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })

  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted/50',
        !notification.read && 'bg-primary/5'
      )}
      onClick={() => onClick?.(notification)}
    >
      <div className="mt-0.5 flex-shrink-0">
        {getNotificationIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'text-sm line-clamp-1',
              !notification.read ? 'font-medium' : 'font-normal'
            )}
          >
            {notification.title}
          </p>
          {!notification.read && (
            <span className="h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
          )}
        </div>
        {notification.message && (
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
            {notification.message}
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">{timeAgo}</p>
      </div>
    </button>
  )
}
