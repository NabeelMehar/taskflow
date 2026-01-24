import { create } from 'zustand'
import { User, Workspace, Project, Task, Notification, TeamInvitation, UserNotificationSettings } from '@/types'

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

  // Team Members
  teamMembers: User[]
  setTeamMembers: (members: User[]) => void

  // Team Invitations
  pendingInvitations: TeamInvitation[]
  setPendingInvitations: (invitations: TeamInvitation[]) => void
  addInvitation: (invitation: TeamInvitation) => void
  removeInvitation: (id: string) => void
  updateInvitation: (invitation: TeamInvitation) => void

  // Notifications
  notifications: Notification[]
  unreadNotificationCount: number
  setNotifications: (notifications: Notification[]) => void
  addNotification: (notification: Notification) => void
  markNotificationAsRead: (id: string) => void
  markAllNotificationsAsRead: () => void
  removeNotification: (id: string) => void

  // Notification Settings
  notificationSettings: UserNotificationSettings | null
  setNotificationSettings: (settings: UserNotificationSettings | null) => void
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

  // Team Members
  teamMembers: [],
  setTeamMembers: (members) => set({ teamMembers: members }),

  // Team Invitations
  pendingInvitations: [],
  setPendingInvitations: (invitations) => set({ pendingInvitations: invitations }),
  addInvitation: (invitation) =>
    set((state) => ({
      pendingInvitations: [...state.pendingInvitations, invitation],
    })),
  removeInvitation: (id) =>
    set((state) => ({
      pendingInvitations: state.pendingInvitations.filter((inv) => inv.id !== id),
    })),
  updateInvitation: (updatedInvitation) =>
    set((state) => ({
      pendingInvitations: state.pendingInvitations.map((inv) =>
        inv.id === updatedInvitation.id ? updatedInvitation : inv
      ),
    })),

  // Notifications
  notifications: [],
  unreadNotificationCount: 0,
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadNotificationCount: notifications.filter((n) => !n.read).length,
    }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadNotificationCount: state.unreadNotificationCount + (notification.read ? 0 : 1),
    })),
  markNotificationAsRead: (id) =>
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id)
      const wasUnread = notification && !notification.read
      return {
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadNotificationCount: wasUnread
          ? state.unreadNotificationCount - 1
          : state.unreadNotificationCount,
      }
    }),
  markAllNotificationsAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadNotificationCount: 0,
    })),
  removeNotification: (id) =>
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id)
      const wasUnread = notification && !notification.read
      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadNotificationCount: wasUnread
          ? state.unreadNotificationCount - 1
          : state.unreadNotificationCount,
      }
    }),

  // Notification Settings
  notificationSettings: null,
  setNotificationSettings: (settings) => set({ notificationSettings: settings }),
}))
