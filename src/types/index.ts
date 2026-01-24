// Database Types
export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Workspace {
  id: string
  name: string
  slug: string
  description: string | null
  owner_id: string
  created_at: string
  updated_at: string
}

export interface WorkspaceMember {
  id: string
  workspace_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  created_at: string
}

export interface Project {
  id: string
  name: string
  key: string
  description: string | null
  workspace_id: string
  lead_id: string | null
  color: string
  created_at: string
  updated_at: string
}

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done' | 'cancelled'
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low' | 'none'

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  project_id: string
  assignee_id: string | null
  reporter_id: string
  parent_id: string | null
  order: number
  due_date: string | null
  created_at: string
  updated_at: string
  // Joined fields
  assignee?: User | null
  reporter?: User
  project?: Project
  labels?: Label[]
  comments_count?: number
  subtasks_count?: number
}

export interface Label {
  id: string
  name: string
  color: string
  project_id: string
  created_at: string
}

export interface TaskLabel {
  task_id: string
  label_id: string
}

export interface Comment {
  id: string
  content: string
  task_id: string
  author_id: string
  created_at: string
  updated_at: string
  // Joined fields
  author?: User
  mentions?: CommentMention[]
}

// Team Invitation
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired'
export type InvitationRole = 'admin' | 'member'

export interface TeamInvitation {
  id: string
  workspace_id: string
  email: string
  role: InvitationRole
  invited_by: string
  token: string
  status: InvitationStatus
  expires_at: string
  created_at: string
  updated_at: string
  // Joined fields
  inviter?: User
  workspace?: Workspace
}

// Comment Mention
export interface CommentMention {
  id: string
  comment_id: string
  user_id: string
  created_at: string
  // Joined fields
  user?: User
}

// Notification
export type NotificationType =
  | 'task_assigned'
  | 'mentioned_in_comment'
  | 'comment_on_task'
  | 'team_invitation'
  | 'invitation_accepted'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string | null
  read: boolean
  entity_type: 'task' | 'comment' | 'invitation' | 'workspace' | null
  entity_id: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

// User Notification Settings
export interface UserNotificationSettings {
  id: string
  user_id: string
  email_enabled: boolean
  task_assigned: boolean
  mentioned_in_comment: boolean
  comment_on_task: boolean
  team_invitation: boolean
  due_date_reminders: boolean
  created_at: string
  updated_at: string
}

// Create Notification Input
export interface CreateNotificationInput {
  user_id: string
  type: NotificationType
  title: string
  message?: string
  entity_type?: 'task' | 'comment' | 'invitation' | 'workspace'
  entity_id?: string
  metadata?: Record<string, any>
}

// Create Invitation Input
export interface CreateInvitationInput {
  workspace_id: string
  email: string
  role?: InvitationRole
}

export interface Activity {
  id: string
  action: string
  entity_type: 'task' | 'project' | 'comment'
  entity_id: string
  user_id: string
  metadata: Record<string, any>
  created_at: string
  // Joined fields
  user?: User
}

// UI Types
export interface Column {
  id: TaskStatus
  title: string
  color: string
}

export interface KanbanState {
  columns: Column[]
  tasks: Record<TaskStatus, Task[]>
}

// Form Types
export interface CreateTaskInput {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  project_id: string
  assignee_id?: string
  due_date?: string
  labels?: string[]
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  id: string
}

export interface CreateProjectInput {
  name: string
  key: string
  description?: string
  workspace_id: string
  color?: string
}

export interface CreateWorkspaceInput {
  name: string
  slug: string
  description?: string
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}
