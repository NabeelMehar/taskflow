import {
  formatNotificationMessage,
  getNotificationTitle,
  shouldCreateNotification,
} from '@/lib/notifications'
import { NotificationType, UserNotificationSettings } from '@/types'

describe('notifications utility functions', () => {
  describe('formatNotificationMessage', () => {
    it('should format task_assigned message', () => {
      const result = formatNotificationMessage('task_assigned', { taskTitle: 'Fix bug' })
      expect(result).toBe('You have been assigned to "Fix bug"')
    })

    it('should format task_assigned message with default', () => {
      const result = formatNotificationMessage('task_assigned', {})
      expect(result).toBe('You have been assigned to "a task"')
    })

    it('should format mentioned_in_comment message', () => {
      const result = formatNotificationMessage('mentioned_in_comment', { mentioner: 'John' })
      expect(result).toBe('John mentioned you in a comment')
    })

    it('should format mentioned_in_comment message with default', () => {
      const result = formatNotificationMessage('mentioned_in_comment', {})
      expect(result).toBe('Someone mentioned you in a comment')
    })

    it('should format comment_on_task message', () => {
      const result = formatNotificationMessage('comment_on_task', {
        commenter: 'Jane',
        taskTitle: 'Review PR',
      })
      expect(result).toBe('Jane commented on "Review PR"')
    })

    it('should format comment_on_task message with defaults', () => {
      const result = formatNotificationMessage('comment_on_task', {})
      expect(result).toBe('Someone commented on "your task"')
    })

    it('should format team_invitation message', () => {
      const result = formatNotificationMessage('team_invitation', {
        inviter: 'Bob',
        teamName: 'Engineering',
      })
      expect(result).toBe('Bob invited you to join Engineering')
    })

    it('should format team_invitation message with defaults', () => {
      const result = formatNotificationMessage('team_invitation', {})
      expect(result).toBe('Someone invited you to join a team')
    })

    it('should format invitation_accepted message', () => {
      const result = formatNotificationMessage('invitation_accepted', { memberName: 'Alice' })
      expect(result).toBe('Alice accepted your team invitation')
    })

    it('should format invitation_accepted message with default', () => {
      const result = formatNotificationMessage('invitation_accepted', {})
      expect(result).toBe('Someone accepted your team invitation')
    })

    it('should return default message for unknown type', () => {
      const result = formatNotificationMessage('unknown' as NotificationType, {})
      expect(result).toBe('You have a new notification')
    })
  })

  describe('getNotificationTitle', () => {
    it('should return correct title for task_assigned', () => {
      expect(getNotificationTitle('task_assigned')).toBe('Task Assigned')
    })

    it('should return correct title for mentioned_in_comment', () => {
      expect(getNotificationTitle('mentioned_in_comment')).toBe('You were mentioned')
    })

    it('should return correct title for comment_on_task', () => {
      expect(getNotificationTitle('comment_on_task')).toBe('New Comment')
    })

    it('should return correct title for team_invitation', () => {
      expect(getNotificationTitle('team_invitation')).toBe('Team Invitation')
    })

    it('should return correct title for invitation_accepted', () => {
      expect(getNotificationTitle('invitation_accepted')).toBe('Invitation Accepted')
    })

    it('should return default title for unknown type', () => {
      expect(getNotificationTitle('unknown' as NotificationType)).toBe('Notification')
    })
  })

  describe('shouldCreateNotification', () => {
    const defaultSettings: UserNotificationSettings = {
      id: 'settings-1',
      user_id: 'user-1',
      email_enabled: true,
      task_assigned: true,
      mentioned_in_comment: true,
      comment_on_task: true,
      team_invitation: true,
      due_date_reminders: true,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    }

    it('should return true when settings is null', () => {
      expect(shouldCreateNotification(null, 'task_assigned')).toBe(true)
    })

    it('should respect task_assigned setting', () => {
      expect(shouldCreateNotification(defaultSettings, 'task_assigned')).toBe(true)
      expect(
        shouldCreateNotification({ ...defaultSettings, task_assigned: false }, 'task_assigned')
      ).toBe(false)
    })

    it('should respect mentioned_in_comment setting', () => {
      expect(shouldCreateNotification(defaultSettings, 'mentioned_in_comment')).toBe(true)
      expect(
        shouldCreateNotification(
          { ...defaultSettings, mentioned_in_comment: false },
          'mentioned_in_comment'
        )
      ).toBe(false)
    })

    it('should respect comment_on_task setting', () => {
      expect(shouldCreateNotification(defaultSettings, 'comment_on_task')).toBe(true)
      expect(
        shouldCreateNotification({ ...defaultSettings, comment_on_task: false }, 'comment_on_task')
      ).toBe(false)
    })

    it('should respect team_invitation setting', () => {
      expect(shouldCreateNotification(defaultSettings, 'team_invitation')).toBe(true)
      expect(
        shouldCreateNotification({ ...defaultSettings, team_invitation: false }, 'team_invitation')
      ).toBe(false)
    })

    it('should return true for unknown types', () => {
      expect(shouldCreateNotification(defaultSettings, 'unknown' as NotificationType)).toBe(true)
    })
  })
})
