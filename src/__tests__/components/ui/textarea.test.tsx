import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Textarea } from '@/components/ui/textarea'

describe('Textarea', () => {
  it('renders correctly', () => {
    render(<Textarea />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders with placeholder', () => {
    render(<Textarea placeholder="Enter description..." />)
    expect(screen.getByPlaceholderText('Enter description...')).toBeInTheDocument()
  })

  it('handles text input', async () => {
    const user = userEvent.setup()
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Hello World')
    expect(textarea).toHaveValue('Hello World')
  })

  it('handles onChange events', () => {
    const handleChange = jest.fn()
    render(<Textarea onChange={handleChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } })
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('can be disabled', () => {
    render(<Textarea disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('applies disabled styles', () => {
    render(<Textarea disabled />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('disabled:cursor-not-allowed')
    expect(textarea).toHaveClass('disabled:opacity-50')
  })

  it('applies custom className', () => {
    render(<Textarea className="custom-class" />)
    expect(screen.getByRole('textbox')).toHaveClass('custom-class')
  })

  it('handles value prop', () => {
    render(<Textarea value="test value" onChange={() => {}} />)
    expect(screen.getByRole('textbox')).toHaveValue('test value')
  })

  it('handles defaultValue prop', () => {
    render(<Textarea defaultValue="default text" />)
    expect(screen.getByRole('textbox')).toHaveValue('default text')
  })

  it('forwards ref correctly', () => {
    const ref = jest.fn()
    render(<Textarea ref={ref} />)
    expect(ref).toHaveBeenCalled()
  })

  it('passes through additional props', () => {
    render(<Textarea data-testid="test-textarea" aria-label="Test Textarea" />)
    expect(screen.getByTestId('test-textarea')).toBeInTheDocument()
    expect(screen.getByLabelText('Test Textarea')).toBeInTheDocument()
  })

  it('has correct default styling', () => {
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('min-h-[80px]')
    expect(textarea).toHaveClass('w-full')
    expect(textarea).toHaveClass('rounded-md')
    expect(textarea).toHaveClass('border')
    expect(textarea).toHaveClass('px-3')
    expect(textarea).toHaveClass('py-2')
    expect(textarea).toHaveClass('text-sm')
  })

  it('handles focus styles', () => {
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('focus-visible:ring-2')
    expect(textarea).toHaveClass('focus-visible:ring-ring')
  })

  it('handles onFocus and onBlur', () => {
    const handleFocus = jest.fn()
    const handleBlur = jest.fn()
    render(<Textarea onFocus={handleFocus} onBlur={handleBlur} />)
    const textarea = screen.getByRole('textbox')

    fireEvent.focus(textarea)
    expect(handleFocus).toHaveBeenCalledTimes(1)

    fireEvent.blur(textarea)
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })

  it('handles readOnly state', () => {
    render(<Textarea readOnly value="readonly" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('readonly')
    expect(textarea).toHaveValue('readonly')
  })

  it('handles required attribute', () => {
    render(<Textarea required />)
    expect(screen.getByRole('textbox')).toBeRequired()
  })

  it('handles rows attribute', () => {
    render(<Textarea rows={10} />)
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '10')
  })

  it('handles maxLength attribute', () => {
    render(<Textarea maxLength={500} />)
    expect(screen.getByRole('textbox')).toHaveAttribute('maxLength', '500')
  })

  it('handles multiline input', async () => {
    const user = userEvent.setup()
    render(<Textarea />)
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Line 1{enter}Line 2{enter}Line 3')
    expect(textarea).toHaveValue('Line 1\nLine 2\nLine 3')
  })
})
