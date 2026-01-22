'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { CreateTaskModal } from '@/components/tasks/create-task-modal'
import { TaskDetailModal } from '@/components/tasks/task-detail-modal'
import { useAppStore } from '@/lib/store'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const supabase = createClient()
  const { setUser, setWorkspaces, setProjects, setTasks, sidebarOpen } = useAppStore()
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
      const { data: workspaces } = await supabase
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: false })

      if (workspaces && workspaces.length > 0) {
        setWorkspaces(workspaces)

        // Load projects for first workspace
        const { data: projects } = await supabase
          .from('projects')
          .select('*')
          .eq('workspace_id', workspaces[0].id)
          .order('created_at', { ascending: false })

        if (projects) {
          setProjects(projects)

          // Load tasks for all projects
          const projectIds = projects.map(p => p.id)
          if (projectIds.length > 0) {
            const { data: tasks } = await supabase
              .from('tasks')
              .select(`
                *,
                project:projects(*),
                assignee:users!tasks_assignee_id_fkey(*),
                reporter:users!tasks_reporter_id_fkey(*)
              `)
              .in('project_id', projectIds)
              .order('order', { ascending: true })

            if (tasks) {
              setTasks(tasks)
            }
          }
        }
      }

      setLoading(false)
    }

    initializeApp()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          router.push('/login')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router, setUser, setWorkspaces, setProjects, setTasks])

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
