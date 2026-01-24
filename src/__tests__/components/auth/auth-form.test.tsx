import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthForm } from '@/components/auth/auth-form'

// Mock the toast
jest.mock('@/components/ui/use-toast', () => ({
  toast: jest.fn(),
}))

// Access global mocks
const getMocks = () => (global as any).__mocks__

describe('AuthForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Login mode', () => {
    it('renders login form correctly', () => {
      render(<AuthForm mode="login" />)

      expect(screen.getByText('Welcome back')).toBeInTheDocument()
      expect(screen.getByText('Enter your credentials to access your account')).toBeInTheDocument()
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
      expect(screen.queryByLabelText('Full Name')).not.toBeInTheDocument()
    })

    it('shows forgot password link in login mode', () => {
      render(<AuthForm mode="login" />)
      expect(screen.getByText('Forgot password?')).toBeInTheDocument()
    })

    it('shows sign up link', () => {
      render(<AuthForm mode="login" />)
      expect(screen.getByText("Don't have an account?")).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Sign up' })).toHaveAttribute('href', '/signup')
    })

    it('handles successful login', async () => {
      const user = userEvent.setup()
      const mocks = getMocks()
      mocks.mockSignInWithPassword.mockResolvedValue({ data: { user: {} }, error: null })

      render(<AuthForm mode="login" />)

      await user.type(screen.getByLabelText('Email'), 'test@example.com')
      await user.type(screen.getByLabelText('Password'), 'password123')
      await user.click(screen.getByRole('button', { name: 'Sign In' }))

      await waitFor(() => {
        expect(mocks.mockSignInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        })
      })

      expect(mocks.mockPush).toHaveBeenCalledWith('/dashboard')
    })

    it('handles login error', async () => {
      const user = userEvent.setup()
      const { toast } = require('@/components/ui/use-toast')
      const mocks = getMocks()
      mocks.mockSignInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' }
      })

      render(<AuthForm mode="login" />)

      await user.type(screen.getByLabelText('Email'), 'test@example.com')
      await user.type(screen.getByLabelText('Password'), 'wrongpassword')
      await user.click(screen.getByRole('button', { name: 'Sign In' }))

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Invalid credentials',
          variant: 'destructive',
        })
      })
    })

    it('disables inputs while loading', async () => {
      const user = userEvent.setup()
      const mocks = getMocks()
      mocks.mockSignInWithPassword.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      )

      render(<AuthForm mode="login" />)

      await user.type(screen.getByLabelText('Email'), 'test@example.com')
      await user.type(screen.getByLabelText('Password'), 'password123')
      await user.click(screen.getByRole('button', { name: 'Sign In' }))

      expect(screen.getByLabelText('Email')).toBeDisabled()
      expect(screen.getByLabelText('Password')).toBeDisabled()
    })
  })

  describe('Signup mode', () => {
    it('renders signup form correctly', () => {
      render(<AuthForm mode="signup" />)

      expect(screen.getByText('Create an account')).toBeInTheDocument()
      expect(screen.getByText('Get started with TaskFlow today')).toBeInTheDocument()
      expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument()
    })

    it('does not show forgot password link in signup mode', () => {
      render(<AuthForm mode="signup" />)
      expect(screen.queryByText('Forgot password?')).not.toBeInTheDocument()
    })

    it('shows sign in link', () => {
      render(<AuthForm mode="signup" />)
      expect(screen.getByText('Already have an account?')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login')
    })

    it('handles successful signup', async () => {
      const user = userEvent.setup()
      const mocks = getMocks()
      mocks.mockSignUp.mockResolvedValue({ data: { user: {} }, error: null })

      render(<AuthForm mode="signup" />)

      await user.type(screen.getByLabelText('Full Name'), 'John Doe')
      await user.type(screen.getByLabelText('Email'), 'john@example.com')
      await user.type(screen.getByLabelText('Password'), 'password123')
      await user.click(screen.getByRole('button', { name: 'Create Account' }))

      await waitFor(() => {
        expect(mocks.mockSignUp).toHaveBeenCalledWith({
          email: 'john@example.com',
          password: 'password123',
          options: {
            data: {
              full_name: 'John Doe',
            },
          },
        })
      })

      expect(mocks.mockPush).toHaveBeenCalledWith('/login')
    })

    it('handles signup error', async () => {
      const user = userEvent.setup()
      const { toast } = require('@/components/ui/use-toast')
      const mocks = getMocks()
      mocks.mockSignUp.mockResolvedValue({
        data: null,
        error: { message: 'Email already registered' }
      })

      render(<AuthForm mode="signup" />)

      await user.type(screen.getByLabelText('Full Name'), 'John Doe')
      await user.type(screen.getByLabelText('Email'), 'existing@example.com')
      await user.type(screen.getByLabelText('Password'), 'password123')
      await user.click(screen.getByRole('button', { name: 'Create Account' }))

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Email already registered',
          variant: 'destructive',
        })
      })
    })
  })

  describe('OAuth', () => {
    it('renders Google OAuth button', () => {
      render(<AuthForm mode="login" />)
      expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument()
    })

    it('handles Google OAuth sign in', async () => {
      const user = userEvent.setup()
      const mocks = getMocks()
      mocks.mockSignInWithOAuth.mockResolvedValue({ error: null })

      render(<AuthForm mode="login" />)

      await user.click(screen.getByRole('button', { name: /continue with google/i }))

      await waitFor(() => {
        expect(mocks.mockSignInWithOAuth).toHaveBeenCalledWith({
          provider: 'google',
          options: {
            redirectTo: expect.stringContaining('/auth/callback'),
          },
        })
      })
    })

    it('handles OAuth error', async () => {
      const user = userEvent.setup()
      const { toast } = require('@/components/ui/use-toast')
      const mocks = getMocks()
      mocks.mockSignInWithOAuth.mockResolvedValue({
        error: { message: 'OAuth error' }
      })

      render(<AuthForm mode="login" />)

      await user.click(screen.getByRole('button', { name: /continue with google/i }))

      await waitFor(() => {
        expect(toast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'OAuth error',
          variant: 'destructive',
        })
      })
    })
  })

  describe('Form validation', () => {
    it('requires email field', async () => {
      render(<AuthForm mode="login" />)
      const emailInput = screen.getByLabelText('Email')
      expect(emailInput).toBeRequired()
    })

    it('requires password field', async () => {
      render(<AuthForm mode="login" />)
      const passwordInput = screen.getByLabelText('Password')
      expect(passwordInput).toBeRequired()
    })

    it('requires full name in signup mode', async () => {
      render(<AuthForm mode="signup" />)
      const fullNameInput = screen.getByLabelText('Full Name')
      expect(fullNameInput).toBeRequired()
    })

    it('password field has minLength of 6', async () => {
      render(<AuthForm mode="login" />)
      const passwordInput = screen.getByLabelText('Password')
      expect(passwordInput).toHaveAttribute('minLength', '6')
    })

    it('email field has type email', async () => {
      render(<AuthForm mode="login" />)
      const emailInput = screen.getByLabelText('Email')
      expect(emailInput).toHaveAttribute('type', 'email')
    })
  })

  describe('UI elements', () => {
    it('displays TaskFlow logo', () => {
      render(<AuthForm mode="login" />)
      expect(screen.getByText('T')).toBeInTheDocument()
    })

    it('displays separator text', () => {
      render(<AuthForm mode="login" />)
      expect(screen.getByText('Or continue with')).toBeInTheDocument()
    })
  })
})
