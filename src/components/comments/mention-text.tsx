'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { parseMentions } from '@/lib/mentions'

interface MentionTextProps {
  text: string
  className?: string
  mentionClassName?: string
  onMentionClick?: (username: string) => void
}

export function MentionText({
  text,
  className,
  mentionClassName,
  onMentionClick,
}: MentionTextProps) {
  const parts = useMemo(() => {
    if (!text) return []

    const mentions = parseMentions(text)
    if (mentions.length === 0) {
      return [{ type: 'text' as const, content: text }]
    }

    const result: Array<{ type: 'text' | 'mention'; content: string }> = []
    let lastIndex = 0

    mentions.forEach((mention) => {
      // Add text before the mention
      if (mention.startIndex > lastIndex) {
        result.push({
          type: 'text',
          content: text.slice(lastIndex, mention.startIndex),
        })
      }

      // Add the mention
      result.push({
        type: 'mention',
        content: `@${mention.username}`,
      })

      lastIndex = mention.endIndex
    })

    // Add any remaining text after the last mention
    if (lastIndex < text.length) {
      result.push({
        type: 'text',
        content: text.slice(lastIndex),
      })
    }

    return result
  }, [text])

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.type === 'mention') {
          return (
            <button
              key={index}
              type="button"
              className={cn(
                'inline rounded bg-primary/10 px-1 font-medium text-primary hover:bg-primary/20 transition-colors',
                mentionClassName
              )}
              onClick={() => onMentionClick?.(part.content.slice(1))}
            >
              {part.content}
            </button>
          )
        }
        return <span key={index}>{part.content}</span>
      })}
    </span>
  )
}
