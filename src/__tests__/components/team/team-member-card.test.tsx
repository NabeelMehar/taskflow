import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TeamMemberCard } from '@/components/team/team-member-card'
import { User } from '@/types'

const mockMember: User = {
  id: 'user-1',
  email: 'john@example.com',
  full_name: 'John Doe',
  avatar_url: null,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
}

describe('TeamMemberCard', () => {
  const defaultProps = {
    member: mockMember,
    role: 'member' as const,
    isCurrentUser: false,
    canManage: false,
  }

  it('renders member name and email', () => {
    render(<TeamMemberCard {...defaultProps} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('renders role badge', () => {
    render(<TeamMemberCard {...defaultProps} />)

    expect(screen.getByText('member')).toBeInTheDocument()
  })

  it('shows "(you)" indicator for current user', () => {
    render(<TeamMemberCard {...defaultProps} isCurrentUser={true} />)

    expect(screen.getByText('(you)')).toBeInTheDocument()
  })

  it('shows owner badge for owner role', () => {
    render(<TeamMemberCard {...defaultProps} role="owner" />)

    expect(screen.getByText('owner')).toBeInTheDocument()
  })

  it('shows admin badge for admin role', () => {
    render(<TeamMemberCard {...defaultProps} role="admin" />)

    expect(screen.getByText('admin')).toBeInTheDocument()
  })

  it('does not show action menu when canManage is false', () => {
    render(<TeamMemberCard {...defaultProps} canManage={false} />)

    expect(screen.queryByRole('button', { name: /member actions/i })).not.toBeInTheDocument()
  })

  it('does not show action menu for current user', () => {
    render(<TeamMemberCard {...defaultProps} canManage={true} isCurrentUser={true} />)

    expect(screen.queryByRole('button', { name: /member actions/i })).not.toBeInTheDocument()
  })

  it('does not show action menu for owner role', () => {
    render(<TeamMemberCard {...defaultProps} canManage={true} role="owner" />)

    expect(screen.queryByRole('button', { name: /member actions/i })).not.toBeInTheDocument()
  })

  it('shows action menu for manageable members', () => {
    render(<TeamMemberCard {...defaultProps} canManage={true} />)

    expect(screen.getByRole('button', { name: /member actions/i })).toBeInTheDocument()
  })

  it('displays avatar fallback with initials', () => {
    render(<TeamMemberCard {...defaultProps} />)

    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('handles member without full_name', () => {
    const memberWithoutName = { ...mockMember, full_name: null }
    render(<TeamMemberCard {...defaultProps} member={memberWithoutName} />)

    expect(screen.getByText('Unknown User')).toBeInTheDocument()
  })

  it('renders action menu button with handlers when canManage is true', () => {
    const handleChangeRole = jest.fn()
    const handleRemove = jest.fn()

    render(
      <TeamMemberCard
        {...defaultProps}
        canManage={true}
        onChangeRole={handleChangeRole}
        onRemove={handleRemove}
      />
    )

    // Verify the action menu button is rendered
    const menuButton = screen.getByRole('button', { name: /member actions/i })
    expect(menuButton).toBeInTheDocument()
    expect(menuButton).not.toBeDisabled()
  })
})
