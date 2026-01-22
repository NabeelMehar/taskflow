import Link from 'next/link'
import { ArrowRight, CheckCircle2, Zap, Users, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">T</span>
            </div>
            <span className="text-xl font-bold">TaskFlow</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started Free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm">
            <Zap className="h-4 w-4 text-primary" />
            <span>Now with AI-powered task suggestions</span>
          </div>
          <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Manage tasks with
            <span className="text-primary"> clarity</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            TaskFlow helps teams organize, track, and manage their work in one place. 
            Simple enough for small teams, powerful enough for enterprises.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Start for free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline">
                View Demo
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Image/Preview */}
        <div className="mt-16 overflow-hidden rounded-xl border bg-card shadow-2xl">
          <div className="border-b bg-muted/50 px-4 py-3">
            <div className="flex gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
          </div>
          <div className="p-4 sm:p-6">
            {/* Kanban Preview */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {['To Do', 'In Progress', 'In Review', 'Done'].map((column, i) => (
                <div key={column} className="rounded-lg bg-muted/50 p-3">
                  <div className="mb-3 flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${
                      i === 0 ? 'bg-gray-500' :
                      i === 1 ? 'bg-blue-500' :
                      i === 2 ? 'bg-purple-500' : 'bg-green-500'
                    }`} />
                    <span className="text-sm font-medium">{column}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                      {4 - i}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {Array.from({ length: Math.max(1, 4 - i) }).map((_, j) => (
                      <div key={j} className="rounded-md border bg-card p-3 shadow-sm">
                        <div className="mb-2 h-2 w-16 rounded bg-muted" />
                        <div className="h-2 w-full rounded bg-muted/50" />
                        <div className="mt-2 h-2 w-2/3 rounded bg-muted/50" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Everything you need to stay organized
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Powerful features to help your team collaborate and deliver projects on time.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: CheckCircle2,
                title: 'Task Management',
                description: 'Create, organize, and track tasks with ease. Set priorities, due dates, and assignees.',
              },
              {
                icon: Users,
                title: 'Team Collaboration',
                description: 'Work together in real-time. Comment on tasks, share files, and stay in sync.',
              },
              {
                icon: BarChart3,
                title: 'Progress Tracking',
                description: 'Visualize your workflow with Kanban boards. Track progress and identify bottlenecks.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl bg-primary px-6 py-16 text-center sm:px-12">
            <h2 className="mb-4 text-3xl font-bold text-primary-foreground sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-primary-foreground/80">
              Join thousands of teams already using TaskFlow to manage their projects.
            </p>
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="gap-2">
                Create free account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
                <span className="text-sm font-bold text-primary-foreground">T</span>
              </div>
              <span className="font-semibold">TaskFlow</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} TaskFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
