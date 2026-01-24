import { render, screen, fireEvent } from '@testing-library/react'
import { NotificationItem } from '@/components/notifications/notification-item'
import { Notification } from '@/types'

const mockNotification: Notification = {
  id: 'notification-1',
  user_id: 'user-1',
  type: 'task_assigned',
  title: 'Task Assigned',
  message: 'You have been assigned to "Fix bug"',
  read: false,
  entity_type: 'task',
  entity_id: 'task-1',
  metadata: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

describe('NotificationItem', () => {
  it('renders notification title and message', () => {
    render(<NotificationItem notification={mockNotification} />)

    expect(screen.getByText('Task Assigned')).toBeInTheDocument()
    expect(screen.getByText('You have been assigned to "Fix bug"')).toBeInTheDocument()
  })

  it('shows unread indicator for unread notifications', () => {
    const { container } = render(<NotificationItem notification={mockNotification} />)

    // Unread notifications have a blue dot
    expect(container.querySelector('.bg-primary')).toBeInTheDocument()
  })

  it('does not show unread indicator for read notifications', () => {
    const readNotification = { ...mockNotification, read: true }
    const { container } = render(<NotificationItem notification={readNotification} />)

    // The unread dot should not be present (there's one bg-primary for the mention but not the dot)
    const button = container.querySelector('button')
    expect(button).not.toHaveClass('bg-primary/5')
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<NotificationItem notification={mockNotification} onClick={handleClick} />)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledWith(mockNotification)
  })

  it('renders correct icon for task_assigned type', () => {
    const { container } = render(<NotificationItem notification={mockNotification} />)
    expect(container.querySelector('.text-blue-500')).toBeInTheDocument()
  })

  it('renders correct icon for mentioned_in_comment type', () => {
    const mentionNotification = { ...mockNotification, type: 'mentioned_in_comment' as const }
    const { container } = render(<NotificationItem notification={mentionNotification} />)
    expect(container.querySelector('.text-purple-500')).toBeInTheDocument()
  })

  it('renders correct icon for comment_on_task type', () => {
    const commentNotification = { ...mockNotification, type: 'comment_on_task' as const }
    const { container } = render(<NotificationItem notification={commentNotification} />)
    expect(container.querySelector('.text-green-500')).toBeInTheDocument()
  })

  it('renders correct icon for team_invitation type', () => {
    const invitationNotification = { ...mockNotification, type: 'team_invitation' as const }
    const { container } = render(<NotificationItem notification={invitationNotification} />)
    expect(container.querySelector('.text-orange-500')).toBeInTheDocument()
  })

  it('renders relative time', () => {
    render(<NotificationItem notification={mockNotification} />)
    // "less than a minute ago" or similar
    expect(screen.getByText(/ago/)).toBeInTheDocument()
  })

  it('handles notification without message', () => {
    const noMessageNotification = { ...mockNotification, message: null }
    render(<NotificationItem notification={noMessageNotification} />)

    expect(screen.getByText('Task Assigned')).toBeInTheDocument()
  })
})
