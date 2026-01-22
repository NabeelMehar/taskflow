'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import {
  Flag,
  ArrowUpDown,
  ChevronDown,
  Calendar,
  User,
  MoreHorizontal,
  Trash2,
  CheckCircle2,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { createClient } from '@/lib/supabase/client'
import { Task, TaskStatus, TaskPriority } from '@/types'
import { TASK_PRIORITIES, TASK_STATUSES } from '@/lib/constants'
import { cn, formatRelativeDate, getInitials } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/components/ui/use-toast'

interface TaskListViewProps {
  projectId: string
}

type SortField = 'title' | 'status' | 'priority' | 'due_date' | 'updated_at'
type SortOrder = 'asc' | 'desc'

export function TaskListView({ projectId }: TaskListViewProps) {
  const { tasks, updateTask, removeTask, openTaskModal } = useAppStore()
  const supabase = createClient()
  const [sortField, setSortField] = useState<SortField>('updated_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())

  const projectTasks = tasks.filter((task) => task.project_id === projectId)

  const sortedTasks = [...projectTasks].sort((a, b) => {
    let comparison = 0

    switch (sortField) {
      case 'title':
        comparison = a.title.localeCompare(b.title)
        break
      case 'status':
        const statusOrder = ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled']
        comparison = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
        break
      case 'priority':
        const priorityOrder = ['urgent', 'high', 'medium', 'low', 'none']
        comparison = priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority)
        break
      case 'due_date':
        if (!a.due_date && !b.due_date) comparison = 0
        else if (!a.due_date) comparison = 1
        else if (!b.due_date) comparison = -1
        else comparison = new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        break
      case 'updated_at':
        comparison = new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        break
    }

    return sortOrder === 'asc' ? comparison : -comparison
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', task.id)

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update task status',
        variant: 'destructive',
      })
      return
    }

    updateTask({ ...task, status: newStatus })
  }

  const handlePriorityChange = async (task: Task, newPriority: TaskPriority) => {
    const { error } = await supabase
      .from('tasks')
      .update({ priority: newPriority, updated_at: new Date().toISOString() })
      .eq('id', task.id)

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update task priority',
        variant: 'destructive',
      })
      return
    }

    updateTask({ ...task, priority: newPriority })
  }

  const handleDeleteTask = async (taskId: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId)

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive',
      })
      return
    }

    removeTask(taskId)
    toast({
      title: 'Task deleted',
      description: 'The task has been deleted',
    })
  }

  const handleSelectTask = (taskId: string, checked: boolean) => {
    const newSelected = new Set(selectedTasks)
    if (checked) {
      newSelected.add(taskId)
    } else {
      newSelected.delete(taskId)
    }
    setSelectedTasks(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(new Set(sortedTasks.map((t) => t.id)))
    } else {
      setSelectedTasks(new Set())
    }
  }

  const handleBulkDelete = async () => {
    const taskIds = Array.from(selectedTasks)

    const { error } = await supabase.from('tasks').delete().in('id', taskIds)

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete tasks',
        variant: 'destructive',
      })
      return
    }

    taskIds.forEach((id) => removeTask(id))
    setSelectedTasks(new Set())
    toast({
      title: 'Tasks deleted',
      description: `${taskIds.length} tasks have been deleted`,
    })
  }

  const handleBulkComplete = async () => {
    const taskIds = Array.from(selectedTasks)

    const { error } = await supabase
      .from('tasks')
      .update({ status: 'done', updated_at: new Date().toISOString() })
      .in('id', taskIds)

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update tasks',
        variant: 'destructive',
      })
      return
    }

    taskIds.forEach((id) => {
      const task = tasks.find((t) => t.id === id)
      if (task) {
        updateTask({ ...task, status: 'done' })
      }
    })
    setSelectedTasks(new Set())
    toast({
      title: 'Tasks completed',
      description: `${taskIds.length} tasks marked as done`,
    })
  }

  const getStatusConfig = (status: TaskStatus) => {
    return TASK_STATUSES.find((s) => s.value === status)
  }

  const getPriorityConfig = (priority: TaskPriority) => {
    return TASK_PRIORITIES.find((p) => p.value === priority)
  }

  const SortableHeader = ({
    field,
    children,
  }: {
    field: SortField
    children: React.ReactNode
  }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-foreground transition-colors"
    >
      {children}
      <ArrowUpDown
        className={cn('h-3 w-3', sortField === field ? 'text-foreground' : 'text-muted-foreground')}
      />
    </button>
  )

  if (projectTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Create your first task to get started
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedTasks.size > 0 && (
        <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">{selectedTasks.size} selected</span>
          <Button size="sm" variant="outline" onClick={handleBulkComplete}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Mark Complete
          </Button>
          <Button size="sm" variant="outline" onClick={handleBulkDelete} className="text-red-600">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedTasks.size === sortedTasks.length && sortedTasks.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>
                <SortableHeader field="title">Title</SortableHeader>
              </TableHead>
              <TableHead className="w-32">
                <SortableHeader field="status">Status</SortableHeader>
              </TableHead>
              <TableHead className="w-32">
                <SortableHeader field="priority">Priority</SortableHeader>
              </TableHead>
              <TableHead className="w-40">Assignee</TableHead>
              <TableHead className="w-32">
                <SortableHeader field="due_date">Due Date</SortableHeader>
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTasks.map((task) => {
              const statusConfig = getStatusConfig(task.status)
              const priorityConfig = getPriorityConfig(task.priority)

              return (
                <TableRow
                  key={task.id}
                  className={cn(
                    'cursor-pointer',
                    selectedTasks.has(task.id) && 'bg-muted/50'
                  )}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedTasks.has(task.id)}
                      onCheckedChange={(checked) =>
                        handleSelectTask(task.id, checked as boolean)
                      }
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell onClick={() => openTaskModal(task)}>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{task.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {task.project?.key}-{task.id.slice(0, 4).toUpperCase()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={task.status}
                      onValueChange={(value) =>
                        handleStatusChange(task, value as TaskStatus)
                      }
                    >
                      <SelectTrigger className="h-8 w-full border-0 bg-transparent p-0 hover:bg-muted">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: statusConfig?.color }}
                          />
                          <span className="text-sm">{statusConfig?.label}</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {TASK_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            <div className="flex items-center gap-2">
                              <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: status.color }}
                              />
                              {status.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={task.priority}
                      onValueChange={(value) =>
                        handlePriorityChange(task, value as TaskPriority)
                      }
                    >
                      <SelectTrigger className="h-8 w-full border-0 bg-transparent p-0 hover:bg-muted">
                        <div className="flex items-center gap-2">
                          <Flag
                            className="h-3 w-3"
                            style={{ color: priorityConfig?.color }}
                          />
                          <span className="text-sm">{priorityConfig?.label}</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {TASK_PRIORITIES.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            <div className="flex items-center gap-2">
                              <Flag
                                className="h-3 w-3"
                                style={{ color: priority.color }}
                              />
                              {priority.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell onClick={() => openTaskModal(task)}>
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={task.assignee.avatar_url || ''} />
                          <AvatarFallback className="text-xs">
                            {getInitials(task.assignee.full_name || 'U')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm truncate">
                          {task.assignee.full_name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell onClick={() => openTaskModal(task)}>
                    {task.due_date ? (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {format(new Date(task.due_date), 'MMM d')}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
