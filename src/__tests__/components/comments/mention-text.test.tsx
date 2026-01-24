import { render, screen, fireEvent } from '@testing-library/react'
import { MentionText } from '@/components/comments/mention-text'

describe('MentionText', () => {
  it('renders plain text without mentions', () => {
    render(<MentionText text="Hello world" />)

    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('renders empty for empty text', () => {
    const { container } = render(<MentionText text="" />)

    expect(container.textContent).toBe('')
  })

  it('highlights single mention', () => {
    render(<MentionText text="Hello @john" />)

    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '@john' })).toBeInTheDocument()
  })

  it('highlights multiple mentions', () => {
    render(<MentionText text="Hey @john and @jane!" />)

    expect(screen.getByRole('button', { name: '@john' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '@jane' })).toBeInTheDocument()
  })

  it('handles mention at start of text', () => {
    render(<MentionText text="@john said hello" />)

    expect(screen.getByRole('button', { name: '@john' })).toBeInTheDocument()
    expect(screen.getByText('said hello')).toBeInTheDocument()
  })

  it('handles mention at end of text', () => {
    render(<MentionText text="Hello @john" />)

    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '@john' })).toBeInTheDocument()
  })

  it('calls onMentionClick when mention is clicked', () => {
    const handleClick = jest.fn()
    render(<MentionText text="Hello @john" onMentionClick={handleClick} />)

    fireEvent.click(screen.getByRole('button', { name: '@john' }))
    expect(handleClick).toHaveBeenCalledWith('john')
  })

  it('applies custom className', () => {
    const { container } = render(
      <MentionText text="Hello world" className="custom-class" />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('applies custom mentionClassName to mentions', () => {
    render(
      <MentionText
        text="Hello @john"
        mentionClassName="custom-mention"
      />
    )

    expect(screen.getByRole('button', { name: '@john' })).toHaveClass('custom-mention')
  })

  it('handles mentions with underscores', () => {
    render(<MentionText text="Hello @john_doe" />)

    expect(screen.getByRole('button', { name: '@john_doe' })).toBeInTheDocument()
  })

  it('handles mentions with numbers', () => {
    render(<MentionText text="Hello @user123" />)

    expect(screen.getByRole('button', { name: '@user123' })).toBeInTheDocument()
  })

  it('preserves whitespace in text', () => {
    render(<MentionText text="Hello  @john  there" />)

    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('there')).toBeInTheDocument()
  })
})
