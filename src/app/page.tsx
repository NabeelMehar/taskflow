import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  Zap,
  Users,
  BarChart3,
  Layout,
  Tag,
  Calendar,
  Shield,
  Sparkles,
  Github,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const features = [
    {
      icon: Layout,
      title: 'Kanban Boards',
      description: 'Visualize your workflow with drag-and-drop kanban boards. Move tasks between columns effortlessly.',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work together in real-time. Assign tasks, mention teammates, and keep everyone in sync.',
    },
    {
      icon: Tag,
      title: 'Labels & Filtering',
      description: 'Organize tasks with custom labels and colors. Filter and search to find exactly what you need.',
    },
    {
      icon: Calendar,
      title: 'Due Dates & Reminders',
      description: 'Never miss a deadline. Set due dates and get notified when tasks are coming up.',
    },
    {
      icon: BarChart3,
      title: 'Progress Tracking',
      description: 'Track project progress with visual indicators. See completion rates at a glance.',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is encrypted and secure. Row-level security ensures privacy for your team.',
    },
  ]

  const stats = [
    { value: '10K+', label: 'Active Users' },
    { value: '50K+', label: 'Tasks Created' },
    { value: '99.9%', label: 'Uptime' },
    { value: '4.9/5', label: 'User Rating' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">T</span>
            </div>
            <span className="text-xl font-bold">TaskFlow</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="https://github.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Github className="h-5 w-5" />
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-primary/5 px-4 py-1.5 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-primary font-medium">New: Dark mode & Labels support</span>
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
            Manage tasks with
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"> clarity</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            TaskFlow helps teams organize, track, and manage their work in one place.
            Simple enough for small teams, powerful enough for enterprises.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="gap-2 h-12 px-8">
                Start for free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-12 px-8">
                View Demo
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required. Free forever for small teams.
          </p>
        </div>

        {/* Hero Image/Preview */}
        <div className="mt-16 overflow-hidden rounded-xl border bg-card shadow-2xl ring-1 ring-border">
          <div className="border-b bg-muted/50 px-4 py-3">
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="rounded bg-muted px-3 py-1 text-xs text-muted-foreground">
                  taskflow.app/projects/DEMO
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6 bg-muted/20">
            {/* Kanban Preview */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
              {[
                { name: 'To Do', color: 'bg-gray-500', count: 4 },
                { name: 'In Progress', color: 'bg-blue-500', count: 3 },
                { name: 'In Review', color: 'bg-purple-500', count: 2 },
                { name: 'Done', color: 'bg-green-500', count: 5 },
              ].map((column) => (
                <div key={column.name} className="rounded-lg bg-background p-3 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${column.color}`} />
                    <span className="text-xs sm:text-sm font-medium">{column.name}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                      {column.count}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {Array.from({ length: Math.min(3, column.count) }).map((_, j) => (
                      <div key={j} className="rounded-md border bg-card p-2 sm:p-3 shadow-sm">
                        <div className="mb-2 h-2 w-12 sm:w-16 rounded bg-muted" />
                        <div className="h-2 w-full rounded bg-muted/50" />
                        <div className="mt-2 flex items-center justify-between">
                          <div className="h-2 w-1/3 rounded bg-muted/50" />
                          <div className="h-5 w-5 rounded-full bg-primary/20" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary sm:text-4xl">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-primary/5 px-4 py-1.5 text-sm text-primary">
              <Zap className="h-4 w-4" />
              <span className="font-medium">Features</span>
            </div>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Everything you need to stay organized
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Powerful features to help your team collaborate and deliver projects on time.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50"
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 transition-colors group-hover:bg-primary/20">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y bg-muted/30 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Get started in minutes
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Three simple steps to transform how your team works together.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Create your workspace',
                description: 'Sign up and create a workspace for your team. Invite members with just an email.',
              },
              {
                step: '02',
                title: 'Set up your projects',
                description: 'Create projects with custom colors and keys. Organize tasks the way you want.',
              },
              {
                step: '03',
                title: 'Start collaborating',
                description: 'Add tasks, assign teammates, and track progress. Ship faster together.',
              },
            ].map((item, index) => (
              <div key={item.step} className="relative">
                {index < 2 && (
                  <div className="absolute top-8 left-1/2 hidden w-full border-t-2 border-dashed border-muted-foreground/30 md:block" />
                )}
                <div className="relative flex flex-col items-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                    {item.step}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/80 px-6 py-16 text-center sm:px-12 lg:py-20">
            <h2 className="mb-4 text-3xl font-bold text-primary-foreground sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-primary-foreground/80">
              Join thousands of teams already using TaskFlow to manage their projects efficiently.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="gap-2 h-12 px-8">
                  Create free account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">T</span>
              </div>
              <span className="font-semibold">TaskFlow</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
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
