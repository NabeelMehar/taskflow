import { create } from 'zustand'
import { User, Workspace, Project, Task } from '@/types'

interface AppState {
  // User
  user: User | null
  setUser: (user: User | null) => void
  
  // Workspace
  currentWorkspace: Workspace | null
  workspaces: Workspace[]
  setCurrentWorkspace: (workspace: Workspace | null) => void
  setWorkspaces: (workspaces: Workspace[]) => void
  
  // Project
  currentProject: Project | null
  projects: Project[]
  setCurrentProject: (project: Project | null) => void
  setProjects: (projects: Project[]) => void
  
  // Tasks
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (task: Task) => void
  removeTask: (taskId: string) => void
  
  // UI State
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  
  // Task Modal
  selectedTask: Task | null
  taskModalOpen: boolean
  setSelectedTask: (task: Task | null) => void
  openTaskModal: (task: Task) => void
  closeTaskModal: () => void
  
  // Create Task Modal
  createTaskModalOpen: boolean
  setCreateTaskModalOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  // User
  user: null,
  setUser: (user) => set({ user }),
  
  // Workspace
  currentWorkspace: null,
  workspaces: [],
  setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
  setWorkspaces: (workspaces) => set({ workspaces }),
  
  // Project
  currentProject: null,
  projects: [],
  setCurrentProject: (project) => set({ currentProject: project }),
  setProjects: (projects) => set({ projects }),
  
  // Tasks
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (updatedTask) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      ),
      // Also update selectedTask if it's the same task
      selectedTask:
        state.selectedTask?.id === updatedTask.id
          ? updatedTask
          : state.selectedTask,
    })),
  removeTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
    })),
  
  // UI State
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  // Task Modal
  selectedTask: null,
  taskModalOpen: false,
  setSelectedTask: (task) => set({ selectedTask: task }),
  openTaskModal: (task) => set({ selectedTask: task, taskModalOpen: true }),
  closeTaskModal: () => set({ selectedTask: null, taskModalOpen: false }),
  
  // Create Task Modal
  createTaskModalOpen: false,
  setCreateTaskModalOpen: (open) => set({ createTaskModalOpen: open }),
}))
