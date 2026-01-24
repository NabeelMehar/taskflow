import '@testing-library/jest-dom'

// Mock next/navigation
const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockBack = jest.fn()
const mockForward = jest.fn()
const mockRefresh = jest.fn()
const mockPrefetch = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
    forward: mockForward,
    refresh: mockRefresh,
    prefetch: mockPrefetch,
  }),
  useParams: () => ({}),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock next-themes
const mockSetTheme = jest.fn()

jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: mockSetTheme,
    resolvedTheme: 'light',
  }),
  ThemeProvider: ({ children }) => children,
}))

// Create mock functions for Supabase
const mockGetUser = jest.fn().mockResolvedValue({ data: { user: null } })
const mockGetSession = jest.fn().mockResolvedValue({ data: { session: null } })
const mockSignInWithPassword = jest.fn().mockResolvedValue({ data: {}, error: null })
const mockSignUp = jest.fn().mockResolvedValue({ data: {}, error: null })
const mockSignOut = jest.fn().mockResolvedValue({ error: null })
const mockResetPasswordForEmail = jest.fn().mockResolvedValue({ error: null })
const mockUpdateUser = jest.fn().mockResolvedValue({ data: {}, error: null })
const mockSignInWithOAuth = jest.fn().mockResolvedValue({ error: null })
const mockOnAuthStateChange = jest.fn(() => ({
  data: { subscription: { unsubscribe: jest.fn() } },
}))

// Create chainable mock object
const createChainableMock = () => {
  const chain = {
    select: jest.fn(() => chain),
    insert: jest.fn(() => chain),
    update: jest.fn(() => chain),
    delete: jest.fn(() => chain),
    eq: jest.fn(() => chain),
    in: jest.fn(() => chain),
    order: jest.fn(() => chain),
    limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
    single: jest.fn(() => Promise.resolve({ data: null, error: null })),
  }
  return chain
}

const mockChain = createChainableMock()
const mockFrom = jest.fn(() => mockChain)

// Also expose individual mocks for backward compatibility
const mockSelect = mockChain.select
const mockInsert = mockChain.insert
const mockUpdate = mockChain.update
const mockDelete = mockChain.delete
const mockEq = mockChain.eq
const mockIn = mockChain.in
const mockOrder = mockChain.order
const mockLimit = mockChain.limit
const mockSingle = mockChain.single

const mockUpload = jest.fn().mockResolvedValue({ error: null })
const mockGetPublicUrl = jest.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/avatar.jpg' } })

const mockStorageFrom = jest.fn(() => ({
  upload: mockUpload,
  getPublicUrl: mockGetPublicUrl,
}))

// Mock for Supabase channel/real-time
const mockChannel = {
  on: jest.fn(() => mockChannel),
  subscribe: jest.fn(() => mockChannel),
}
const mockRemoveChannel = jest.fn()

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: mockGetUser,
      getSession: mockGetSession,
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signOut: mockSignOut,
      resetPasswordForEmail: mockResetPasswordForEmail,
      updateUser: mockUpdateUser,
      signInWithOAuth: mockSignInWithOAuth,
      onAuthStateChange: mockOnAuthStateChange,
    },
    from: mockFrom,
    storage: {
      from: mockStorageFrom,
    },
    channel: jest.fn(() => mockChannel),
    removeChannel: mockRemoveChannel,
  })),
}))

// Mock data for tests
const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  full_name: 'Test User',
  avatar_url: null,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
}

const mockWorkspace = {
  id: 'workspace-1',
  name: 'Test Workspace',
  slug: 'test-workspace',
  description: 'A test workspace',
  owner_id: 'user-1',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
}

const mockInvitation = {
  id: 'invitation-1',
  workspace_id: 'workspace-1',
  email: 'invited@example.com',
  role: 'member',
  invited_by: 'user-1',
  token: 'abc123token',
  status: 'pending',
  expires_at: '2026-02-01T00:00:00.000Z',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

const mockNotification = {
  id: 'notification-1',
  user_id: 'user-1',
  type: 'task_assigned',
  title: 'Task Assigned',
  message: 'You have been assigned to "Fix bug"',
  read: false,
  entity_type: 'task',
  entity_id: 'task-1',
  metadata: {},
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

const mockNotificationSettings = {
  id: 'settings-1',
  user_id: 'user-1',
  email_enabled: true,
  task_assigned: true,
  mentioned_in_comment: true,
  comment_on_task: true,
  team_invitation: true,
  due_date_reminders: true,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

// Export mocks for test access
global.__mocks__ = {
  // Navigation
  mockPush,
  mockReplace,
  mockRefresh,
  // Theme
  mockSetTheme,
  // Supabase auth
  mockGetUser,
  mockGetSession,
  mockSignInWithPassword,
  mockSignUp,
  mockSignOut,
  mockResetPasswordForEmail,
  mockUpdateUser,
  mockSignInWithOAuth,
  // Supabase DB
  mockFrom,
  mockSelect,
  mockInsert,
  mockUpdate,
  mockDelete,
  mockEq,
  mockIn,
  mockOrder,
  mockLimit,
  mockSingle,
  mockChain,
  // Supabase real-time
  mockChannel,
  mockRemoveChannel,
  // Supabase storage
  mockStorageFrom,
  mockUpload,
  mockGetPublicUrl,
  // Mock data
  mockUser,
  mockWorkspace,
  mockInvitation,
  mockNotification,
  mockNotificationSettings,
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Suppress console errors during tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
        args[0].includes('Warning: An update to') ||
        args[0].includes('act(...)'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks()

  // Reset default mock implementations
  mockSignInWithPassword.mockResolvedValue({ data: {}, error: null })
  mockSignUp.mockResolvedValue({ data: {}, error: null })
  mockSignOut.mockResolvedValue({ error: null })
  mockResetPasswordForEmail.mockResolvedValue({ error: null })
  mockUpdateUser.mockResolvedValue({ data: {}, error: null })
  mockSignInWithOAuth.mockResolvedValue({ error: null })
})
