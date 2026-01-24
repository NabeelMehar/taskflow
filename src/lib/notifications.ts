import { SupabaseClient } from '@supabase/supabase-js'
import { NotificationType, CreateNotificationInput, Notification, UserNotificationSettings } from '@/types'

/**
 * Create a new notification in the database
 * @param supabase - Supabase client instance
 * @param data - Notification data to create
 * @returns Created notification or null on error
 */
export async function createNotification(
  supabase: SupabaseClient,
  data: CreateNotificationInput
): Promise<Notification | null> {
  const { data: notification, error } = await supabase
    .from('notifications')
    .insert({
      user_id: data.user_id,
      type: data.type,
      title: data.title,
      message: data.message || null,
      entity_type: data.entity_type || null,
      entity_id: data.entity_id || null,
      metadata: data.metadata || {},
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating notification:', error)
    return null
  }

  return notification
}

/**
 * Format notification message based on type and metadata
 * @param type - Notification type
 * @param metadata - Additional data for formatting
 * @returns Formatted message string
 */
export function formatNotificationMessage(
  type: NotificationType,
  metadata: Record<string, any>
): string {
  switch (type) {
    case 'task_assigned':
      return `You have been assigned to "${metadata.taskTitle || 'a task'}"`
    case 'mentioned_in_comment':
      return `${metadata.mentioner || 'Someone'} mentioned you in a comment`
    case 'comment_on_task':
      return `${metadata.commenter || 'Someone'} commented on "${metadata.taskTitle || 'your task'}"`
    case 'team_invitation':
      return `${metadata.inviter || 'Someone'} invited you to join ${metadata.teamName || 'a team'}`
    case 'invitation_accepted':
      return `${metadata.memberName || 'Someone'} accepted your team invitation`
    default:
      return 'You have a new notification'
  }
}

/**
 * Get notification title based on type
 * @param type - Notification type
 * @returns Title string
 */
export function getNotificationTitle(type: NotificationType): string {
  switch (type) {
    case 'task_assigned':
      return 'Task Assigned'
    case 'mentioned_in_comment':
      return 'You were mentioned'
    case 'comment_on_task':
      return 'New Comment'
    case 'team_invitation':
      return 'Team Invitation'
    case 'invitation_accepted':
      return 'Invitation Accepted'
    default:
      return 'Notification'
  }
}

/**
 * Check if a notification should be created based on user settings
 * @param settings - User notification settings
 * @param type - Notification type to check
 * @returns boolean indicating if notification should be created
 */
export function shouldCreateNotification(
  settings: UserNotificationSettings | null,
  type: NotificationType
): boolean {
  // If no settings, create notification by default
  if (!settings) return true

  switch (type) {
    case 'task_assigned':
      return settings.task_assigned
    case 'mentioned_in_comment':
      return settings.mentioned_in_comment
    case 'comment_on_task':
      return settings.comment_on_task
    case 'team_invitation':
      return settings.team_invitation
    default:
      return true
  }
}

/**
 * Mark a notification as read
 * @param supabase - Supabase client instance
 * @param notificationId - ID of notification to mark as read
 * @returns boolean indicating success
 */
export async function markAsRead(
  supabase: SupabaseClient,
  notificationId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)

  if (error) {
    console.error('Error marking notification as read:', error)
    return false
  }

  return true
}

/**
 * Mark all notifications as read for a user
 * @param supabase - Supabase client instance
 * @param userId - User ID
 * @returns boolean indicating success
 */
export async function markAllAsRead(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false)

  if (error) {
    console.error('Error marking all notifications as read:', error)
    return false
  }

  return true
}

/**
 * Fetch notifications for a user
 * @param supabase - Supabase client instance
 * @param userId - User ID
 * @param limit - Number of notifications to fetch
 * @returns Array of notifications
 */
export async function fetchNotifications(
  supabase: SupabaseClient,
  userId: string,
  limit: number = 20
): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching notifications:', error)
    return []
  }

  return data || []
}

/**
 * Get unread notification count for a user
 * @param supabase - Supabase client instance
 * @param userId - User ID
 * @returns Number of unread notifications
 */
export async function getUnreadCount(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false)

  if (error) {
    console.error('Error getting unread count:', error)
    return 0
  }

  return count || 0
}

/**
 * Delete a notification
 * @param supabase - Supabase client instance
 * @param notificationId - ID of notification to delete
 * @returns boolean indicating success
 */
export async function deleteNotification(
  supabase: SupabaseClient,
  notificationId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)

  if (error) {
    console.error('Error deleting notification:', error)
    return false
  }

  return true
}

/**
 * Fetch or create user notification settings
 * @param supabase - Supabase client instance
 * @param userId - User ID
 * @returns User notification settings
 */
export async function fetchNotificationSettings(
  supabase: SupabaseClient,
  userId: string
): Promise<UserNotificationSettings | null> {
  const { data, error } = await supabase
    .from('user_notification_settings')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned
    console.error('Error fetching notification settings:', error)
    return null
  }

  // If no settings exist, create default ones
  if (!data) {
    const { data: newSettings, error: createError } = await supabase
      .from('user_notification_settings')
      .insert({ user_id: userId })
      .select()
      .single()

    if (createError) {
      console.error('Error creating notification settings:', createError)
      return null
    }

    return newSettings
  }

  return data
}

/**
 * Update user notification settings
 * @param supabase - Supabase client instance
 * @param userId - User ID
 * @param settings - Partial settings to update
 * @returns Updated settings or null on error
 */
export async function updateNotificationSettings(
  supabase: SupabaseClient,
  userId: string,
  settings: Partial<Omit<UserNotificationSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<UserNotificationSettings | null> {
  const { data, error } = await supabase
    .from('user_notification_settings')
    .update(settings)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating notification settings:', error)
    return null
  }

  return data
}

/**
 * Create notification for task assignment
 */
export async function notifyTaskAssigned(
  supabase: SupabaseClient,
  assigneeId: string,
  taskId: string,
  taskTitle: string,
  assignerName: string
): Promise<Notification | null> {
  return createNotification(supabase, {
    user_id: assigneeId,
    type: 'task_assigned',
    title: getNotificationTitle('task_assigned'),
    message: formatNotificationMessage('task_assigned', { taskTitle }),
    entity_type: 'task',
    entity_id: taskId,
    metadata: { taskTitle, assignerName },
  })
}

/**
 * Create notification for comment mention
 */
export async function notifyMentionedInComment(
  supabase: SupabaseClient,
  mentionedUserId: string,
  commentId: string,
  taskId: string,
  mentionerName: string
): Promise<Notification | null> {
  return createNotification(supabase, {
    user_id: mentionedUserId,
    type: 'mentioned_in_comment',
    title: getNotificationTitle('mentioned_in_comment'),
    message: formatNotificationMessage('mentioned_in_comment', { mentioner: mentionerName }),
    entity_type: 'comment',
    entity_id: commentId,
    metadata: { mentionerName, taskId },
  })
}

/**
 * Create notification for new comment on task
 */
export async function notifyCommentOnTask(
  supabase: SupabaseClient,
  taskOwnerId: string,
  taskId: string,
  taskTitle: string,
  commenterName: string
): Promise<Notification | null> {
  return createNotification(supabase, {
    user_id: taskOwnerId,
    type: 'comment_on_task',
    title: getNotificationTitle('comment_on_task'),
    message: formatNotificationMessage('comment_on_task', { taskTitle, commenter: commenterName }),
    entity_type: 'task',
    entity_id: taskId,
    metadata: { taskTitle, commenterName },
  })
}

/**
 * Create notification for team invitation
 */
export async function notifyTeamInvitation(
  supabase: SupabaseClient,
  inviteeId: string,
  invitationId: string,
  teamName: string,
  inviterName: string
): Promise<Notification | null> {
  return createNotification(supabase, {
    user_id: inviteeId,
    type: 'team_invitation',
    title: getNotificationTitle('team_invitation'),
    message: formatNotificationMessage('team_invitation', { teamName, inviter: inviterName }),
    entity_type: 'invitation',
    entity_id: invitationId,
    metadata: { teamName, inviterName },
  })
}

/**
 * Create notification for invitation accepted
 */
export async function notifyInvitationAccepted(
  supabase: SupabaseClient,
  inviterId: string,
  workspaceId: string,
  memberName: string
): Promise<Notification | null> {
  return createNotification(supabase, {
    user_id: inviterId,
    type: 'invitation_accepted',
    title: getNotificationTitle('invitation_accepted'),
    message: formatNotificationMessage('invitation_accepted', { memberName }),
    entity_type: 'workspace',
    entity_id: workspaceId,
    metadata: { memberName },
  })
}
