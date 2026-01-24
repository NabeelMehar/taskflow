import { render, screen, fireEvent } from '@testing-library/react'
import { Sidebar } from '@/components/layout/sidebar'

// Mock the store
const mockToggleSidebar = jest.fn()
const mockSetCreateTaskModalOpen = jest.fn()

let mockSidebarOpen = true
let mockProjects: any[] = []

jest.mock('@/lib/store', () => ({
  useAppStore: () => ({
    sidebarOpen: mockSidebarOpen,
    toggleSidebar: mockToggleSidebar,
    projects: mockProjects,
    setCreateTaskModalOpen: mockSetCreateTaskModalOpen,
  }),
}))

// Mock next/navigation
const mockPathname = '/dashboard'
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}))

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSidebarOpen = true
    mockProjects = []
  })

  describe('when open', () => {
    it('renders TaskFlow logo', () => {
      render(<Sidebar />)
      expect(screen.getByText('TaskFlow')).toBeInTheDocument()
    })

    it('renders navigation links', () => {
      render(<Sidebar />)
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Projects')).toBeInTheDocument()
      expect(screen.getByText('My Tasks')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('renders New Task button with text', () => {
      render(<Sidebar />)
      expect(screen.getByText('New Task')).toBeInTheDocument()
    })

    it('has expanded width class', () => {
      render(<Sidebar />)
      const sidebar = screen.getByText('TaskFlow').closest('aside')
      expect(sidebar).toHaveClass('w-64')
    })

    it('calls setCreateTaskModalOpen when New Task is clicked', () => {
      render(<Sidebar />)
      const newTaskButton = screen.getByText('New Task').closest('button')
      fireEvent.click(newTaskButton!)
      expect(mockSetCreateTaskModalOpen).toHaveBeenCalledWith(true)
    })

    it('calls toggleSidebar when collapse button is clicked', () => {
      render(<Sidebar />)
      // Find the button with ChevronLeft icon
      const buttons = screen.getAllByRole('button')
      const toggleButton = buttons.find((btn) =>
        btn.querySelector('.lucide-chevron-left')
      )
      fireEvent.click(toggleButton!)
      expect(mockToggleSidebar).toHaveBeenCalled()
    })
  })

  describe('when collapsed', () => {
    beforeEach(() => {
      mockSidebarOpen = false
    })

    it('does not render TaskFlow text', () => {
      render(<Sidebar />)
      expect(screen.queryByText('TaskFlow')).not.toBeInTheDocument()
    })

    it('does not render navigation text', () => {
      render(<Sidebar />)
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
      expect(screen.queryByText('Projects')).not.toBeInTheDocument()
    })

    it('does not render New Task text', () => {
      render(<Sidebar />)
      expect(screen.queryByText('New Task')).not.toBeInTheDocument()
    })

    it('has collapsed width class', () => {
      render(<Sidebar />)
      const sidebar = document.querySelector('aside')
      expect(sidebar).toHaveClass('w-16')
    })

    it('shows expand icon', () => {
      render(<Sidebar />)
      const expandIcon = document.querySelector('.lucide-chevron-right')
      expect(expandIcon).toBeInTheDocument()
    })
  })

  describe('navigation links', () => {
    it('has correct href for Dashboard', () => {
      render(<Sidebar />)
      const dashboardLink = screen.getByText('Dashboard').closest('a')
      expect(dashboardLink).toHaveAttribute('href', '/dashboard')
    })

    it('has correct href for Projects', () => {
      render(<Sidebar />)
      const projectsLink = screen.getByText('Projects').closest('a')
      expect(projectsLink).toHaveAttribute('href', '/projects')
    })

    it('has correct href for My Tasks', () => {
      render(<Sidebar />)
      const tasksLink = screen.getByText('My Tasks').closest('a')
      expect(tasksLink).toHaveAttribute('href', '/tasks')
    })

    it('has correct href for Settings', () => {
      render(<Sidebar />)
      const settingsLink = screen.getByText('Settings').closest('a')
      expect(settingsLink).toHaveAttribute('href', '/settings')
    })
  })

  describe('with projects', () => {
    beforeEach(() => {
      mockProjects = [
        {
          id: 'project-1',
          name: 'Project One',
          color: '#3b82f6',
          key: 'P1',
          description: '',
          workspace_id: 'ws-1',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          id: 'project-2',
          name: 'Project Two',
          color: '#22c55e',
          key: 'P2',
          description: '',
          workspace_id: 'ws-1',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ]
    })

    it('renders Projects section header', () => {
      render(<Sidebar />)
      // There are two "Projects" texts - one in nav and one in section header
      const projectsElements = screen.getAllByText('Projects')
      expect(projectsElements.length).toBeGreaterThanOrEqual(2)
    })

    it('renders project links', () => {
      render(<Sidebar />)
      expect(screen.getByText('Project One')).toBeInTheDocument()
      expect(screen.getByText('Project Two')).toBeInTheDocument()
    })

    it('project links have correct href', () => {
      render(<Sidebar />)
      const projectLink = screen.getByText('Project One').closest('a')
      expect(projectLink).toHaveAttribute('href', '/projects/project-1')
    })

    it('limits to 5 projects', () => {
      mockProjects = [
        { id: '1', name: 'P1', color: '#fff', key: 'P1', description: '', workspace_id: 'ws-1', created_at: '', updated_at: '' },
        { id: '2', name: 'P2', color: '#fff', key: 'P2', description: '', workspace_id: 'ws-1', created_at: '', updated_at: '' },
        { id: '3', name: 'P3', color: '#fff', key: 'P3', description: '', workspace_id: 'ws-1', created_at: '', updated_at: '' },
        { id: '4', name: 'P4', color: '#fff', key: 'P4', description: '', workspace_id: 'ws-1', created_at: '', updated_at: '' },
        { id: '5', name: 'P5', color: '#fff', key: 'P5', description: '', workspace_id: 'ws-1', created_at: '', updated_at: '' },
        { id: '6', name: 'P6', color: '#fff', key: 'P6', description: '', workspace_id: 'ws-1', created_at: '', updated_at: '' },
      ]
      render(<Sidebar />)
      expect(screen.getByText('P1')).toBeInTheDocument()
      expect(screen.getByText('P5')).toBeInTheDocument()
      expect(screen.queryByText('P6')).not.toBeInTheDocument()
    })

    it('does not show projects section when collapsed', () => {
      mockSidebarOpen = false
      render(<Sidebar />)
      expect(screen.queryByText('Project One')).not.toBeInTheDocument()
    })
  })

  describe('styling', () => {
    it('has fixed positioning', () => {
      render(<Sidebar />)
      const sidebar = document.querySelector('aside')
      expect(sidebar).toHaveClass('fixed')
    })

    it('has full height', () => {
      render(<Sidebar />)
      const sidebar = document.querySelector('aside')
      expect(sidebar).toHaveClass('h-screen')
    })

    it('has border-right', () => {
      render(<Sidebar />)
      const sidebar = document.querySelector('aside')
      expect(sidebar).toHaveClass('border-r')
    })

    it('has transition for smooth width change', () => {
      render(<Sidebar />)
      const sidebar = document.querySelector('aside')
      expect(sidebar).toHaveClass('transition-all')
      expect(sidebar).toHaveClass('duration-300')
    })
  })
})
