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
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { createClient } from '@/lib/supabase/client'
import { Comment, TaskPriority, TaskStatus } from '@/types'
import { TASK_PRIORITIES, TASK_STATUSES } from '@/lib/constants'
import { cn, formatRelativeDate, getInitials } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'

export function TaskDetailModal() {
  const {
    selectedTask,
    taskModalOpen,
    closeTaskModal,
    updateTask,
    user,
  } = useAppStore()

  const supabase = createClient()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loadingComment, setLoadingComment] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingDescription, setEditingDescription] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (selectedTask) {
      setTitle(selectedTask.title)
      setDescription(selectedTask.description || '')
      fetchComments()
    }
  }, [selectedTask])

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

    updateTask({ ...selectedTask, [field]: value })
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

    setLoadingComment(false)

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      })
      return
    }

    setComments([...comments, data as Comment])
    setNewComment('')
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
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="col-span-2 space-y-6">
              {/* Description */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Description
                </Label>
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
                <Label className="text-sm font-medium text-muted-foreground mb-4 block flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Comments ({comments.length})
                </Label>

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
                        <p className="text-sm">{comment.content}</p>
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
                      <Textarea
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
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
                <Label className="text-xs font-medium text-muted-foreground mb-2 block">
                  Status
                </Label>
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
                <Label className="text-xs font-medium text-muted-foreground mb-2 block">
                  Priority
                </Label>
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
                <Label className="text-xs font-medium text-muted-foreground mb-2 block">
                  Assignee
                </Label>
                {selectedTask.assignee ? (
                  <div className="flex items-center gap-2 p-2 rounded-md border">
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
              </div>

              {/* Due Date */}
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-2 block">
                  Due Date
                </Label>
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
