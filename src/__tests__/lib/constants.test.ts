import {
  TASK_STATUSES,
  TASK_PRIORITIES,
  KANBAN_COLUMNS,
  PROJECT_COLORS,
  DEFAULT_PROJECT_COLOR,
} from '@/lib/constants'

describe('TASK_STATUSES', () => {
  it('should have all required statuses', () => {
    const statusValues = TASK_STATUSES.map((s) => s.value)
    expect(statusValues).toContain('backlog')
    expect(statusValues).toContain('todo')
    expect(statusValues).toContain('in_progress')
    expect(statusValues).toContain('in_review')
    expect(statusValues).toContain('done')
    expect(statusValues).toContain('cancelled')
  })

  it('should have 6 statuses', () => {
    expect(TASK_STATUSES).toHaveLength(6)
  })

  it('each status should have value, label, and color', () => {
    TASK_STATUSES.forEach((status) => {
      expect(status).toHaveProperty('value')
      expect(status).toHaveProperty('label')
      expect(status).toHaveProperty('color')
      expect(typeof status.value).toBe('string')
      expect(typeof status.label).toBe('string')
      expect(typeof status.color).toBe('string')
    })
  })

  it('colors should be valid hex colors', () => {
    TASK_STATUSES.forEach((status) => {
      expect(status.color).toMatch(/^#[0-9a-f]{6}$/i)
    })
  })
})

describe('TASK_PRIORITIES', () => {
  it('should have all required priorities', () => {
    const priorityValues = TASK_PRIORITIES.map((p) => p.value)
    expect(priorityValues).toContain('urgent')
    expect(priorityValues).toContain('high')
    expect(priorityValues).toContain('medium')
    expect(priorityValues).toContain('low')
    expect(priorityValues).toContain('none')
  })

  it('should have 5 priorities', () => {
    expect(TASK_PRIORITIES).toHaveLength(5)
  })

  it('each priority should have value, label, and color', () => {
    TASK_PRIORITIES.forEach((priority) => {
      expect(priority).toHaveProperty('value')
      expect(priority).toHaveProperty('label')
      expect(priority).toHaveProperty('color')
      expect(typeof priority.value).toBe('string')
      expect(typeof priority.label).toBe('string')
      expect(typeof priority.color).toBe('string')
    })
  })

  it('colors should be valid hex colors', () => {
    TASK_PRIORITIES.forEach((priority) => {
      expect(priority.color).toMatch(/^#[0-9a-f]{6}$/i)
    })
  })

  it('urgent should be first (highest priority)', () => {
    expect(TASK_PRIORITIES[0].value).toBe('urgent')
  })

  it('none should be last (lowest priority)', () => {
    expect(TASK_PRIORITIES[TASK_PRIORITIES.length - 1].value).toBe('none')
  })
})

describe('KANBAN_COLUMNS', () => {
  it('should have 5 columns', () => {
    expect(KANBAN_COLUMNS).toHaveLength(5)
  })

  it('should have correct column order', () => {
    expect(KANBAN_COLUMNS[0].id).toBe('backlog')
    expect(KANBAN_COLUMNS[1].id).toBe('todo')
    expect(KANBAN_COLUMNS[2].id).toBe('in_progress')
    expect(KANBAN_COLUMNS[3].id).toBe('in_review')
    expect(KANBAN_COLUMNS[4].id).toBe('done')
  })

  it('each column should have id, title, and color', () => {
    KANBAN_COLUMNS.forEach((column) => {
      expect(column).toHaveProperty('id')
      expect(column).toHaveProperty('title')
      expect(column).toHaveProperty('color')
      expect(typeof column.id).toBe('string')
      expect(typeof column.title).toBe('string')
      expect(typeof column.color).toBe('string')
    })
  })

  it('should not include cancelled in kanban columns', () => {
    const columnIds = KANBAN_COLUMNS.map((c) => c.id)
    expect(columnIds).not.toContain('cancelled')
  })
})

describe('PROJECT_COLORS', () => {
  it('should have at least 5 colors', () => {
    expect(PROJECT_COLORS.length).toBeGreaterThanOrEqual(5)
  })

  it('all colors should be valid hex colors', () => {
    PROJECT_COLORS.forEach((color) => {
      expect(color).toMatch(/^#[0-9a-f]{6}$/i)
    })
  })

  it('should have unique colors', () => {
    const uniqueColors = new Set(PROJECT_COLORS)
    expect(uniqueColors.size).toBe(PROJECT_COLORS.length)
  })
})

describe('DEFAULT_PROJECT_COLOR', () => {
  it('should be a valid hex color', () => {
    expect(DEFAULT_PROJECT_COLOR).toMatch(/^#[0-9a-f]{6}$/i)
  })

  it('should be included in PROJECT_COLORS', () => {
    expect(PROJECT_COLORS).toContain(DEFAULT_PROJECT_COLOR)
  })
})
