'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppStore } from '@/lib/store'
import { createClient } from '@/lib/supabase/client'
import { markAsRead, markAllAsRead, fetchNotifications } from '@/lib/notifications'
import { NotificationItem } from './notification-item'
import { Notification } from '@/types'

interface NotificationDropdownProps {
  align?: 'start' | 'center' | 'end'
}

export function NotificationDropdown({ align = 'end' }: NotificationDropdownProps) {
  const router = useRouter()
  const supabase = createClient()
  const {
    user,
    notifications,
    unreadNotificationCount,
    setNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useAppStore()

  // Load notifications on mount
  useEffect(() => {
    if (!user?.id) return

    const loadNotifications = async () => {
      const data = await fetchNotifications(supabase, user.id)
      setNotifications(data)
    }

    loadNotifications()

    // Set up real-time subscription
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification
          useAppStore.getState().addNotification(newNotification)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, supabase, setNotifications])

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      await markAsRead(supabase, notification.id)
      markNotificationAsRead(notification.id)
    }

    // Navigate based on notification type
    if (notification.entity_type === 'task' && notification.entity_id) {
      // Could open task modal or navigate to task
      router.push('/dashboard')
    } else if (notification.entity_type === 'invitation' && notification.entity_id) {
      router.push('/team')
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return
    await markAllAsRead(supabase, user.id)
    markAllNotificationsAsRead()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadNotificationCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-80">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-semibold">Notifications</h3>
          {unreadNotificationCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={handleNotificationClick}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
