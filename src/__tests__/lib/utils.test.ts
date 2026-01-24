import {
  cn,
  generateSlug,
  generateProjectKey,
  formatDate,
  formatRelativeDate,
  getInitials,
  getPriorityColor,
  getStatusColor,
  getStatusLabel,
  getPriorityLabel,
} from '@/lib/utils'

describe('cn (classNames utility)', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })

  it('should merge tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })

  it('should handle arrays', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz')
  })

  it('should handle objects', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz')
  })

  it('should handle undefined and null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
  })

  it('should handle empty strings', () => {
    expect(cn('foo', '', 'bar')).toBe('foo bar')
  })
})

describe('generateSlug', () => {
  it('should convert to lowercase', () => {
    expect(generateSlug('Hello World')).toBe('hello-world')
  })

  it('should replace spaces with hyphens', () => {
    expect(generateSlug('my project name')).toBe('my-project-name')
  })

  it('should remove special characters', () => {
    expect(generateSlug('Hello! World?')).toBe('hello-world')
  })

  it('should handle multiple consecutive special characters', () => {
    expect(generateSlug('Hello!!!World')).toBe('hello-world')
  })

  it('should remove leading and trailing hyphens', () => {
    expect(generateSlug('---hello---')).toBe('hello')
  })

  it('should handle numbers', () => {
    expect(generateSlug('Project 2024')).toBe('project-2024')
  })

  it('should handle empty string', () => {
    expect(generateSlug('')).toBe('')
  })

  it('should handle only special characters', () => {
    expect(generateSlug('!@#$%')).toBe('')
  })
})

describe('generateProjectKey', () => {
  it('should generate key from first letters', () => {
    expect(generateProjectKey('Task Flow')).toBe('TF')
  })

  it('should convert to uppercase', () => {
    expect(generateProjectKey('my project')).toBe('MP')
  })

  it('should limit to 4 characters', () => {
    expect(generateProjectKey('Very Long Project Name Here')).toBe('VLPN')
  })

  it('should handle single word', () => {
    expect(generateProjectKey('Project')).toBe('P')
  })

  it('should handle multiple spaces', () => {
    expect(generateProjectKey('A   B   C')).toBe('ABC')
  })
})

describe('formatDate', () => {
  it('should format date string correctly', () => {
    const result = formatDate('2024-01-15')
    expect(result).toMatch(/Jan 15, 2024/)
  })

  it('should format Date object correctly', () => {
    const date = new Date(2024, 5, 20) // June 20, 2024
    const result = formatDate(date)
    expect(result).toMatch(/Jun 20, 2024/)
  })

  it('should handle ISO date strings', () => {
    const result = formatDate('2024-12-25T00:00:00.000Z')
    expect(result).toMatch(/Dec 2[45], 2024/) // May vary by timezone
  })
})

describe('formatRelativeDate', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-06-15T12:00:00.000Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should return "just now" for recent dates', () => {
    const date = new Date('2024-06-15T11:59:30.000Z')
    expect(formatRelativeDate(date)).toBe('just now')
  })

  it('should return minutes ago', () => {
    const date = new Date('2024-06-15T11:55:00.000Z')
    expect(formatRelativeDate(date)).toBe('5m ago')
  })

  it('should return hours ago', () => {
    const date = new Date('2024-06-15T09:00:00.000Z')
    expect(formatRelativeDate(date)).toBe('3h ago')
  })

  it('should return days ago', () => {
    const date = new Date('2024-06-13T12:00:00.000Z')
    expect(formatRelativeDate(date)).toBe('2d ago')
  })

  it('should return formatted date for older dates', () => {
    const date = new Date('2024-05-01T12:00:00.000Z')
    const result = formatRelativeDate(date)
    expect(result).toMatch(/May 1, 2024/)
  })
})

describe('getInitials', () => {
  it('should get initials from full name', () => {
    expect(getInitials('John Doe')).toBe('JD')
  })

  it('should handle single name', () => {
    expect(getInitials('John')).toBe('J')
  })

  it('should limit to 2 characters', () => {
    expect(getInitials('John Michael Doe')).toBe('JM')
  })

  it('should handle lowercase names', () => {
    expect(getInitials('john doe')).toBe('JD')
  })

  it('should handle names with extra spaces', () => {
    expect(getInitials('John   Doe')).toBe('JD')
  })
})

describe('getPriorityColor', () => {
  it('should return correct color for urgent', () => {
    expect(getPriorityColor('urgent')).toBe('bg-red-500')
  })

  it('should return correct color for high', () => {
    expect(getPriorityColor('high')).toBe('bg-orange-500')
  })

  it('should return correct color for medium', () => {
    expect(getPriorityColor('medium')).toBe('bg-yellow-500')
  })

  it('should return correct color for low', () => {
    expect(getPriorityColor('low')).toBe('bg-green-500')
  })

  it('should return correct color for none', () => {
    expect(getPriorityColor('none')).toBe('bg-gray-400')
  })

  it('should return default color for unknown priority', () => {
    expect(getPriorityColor('unknown')).toBe('bg-gray-400')
  })
})

describe('getStatusColor', () => {
  it('should return correct color for backlog', () => {
    expect(getStatusColor('backlog')).toBe('bg-gray-400')
  })

  it('should return correct color for todo', () => {
    expect(getStatusColor('todo')).toBe('bg-gray-500')
  })

  it('should return correct color for in_progress', () => {
    expect(getStatusColor('in_progress')).toBe('bg-blue-500')
  })

  it('should return correct color for in_review', () => {
    expect(getStatusColor('in_review')).toBe('bg-purple-500')
  })

  it('should return correct color for done', () => {
    expect(getStatusColor('done')).toBe('bg-green-500')
  })

  it('should return correct color for cancelled', () => {
    expect(getStatusColor('cancelled')).toBe('bg-red-400')
  })

  it('should return default color for unknown status', () => {
    expect(getStatusColor('unknown')).toBe('bg-gray-500')
  })
})

describe('getStatusLabel', () => {
  it('should return correct label for backlog', () => {
    expect(getStatusLabel('backlog')).toBe('Backlog')
  })

  it('should return correct label for todo', () => {
    expect(getStatusLabel('todo')).toBe('To Do')
  })

  it('should return correct label for in_progress', () => {
    expect(getStatusLabel('in_progress')).toBe('In Progress')
  })

  it('should return correct label for in_review', () => {
    expect(getStatusLabel('in_review')).toBe('In Review')
  })

  it('should return correct label for done', () => {
    expect(getStatusLabel('done')).toBe('Done')
  })

  it('should return correct label for cancelled', () => {
    expect(getStatusLabel('cancelled')).toBe('Cancelled')
  })

  it('should return original value for unknown status', () => {
    expect(getStatusLabel('custom_status')).toBe('custom_status')
  })
})

describe('getPriorityLabel', () => {
  it('should return correct label for urgent', () => {
    expect(getPriorityLabel('urgent')).toBe('Urgent')
  })

  it('should return correct label for high', () => {
    expect(getPriorityLabel('high')).toBe('High')
  })

  it('should return correct label for medium', () => {
    expect(getPriorityLabel('medium')).toBe('Medium')
  })

  it('should return correct label for low', () => {
    expect(getPriorityLabel('low')).toBe('Low')
  })

  it('should return correct label for none', () => {
    expect(getPriorityLabel('none')).toBe('No Priority')
  })

  it('should return original value for unknown priority', () => {
    expect(getPriorityLabel('custom_priority')).toBe('custom_priority')
  })
})
