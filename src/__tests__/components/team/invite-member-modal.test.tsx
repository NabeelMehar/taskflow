import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InviteMemberModal } from '@/components/team/invite-member-modal'

// Mock the toast hook
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

describe('InviteMemberModal', () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    onInvite: jest.fn(),
    teamName: 'Test Team',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders modal when open', () => {
    render(<InviteMemberModal {...defaultProps} />)

    expect(screen.getByText('Invite Team Member')).toBeInTheDocument()
    expect(screen.getByText(/Send an invitation to join Test Team/)).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<InviteMemberModal {...defaultProps} open={false} />)

    expect(screen.queryByText('Invite Team Member')).not.toBeInTheDocument()
  })

  it('renders email input field', () => {
    render(<InviteMemberModal {...defaultProps} />)

    expect(screen.getByLabelText('Email address')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('colleague@company.com')).toBeInTheDocument()
  })

  it('renders role selector', () => {
    render(<InviteMemberModal {...defaultProps} />)

    expect(screen.getByLabelText('Role')).toBeInTheDocument()
  })

  it('calls onInvite with email and role when form is submitted', async () => {
    const user = userEvent.setup()
    const handleInvite = jest.fn().mockResolvedValue(undefined)

    render(<InviteMemberModal {...defaultProps} onInvite={handleInvite} />)

    // Enter email
    const emailInput = screen.getByPlaceholderText('colleague@company.com')
    await user.type(emailInput, 'newuser@example.com')

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Send Invitation' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(handleInvite).toHaveBeenCalledWith('newuser@example.com', 'member')
    })
  })

  it('shows loading state while submitting', async () => {
    const user = userEvent.setup()
    let resolveInvite: () => void
    const handleInvite = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveInvite = resolve
        })
    )

    render(<InviteMemberModal {...defaultProps} onInvite={handleInvite} />)

    // Enter email
    const emailInput = screen.getByPlaceholderText('colleague@company.com')
    await user.type(emailInput, 'newuser@example.com')

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Send Invitation' })
    await user.click(submitButton)

    // Check loading state
    expect(screen.getByRole('button', { name: /send invitation/i })).toBeDisabled()

    // Resolve the promise
    resolveInvite!()
  })

  it('closes modal after successful submission', async () => {
    const user = userEvent.setup()
    const handleInvite = jest.fn().mockResolvedValue(undefined)
    const handleOpenChange = jest.fn()

    render(
      <InviteMemberModal
        {...defaultProps}
        onInvite={handleInvite}
        onOpenChange={handleOpenChange}
      />
    )

    // Enter email
    const emailInput = screen.getByPlaceholderText('colleague@company.com')
    await user.type(emailInput, 'newuser@example.com')

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Send Invitation' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(handleOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('calls onOpenChange when Cancel is clicked', async () => {
    const user = userEvent.setup()
    const handleOpenChange = jest.fn()

    render(<InviteMemberModal {...defaultProps} onOpenChange={handleOpenChange} />)

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    await user.click(cancelButton)

    expect(handleOpenChange).toHaveBeenCalledWith(false)
  })

  it('renders with default team name when not provided', () => {
    render(<InviteMemberModal {...defaultProps} teamName={undefined} />)

    expect(screen.getByText(/Send an invitation to join your team/)).toBeInTheDocument()
  })
})
