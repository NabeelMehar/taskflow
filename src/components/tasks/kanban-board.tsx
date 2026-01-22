'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  closestCenter,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
  UniqueIdentifier,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
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
  const { tasks, updateTask, setTasks, setCreateTaskModalOpen } = useAppStore()
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const supabase = createClient()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  // Filter tasks by project
  const filteredTasks = projectId
    ? tasks.filter(task => task.project_id === projectId)
    : tasks

  // Group tasks by status
  const tasksByStatus = KANBAN_COLUMNS.reduce((acc, column) => {
    acc[column.id] = filteredTasks
      .filter((task) => task.status === column.id)
      .sort((a, b) => a.order - b.order)
    return acc
  }, {} as Record<TaskStatus, Task[]>)

  // Find which column a task belongs to
  const findColumn = (id: UniqueIdentifier): TaskStatus | null => {
    // Check if id is a column
    const column = KANBAN_COLUMNS.find(col => col.id === id)
    if (column) return column.id

    // Check if id is a task
    const task = filteredTasks.find(t => t.id === id)
    if (task) return task.status

    return null
  }

  // Custom collision detection that works better with scrollable containers
  const collisionDetectionStrategy = useCallback(
    (args: any) => {
      // First, check if we're over a droppable column
      const pointerCollisions = pointerWithin(args)
      const intersectionCollisions = rectIntersection(args)

      // Combine collision results
      const collisions = pointerCollisions.length > 0 ? pointerCollisions : intersectionCollisions

      if (collisions.length === 0) {
        return []
      }

      // Get the first collision
      let overId = getFirstCollision(collisions, 'id')

      if (overId != null) {
        // If we're over a column, find the closest task within that column
        if (KANBAN_COLUMNS.some(col => col.id === overId)) {
          const columnTasks = tasksByStatus[overId as TaskStatus] || []

          // If there are tasks in the column, use closestCenter to find the best position
          if (columnTasks.length > 0) {
            const closestTask = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container: any) =>
                  container.id !== overId &&
                  columnTasks.some(t => t.id === container.id)
              ),
            })

            if (closestTask.length > 0) {
              overId = closestTask[0].id
            }
          }
        }

        return [{ id: overId }]
      }

      return collisions
    },
    [tasksByStatus]
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id)
    const task = filteredTasks.find((t) => t.id === active.id)
    if (task) {
      setActiveTask(task)
    }
  }, [filteredTasks])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeColumn = findColumn(activeId)
    const overColumn = findColumn(overId)

    if (!activeColumn || !overColumn || activeColumn === overColumn) {
      return
    }

    // Moving to a different column
    const activeTask = filteredTasks.find(t => t.id === activeId)
    if (!activeTask) return

    // Update task status optimistically
    const updatedTask = { ...activeTask, status: overColumn }
    updateTask(updatedTask)
  }, [filteredTasks, updateTask])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event

    setActiveTask(null)
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeColumn = findColumn(activeId)
    const overColumn = findColumn(overId)

    if (!activeColumn || !overColumn) return

    const activeTask = filteredTasks.find(t => t.id === activeId)
    if (!activeTask) return

    // Get tasks in the target column
    const columnTasks = [...(tasksByStatus[overColumn] || [])]

    // Find indices
    const activeIndex = columnTasks.findIndex(t => t.id === activeId)
    const overIndex = columnTasks.findIndex(t => t.id === overId)

    let newOrder = activeTask.order
    let statusChanged = activeTask.status !== overColumn

    if (activeColumn === overColumn && activeIndex !== overIndex && overIndex !== -1) {
      // Reordering within the same column
      const reorderedTasks = arrayMove(columnTasks, activeIndex, overIndex)

      // Update order for all affected tasks
      const updates = reorderedTasks.map((task, index) => ({
        ...task,
        order: index,
      }))

      // Update local state
      const newTasks = tasks.map(t => {
        const updated = updates.find(u => u.id === t.id)
        return updated || t
      })
      setTasks(newTasks)

      // Update database
      for (const task of updates) {
        await supabase
          .from('tasks')
          .update({ order: task.order, updated_at: new Date().toISOString() })
          .eq('id', task.id)
      }
    } else if (statusChanged) {
      // Moving to a different column
      // Calculate new order (add to end of column)
      const targetColumnTasks = tasksByStatus[overColumn] || []

      if (overId !== overColumn) {
        // Dropped on a specific task - insert near that task
        const overTaskIndex = targetColumnTasks.findIndex(t => t.id === overId)
        if (overTaskIndex !== -1) {
          newOrder = overTaskIndex
        } else {
          newOrder = targetColumnTasks.length
        }
      } else {
        // Dropped on column itself - add to end
        newOrder = targetColumnTasks.length
      }

      // Update in database
      const { error } = await supabase
        .from('tasks')
        .update({
          status: overColumn,
          order: newOrder,
          updated_at: new Date().toISOString()
        })
        .eq('id', activeId)

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update task',
          variant: 'destructive',
        })
        // Revert - refetch tasks
        return
      }

      // Update local state
      updateTask({ ...activeTask, status: overColumn, order: newOrder })
    }
  }, [filteredTasks, tasks, tasksByStatus, updateTask, setTasks, supabase])

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
      collisionDetection={collisionDetectionStrategy}
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

      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <div className="rotate-2 scale-105 opacity-90">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
