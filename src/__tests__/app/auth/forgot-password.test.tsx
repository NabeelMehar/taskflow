import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ForgotPasswordPage from '@/app/(auth)/forgot-password/page'

// Mock toast
jest.mock('@/components/ui/use-toast', () => ({
  toast: jest.fn(),
}))

// Access global mocks
const getMocks = () => (global as any).__mocks__

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the page correctly', () => {
    render(<ForgotPasswordPage />)
    expect(screen.getByText('Forgot password?')).toBeInTheDocument()
    expect(screen.getByText("Enter your email and we'll send you a reset link")).toBeInTheDocument()
  })

  it('renders the TaskFlow logo', () => {
    render(<ForgotPasswordPage />)
    expect(screen.getByText('T')).toBeInTheDocument()
  })

  it('renders email input', () => {
    render(<ForgotPasswordPage />)
    expect(screen.getByLabelText('Email address')).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<ForgotPasswordPage />)
    expect(screen.getByRole('button', { name: 'Send reset link' })).toBeInTheDocument()
  })

  it('renders back to login link', () => {
    render(<ForgotPasswordPage />)
    expect(screen.getByText('Back to login')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to login/i })).toHaveAttribute('href', '/login')
  })

  it('handles successful password reset request', async () => {
    const user = userEvent.setup()
    const mocks = getMocks()
    mocks.mockResetPasswordForEmail.mockResolvedValue({ error: null })

    render(<ForgotPasswordPage />)

    await user.type(screen.getByLabelText('Email address'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: 'Send reset link' }))

    await waitFor(() => {
      expect(mocks.mockResetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
        redirectTo: expect.stringContaining('/reset-password'),
      })
    })

    await waitFor(() => {
      expect(screen.getByText('Check your email')).toBeInTheDocument()
    })
  })

  it('shows success message after sending', async () => {
    const user = userEvent.setup()
    const mocks = getMocks()
    mocks.mockResetPasswordForEmail.mockResolvedValue({ error: null })

    render(<ForgotPasswordPage />)

    await user.type(screen.getByLabelText('Email address'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: 'Send reset link' }))

    await waitFor(() => {
      expect(screen.getByText('Check your email')).toBeInTheDocument()
      expect(screen.getByText("We've sent you a password reset link")).toBeInTheDocument()
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })
  })

  it('shows try again button after success', async () => {
    const user = userEvent.setup()
    const mocks = getMocks()
    mocks.mockResetPasswordForEmail.mockResolvedValue({ error: null })

    render(<ForgotPasswordPage />)

    await user.type(screen.getByLabelText('Email address'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: 'Send reset link' }))

    await waitFor(() => {
      expect(screen.getByText('Try again')).toBeInTheDocument()
    })
  })

  it('clicking try again shows form again', async () => {
    const user = userEvent.setup()
    const mocks = getMocks()
    mocks.mockResetPasswordForEmail.mockResolvedValue({ error: null })

    render(<ForgotPasswordPage />)

    await user.type(screen.getByLabelText('Email address'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: 'Send reset link' }))

    await waitFor(() => {
      expect(screen.getByText('Try again')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Try again'))

    await waitFor(() => {
      expect(screen.getByText('Forgot password?')).toBeInTheDocument()
      expect(screen.getByLabelText('Email address')).toBeInTheDocument()
    })
  })

  it('handles error response', async () => {
    const user = userEvent.setup()
    const { toast } = require('@/components/ui/use-toast')
    const mocks = getMocks()
    mocks.mockResetPasswordForEmail.mockResolvedValue({
      error: { message: 'User not found' },
    })

    render(<ForgotPasswordPage />)

    await user.type(screen.getByLabelText('Email address'), 'notfound@example.com')
    await user.click(screen.getByRole('button', { name: 'Send reset link' }))

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'User not found',
        variant: 'destructive',
      })
    })
  })

  it('disables input while loading', async () => {
    const user = userEvent.setup()
    const mocks = getMocks()
    mocks.mockResetPasswordForEmail.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    )

    render(<ForgotPasswordPage />)

    await user.type(screen.getByLabelText('Email address'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: 'Send reset link' }))

    expect(screen.getByLabelText('Email address')).toBeDisabled()
  })

  it('email input has correct type', () => {
    render(<ForgotPasswordPage />)
    expect(screen.getByLabelText('Email address')).toHaveAttribute('type', 'email')
  })

  it('email input has required attribute', () => {
    render(<ForgotPasswordPage />)
    expect(screen.getByLabelText('Email address')).toBeRequired()
  })

  it('renders email icon in input', () => {
    render(<ForgotPasswordPage />)
    expect(document.querySelector('.lucide-mail')).toBeInTheDocument()
  })

  it('renders success state after sending', async () => {
    const user = userEvent.setup()
    const mocks = getMocks()
    mocks.mockResetPasswordForEmail.mockResolvedValue({ error: null })

    render(<ForgotPasswordPage />)

    await user.type(screen.getByLabelText('Email address'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: 'Send reset link' }))

    await waitFor(() => {
      // Just verify the success state renders
      expect(screen.getByText('Email sent to')).toBeInTheDocument()
    })
  })
})
