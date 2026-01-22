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
