import { render, screen } from '@testing-library/react'
import { Badge, badgeVariants } from '@/components/ui/badge'

describe('Badge', () => {
  it('renders with children', () => {
    render(<Badge>New</Badge>)
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Badge className="custom-class">Badge</Badge>)
    expect(screen.getByText('Badge')).toHaveClass('custom-class')
  })

  describe('variants', () => {
    it('renders default variant', () => {
      render(<Badge variant="default">Default</Badge>)
      const badge = screen.getByText('Default')
      expect(badge).toHaveClass('bg-primary')
      expect(badge).toHaveClass('text-primary-foreground')
    })

    it('renders secondary variant', () => {
      render(<Badge variant="secondary">Secondary</Badge>)
      const badge = screen.getByText('Secondary')
      expect(badge).toHaveClass('bg-secondary')
      expect(badge).toHaveClass('text-secondary-foreground')
    })

    it('renders destructive variant', () => {
      render(<Badge variant="destructive">Destructive</Badge>)
      const badge = screen.getByText('Destructive')
      expect(badge).toHaveClass('bg-destructive')
      expect(badge).toHaveClass('text-destructive-foreground')
    })

    it('renders outline variant', () => {
      render(<Badge variant="outline">Outline</Badge>)
      const badge = screen.getByText('Outline')
      expect(badge).toHaveClass('text-foreground')
    })
  })

  it('has correct base styling', () => {
    render(<Badge>Badge</Badge>)
    const badge = screen.getByText('Badge')
    expect(badge).toHaveClass('inline-flex')
    expect(badge).toHaveClass('items-center')
    expect(badge).toHaveClass('rounded-full')
    expect(badge).toHaveClass('border')
    expect(badge).toHaveClass('px-2.5')
    expect(badge).toHaveClass('py-0.5')
    expect(badge).toHaveClass('text-xs')
    expect(badge).toHaveClass('font-semibold')
  })

  it('renders with complex children', () => {
    render(
      <Badge>
        <span>Icon</span>
        <span>Text</span>
      </Badge>
    )
    expect(screen.getByText('Icon')).toBeInTheDocument()
    expect(screen.getByText('Text')).toBeInTheDocument()
  })

  it('passes through additional props', () => {
    render(<Badge data-testid="test-badge">Badge</Badge>)
    expect(screen.getByTestId('test-badge')).toBeInTheDocument()
  })

  it('handles onClick events', () => {
    const handleClick = jest.fn()
    render(<Badge onClick={handleClick}>Clickable</Badge>)
    screen.getByText('Clickable').click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})

describe('badgeVariants', () => {
  it('returns correct classes for default variant', () => {
    const classes = badgeVariants()
    expect(classes).toContain('bg-primary')
    expect(classes).toContain('text-primary-foreground')
  })

  it('returns correct classes for secondary variant', () => {
    const classes = badgeVariants({ variant: 'secondary' })
    expect(classes).toContain('bg-secondary')
  })

  it('returns correct classes for destructive variant', () => {
    const classes = badgeVariants({ variant: 'destructive' })
    expect(classes).toContain('bg-destructive')
  })

  it('returns correct classes for outline variant', () => {
    const classes = badgeVariants({ variant: 'outline' })
    expect(classes).toContain('text-foreground')
  })
})
