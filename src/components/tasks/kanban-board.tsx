'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { Task, TaskStatus } from '@/types'
import { KANBAN_COLUMNS } from '@/lib/constants'
import { useAppStore } from '@/lib/store'
import { KanbanColumn } from './kanban-column'
import { TaskCard } from './task-card'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/ui/use-toast'

interface KanbanBoardProps {
  projectId?: string
}

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { tasks, updateTask, setCreateTaskModalOpen } = useAppStore()
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const supabase = createClient()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Group tasks by status
  const tasksByStatus = KANBAN_COLUMNS.reduce((acc, column) => {
    acc[column.id] = tasks.filter((task) => {
      const matchesProject = projectId ? task.project_id === projectId : true
      return task.status === column.id && matchesProject
    })
    return acc
  }, {} as Record<TaskStatus, Task[]>)

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    const task = tasks.find((t) => t.id === active.id)
    if (task) {
      setActiveTask(task)
    }
  }, [tasks])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find the task being dragged
    const activeTask = tasks.find((t) => t.id === activeId)
    if (!activeTask) return

    // Check if we're over a column
    const overColumn = KANBAN_COLUMNS.find((col) => col.id === overId)
    
    if (overColumn && activeTask.status !== overColumn.id) {
      // Update task status optimistically
      const updatedTask = { ...activeTask, status: overColumn.id }
      updateTask(updatedTask)
    }
  }, [tasks, updateTask])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeTask = tasks.find((t) => t.id === activeId)
    if (!activeTask) return

    // Determine the target status
    let targetStatus: TaskStatus | null = null
    
    // Check if dropped on a column
    const overColumn = KANBAN_COLUMNS.find((col) => col.id === overId)
    if (overColumn) {
      targetStatus = overColumn.id
    } else {
      // Check if dropped on another task
      const overTask = tasks.find((t) => t.id === overId)
      if (overTask) {
        targetStatus = overTask.status
      }
    }

    if (targetStatus && activeTask.status !== targetStatus) {
      // Update in database
      const { error } = await supabase
        .from('tasks')
        .update({ status: targetStatus, updated_at: new Date().toISOString() })
        .eq('id', activeId)

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update task status',
          variant: 'destructive',
        })
        // Revert optimistic update
        updateTask(activeTask)
      }
    }
  }, [tasks, updateTask, supabase])

  const handleDeleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive',
      })
    } else {
      const { removeTask } = useAppStore.getState()
      removeTask(taskId)
      toast({
        title: 'Task deleted',
        description: 'The task has been deleted successfully',
      })
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-4 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            color={column.color}
            tasks={tasksByStatus[column.id] || []}
            onAddTask={() => setCreateTaskModalOpen(true)}
            onDeleteTask={handleDeleteTask}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 scale-105">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
