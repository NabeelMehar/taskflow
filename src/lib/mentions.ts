import { User } from '@/types'

export interface MentionMatch {
  username: string
  startIndex: number
  endIndex: number
}

// Regex to match @mentions - captures word characters after @
const MENTION_REGEX = /@(\w+)/g

/**
 * Parse all @mentions from a text string
 * @param text - The text to parse for mentions
 * @returns Array of mention matches with username and position
 */
export function parseMentions(text: string): MentionMatch[] {
  if (!text) return []

  const matches: MentionMatch[] = []
  let match: RegExpExecArray | null

  // Reset regex lastIndex
  MENTION_REGEX.lastIndex = 0

  while ((match = MENTION_REGEX.exec(text)) !== null) {
    matches.push({
      username: match[1],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    })
  }

  return matches
}

/**
 * Extract unique usernames from mentions in text
 * @param text - The text to extract usernames from
 * @returns Array of unique lowercase usernames
 */
export function extractMentionedUsernames(text: string): string[] {
  const mentions = parseMentions(text)
  const usernames = mentions.map((m) => m.username.toLowerCase())
  return Array.from(new Set(usernames))
}

/**
 * Match mentioned usernames to actual users from a list
 * Uses firstName matching (first word of full_name)
 * @param text - The text containing mentions
 * @param members - List of team members to match against
 * @returns Array of matched User objects
 */
export function getMentionedUsers(text: string, members: User[]): User[] {
  const mentionedUsernames = extractMentionedUsernames(text)
  if (mentionedUsernames.length === 0 || members.length === 0) return []

  return members.filter((member) => {
    if (!member.full_name) return false
    const firstName = member.full_name.split(' ')[0].toLowerCase()
    return mentionedUsernames.includes(firstName)
  })
}

/**
 * Get the current word being typed at cursor position
 * Used for autocomplete detection
 * @param text - Full text
 * @param cursorPosition - Current cursor position
 * @returns Object with word, start position, and whether it's a mention
 */
export function getCurrentMentionQuery(
  text: string,
  cursorPosition: number
): { query: string; startIndex: number; isMention: boolean } | null {
  if (!text || cursorPosition === 0) return null

  // Find the start of the current word
  let startIndex = cursorPosition - 1
  while (startIndex >= 0 && !/\s/.test(text[startIndex])) {
    startIndex--
  }
  startIndex++

  const word = text.slice(startIndex, cursorPosition)

  // Check if it starts with @
  if (word.startsWith('@')) {
    return {
      query: word.slice(1).toLowerCase(), // Remove @ and lowercase
      startIndex,
      isMention: true,
    }
  }

  return null
}

/**
 * Replace the current mention query with a selected username
 * @param text - Original text
 * @param mentionStart - Start index of the @mention
 * @param cursorPosition - Current cursor position
 * @param username - Username to insert
 * @returns New text with the mention replaced
 */
export function insertMention(
  text: string,
  mentionStart: number,
  cursorPosition: number,
  username: string
): { newText: string; newCursorPosition: number } {
  const before = text.slice(0, mentionStart)
  const after = text.slice(cursorPosition)
  const mention = `@${username} `
  const newText = before + mention + after
  const newCursorPosition = mentionStart + mention.length

  return { newText, newCursorPosition }
}

/**
 * Filter team members by a search query (matches against firstName)
 * @param members - List of team members
 * @param query - Search query (without @)
 * @returns Filtered list of members
 */
export function filterMembersByQuery(members: User[], query: string): User[] {
  if (!query) return members.slice(0, 5) // Return first 5 if no query

  const lowercaseQuery = query.toLowerCase()
  return members
    .filter((member) => {
      if (!member.full_name) return false
      const firstName = member.full_name.split(' ')[0].toLowerCase()
      const fullName = member.full_name.toLowerCase()
      return firstName.startsWith(lowercaseQuery) || fullName.includes(lowercaseQuery)
    })
    .slice(0, 5) // Limit to 5 results
}

/**
 * Check if text contains any mentions
 * @param text - Text to check
 * @returns boolean indicating if mentions exist
 */
export function hasMentions(text: string): boolean {
  if (!text) return false
  MENTION_REGEX.lastIndex = 0
  return MENTION_REGEX.test(text)
}

/**
 * Get mention display name from a user
 * @param user - User object
 * @returns First name for mention
 */
export function getMentionDisplayName(user: User): string {
  if (!user.full_name) return user.email.split('@')[0]
  return user.full_name.split(' ')[0]
}
