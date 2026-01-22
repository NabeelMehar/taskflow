'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, MessageSquare, MoreHorizontal, Flag } from 'lucide-react'
import { Task } from '@/types'
import { cn, formatRelativeDate, getPriorityColor } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/lib/store'
import { getInitials } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onEdit?: () => void
  onDelete?: () => void
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const { openTaskModal } = useAppStore()
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const priorityColors: Record<string, string> = {
    urgent: 'text-red-500',
    high: 'text-orange-500',
    medium: 'text-yellow-500',
    low: 'text-green-500',
    none: 'text-gray-400',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'group cursor-grab rounded-lg border bg-card p-3 shadow-sm transition-all hover:shadow-md active:cursor-grabbing',
        isDragging && 'opacity-50 shadow-lg ring-2 ring-primary'
      )}
      onClick={() => openTaskModal(task)}
    >
      {/* Task Key & Priority */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {task.project?.key}-{task.id.slice(0, 4).toUpperCase()}
          </span>
          {task.priority !== 'none' && (
            <Flag className={cn('h-3 w-3', priorityColors[task.priority])} />
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.() }}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); onDelete?.() }}
              className="text-red-600"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Title */}
      <h4 className="mb-2 text-sm font-medium leading-tight">{task.title}</h4>

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {task.labels.slice(0, 2).map((label) => (
            <Badge
              key={label.id}
              variant="secondary"
              className="text-[10px] px-1.5 py-0"
              style={{ backgroundColor: `${label.color}20`, color: label.color }}
            >
              {label.name}
            </Badge>
          ))}
          {task.labels.length > 2 && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              +{task.labels.length - 2}
            </Badge>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {task.due_date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatRelativeDate(task.due_date)}</span>
            </div>
          )}
          {task.comments_count && task.comments_count > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span>{task.comments_count}</span>
            </div>
          )}
        </div>

        {/* Assignee */}
        {task.assignee && (
          <Avatar className="h-6 w-6">
            <AvatarImage src={task.assignee.avatar_url || ''} />
            <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
              {getInitials(task.assignee.full_name || 'U')}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  )
}
