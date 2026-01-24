import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'

describe('Card', () => {
  it('renders with children', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Card className="custom-class">Card</Card>)
    expect(screen.getByText('Card')).toHaveClass('custom-class')
  })

  it('has correct base styling', () => {
    render(<Card>Card</Card>)
    const card = screen.getByText('Card')
    expect(card).toHaveClass('rounded-lg')
    expect(card).toHaveClass('border')
    expect(card).toHaveClass('bg-card')
    expect(card).toHaveClass('text-card-foreground')
    expect(card).toHaveClass('shadow-sm')
  })

  it('forwards ref correctly', () => {
    const ref = jest.fn()
    render(<Card ref={ref}>Card</Card>)
    expect(ref).toHaveBeenCalled()
  })

  it('passes through additional props', () => {
    render(<Card data-testid="test-card">Card</Card>)
    expect(screen.getByTestId('test-card')).toBeInTheDocument()
  })
})

describe('CardHeader', () => {
  it('renders with children', () => {
    render(<CardHeader>Header content</CardHeader>)
    expect(screen.getByText('Header content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<CardHeader className="custom-class">Header</CardHeader>)
    expect(screen.getByText('Header')).toHaveClass('custom-class')
  })

  it('has correct base styling', () => {
    render(<CardHeader>Header</CardHeader>)
    const header = screen.getByText('Header')
    expect(header).toHaveClass('flex')
    expect(header).toHaveClass('flex-col')
    expect(header).toHaveClass('space-y-1.5')
    expect(header).toHaveClass('p-6')
  })

  it('forwards ref correctly', () => {
    const ref = jest.fn()
    render(<CardHeader ref={ref}>Header</CardHeader>)
    expect(ref).toHaveBeenCalled()
  })
})

describe('CardTitle', () => {
  it('renders with children', () => {
    render(<CardTitle>Title</CardTitle>)
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Title')
  })

  it('applies custom className', () => {
    render(<CardTitle className="custom-class">Title</CardTitle>)
    expect(screen.getByText('Title')).toHaveClass('custom-class')
  })

  it('has correct base styling', () => {
    render(<CardTitle>Title</CardTitle>)
    const title = screen.getByText('Title')
    expect(title).toHaveClass('text-2xl')
    expect(title).toHaveClass('font-semibold')
    expect(title).toHaveClass('leading-none')
    expect(title).toHaveClass('tracking-tight')
  })

  it('forwards ref correctly', () => {
    const ref = jest.fn()
    render(<CardTitle ref={ref}>Title</CardTitle>)
    expect(ref).toHaveBeenCalled()
  })
})

describe('CardDescription', () => {
  it('renders with children', () => {
    render(<CardDescription>Description text</CardDescription>)
    expect(screen.getByText('Description text')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<CardDescription className="custom-class">Desc</CardDescription>)
    expect(screen.getByText('Desc')).toHaveClass('custom-class')
  })

  it('has correct base styling', () => {
    render(<CardDescription>Description</CardDescription>)
    const desc = screen.getByText('Description')
    expect(desc).toHaveClass('text-sm')
    expect(desc).toHaveClass('text-muted-foreground')
  })

  it('forwards ref correctly', () => {
    const ref = jest.fn()
    render(<CardDescription ref={ref}>Desc</CardDescription>)
    expect(ref).toHaveBeenCalled()
  })
})

describe('CardContent', () => {
  it('renders with children', () => {
    render(<CardContent>Content here</CardContent>)
    expect(screen.getByText('Content here')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<CardContent className="custom-class">Content</CardContent>)
    expect(screen.getByText('Content')).toHaveClass('custom-class')
  })

  it('has correct base styling', () => {
    render(<CardContent>Content</CardContent>)
    const content = screen.getByText('Content')
    expect(content).toHaveClass('p-6')
    expect(content).toHaveClass('pt-0')
  })

  it('forwards ref correctly', () => {
    const ref = jest.fn()
    render(<CardContent ref={ref}>Content</CardContent>)
    expect(ref).toHaveBeenCalled()
  })
})

describe('CardFooter', () => {
  it('renders with children', () => {
    render(<CardFooter>Footer content</CardFooter>)
    expect(screen.getByText('Footer content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<CardFooter className="custom-class">Footer</CardFooter>)
    expect(screen.getByText('Footer')).toHaveClass('custom-class')
  })

  it('has correct base styling', () => {
    render(<CardFooter>Footer</CardFooter>)
    const footer = screen.getByText('Footer')
    expect(footer).toHaveClass('flex')
    expect(footer).toHaveClass('items-center')
    expect(footer).toHaveClass('p-6')
    expect(footer).toHaveClass('pt-0')
  })

  it('forwards ref correctly', () => {
    const ref = jest.fn()
    render(<CardFooter ref={ref}>Footer</CardFooter>)
    expect(ref).toHaveBeenCalled()
  })
})

describe('Card composition', () => {
  it('renders a complete card with all parts', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card content goes here</p>
        </CardContent>
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      </Card>
    )

    expect(screen.getByRole('heading', { name: 'Card Title' })).toBeInTheDocument()
    expect(screen.getByText('Card Description')).toBeInTheDocument()
    expect(screen.getByText('Card content goes here')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
  })
})
