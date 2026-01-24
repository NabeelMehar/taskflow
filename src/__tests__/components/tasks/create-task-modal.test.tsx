import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateTaskModal } from '@/components/tasks/create-task-modal'

// Mock toast
jest.mock('@/components/ui/use-toast', () => ({
  toast: jest.fn(),
}))

// Mock store
const mockSetCreateTaskModalOpen = jest.fn()
const mockAddTask = jest.fn()

let mockCreateTaskModalOpen = true
const mockCurrentProject = {
  id: 'project-1',
  name: 'Test Project',
  key: 'TP',
  color: '#3b82f6',
  description: '',
  workspace_id: 'ws-1',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
}

const mockProjects = [mockCurrentProject]

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  full_name: 'Test User',
  avatar_url: null,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
}

jest.mock('@/lib/store', () => ({
  useAppStore: () => ({
    createTaskModalOpen: mockCreateTaskModalOpen,
    setCreateTaskModalOpen: mockSetCreateTaskModalOpen,
    currentProject: mockCurrentProject,
    projects: mockProjects,
    user: mockUser,
    addTask: mockAddTask,
  }),
}))

describe('CreateTaskModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateTaskModalOpen = true
  })

  it('renders when open', () => {
    render(<CreateTaskModal />)
    expect(screen.getByText('Create New Task')).toBeInTheDocument()
  })

  it('renders title label', () => {
    render(<CreateTaskModal />)
    expect(screen.getByText('Title *')).toBeInTheDocument()
  })

  it('renders description label', () => {
    render(<CreateTaskModal />)
    expect(screen.getByText('Description')).toBeInTheDocument()
  })

  it('renders due date label', () => {
    render(<CreateTaskModal />)
    expect(screen.getByText('Due Date')).toBeInTheDocument()
  })

  it('renders Cancel button', () => {
    render(<CreateTaskModal />)
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('renders Create Task button', () => {
    render(<CreateTaskModal />)
    expect(screen.getByRole('button', { name: 'Create Task' })).toBeInTheDocument()
  })

  it('closes modal when Cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<CreateTaskModal />)

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockSetCreateTaskModalOpen).toHaveBeenCalledWith(false)
  })

  it('shows description placeholder text', () => {
    render(<CreateTaskModal />)
    expect(screen.getByText('Add a new task to your project. Fill in the details below.')).toBeInTheDocument()
  })

  it('renders status label', () => {
    render(<CreateTaskModal />)
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('renders priority label', () => {
    render(<CreateTaskModal />)
    expect(screen.getByText('Priority')).toBeInTheDocument()
  })

  it('renders project label', () => {
    render(<CreateTaskModal />)
    expect(screen.getByText('Project *')).toBeInTheDocument()
  })

  it('title input exists', () => {
    render(<CreateTaskModal />)
    const titleInput = screen.getByPlaceholderText('Enter task title...')
    expect(titleInput).toBeInTheDocument()
  })

  it('title input can be typed in', async () => {
    const user = userEvent.setup()
    render(<CreateTaskModal />)

    const titleInput = screen.getByPlaceholderText('Enter task title...')
    await user.type(titleInput, 'New Test Task')
    expect(titleInput).toHaveValue('New Test Task')
  })

  it('description textarea exists', () => {
    render(<CreateTaskModal />)
    const descInput = screen.getByPlaceholderText('Add a description...')
    expect(descInput).toBeInTheDocument()
  })

  it('description textarea can be typed in', async () => {
    const user = userEvent.setup()
    render(<CreateTaskModal />)

    const descInput = screen.getByPlaceholderText('Add a description...')
    await user.type(descInput, 'Task description')
    expect(descInput).toHaveValue('Task description')
  })

  describe('form validation', () => {
    it('shows error when title is empty', async () => {
      const user = userEvent.setup()
      const { toast } = require('@/components/ui/use-toast')
      render(<CreateTaskModal />)

      await user.click(screen.getByRole('button', { name: 'Create Task' }))

      expect(toast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Please enter a task title',
        variant: 'destructive',
      })
    })
  })
})
