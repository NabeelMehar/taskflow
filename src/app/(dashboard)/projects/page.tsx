'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, FolderKanban, MoreHorizontal, Pencil, Trash2, Loader2, Users } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from '@/components/ui/use-toast'
import { PROJECT_COLORS, DEFAULT_PROJECT_COLOR } from '@/lib/constants'
import { generateProjectKey, getInitials } from '@/lib/utils'
import { Project, User } from '@/types'

export default function ProjectsPage() {
  const { projects, tasks, workspaces, setProjects, user } = useAppStore()
  const supabase = createClient()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(false)
  const [workspaceMembers, setWorkspaceMembers] = useState<User[]>([])

  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
    color: DEFAULT_PROJECT_COLOR,
    lead_id: '',
  })

  useEffect(() => {
    fetchWorkspaceMembers()
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

  const resetForm = () => {
    setFormData({
      name: '',
      key: '',
      description: '',
      color: DEFAULT_PROJECT_COLOR,
      lead_id: user?.id || '',
    })
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      key: generateProjectKey(name),
    })
  }

  const handleOpenEditModal = (project: Project) => {
    setSelectedProject(project)
    setFormData({
      name: project.name,
      key: project.key,
      description: project.description || '',
      color: project.color,
      lead_id: project.lead_id || '',
    })
    setEditModalOpen(true)
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.key.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    if (!workspaces.length) {
      toast({
        title: 'Error',
        description: 'Please create a workspace first',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    const { data, error } = await supabase
      .from('projects')
      .insert({
        name: formData.name.trim(),
        key: formData.key.toUpperCase().trim(),
        description: formData.description.trim() || null,
        color: formData.color,
        workspace_id: workspaces[0].id,
        lead_id: formData.lead_id || user?.id,
      })
      .select()
      .single()

    setLoading(false)

    if (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create project',
        variant: 'destructive',
      })
      return
    }

    setProjects([data as Project, ...projects])
    toast({
      title: 'Project created',
      description: 'Your project has been created successfully',
    })
    setCreateModalOpen(false)
    resetForm()
  }

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedProject) return

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
        lead_id: formData.lead_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', selectedProject.id)

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
        p.id === selectedProject.id
          ? {
              ...p,
              name: formData.name.trim(),
              description: formData.description.trim() || null,
              color: formData.color,
              lead_id: formData.lead_id || null,
            }
          : p
      )
    )
    toast({
      title: 'Project updated',
      description: 'The project has been updated successfully',
    })
    setEditModalOpen(false)
    setSelectedProject(null)
    resetForm()
  }

  const handleDeleteProject = async () => {
    if (!selectedProject) return

    setLoading(true)

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', selectedProject.id)

    setLoading(false)

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive',
      })
      return
    }

    setProjects(projects.filter(p => p.id !== selectedProject.id))
    toast({
      title: 'Project deleted',
      description: 'The project has been deleted',
    })
    setDeleteDialogOpen(false)
    setSelectedProject(null)
  }

  const openDeleteDialog = (project: Project) => {
    setSelectedProject(project)
    setDeleteDialogOpen(true)
  }

  const ProjectFormContent = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor={isEdit ? 'edit-name' : 'name'}>Project Name *</Label>
        <Input
          id={isEdit ? 'edit-name' : 'name'}
          placeholder="e.g., Marketing Campaign"
          value={formData.name}
          onChange={(e) =>
            isEdit
              ? setFormData({ ...formData, name: e.target.value })
              : handleNameChange(e.target.value)
          }
        />
      </div>
      {!isEdit && (
        <div className="grid gap-2">
          <Label htmlFor="key">Project Key *</Label>
          <Input
            id="key"
            placeholder="e.g., MKT"
            value={formData.key}
            onChange={(e) =>
              setFormData({ ...formData, key: e.target.value.toUpperCase() })
            }
            maxLength={6}
          />
          <p className="text-xs text-muted-foreground">
            A short identifier for tasks (e.g., MKT-123)
          </p>
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor={isEdit ? 'edit-description' : 'description'}>
          Description
        </Label>
        <Textarea
          id={isEdit ? 'edit-description' : 'description'}
          placeholder="What is this project about?"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
        />
      </div>
      <div className="grid gap-2">
        <Label>Project Lead</Label>
        <Select
          value={formData.lead_id}
          onValueChange={(value) => setFormData({ ...formData, lead_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a project lead" />
          </SelectTrigger>
          <SelectContent>
            {workspaceMembers.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={member.avatar_url || ''} />
                    <AvatarFallback className="text-xs">
                      {getInitials(member.full_name || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  {member.full_name || member.email}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage and organize your team&apos;s projects
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderKanban className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 text-lg font-semibold">No projects yet</h3>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              Create your first project to start organizing your tasks
            </p>
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const projectTasks = tasks.filter(t => t.project_id === project.id)
            const completedCount = projectTasks.filter(t => t.status === 'done').length
            const progress = projectTasks.length > 0
              ? Math.round((completedCount / projectTasks.length) * 100)
              : 0
            const lead = workspaceMembers.find(m => m.id === project.lead_id)

            return (
              <Card key={project.id} className="group relative overflow-hidden">
                <div
                  className="absolute inset-x-0 top-0 h-1"
                  style={{ backgroundColor: project.color }}
                />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-white font-bold"
                        style={{ backgroundColor: project.color }}
                      >
                        {project.key.slice(0, 2)}
                      </div>
                      <div>
                        <CardTitle className="text-base">{project.name}</CardTitle>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {project.key}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenEditModal(project)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => openDeleteDialog(project)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  {project.description && (
                    <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  {lead && (
                    <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={lead.avatar_url || ''} />
                        <AvatarFallback className="text-xs">
                          {getInitials(lead.full_name || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <span>{lead.full_name || lead.email}</span>
                    </div>
                  )}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{projectTasks.length} tasks</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: project.color,
                        }}
                      />
                    </div>
                    <Link href={`/projects/${project.key}`}>
                      <Button variant="outline" className="w-full mt-2">
                        Open Project
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Project Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent>
          <form onSubmit={handleCreateProject}>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Add a new project to organize your tasks
              </DialogDescription>
            </DialogHeader>
            <ProjectFormContent />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCreateModalOpen(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Creating...' : 'Create Project'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Project Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <form onSubmit={handleUpdateProject}>
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>
                Update the project details
              </DialogDescription>
            </DialogHeader>
            <ProjectFormContent isEdit />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditModalOpen(false)
                  setSelectedProject(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedProject?.name}&quot;? This action
              cannot be undone. All tasks within this project will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className="bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
