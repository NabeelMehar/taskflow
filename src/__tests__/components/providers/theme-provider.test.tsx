import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@/components/providers/theme-provider'

describe('ThemeProvider', () => {
  it('renders children', () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div data-testid="child">Child content</div>
      </ThemeProvider>
    )
    expect(screen.getByTestId('child')).toHaveTextContent('Child content')
  })

  it('passes through theme props', () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <div>Test</div>
      </ThemeProvider>
    )
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('renders without enableSystem prop', () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="light">
        <div>Content</div>
      </ThemeProvider>
    )
    expect(screen.getByText('Content')).toBeInTheDocument()
  })
})
