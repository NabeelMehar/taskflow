import { render, screen } from '@testing-library/react'
import SignupPage from '@/app/(auth)/signup/page'

// Mock the AuthForm component
jest.mock('@/components/auth/auth-form', () => ({
  AuthForm: ({ mode }: { mode: string }) => (
    <div data-testid="auth-form" data-mode={mode}>
      Mock AuthForm - {mode}
    </div>
  ),
}))

describe('SignupPage', () => {
  it('renders the AuthForm component', () => {
    render(<SignupPage />)
    expect(screen.getByTestId('auth-form')).toBeInTheDocument()
  })

  it('passes signup mode to AuthForm', () => {
    render(<SignupPage />)
    const authForm = screen.getByTestId('auth-form')
    expect(authForm).toHaveAttribute('data-mode', 'signup')
  })

  it('displays signup mode text', () => {
    render(<SignupPage />)
    expect(screen.getByText('Mock AuthForm - signup')).toBeInTheDocument()
  })
})
