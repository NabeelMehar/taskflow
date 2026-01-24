'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { CreateTaskModal } from '@/components/tasks/create-task-modal'
import { TaskDetailModal } from '@/components/tasks/task-detail-modal'
import { useAppStore } from '@/lib/store'
import { createClient } from '@/lib/supabase/client'
import { fetchNotifications, fetchNotificationSettings } from '@/lib/notifications'
import { Loader2 } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const supabase = createClient()
  const {
    setUser,
    setWorkspaces,
    setProjects,
    setTasks,
    setTeamMembers,
    setNotifications,
    setNotificationSettings,
    sidebarOpen,
  } = useAppStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeApp = async () => {
      // Check auth
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // Get or create user profile
      let { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profile) {
        // Create profile
        const { data: newProfile } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
            avatar_url: user.user_metadata?.avatar_url,
          })
          .select()
          .single()
        profile = newProfile
      }

      setUser(profile)

      // Load workspaces
      let { data: workspaces } = await supabase
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: false })

      // Auto-create default workspace for new users
      if (!workspaces || workspaces.length === 0) {
        const { data: newWorkspace, error: wsError } = await supabase
          .from('workspaces')
          .insert({
            name: 'My Workspace',
            slug: `workspace-${user.id.slice(0, 8)}`,
            owner_id: user.id,
          })
          .select()
          .single()

        if (newWorkspace && !wsError) {
          workspaces = [newWorkspace]
        }
      }

      if (workspaces && workspaces.length > 0) {
        setWorkspaces(workspaces)

        // Load team members for first workspace
        const { data: membersData } = await supabase
          .from('workspace_members')
          .select('user:users(*)')
          .eq('workspace_id', workspaces[0].id)

        if (membersData) {
          const members = membersData.map((m: any) => m.user).filter(Boolean)
          setTeamMembers(members)
        }

        // Load notifications
        const notifications = await fetchNotifications(supabase, user.id)
        setNotifications(notifications)

        // Load notification settings
        const notificationSettings = await fetchNotificationSettings(supabase, user.id)
        setNotificationSettings(notificationSettings)

        // Load projects for first workspace
        const { data: projects } = await supabase
          .from('projects')
          .select('*')
          .eq('workspace_id', workspaces[0].id)
          .order('created_at', { ascending: false })

        if (projects) {
          setProjects(projects)

          // Load tasks for all projects
          const projectIds = projects.map((p: { id: string }) => p.id)
          if (projectIds.length > 0) {
            const { data: tasks } = await supabase
              .from('tasks')
              .select(`
                *,
                project:projects(*),
                assignee:users!tasks_assignee_id_fkey(*),
                reporter:users!tasks_reporter_id_fkey(*),
                task_labels(label:labels(*))
              `)
              .in('project_id', projectIds)
              .order('order', { ascending: true })

            if (tasks) {
              // Transform task_labels to labels array
              const tasksWithLabels = tasks.map((task: any) => ({
                ...task,
                labels: task.task_labels?.map((tl: any) => tl.label).filter(Boolean) || [],
                task_labels: undefined, // Remove the raw junction data
              }))
              setTasks(tasksWithLabels)
            }
          }
        }
      }

      setLoading(false)
    }

    initializeApp()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: string, session: unknown) => {
        if (event === 'SIGNED_OUT') {
          router.push('/login')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router, setUser, setWorkspaces, setProjects, setTasks, setTeamMembers, setNotifications, setNotificationSettings])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      <main
        className={`pt-16 transition-all duration-300 ${
          sidebarOpen ? 'pl-64' : 'pl-16'
        }`}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
      <CreateTaskModal />
      <TaskDetailModal />
    </div>
  )
}
