'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  Calendar,
  Flag,
  MessageSquare,
  Paperclip,
  User,
  X,
  Clock,
  Tag,
  Plus,
  Check,
  Loader2,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { createClient } from '@/lib/supabase/client'
import { Comment, TaskPriority, TaskStatus, User as UserType, Label } from '@/types'
import { TASK_PRIORITIES, TASK_STATUSES } from '@/lib/constants'
import { cn, formatRelativeDate, getInitials } from '@/lib/utils'
import { getMentionedUsers } from '@/lib/mentions'
import { notifyMentionedInComment, notifyCommentOnTask, notifyTaskAssigned } from '@/lib/notifications'
import { MentionInput, MentionText } from '@/components/comments'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label as FormLabel } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'

const LABEL_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280',
]

export function TaskDetailModal() {
  const {
    selectedTask,
    taskModalOpen,
    closeTaskModal,
    updateTask,
    user,
    workspaces,
  } = useAppStore()

  const supabase = createClient()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loadingComment, setLoadingComment] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingDescription, setEditingDescription] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [workspaceMembers, setWorkspaceMembers] = useState<UserType[]>([])
  const [labels, setLabels] = useState<Label[]>([])
  const [taskLabels, setTaskLabels] = useState<Label[]>([])
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0])
  const [creatingLabel, setCreatingLabel] = useState(false)
  const [labelPopoverOpen, setLabelPopoverOpen] = useState(false)
  const [assigneePopoverOpen, setAssigneePopoverOpen] = useState(false)

  useEffect(() => {
    if (selectedTask) {
      setTitle(selectedTask.title)
      setDescription(selectedTask.description || '')
      fetchComments()
      fetchLabels()
      fetchTaskLabels()
    }
  }, [selectedTask])

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
      const members = data.map((d: any) => d.user).filter(Boolean) as UserType[]
      setWorkspaceMembers(members)
    }
  }

  const fetchComments = async () => {
    if (!selectedTask) return

    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:users(*)
      `)
      .eq('task_id', selectedTask.id)
      .order('created_at', { ascending: true })

    if (!error && data) {
      setComments(data as Comment[])
    }
  }

  const fetchLabels = async () => {
    if (!selectedTask) return

    const { data, error } = await supabase
      .from('labels')
      .select('*')
      .eq('project_id', selectedTask.project_id)
      .order('name', { ascending: true })

    if (!error && data) {
      setLabels(data as Label[])
    }
  }

  const fetchTaskLabels = async () => {
    if (!selectedTask) return

    const { data, error } = await supabase
      .from('task_labels')
      .select('label:labels(*)')
      .eq('task_id', selectedTask.id)

    if (!error && data) {
      const taskLabelsList = data.map((d: any) => d.label).filter(Boolean) as Label[]
      setTaskLabels(taskLabelsList)
    }
  }

  const handleUpdateField = async (field: string, value: any) => {
    if (!selectedTask) return

    const { error } = await supabase
      .from('tasks')
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq('id', selectedTask.id)

    if (error) {
      toast({
        title: 'Error',
        description: `Failed to update ${field}`,
        variant: 'destructive',
      })
      return
    }

    // Update local state with assignee info if updating assignee
    if (field === 'assignee_id') {
      const assignee = workspaceMembers.find(m => m.id === value) || null
      updateTask({ ...selectedTask, [field]: value, assignee })

      // Notify the new assignee (if not self)
      if (value && value !== user?.id) {
        await notifyTaskAssigned(
          supabase,
          value,
          selectedTask.id,
          selectedTask.title,
          user?.full_name || user?.email || 'Someone'
        )
      }
    } else {
      updateTask({ ...selectedTask, [field]: value })
    }
  }

  const handleSaveTitle = async () => {
    if (title.trim() && title !== selectedTask?.title) {
      await handleUpdateField('title', title.trim())
    }
    setEditingTitle(false)
  }

  const handleSaveDescription = async () => {
    if (description !== selectedTask?.description) {
      await handleUpdateField('description', description.trim() || null)
    }
    setEditingDescription(false)
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedTask || !user) return

    setLoadingComment(true)

    const { data, error } = await supabase
      .from('comments')
      .insert({
        content: newComment.trim(),
        task_id: selectedTask.id,
        author_id: user.id,
      })
      .select(`
        *,
        author:users(*)
      `)
      .single()

    if (error) {
      setLoadingComment(false)
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      })
      return
    }

    // Handle @mentions
    const mentionedUsers = getMentionedUsers(newComment, workspaceMembers)
    for (const mentionedUser of mentionedUsers) {
      // Don't notify self
      if (mentionedUser.id === user.id) continue

      // Store mention in database
      await supabase.from('comment_mentions').insert({
        comment_id: data.id,
        user_id: mentionedUser.id,
      })

      // Create notification for mentioned user
      await notifyMentionedInComment(
        supabase,
        mentionedUser.id,
        data.id,
        selectedTask.id,
        user.full_name || user.email
      )
    }

    // Notify task reporter/assignee about new comment (if not the commenter)
    if (selectedTask.reporter_id && selectedTask.reporter_id !== user.id) {
      // Check if reporter wasn't already mentioned
      const reporterWasMentioned = mentionedUsers.some(u => u.id === selectedTask.reporter_id)
      if (!reporterWasMentioned) {
        await notifyCommentOnTask(
          supabase,
          selectedTask.reporter_id,
          selectedTask.id,
          selectedTask.title,
          user.full_name || user.email
        )
      }
    }

    setLoadingComment(false)
    setComments([...comments, data as Comment])
    setNewComment('')
  }

  const handleCreateLabel = async () => {
    if (!newLabelName.trim() || !selectedTask) return

    setCreatingLabel(true)

    const { data, error } = await supabase
      .from('labels')
      .insert({
        name: newLabelName.trim(),
        color: newLabelColor,
        project_id: selectedTask.project_id,
      })
      .select()
      .single()

    setCreatingLabel(false)

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to create label',
        variant: 'destructive',
      })
      return
    }

    setLabels([...labels, data as Label])
    setNewLabelName('')
    toast({
      title: 'Label created',
      description: 'The label has been created successfully',
    })
  }

  const handleToggleLabel = async (label: Label) => {
    if (!selectedTask) return

    const isAttached = taskLabels.some(l => l.id === label.id)

    if (isAttached) {
      // Remove label
      const { error } = await supabase
        .from('task_labels')
        .delete()
        .eq('task_id', selectedTask.id)
        .eq('label_id', label.id)

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to remove label',
          variant: 'destructive',
        })
        return
      }

      const newLabels = taskLabels.filter(l => l.id !== label.id)
      setTaskLabels(newLabels)
      // Update task in store so card updates too
      updateTask({ ...selectedTask, labels: newLabels })
    } else {
      // Add label
      const { error } = await supabase
        .from('task_labels')
        .insert({
          task_id: selectedTask.id,
          label_id: label.id,
        })

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to add label',
          variant: 'destructive',
        })
        return
      }

      const newLabels = [...taskLabels, label]
      setTaskLabels(newLabels)
      // Update task in store so card updates too
      updateTask({ ...selectedTask, labels: newLabels })
    }
  }

  const handleAssigneeChange = async (memberId: string | null) => {
    await handleUpdateField('assignee_id', memberId)
    setAssigneePopoverOpen(false)
  }

  if (!selectedTask) return null

  return (
    <Dialog open={taskModalOpen} onOpenChange={closeTaskModal}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span className="font-medium">
              {selectedTask.project?.key}-{selectedTask.id.slice(0, 4).toUpperCase()}
            </span>
          </div>

          {editingTitle ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
              className="text-xl font-semibold"
              autoFocus
            />
          ) : (
            <DialogTitle
              className="text-xl cursor-pointer hover:bg-muted/50 rounded px-2 py-1 -mx-2"
              onClick={() => setEditingTitle(true)}
            >
              {selectedTask.title}
            </DialogTitle>
          )}

          {/* Labels */}
          {taskLabels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {taskLabels.map((label) => (
                <Badge
                  key={label.id}
                  variant="secondary"
                  className="text-xs"
                  style={{ backgroundColor: `${label.color}20`, color: label.color }}
                >
                  {label.name}
                </Badge>
              ))}
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="col-span-2 space-y-6">
              {/* Description */}
              <div>
                <FormLabel className="text-sm font-medium text-muted-foreground mb-2 block">
                  Description
                </FormLabel>
                {editingDescription ? (
                  <div className="space-y-2">
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      placeholder="Add a description..."
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveDescription}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setDescription(selectedTask.description || '')
                          setEditingDescription(false)
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="min-h-[60px] rounded-md border p-3 text-sm cursor-pointer hover:bg-muted/50"
                    onClick={() => setEditingDescription(true)}
                  >
                    {selectedTask.description || (
                      <span className="text-muted-foreground">
                        Click to add a description...
                      </span>
                    )}
                  </div>
                )}
              </div>

              <Separator />

              {/* Comments */}
              <div>
                <FormLabel className="text-sm font-medium text-muted-foreground mb-4 block flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Comments ({comments.length})
                </FormLabel>

                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.author?.avatar_url || ''} />
                        <AvatarFallback className="text-xs">
                          {getInitials(comment.author?.full_name || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">
                            {comment.author?.full_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeDate(comment.created_at)}
                          </span>
                        </div>
                        <MentionText text={comment.content} className="text-sm" />
                      </div>
                    </div>
                  ))}

                  {/* Add Comment */}
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar_url || ''} />
                      <AvatarFallback className="text-xs">
                        {getInitials(user?.full_name || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <MentionInput
                        value={newComment}
                        onChange={setNewComment}
                        placeholder="Write a comment... Use @ to mention team members"
                        teamMembers={workspaceMembers}
                        rows={2}
                      />
                      <Button
                        size="sm"
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || loadingComment}
                      >
                        {loadingComment ? 'Posting...' : 'Comment'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Status */}
              <div>
                <FormLabel className="text-xs font-medium text-muted-foreground mb-2 block">
                  Status
                </FormLabel>
                <Select
                  value={selectedTask.status}
                  onValueChange={(value) => handleUpdateField('status', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
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
              </div>

              {/* Priority */}
              <div>
                <FormLabel className="text-xs font-medium text-muted-foreground mb-2 block">
                  Priority
                </FormLabel>
                <Select
                  value={selectedTask.priority}
                  onValueChange={(value) => handleUpdateField('priority', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
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
              </div>

              {/* Assignee */}
              <div>
                <FormLabel className="text-xs font-medium text-muted-foreground mb-2 block">
                  Assignee
                </FormLabel>
                <Popover open={assigneePopoverOpen} onOpenChange={setAssigneePopoverOpen}>
                  <PopoverTrigger asChild>
                    {selectedTask.assignee ? (
                      <div className="flex items-center gap-2 p-2 rounded-md border cursor-pointer hover:bg-muted/50">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={selectedTask.assignee.avatar_url || ''} />
                          <AvatarFallback className="text-xs">
                            {getInitials(selectedTask.assignee.full_name || 'U')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{selectedTask.assignee.full_name}</span>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <User className="h-4 w-4 mr-2" />
                        Assign
                      </Button>
                    )}
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-2" align="start">
                    <div className="space-y-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-muted-foreground"
                        onClick={() => handleAssigneeChange(null)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Unassigned
                      </Button>
                      <Separator className="my-2" />
                      {workspaceMembers.map((member) => (
                        <Button
                          key={member.id}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => handleAssigneeChange(member.id)}
                        >
                          <Avatar className="h-5 w-5 mr-2">
                            <AvatarImage src={member.avatar_url || ''} />
                            <AvatarFallback className="text-xs">
                              {getInitials(member.full_name || 'U')}
                            </AvatarFallback>
                          </Avatar>
                          {member.full_name || member.email}
                          {selectedTask.assignee_id === member.id && (
                            <Check className="h-4 w-4 ml-auto" />
                          )}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Labels */}
              <div>
                <FormLabel className="text-xs font-medium text-muted-foreground mb-2 block">
                  Labels
                </FormLabel>
                <Popover open={labelPopoverOpen} onOpenChange={setLabelPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Tag className="h-4 w-4 mr-2" />
                      {taskLabels.length > 0 ? `${taskLabels.length} labels` : 'Add labels'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-3" align="start">
                    <div className="space-y-3">
                      <div className="font-medium text-sm">Labels</div>

                      {/* Existing Labels */}
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {labels.map((label) => {
                          const isSelected = taskLabels.some(l => l.id === label.id)
                          return (
                            <button
                              key={label.id}
                              onClick={() => handleToggleLabel(label)}
                              className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 text-left"
                            >
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: label.color }}
                              />
                              <span className="flex-1 text-sm">{label.name}</span>
                              {isSelected && <Check className="h-4 w-4 text-primary" />}
                            </button>
                          )
                        })}
                        {labels.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-2">
                            No labels yet
                          </p>
                        )}
                      </div>

                      <Separator />

                      {/* Create New Label */}
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-muted-foreground">
                          Create new label
                        </div>
                        <Input
                          placeholder="Label name"
                          value={newLabelName}
                          onChange={(e) => setNewLabelName(e.target.value)}
                          className="h-8"
                        />
                        <div className="flex gap-1.5">
                          {LABEL_COLORS.map((color) => (
                            <button
                              key={color}
                              onClick={() => setNewLabelColor(color)}
                              className={`h-5 w-5 rounded-full transition-all ${
                                newLabelColor === color
                                  ? 'ring-2 ring-offset-1 ring-primary'
                                  : ''
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={handleCreateLabel}
                          disabled={!newLabelName.trim() || creatingLabel}
                        >
                          {creatingLabel ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Plus className="h-4 w-4 mr-2" />
                          )}
                          Create Label
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Due Date */}
              <div>
                <FormLabel className="text-xs font-medium text-muted-foreground mb-2 block">
                  Due Date
                </FormLabel>
                <Input
                  type="date"
                  value={selectedTask.due_date?.split('T')[0] || ''}
                  onChange={(e) => handleUpdateField('due_date', e.target.value || null)}
                />
              </div>

              <Separator />

              {/* Meta Info */}
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Created {formatRelativeDate(selectedTask.created_at)}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Updated {formatRelativeDate(selectedTask.updated_at)}
                </div>
                {selectedTask.reporter && (
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    Reporter: {selectedTask.reporter.full_name}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
