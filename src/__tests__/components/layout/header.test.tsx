import { render, screen, fireEvent } from '@testing-library/react'
import { Header } from '@/components/layout/header'

// Mock the store
const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  full_name: 'Test User',
  avatar_url: null,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
}

const mockNotifications = [
  { id: 'n1', read: false },
  { id: 'n2', read: false },
  { id: 'n3', read: true },
]

jest.mock('@/lib/store', () => ({
  useAppStore: jest.fn(() => ({
    user: mockUser,
    sidebarOpen: true,
    notifications: mockNotifications,
    unreadNotificationCount: 2,
    setNotifications: jest.fn(),
    markNotificationAsRead: jest.fn(),
    markAllNotificationsAsRead: jest.fn(),
  })),
}))

// Access global mocks
const getMocks = () => (global as any).__mocks__

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the header', () => {
    render(<Header />)
    expect(document.querySelector('header')).toBeInTheDocument()
  })

  it('renders search placeholder', () => {
    render(<Header />)
    expect(screen.getByText('Search tasks...')).toBeInTheDocument()
  })

  it('renders keyboard shortcut', () => {
    render(<Header />)
    expect(screen.getByText('K')).toBeInTheDocument()
  })

  it('renders theme toggle button', () => {
    render(<Header />)
    expect(screen.getByText('Toggle theme')).toBeInTheDocument()
  })

  it('renders notifications button with count', () => {
    render(<Header />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('renders user avatar with initials', () => {
    render(<Header />)
    expect(screen.getByText('TU')).toBeInTheDocument() // Test User -> TU
  })

  describe('theme toggle', () => {
    it('calls setTheme when theme button is clicked', () => {
      render(<Header />)
      const mocks = getMocks()
      const themeButton = screen.getByText('Toggle theme').closest('button')
      fireEvent.click(themeButton!)
      expect(mocks.mockSetTheme).toHaveBeenCalledWith('dark')
    })
  })

  describe('user menu', () => {
    it('renders user avatar button', () => {
      render(<Header />)
      // User avatar button with initials is rendered
      expect(screen.getByText('TU')).toBeInTheDocument()
    })

    it('user avatar button has correct attributes', () => {
      render(<Header />)
      const avatarButton = screen.getByText('TU').closest('button')
      expect(avatarButton).toHaveAttribute('aria-haspopup', 'menu')
    })

    it('user avatar shows correct initials', () => {
      render(<Header />)
      // TU for Test User
      expect(screen.getByText('TU')).toBeInTheDocument()
    })
  })

  describe('positioning', () => {
    it('has fixed positioning', () => {
      render(<Header />)
      const header = document.querySelector('header')
      expect(header).toHaveClass('fixed')
    })

    it('has correct top position', () => {
      render(<Header />)
      const header = document.querySelector('header')
      expect(header).toHaveClass('top-0')
    })

    it('has correct z-index', () => {
      render(<Header />)
      const header = document.querySelector('header')
      expect(header).toHaveClass('z-30')
    })

    it('has correct left offset when sidebar is open', () => {
      render(<Header />)
      const header = document.querySelector('header')
      expect(header?.className).toContain('left-64')
    })
  })

  describe('styling', () => {
    it('has border-bottom', () => {
      render(<Header />)
      const header = document.querySelector('header')
      expect(header).toHaveClass('border-b')
    })

    it('has backdrop blur', () => {
      render(<Header />)
      const header = document.querySelector('header')
      expect(header).toHaveClass('backdrop-blur')
    })

    it('has correct height', () => {
      render(<Header />)
      const header = document.querySelector('header')
      expect(header).toHaveClass('h-16')
    })
  })

  describe('icons', () => {
    it('renders sun icon for light mode', () => {
      render(<Header />)
      const sunIcon = document.querySelector('.lucide-sun')
      expect(sunIcon).toBeInTheDocument()
    })

    it('renders moon icon for dark mode', () => {
      render(<Header />)
      const moonIcon = document.querySelector('.lucide-moon')
      expect(moonIcon).toBeInTheDocument()
    })

    it('renders bell icon', () => {
      render(<Header />)
      const bellIcon = document.querySelector('.lucide-bell')
      expect(bellIcon).toBeInTheDocument()
    })

    it('renders search icon', () => {
      render(<Header />)
      const searchIcon = document.querySelector('.lucide-search')
      expect(searchIcon).toBeInTheDocument()
    })
  })
})
