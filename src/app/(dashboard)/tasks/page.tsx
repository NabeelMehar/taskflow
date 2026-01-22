'use client'

import { useState } from 'react'
import { Plus, Search, Filter, SortAsc } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TASK_STATUSES, TASK_PRIORITIES } from '@/lib/constants'
import { formatRelativeDate, getInitials, getPriorityColor, getStatusLabel, getPriorityLabel } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Task, TaskStatus, TaskPriority } from '@/types'

export default function TasksPage() {
  const { tasks, projects, setCreateTaskModalOpen, openTaskModal } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [projectFilter, setProjectFilter] = useState<string>('all')

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
    const matchesProject = projectFilter === 'all' || task.project_id === projectFilter
    return matchesSearch && matchesStatus && matchesPriority && matchesProject
  })

  // Sort by updated date
  const sortedTasks = [...filteredTasks].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  )

  const statusColors: Record<TaskStatus, string> = {
    backlog: 'bg-gray-500',
    todo: 'bg-gray-500',
    in_progress: 'bg-blue-500',
    in_review: 'bg-purple-500',
    done: 'bg-green-500',
    cancelled: 'bg-red-500',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
          <p className="text-muted-foreground">
            View and manage all your tasks across projects
          </p>
        </div>
        <Button onClick={() => setCreateTaskModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
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
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {TASK_PRIORITIES.map((priority) => (
              <SelectItem key={priority.value} value={priority.value}>
                {priority.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  {project.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Task Count */}
      <div className="text-sm text-muted-foreground">
        Showing {sortedTasks.length} of {tasks.length} tasks
      </div>

      {/* Tasks List */}
      {sortedTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <p className="mb-4 text-muted-foreground">No tasks found</p>
          <Button onClick={() => setCreateTaskModalOpen(true)} variant="outline">
            Create a task
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border">
          <div className="grid grid-cols-[1fr,120px,120px,150px,100px] gap-4 border-b bg-muted/50 px-4 py-3 text-sm font-medium text-muted-foreground">
            <div>Task</div>
            <div>Status</div>
            <div>Priority</div>
            <div>Project</div>
            <div>Updated</div>
          </div>
          <div className="divide-y">
            {sortedTasks.map((task) => (
              <div
                key={task.id}
                className="grid grid-cols-[1fr,120px,120px,150px,100px] gap-4 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => openTaskModal(task)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`h-2 w-2 rounded-full flex-shrink-0 ${statusColors[task.status]}`}
                  />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {task.project?.key}-{task.id.slice(0, 4).toUpperCase()}
                    </p>
                  </div>
                </div>
                <div>
                  <Badge variant="secondary" className="text-xs">
                    {getStatusLabel(task.status)}
                  </Badge>
                </div>
                <div>
                  <Badge
                    variant="outline"
                    className={`text-xs ${getPriorityColor(task.priority)} text-white border-0`}
                  >
                    {getPriorityLabel(task.priority)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: task.project?.color }}
                  />
                  <span className="text-sm truncate">{task.project?.name}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatRelativeDate(task.updated_at)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
