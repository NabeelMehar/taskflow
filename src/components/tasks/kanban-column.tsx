'use client'

import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { Task, TaskStatus } from '@/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { TaskCard } from './task-card'
import { useRef, useEffect } from 'react'

interface KanbanColumnProps {
  id: TaskStatus
  title: string
  color: string
  tasks: Task[]
  onAddTask?: () => void
  onEditTask?: (task: Task) => void
  onDeleteTask?: (taskId: string) => void
}

export function KanbanColumn({
  id,
  title,
  color,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
}: KanbanColumnProps) {
  const { setNodeRef, isOver, active } = useDroppable({ id })
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll when dragging near edges
  useEffect(() => {
    if (!active || !scrollRef.current || !isOver) return

    const scrollContainer = scrollRef.current
    const scrollSpeed = 10
    const scrollThreshold = 50

    const handleAutoScroll = (e: PointerEvent) => {
      const rect = scrollContainer.getBoundingClientRect()
      const y = e.clientY

      // Scroll up when near top
      if (y < rect.top + scrollThreshold && scrollContainer.scrollTop > 0) {
        scrollContainer.scrollTop -= scrollSpeed
      }
      // Scroll down when near bottom
      else if (y > rect.bottom - scrollThreshold &&
               scrollContainer.scrollTop < scrollContainer.scrollHeight - scrollContainer.clientHeight) {
        scrollContainer.scrollTop += scrollSpeed
      }
    }

    window.addEventListener('pointermove', handleAutoScroll)
    return () => window.removeEventListener('pointermove', handleAutoScroll)
  }, [active, isOver])

  return (
    <div className="flex h-full w-72 flex-shrink-0 flex-col rounded-lg bg-muted/50">
      {/* Column Header */}
      <div className="flex items-center justify-between p-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <h3 className="text-sm font-semibold">{title}</h3>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium">
            {tasks.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onAddTask}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Scrollable Tasks Container */}
      <div
        ref={(node) => {
          setNodeRef(node)
          // @ts-ignore
          scrollRef.current = node
        }}
        className={cn(
          'flex-1 overflow-y-auto p-2 transition-colors',
          isOver && 'bg-primary/5'
        )}
        style={{ minHeight: '100px' }}
      >
        <SortableContext
          items={tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className={cn(
            'space-y-2',
            // Ensure there's always space to drop
            tasks.length === 0 ? 'min-h-[120px]' : 'min-h-[60px] pb-16'
          )}>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => onEditTask?.(task)}
                onDelete={() => onDeleteTask?.(task.id)}
              />
            ))}
          </div>
        </SortableContext>

        {/* Empty state / Drop zone */}
        {tasks.length === 0 && (
          <div
            className={cn(
              'flex h-24 items-center justify-center rounded-lg border-2 border-dashed transition-all',
              isOver
                ? 'border-primary bg-primary/10'
                : 'border-muted-foreground/20'
            )}
          >
            <p className="text-sm text-muted-foreground">
              {isOver ? 'Drop here' : 'No tasks'}
            </p>
          </div>
        )}

        {/* Drop indicator at bottom when has tasks */}
        {tasks.length > 0 && isOver && (
          <div className="mt-2 h-16 rounded-lg border-2 border-dashed border-primary bg-primary/10 flex items-center justify-center">
            <p className="text-sm text-primary">Drop here</p>
          </div>
        )}
      </div>
    </div>
  )
}
