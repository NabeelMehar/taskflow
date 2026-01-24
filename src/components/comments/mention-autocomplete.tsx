'use client'

import { useEffect, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'
import { getMentionDisplayName } from '@/lib/mentions'
import { User } from '@/types'

interface MentionAutocompleteProps {
  users: User[]
  selectedIndex: number
  onSelect: (user: User) => void
  position: { top: number; left: number }
  visible: boolean
}

export function MentionAutocomplete({
  users,
  selectedIndex,
  onSelect,
  position,
  visible,
}: MentionAutocompleteProps) {
  const listRef = useRef<HTMLDivElement>(null)

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  if (!visible || users.length === 0) {
    return null
  }

  return (
    <div
      className="absolute z-50 w-64 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
      style={{
        top: position.top,
        left: position.left,
      }}
      ref={listRef}
    >
      {users.map((user, index) => (
        <button
          key={user.id}
          type="button"
          className={cn(
            'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
            index === selectedIndex
              ? 'bg-accent text-accent-foreground'
              : 'hover:bg-accent hover:text-accent-foreground'
          )}
          onClick={() => onSelect(user)}
          onMouseEnter={(e) => e.currentTarget.focus()}
        >
          <Avatar className="h-6 w-6">
            <AvatarImage src={user.avatar_url || ''} alt={user.full_name || ''} />
            <AvatarFallback className="text-xs">
              {user.full_name ? getInitials(user.full_name) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="font-medium">{user.full_name || 'Unknown'}</span>
            <span className="text-xs text-muted-foreground">
              @{getMentionDisplayName(user)}
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}
