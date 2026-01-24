'use client'

import { useState, useRef, useCallback, useEffect, KeyboardEvent } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { MentionAutocomplete } from './mention-autocomplete'
import {
  getCurrentMentionQuery,
  insertMention,
  filterMembersByQuery,
  getMentionDisplayName,
} from '@/lib/mentions'
import { User } from '@/types'

interface MentionInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  teamMembers: User[]
  disabled?: boolean
  className?: string
  rows?: number
}

export function MentionInput({
  value,
  onChange,
  placeholder = 'Write a comment...',
  teamMembers,
  disabled = false,
  className,
  rows = 3,
}: MentionInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [autocompletePosition, setAutocompletePosition] = useState({ top: 0, left: 0 })
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [mentionStart, setMentionStart] = useState<number | null>(null)

  const updateAutocomplete = useCallback(() => {
    if (!textareaRef.current) return

    const cursorPosition = textareaRef.current.selectionStart
    const mentionQuery = getCurrentMentionQuery(value, cursorPosition)

    if (mentionQuery && mentionQuery.isMention) {
      const filtered = filterMembersByQuery(teamMembers, mentionQuery.query)
      setFilteredUsers(filtered)
      setMentionStart(mentionQuery.startIndex)
      setSelectedIndex(0)

      // Calculate position for autocomplete dropdown
      const textarea = textareaRef.current
      const textBeforeCursor = value.slice(0, cursorPosition)
      const lines = textBeforeCursor.split('\n')
      const currentLineIndex = lines.length - 1
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20

      // Position below the current line
      setAutocompletePosition({
        top: (currentLineIndex + 1) * lineHeight + 8,
        left: 0,
      })

      setShowAutocomplete(filtered.length > 0)
    } else {
      setShowAutocomplete(false)
      setMentionStart(null)
    }
  }, [value, teamMembers])

  useEffect(() => {
    updateAutocomplete()
  }, [value, updateAutocomplete])

  const handleSelect = useCallback(
    (user: User) => {
      if (mentionStart === null || !textareaRef.current) return

      const cursorPosition = textareaRef.current.selectionStart
      const username = getMentionDisplayName(user)
      const { newText, newCursorPosition } = insertMention(
        value,
        mentionStart,
        cursorPosition,
        username
      )

      onChange(newText)
      setShowAutocomplete(false)
      setMentionStart(null)

      // Set cursor position after the inserted mention
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
          textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition)
        }
      }, 0)
    },
    [value, mentionStart, onChange]
  )

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showAutocomplete) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % filteredUsers.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length)
        break
      case 'Enter':
        if (filteredUsers.length > 0) {
          e.preventDefault()
          handleSelect(filteredUsers[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowAutocomplete(false)
        break
      case 'Tab':
        if (filteredUsers.length > 0) {
          e.preventDefault()
          handleSelect(filteredUsers[selectedIndex])
        }
        break
    }
  }

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        rows={rows}
      />
      <MentionAutocomplete
        users={filteredUsers}
        selectedIndex={selectedIndex}
        onSelect={handleSelect}
        position={autocompletePosition}
        visible={showAutocomplete}
      />
    </div>
  )
}
