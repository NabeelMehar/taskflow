import { render, screen } from '@testing-library/react'
import LoginPage from '@/app/(auth)/login/page'

// Mock the AuthForm component
jest.mock('@/components/auth/auth-form', () => ({
  AuthForm: ({ mode }: { mode: string }) => (
    <div data-testid="auth-form" data-mode={mode}>
      Mock AuthForm - {mode}
    </div>
  ),
}))

describe('LoginPage', () => {
  it('renders the AuthForm component', () => {
    render(<LoginPage />)
    expect(screen.getByTestId('auth-form')).toBeInTheDocument()
  })

  it('passes login mode to AuthForm', () => {
    render(<LoginPage />)
    const authForm = screen.getByTestId('auth-form')
    expect(authForm).toHaveAttribute('data-mode', 'login')
  })

  it('displays login mode text', () => {
    render(<LoginPage />)
    expect(screen.getByText('Mock AuthForm - login')).toBeInTheDocument()
  })
})
