import {
  parseMentions,
  extractMentionedUsernames,
  getMentionedUsers,
  getCurrentMentionQuery,
  insertMention,
  filterMembersByQuery,
  hasMentions,
  getMentionDisplayName,
} from '@/lib/mentions'
import { User } from '@/types'

const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'john@example.com',
    full_name: 'John Doe',
    avatar_url: null,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'user-2',
    email: 'jane@example.com',
    full_name: 'Jane Smith',
    avatar_url: null,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'user-3',
    email: 'bob@example.com',
    full_name: 'Bob Wilson',
    avatar_url: null,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'user-4',
    email: 'noname@example.com',
    full_name: null,
    avatar_url: null,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
]

describe('mentions utility functions', () => {
  describe('parseMentions', () => {
    it('should return empty array for empty string', () => {
      expect(parseMentions('')).toEqual([])
    })

    it('should return empty array for null/undefined', () => {
      expect(parseMentions(null as any)).toEqual([])
      expect(parseMentions(undefined as any)).toEqual([])
    })

    it('should return empty array for text without mentions', () => {
      expect(parseMentions('Hello world')).toEqual([])
    })

    it('should parse single mention', () => {
      const result = parseMentions('Hello @john')
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        username: 'john',
        startIndex: 6,
        endIndex: 11,
      })
    })

    it('should parse multiple mentions', () => {
      const result = parseMentions('Hey @john and @jane!')
      expect(result).toHaveLength(2)
      expect(result[0].username).toBe('john')
      expect(result[1].username).toBe('jane')
    })

    it('should handle mentions at the start of text', () => {
      const result = parseMentions('@john said hello')
      expect(result).toHaveLength(1)
      expect(result[0].startIndex).toBe(0)
    })

    it('should handle mentions with underscores', () => {
      const result = parseMentions('Hey @john_doe')
      expect(result).toHaveLength(1)
      expect(result[0].username).toBe('john_doe')
    })

    it('should handle mentions with numbers', () => {
      const result = parseMentions('Hey @user123')
      expect(result).toHaveLength(1)
      expect(result[0].username).toBe('user123')
    })
  })

  describe('extractMentionedUsernames', () => {
    it('should return empty array for text without mentions', () => {
      expect(extractMentionedUsernames('Hello world')).toEqual([])
    })

    it('should extract unique usernames in lowercase', () => {
      const result = extractMentionedUsernames('@John and @JANE')
      expect(result).toContain('john')
      expect(result).toContain('jane')
    })

    it('should remove duplicates', () => {
      const result = extractMentionedUsernames('@john @john @john')
      expect(result).toHaveLength(1)
      expect(result[0]).toBe('john')
    })
  })

  describe('getMentionedUsers', () => {
    it('should return empty array for empty text', () => {
      expect(getMentionedUsers('', mockUsers)).toEqual([])
    })

    it('should return empty array for empty members list', () => {
      expect(getMentionedUsers('@john', [])).toEqual([])
    })

    it('should match users by first name', () => {
      const result = getMentionedUsers('Hey @john', mockUsers)
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('user-1')
    })

    it('should match multiple users', () => {
      const result = getMentionedUsers('@john and @jane', mockUsers)
      expect(result).toHaveLength(2)
    })

    it('should be case insensitive', () => {
      const result = getMentionedUsers('@JOHN', mockUsers)
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('user-1')
    })

    it('should not match users without full_name', () => {
      const result = getMentionedUsers('@noname', mockUsers)
      expect(result).toHaveLength(0)
    })
  })

  describe('getCurrentMentionQuery', () => {
    it('should return null for empty text', () => {
      expect(getCurrentMentionQuery('', 0)).toBeNull()
    })

    it('should return null for cursor at position 0', () => {
      expect(getCurrentMentionQuery('hello', 0)).toBeNull()
    })

    it('should return null for non-mention word', () => {
      expect(getCurrentMentionQuery('hello', 5)).toBeNull()
    })

    it('should detect mention at cursor position', () => {
      const result = getCurrentMentionQuery('Hey @jo', 7)
      expect(result).not.toBeNull()
      expect(result?.isMention).toBe(true)
      expect(result?.query).toBe('jo')
      expect(result?.startIndex).toBe(4)
    })

    it('should detect mention at start of text', () => {
      const result = getCurrentMentionQuery('@john', 5)
      expect(result).not.toBeNull()
      expect(result?.isMention).toBe(true)
      expect(result?.query).toBe('john')
    })

    it('should handle just @ symbol', () => {
      const result = getCurrentMentionQuery('Hey @', 5)
      expect(result).not.toBeNull()
      expect(result?.isMention).toBe(true)
      expect(result?.query).toBe('')
    })
  })

  describe('insertMention', () => {
    it('should insert mention at the correct position', () => {
      const result = insertMention('Hey @jo', 4, 7, 'john')
      expect(result.newText).toBe('Hey @john ')
      expect(result.newCursorPosition).toBe(10)
    })

    it('should handle insertion at start of text', () => {
      const result = insertMention('@jo', 0, 3, 'john')
      expect(result.newText).toBe('@john ')
      expect(result.newCursorPosition).toBe(6)
    })

    it('should preserve text after the mention', () => {
      const result = insertMention('Hey @jo world', 4, 7, 'john')
      expect(result.newText).toBe('Hey @john  world')
    })
  })

  describe('filterMembersByQuery', () => {
    it('should return first 5 members when no query', () => {
      const result = filterMembersByQuery(mockUsers, '')
      expect(result.length).toBeLessThanOrEqual(5)
    })

    it('should filter by first name prefix', () => {
      const result = filterMembersByQuery(mockUsers, 'jo')
      expect(result).toHaveLength(1)
      expect(result[0].full_name).toBe('John Doe')
    })

    it('should filter by full name containing query', () => {
      const result = filterMembersByQuery(mockUsers, 'doe')
      expect(result).toHaveLength(1)
      expect(result[0].full_name).toBe('John Doe')
    })

    it('should be case insensitive', () => {
      const result = filterMembersByQuery(mockUsers, 'JANE')
      expect(result).toHaveLength(1)
    })

    it('should limit results to 5', () => {
      const manyUsers = Array(10).fill(null).map((_, i) => ({
        ...mockUsers[0],
        id: `user-${i}`,
        full_name: `John ${i}`,
      }))
      const result = filterMembersByQuery(manyUsers, 'john')
      expect(result).toHaveLength(5)
    })

    it('should not match users without full_name', () => {
      const result = filterMembersByQuery(mockUsers, 'noname')
      expect(result).toHaveLength(0)
    })
  })

  describe('hasMentions', () => {
    it('should return false for empty text', () => {
      expect(hasMentions('')).toBe(false)
    })

    it('should return false for null/undefined', () => {
      expect(hasMentions(null as any)).toBe(false)
      expect(hasMentions(undefined as any)).toBe(false)
    })

    it('should return false for text without mentions', () => {
      expect(hasMentions('Hello world')).toBe(false)
    })

    it('should return true for text with mentions', () => {
      expect(hasMentions('Hey @john')).toBe(true)
    })
  })

  describe('getMentionDisplayName', () => {
    it('should return first name from full_name', () => {
      expect(getMentionDisplayName(mockUsers[0])).toBe('John')
    })

    it('should return email prefix if no full_name', () => {
      expect(getMentionDisplayName(mockUsers[3])).toBe('noname')
    })
  })
})
