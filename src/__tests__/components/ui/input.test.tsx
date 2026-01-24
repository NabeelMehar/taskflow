import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/ui/input'

describe('Input', () => {
  it('renders correctly', () => {
    render(<Input />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders with placeholder', () => {
    render(<Input placeholder="Enter text..." />)
    expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument()
  })

  it('handles text input', async () => {
    const user = userEvent.setup()
    render(<Input />)
    const input = screen.getByRole('textbox')
    await user.type(input, 'Hello World')
    expect(input).toHaveValue('Hello World')
  })

  it('handles onChange events', () => {
    const handleChange = jest.fn()
    render(<Input onChange={handleChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } })
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('can be disabled', () => {
    render(<Input disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('applies disabled styles', () => {
    render(<Input disabled />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('disabled:cursor-not-allowed')
    expect(input).toHaveClass('disabled:opacity-50')
  })

  it('applies custom className', () => {
    render(<Input className="custom-class" />)
    expect(screen.getByRole('textbox')).toHaveClass('custom-class')
  })

  it('renders with different types', () => {
    const { rerender } = render(<Input type="email" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')

    rerender(<Input type="password" />)
    // Password inputs don't have textbox role
    expect(document.querySelector('input[type="password"]')).toBeInTheDocument()

    rerender(<Input type="number" />)
    expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number')
  })

  it('handles value prop', () => {
    render(<Input value="test value" onChange={() => {}} />)
    expect(screen.getByRole('textbox')).toHaveValue('test value')
  })

  it('handles defaultValue prop', () => {
    render(<Input defaultValue="default" />)
    expect(screen.getByRole('textbox')).toHaveValue('default')
  })

  it('forwards ref correctly', () => {
    const ref = jest.fn()
    render(<Input ref={ref} />)
    expect(ref).toHaveBeenCalled()
  })

  it('passes through additional props', () => {
    render(<Input data-testid="test-input" aria-label="Test Input" />)
    expect(screen.getByTestId('test-input')).toBeInTheDocument()
    expect(screen.getByLabelText('Test Input')).toBeInTheDocument()
  })

  it('applies focus styles', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('focus-visible:ring-2')
    expect(input).toHaveClass('focus-visible:ring-ring')
  })

  it('has correct default styling', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('h-10')
    expect(input).toHaveClass('w-full')
    expect(input).toHaveClass('rounded-md')
    expect(input).toHaveClass('border')
    expect(input).toHaveClass('px-3')
    expect(input).toHaveClass('py-2')
    expect(input).toHaveClass('text-sm')
  })

  it('handles onFocus and onBlur', () => {
    const handleFocus = jest.fn()
    const handleBlur = jest.fn()
    render(<Input onFocus={handleFocus} onBlur={handleBlur} />)
    const input = screen.getByRole('textbox')

    fireEvent.focus(input)
    expect(handleFocus).toHaveBeenCalledTimes(1)

    fireEvent.blur(input)
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })

  it('handles readOnly state', () => {
    render(<Input readOnly value="readonly" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('readonly')
    expect(input).toHaveValue('readonly')
  })

  it('handles required attribute', () => {
    render(<Input required />)
    expect(screen.getByRole('textbox')).toBeRequired()
  })

  it('handles maxLength attribute', () => {
    render(<Input maxLength={10} />)
    expect(screen.getByRole('textbox')).toHaveAttribute('maxLength', '10')
  })

  it('handles minLength attribute', () => {
    render(<Input minLength={5} />)
    expect(screen.getByRole('textbox')).toHaveAttribute('minLength', '5')
  })

  it('handles pattern attribute', () => {
    render(<Input pattern="[A-Za-z]+" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('pattern', '[A-Za-z]+')
  })
})
