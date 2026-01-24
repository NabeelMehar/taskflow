import { useAppStore } from '@/lib/store'
import { User, Workspace, Project, Task } from '@/types'

// Reset store before each test
beforeEach(() => {
  const store = useAppStore.getState()
  store.setUser(null)
  store.setWorkspaces([])
  store.setCurrentWorkspace(null)
  store.setProjects([])
  store.setCurrentProject(null)
  store.setTasks([])
  store.closeTaskModal()
  store.setCreateTaskModalOpen(false)
  store.setSidebarOpen(true)
})

const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  full_name: 'Test User',
  avatar_url: null,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
}

const mockWorkspace: Workspace = {
  id: 'workspace-1',
  name: 'Test Workspace',
  slug: 'test-workspace',
  owner_id: 'user-1',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
}

const mockProject: Project = {
  id: 'project-1',
  name: 'Test Project',
  key: 'TP',
  description: 'Test description',
  color: '#3b82f6',
  workspace_id: 'workspace-1',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
}

const mockTask: Task = {
  id: 'task-1',
  title: 'Test Task',
  description: 'Test description',
  status: 'todo',
  priority: 'medium',
  project_id: 'project-1',
  assignee_id: 'user-1',
  reporter_id: 'user-1',
  due_date: null,
  order: 0,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
}

describe('User state', () => {
  it('should set user', () => {
    const { setUser } = useAppStore.getState()
    setUser(mockUser)
    expect(useAppStore.getState().user).toEqual(mockUser)
  })

  it('should clear user', () => {
    const { setUser } = useAppStore.getState()
    setUser(mockUser)
    setUser(null)
    expect(useAppStore.getState().user).toBeNull()
  })
})

describe('Workspace state', () => {
  it('should set current workspace', () => {
    const { setCurrentWorkspace } = useAppStore.getState()
    setCurrentWorkspace(mockWorkspace)
    expect(useAppStore.getState().currentWorkspace).toEqual(mockWorkspace)
  })

  it('should set workspaces', () => {
    const { setWorkspaces } = useAppStore.getState()
    const workspaces = [mockWorkspace, { ...mockWorkspace, id: 'workspace-2' }]
    setWorkspaces(workspaces)
    expect(useAppStore.getState().workspaces).toEqual(workspaces)
    expect(useAppStore.getState().workspaces).toHaveLength(2)
  })

  it('should clear current workspace', () => {
    const { setCurrentWorkspace } = useAppStore.getState()
    setCurrentWorkspace(mockWorkspace)
    setCurrentWorkspace(null)
    expect(useAppStore.getState().currentWorkspace).toBeNull()
  })
})

describe('Project state', () => {
  it('should set current project', () => {
    const { setCurrentProject } = useAppStore.getState()
    setCurrentProject(mockProject)
    expect(useAppStore.getState().currentProject).toEqual(mockProject)
  })

  it('should set projects', () => {
    const { setProjects } = useAppStore.getState()
    const projects = [mockProject, { ...mockProject, id: 'project-2' }]
    setProjects(projects)
    expect(useAppStore.getState().projects).toEqual(projects)
    expect(useAppStore.getState().projects).toHaveLength(2)
  })

  it('should clear current project', () => {
    const { setCurrentProject } = useAppStore.getState()
    setCurrentProject(mockProject)
    setCurrentProject(null)
    expect(useAppStore.getState().currentProject).toBeNull()
  })
})

describe('Tasks state', () => {
  it('should set tasks', () => {
    const { setTasks } = useAppStore.getState()
    const tasks = [mockTask, { ...mockTask, id: 'task-2' }]
    setTasks(tasks)
    expect(useAppStore.getState().tasks).toEqual(tasks)
    expect(useAppStore.getState().tasks).toHaveLength(2)
  })

  it('should add task', () => {
    const { setTasks, addTask } = useAppStore.getState()
    setTasks([mockTask])
    const newTask = { ...mockTask, id: 'task-2', title: 'New Task' }
    addTask(newTask)
    expect(useAppStore.getState().tasks).toHaveLength(2)
    expect(useAppStore.getState().tasks[1]).toEqual(newTask)
  })

  it('should update task', () => {
    const { setTasks, updateTask } = useAppStore.getState()
    setTasks([mockTask])
    const updatedTask = { ...mockTask, title: 'Updated Task' }
    updateTask(updatedTask)
    expect(useAppStore.getState().tasks[0].title).toBe('Updated Task')
  })

  it('should update selectedTask when updating the same task', () => {
    const { setTasks, openTaskModal, updateTask } = useAppStore.getState()
    setTasks([mockTask])
    openTaskModal(mockTask)

    const updatedTask = { ...mockTask, title: 'Updated Task', status: 'in_progress' as const }
    updateTask(updatedTask)

    expect(useAppStore.getState().selectedTask?.title).toBe('Updated Task')
    expect(useAppStore.getState().selectedTask?.status).toBe('in_progress')
  })

  it('should not update selectedTask when updating a different task', () => {
    const { setTasks, openTaskModal, updateTask } = useAppStore.getState()
    const task2 = { ...mockTask, id: 'task-2', title: 'Task 2' }
    setTasks([mockTask, task2])
    openTaskModal(mockTask)

    const updatedTask2 = { ...task2, title: 'Updated Task 2' }
    updateTask(updatedTask2)

    expect(useAppStore.getState().selectedTask?.title).toBe('Test Task')
  })

  it('should remove task', () => {
    const { setTasks, removeTask } = useAppStore.getState()
    setTasks([mockTask, { ...mockTask, id: 'task-2' }])
    removeTask('task-1')
    expect(useAppStore.getState().tasks).toHaveLength(1)
    expect(useAppStore.getState().tasks[0].id).toBe('task-2')
  })

  it('should not affect other tasks when removing', () => {
    const { setTasks, removeTask } = useAppStore.getState()
    const task2 = { ...mockTask, id: 'task-2', title: 'Task 2' }
    setTasks([mockTask, task2])
    removeTask('task-1')
    expect(useAppStore.getState().tasks[0]).toEqual(task2)
  })
})

describe('Sidebar state', () => {
  it('should start with sidebar open', () => {
    expect(useAppStore.getState().sidebarOpen).toBe(true)
  })

  it('should toggle sidebar', () => {
    const { toggleSidebar } = useAppStore.getState()
    toggleSidebar()
    expect(useAppStore.getState().sidebarOpen).toBe(false)
    toggleSidebar()
    expect(useAppStore.getState().sidebarOpen).toBe(true)
  })

  it('should set sidebar open state directly', () => {
    const { setSidebarOpen } = useAppStore.getState()
    setSidebarOpen(false)
    expect(useAppStore.getState().sidebarOpen).toBe(false)
    setSidebarOpen(true)
    expect(useAppStore.getState().sidebarOpen).toBe(true)
  })
})

describe('Task Modal state', () => {
  it('should start with modal closed', () => {
    expect(useAppStore.getState().taskModalOpen).toBe(false)
    expect(useAppStore.getState().selectedTask).toBeNull()
  })

  it('should open task modal with task', () => {
    const { openTaskModal } = useAppStore.getState()
    openTaskModal(mockTask)
    expect(useAppStore.getState().taskModalOpen).toBe(true)
    expect(useAppStore.getState().selectedTask).toEqual(mockTask)
  })

  it('should close task modal and clear selected task', () => {
    const { openTaskModal, closeTaskModal } = useAppStore.getState()
    openTaskModal(mockTask)
    closeTaskModal()
    expect(useAppStore.getState().taskModalOpen).toBe(false)
    expect(useAppStore.getState().selectedTask).toBeNull()
  })

  it('should set selected task directly', () => {
    const { setSelectedTask } = useAppStore.getState()
    setSelectedTask(mockTask)
    expect(useAppStore.getState().selectedTask).toEqual(mockTask)
  })

  it('should clear selected task', () => {
    const { setSelectedTask } = useAppStore.getState()
    setSelectedTask(mockTask)
    setSelectedTask(null)
    expect(useAppStore.getState().selectedTask).toBeNull()
  })
})

describe('Create Task Modal state', () => {
  it('should start with create modal closed', () => {
    expect(useAppStore.getState().createTaskModalOpen).toBe(false)
  })

  it('should open create task modal', () => {
    const { setCreateTaskModalOpen } = useAppStore.getState()
    setCreateTaskModalOpen(true)
    expect(useAppStore.getState().createTaskModalOpen).toBe(true)
  })

  it('should close create task modal', () => {
    const { setCreateTaskModalOpen } = useAppStore.getState()
    setCreateTaskModalOpen(true)
    setCreateTaskModalOpen(false)
    expect(useAppStore.getState().createTaskModalOpen).toBe(false)
  })
})

describe('Store integration', () => {
  it('should maintain independent state between different concerns', () => {
    const store = useAppStore.getState()

    store.setUser(mockUser)
    store.setCurrentWorkspace(mockWorkspace)
    store.setCurrentProject(mockProject)
    store.setTasks([mockTask])
    store.toggleSidebar()
    store.openTaskModal(mockTask)

    const state = useAppStore.getState()

    expect(state.user).toEqual(mockUser)
    expect(state.currentWorkspace).toEqual(mockWorkspace)
    expect(state.currentProject).toEqual(mockProject)
    expect(state.tasks).toHaveLength(1)
    expect(state.sidebarOpen).toBe(false)
    expect(state.taskModalOpen).toBe(true)
    expect(state.selectedTask).toEqual(mockTask)
  })

  it('should handle multiple task updates', () => {
    const { setTasks, updateTask } = useAppStore.getState()
    const tasks = [
      mockTask,
      { ...mockTask, id: 'task-2', title: 'Task 2' },
      { ...mockTask, id: 'task-3', title: 'Task 3' },
    ]
    setTasks(tasks)

    updateTask({ ...tasks[0], status: 'done' })
    updateTask({ ...tasks[1], priority: 'high' })
    updateTask({ ...tasks[2], title: 'Updated Task 3' })

    const state = useAppStore.getState()
    expect(state.tasks[0].status).toBe('done')
    expect(state.tasks[1].priority).toBe('high')
    expect(state.tasks[2].title).toBe('Updated Task 3')
  })
})
