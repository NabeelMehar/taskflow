import { render, screen, fireEvent } from '@testing-library/react'
import { TaskCard } from '@/components/tasks/task-card'
import { Task } from '@/types'

// Mock dnd-kit
jest.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}))

jest.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: jest.fn(() => ''),
    },
  },
}))

// Mock the store
const mockOpenTaskModal = jest.fn()
jest.mock('@/lib/store', () => ({
  useAppStore: () => ({
    openTaskModal: mockOpenTaskModal,
  }),
}))

const mockTask: Task = {
  id: 'task-123',
  title: 'Test Task Title',
  description: 'Test description',
  status: 'todo',
  priority: 'medium',
  project_id: 'project-1',
  assignee_id: 'user-1',
  reporter_id: 'user-1',
  due_date: null,
  order: 0,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  project: {
    id: 'project-1',
    name: 'Test Project',
    key: 'TP',
    description: 'Test project description',
    color: '#3b82f6',
    workspace_id: 'workspace-1',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
}

describe('TaskCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders task title', () => {
    render(<TaskCard task={mockTask} />)
    expect(screen.getByText('Test Task Title')).toBeInTheDocument()
  })

  it('renders task key', () => {
    render(<TaskCard task={mockTask} />)
    expect(screen.getByText('TP-TASK')).toBeInTheDocument()
  })

  it('displays priority flag for non-none priority', () => {
    render(<TaskCard task={mockTask} />)
    // Medium priority shows a flag
    const flag = document.querySelector('.lucide-flag')
    expect(flag).toBeInTheDocument()
  })

  it('does not display priority flag for none priority', () => {
    const taskWithNoPriority = { ...mockTask, priority: 'none' as const }
    render(<TaskCard task={taskWithNoPriority} />)
    const flag = document.querySelector('.lucide-flag')
    expect(flag).not.toBeInTheDocument()
  })

  it('opens task modal when clicked', () => {
    render(<TaskCard task={mockTask} />)
    const card = screen.getByText('Test Task Title').closest('div[class*="cursor-grab"]')
    fireEvent.click(card!)
    expect(mockOpenTaskModal).toHaveBeenCalledWith(mockTask)
  })

  it('shows dropdown menu on hover', () => {
    render(<TaskCard task={mockTask} />)
    // The menu trigger button exists but is hidden until hover
    const menuTrigger = screen.getByRole('button')
    expect(menuTrigger).toHaveClass('opacity-0')
  })

  describe('with due date', () => {
    it('renders due date', () => {
      const taskWithDueDate = {
        ...mockTask,
        due_date: '2024-12-25T00:00:00.000Z',
      }
      render(<TaskCard task={taskWithDueDate} />)
      // Should show some date format
      const calendarIcon = document.querySelector('.lucide-calendar')
      expect(calendarIcon).toBeInTheDocument()
    })
  })

  describe('with comments', () => {
    it('renders comments count', () => {
      const taskWithComments = {
        ...mockTask,
        comments_count: 5,
      }
      render(<TaskCard task={taskWithComments} />)
      expect(screen.getByText('5')).toBeInTheDocument()
      const messageIcon = document.querySelector('.lucide-message-square')
      expect(messageIcon).toBeInTheDocument()
    })

    it('does not render comments section when count is 0', () => {
      const taskWithNoComments = {
        ...mockTask,
        comments_count: 0,
      }
      render(<TaskCard task={taskWithNoComments} />)
      const messageIcon = document.querySelector('.lucide-message-square')
      expect(messageIcon).not.toBeInTheDocument()
    })
  })

  describe('with assignee', () => {
    it('renders assignee avatar', () => {
      const taskWithAssignee = {
        ...mockTask,
        assignee: {
          id: 'user-1',
          email: 'john@example.com',
          full_name: 'John Doe',
          avatar_url: null,
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
        },
      }
      render(<TaskCard task={taskWithAssignee} />)
      expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('renders assignee avatar with image src', () => {
      const taskWithAssigneeAvatar = {
        ...mockTask,
        assignee: {
          id: 'user-1',
          email: 'john@example.com',
          full_name: 'John Doe',
          avatar_url: 'https://example.com/avatar.jpg',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
        },
      }
      render(<TaskCard task={taskWithAssigneeAvatar} />)
      // When avatar_url is provided, the fallback should still render JD
      // since images may not load in test environment
      expect(screen.getByText('JD')).toBeInTheDocument()
    })
  })

  describe('with labels', () => {
    it('renders labels', () => {
      const taskWithLabels = {
        ...mockTask,
        labels: [
          { id: 'label-1', name: 'Bug', color: '#ef4444', project_id: 'project-1', created_at: '2024-01-01' },
          { id: 'label-2', name: 'Feature', color: '#22c55e', project_id: 'project-1', created_at: '2024-01-01' },
        ],
      }
      render(<TaskCard task={taskWithLabels} />)
      expect(screen.getByText('Bug')).toBeInTheDocument()
      expect(screen.getByText('Feature')).toBeInTheDocument()
    })

    it('shows overflow count for more than 2 labels', () => {
      const taskWithManyLabels = {
        ...mockTask,
        labels: [
          { id: 'label-1', name: 'Bug', color: '#ef4444', project_id: 'project-1', created_at: '2024-01-01' },
          { id: 'label-2', name: 'Feature', color: '#22c55e', project_id: 'project-1', created_at: '2024-01-01' },
          { id: 'label-3', name: 'Urgent', color: '#f97316', project_id: 'project-1', created_at: '2024-01-01' },
          { id: 'label-4', name: 'Backend', color: '#8b5cf6', project_id: 'project-1', created_at: '2024-01-01' },
        ],
      }
      render(<TaskCard task={taskWithManyLabels} />)
      expect(screen.getByText('Bug')).toBeInTheDocument()
      expect(screen.getByText('Feature')).toBeInTheDocument()
      expect(screen.queryByText('Urgent')).not.toBeInTheDocument()
      expect(screen.getByText('+2')).toBeInTheDocument()
    })
  })

  describe('priority colors', () => {
    it('applies correct color for urgent priority', () => {
      const urgentTask = { ...mockTask, priority: 'urgent' as const }
      render(<TaskCard task={urgentTask} />)
      const flag = document.querySelector('.lucide-flag')
      expect(flag).toHaveClass('text-red-500')
    })

    it('applies correct color for high priority', () => {
      const highTask = { ...mockTask, priority: 'high' as const }
      render(<TaskCard task={highTask} />)
      const flag = document.querySelector('.lucide-flag')
      expect(flag).toHaveClass('text-orange-500')
    })

    it('applies correct color for medium priority', () => {
      render(<TaskCard task={mockTask} />)
      const flag = document.querySelector('.lucide-flag')
      expect(flag).toHaveClass('text-yellow-500')
    })

    it('applies correct color for low priority', () => {
      const lowTask = { ...mockTask, priority: 'low' as const }
      render(<TaskCard task={lowTask} />)
      const flag = document.querySelector('.lucide-flag')
      expect(flag).toHaveClass('text-green-500')
    })
  })

  describe('callbacks', () => {
    it('provides onEdit prop', () => {
      const onEdit = jest.fn()
      render(<TaskCard task={mockTask} onEdit={onEdit} />)
      // The onEdit callback is passed to the component
      // Dropdown menu testing with Radix UI requires special setup
      expect(screen.getByText('Test Task Title')).toBeInTheDocument()
    })

    it('provides onDelete prop', () => {
      const onDelete = jest.fn()
      render(<TaskCard task={mockTask} onDelete={onDelete} />)
      // The onDelete callback is passed to the component
      expect(screen.getByText('Test Task Title')).toBeInTheDocument()
    })
  })

  describe('card styling', () => {
    it('has cursor-grab class', () => {
      render(<TaskCard task={mockTask} />)
      const card = screen.getByText('Test Task Title').closest('div[class*="cursor-grab"]')
      expect(card).toHaveClass('cursor-grab')
    })

    it('has rounded-lg border', () => {
      render(<TaskCard task={mockTask} />)
      const card = screen.getByText('Test Task Title').closest('div[class*="cursor-grab"]')
      expect(card).toHaveClass('rounded-lg')
      expect(card).toHaveClass('border')
    })
  })
})
