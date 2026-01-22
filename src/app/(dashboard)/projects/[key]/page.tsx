'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Settings, Users, LayoutGrid, List } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { KanbanBoard } from '@/components/tasks/kanban-board'

export default function ProjectPage() {
  const params = useParams()
  const { projects, setCurrentProject, currentProject } = useAppStore()
  const projectKey = params.key as string

  useEffect(() => {
    const project = projects.find(p => p.key === projectKey)
    if (project) {
      setCurrentProject(project)
    }
  }, [projectKey, projects, setCurrentProject])

  if (!currentProject) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      {/* Project Header */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-4">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg text-white font-bold"
            style={{ backgroundColor: currentProject.color }}
          >
            {currentProject.key.slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{currentProject.name}</h1>
              <Badge variant="outline">{currentProject.key}</Badge>
            </div>
            {currentProject.description && (
              <p className="text-sm text-muted-foreground">
                {currentProject.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <Users className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator className="mb-4" />

      {/* View Toggle (future enhancement) */}
      <div className="mb-4 flex items-center gap-2">
        <Button variant="secondary" size="sm" className="gap-2">
          <LayoutGrid className="h-4 w-4" />
          Board
        </Button>
        <Button variant="ghost" size="sm" className="gap-2">
          <List className="h-4 w-4" />
          List
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard projectId={currentProject.id} />
      </div>
    </div>
  )
}
