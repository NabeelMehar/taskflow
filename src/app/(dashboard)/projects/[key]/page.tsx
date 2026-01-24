'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Settings, Users, LayoutGrid, List, Plus, Pencil } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import { KanbanBoard } from '@/components/tasks/kanban-board'
import { TaskListView } from '@/components/tasks/task-list-view'
import { CreateTaskModal } from '@/components/tasks/create-task-modal'
import { PROJECT_COLORS } from '@/lib/constants'
import { getInitials } from '@/lib/utils'
import { User } from '@/types'

type ViewMode = 'board' | 'list'

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const { projects, setCurrentProject, currentProject, setProjects, workspaces, setCreateTaskModalOpen } = useAppStore()
  const supabase = createClient()
  const projectKey = params.key as string

  const [viewMode, setViewMode] = useState<ViewMode>('board')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [membersOpen, setMembersOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [workspaceMembers, setWorkspaceMembers] = useState<User[]>([])

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '',
  })

  useEffect(() => {
    const project = projects.find(p => p.key === projectKey)
    if (project) {
      setCurrentProject(project)
      setFormData({
        name: project.name,
        description: project.description || '',
        color: project.color,
      })
    }
  }, [projectKey, projects, setCurrentProject])

  useEffect(() => {
    if (workspaces.length > 0) {
      fetchWorkspaceMembers()
    }
  }, [workspaces])

  const fetchWorkspaceMembers = async () => {
    if (!workspaces.length) return

    const { data, error } = await supabase
      .from('workspace_members')
      .select('user:users(*)')
      .eq('workspace_id', workspaces[0].id)

    if (!error && data) {
      const members = data.map((d: any) => d.user).filter(Boolean) as User[]
      setWorkspaceMembers(members)
    }
  }

  const handleUpdateProject = async () => {
    if (!currentProject) return

    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Project name is required',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    const { error } = await supabase
      .from('projects')
      .update({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        color: formData.color,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentProject.id)

    setLoading(false)

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update project',
        variant: 'destructive',
      })
      return
    }

    setProjects(
      projects.map((p) =>
        p.id === currentProject.id
          ? {
              ...p,
              name: formData.name.trim(),
              description: formData.description.trim() || null,
              color: formData.color,
            }
          : p
      )
    )

    setCurrentProject({
      ...currentProject,
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      color: formData.color,
    })

    toast({
      title: 'Project updated',
      description: 'The project has been updated successfully',
    })
    setSettingsOpen(false)
  }

  const handleDeleteProject = async () => {
    if (!currentProject) return

    setLoading(true)

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', currentProject.id)

    setLoading(false)

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive',
      })
      return
    }

    setProjects(projects.filter(p => p.id !== currentProject.id))
    toast({
      title: 'Project deleted',
      description: 'The project has been deleted',
    })
    router.push('/projects')
  }

  if (!currentProject) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    )
  }

  const projectLead = workspaceMembers.find(m => m.id === currentProject.lead_id)

  return (
    <TooltipProvider>
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
            <Button onClick={() => setCreateTaskModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Task
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => setMembersOpen(true)}>
                  <Users className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Team Members</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => setSettingsOpen(true)}>
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Project Settings</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <Separator className="mb-4" />

        {/* View Toggle */}
        <div className="mb-4 flex items-center gap-2">
          <Button
            variant={viewMode === 'board' ? 'secondary' : 'ghost'}
            size="sm"
            className="gap-2"
            onClick={() => setViewMode('board')}
          >
            <LayoutGrid className="h-4 w-4" />
            Board
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            className="gap-2"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
            List
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {viewMode === 'board' ? (
            <KanbanBoard projectId={currentProject.id} />
          ) : (
            <TaskListView projectId={currentProject.id} />
          )}
        </div>

        {/* Create Task Modal */}
        <CreateTaskModal />

        {/* Project Settings Modal */}
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Project Settings</DialogTitle>
              <DialogDescription>
                Update your project details
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="project-description">Description</Label>
                <Textarea
                  id="project-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  {PROJECT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`h-8 w-8 rounded-full transition-all ${
                        formData.color === color
                          ? 'ring-2 ring-offset-2 ring-primary'
                          : ''
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>
              <Separator className="my-2" />
              <div className="space-y-2">
                <Label className="text-red-600">Danger Zone</Label>
                <p className="text-sm text-muted-foreground">
                  Deleting this project will also delete all tasks within it.
                </p>
                <Button
                  variant="destructive"
                  onClick={handleDeleteProject}
                  disabled={loading}
                >
                  Delete Project
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSettingsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateProject} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Team Members Modal */}
        <Dialog open={membersOpen} onOpenChange={setMembersOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Team Members</DialogTitle>
              <DialogDescription>
                Members who have access to this project
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-3">
                {workspaceMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatar_url || ''} />
                        <AvatarFallback>
                          {getInitials(member.full_name || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.full_name || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    {member.id === currentProject.lead_id && (
                      <Badge>Lead</Badge>
                    )}
                  </div>
                ))}
                {workspaceMembers.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No team members found
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setMembersOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
