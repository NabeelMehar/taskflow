-- TaskFlow Database Schema for Supabase
-- Run this SQL in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspaces table
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspace members table
CREATE TABLE IF NOT EXISTS public.workspace_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  key TEXT NOT NULL,
  description TEXT,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, key)
);

-- Task status enum type
DO $$ BEGIN
  CREATE TYPE task_status AS ENUM ('backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Task priority enum type
DO $$ BEGIN
  CREATE TYPE task_priority AS ENUM ('urgent', 'high', 'medium', 'low', 'none');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'todo',
  priority task_priority DEFAULT 'none',
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  assignee_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reporter_id UUID REFERENCES public.users(id) ON DELETE SET NULL NOT NULL,
  parent_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  "order" INTEGER DEFAULT 0,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Labels table
CREATE TABLE IF NOT EXISTS public.labels (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, name)
);

-- Task labels junction table
CREATE TABLE IF NOT EXISTS public.task_labels (
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  label_id UUID REFERENCES public.labels(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (task_id, label_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content TEXT NOT NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity log table
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON public.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_task_id ON public.comments(task_id);
CREATE INDEX IF NOT EXISTS idx_projects_workspace_id ON public.projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_entity ON public.activities(entity_type, entity_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: Users can read all users, update their own
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Workspaces: Members can view, owners can modify
CREATE POLICY "Workspace members can view workspace" ON public.workspaces FOR SELECT
  USING (
    owner_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = id AND user_id = auth.uid())
  );
CREATE POLICY "Users can create workspaces" ON public.workspaces FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update workspace" ON public.workspaces FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Owners can delete workspace" ON public.workspaces FOR DELETE USING (owner_id = auth.uid());

-- Workspace members
CREATE POLICY "Members can view workspace members" ON public.workspace_members FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.workspaces WHERE id = workspace_id AND (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.workspace_members wm WHERE wm.workspace_id = id AND wm.user_id = auth.uid()))));
CREATE POLICY "Owners can manage members" ON public.workspace_members FOR ALL
  USING (EXISTS (SELECT 1 FROM public.workspaces WHERE id = workspace_id AND owner_id = auth.uid()));

-- Projects: Workspace members can view and manage
CREATE POLICY "Workspace members can view projects" ON public.projects FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.workspaces w LEFT JOIN public.workspace_members wm ON w.id = wm.workspace_id WHERE w.id = workspace_id AND (w.owner_id = auth.uid() OR wm.user_id = auth.uid())));
CREATE POLICY "Workspace members can create projects" ON public.projects FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.workspaces w LEFT JOIN public.workspace_members wm ON w.id = wm.workspace_id WHERE w.id = workspace_id AND (w.owner_id = auth.uid() OR wm.user_id = auth.uid())));
CREATE POLICY "Workspace members can update projects" ON public.projects FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.workspaces w LEFT JOIN public.workspace_members wm ON w.id = wm.workspace_id WHERE w.id = workspace_id AND (w.owner_id = auth.uid() OR wm.user_id = auth.uid())));
CREATE POLICY "Workspace members can delete projects" ON public.projects FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.workspaces w LEFT JOIN public.workspace_members wm ON w.id = wm.workspace_id WHERE w.id = workspace_id AND (w.owner_id = auth.uid() OR wm.user_id = auth.uid())));

-- Tasks: Project members can manage
CREATE POLICY "Project members can view tasks" ON public.tasks FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.projects p JOIN public.workspaces w ON p.workspace_id = w.id LEFT JOIN public.workspace_members wm ON w.id = wm.workspace_id WHERE p.id = project_id AND (w.owner_id = auth.uid() OR wm.user_id = auth.uid())));
CREATE POLICY "Project members can create tasks" ON public.tasks FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects p JOIN public.workspaces w ON p.workspace_id = w.id LEFT JOIN public.workspace_members wm ON w.id = wm.workspace_id WHERE p.id = project_id AND (w.owner_id = auth.uid() OR wm.user_id = auth.uid())));
CREATE POLICY "Project members can update tasks" ON public.tasks FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.projects p JOIN public.workspaces w ON p.workspace_id = w.id LEFT JOIN public.workspace_members wm ON w.id = wm.workspace_id WHERE p.id = project_id AND (w.owner_id = auth.uid() OR wm.user_id = auth.uid())));
CREATE POLICY "Project members can delete tasks" ON public.tasks FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.projects p JOIN public.workspaces w ON p.workspace_id = w.id LEFT JOIN public.workspace_members wm ON w.id = wm.workspace_id WHERE p.id = project_id AND (w.owner_id = auth.uid() OR wm.user_id = auth.uid())));

-- Labels
CREATE POLICY "Project members can manage labels" ON public.labels FOR ALL
  USING (EXISTS (SELECT 1 FROM public.projects p JOIN public.workspaces w ON p.workspace_id = w.id LEFT JOIN public.workspace_members wm ON w.id = wm.workspace_id WHERE p.id = project_id AND (w.owner_id = auth.uid() OR wm.user_id = auth.uid())));

-- Task labels
CREATE POLICY "Project members can manage task labels" ON public.task_labels FOR ALL
  USING (EXISTS (SELECT 1 FROM public.tasks t JOIN public.projects p ON t.project_id = p.id JOIN public.workspaces w ON p.workspace_id = w.id LEFT JOIN public.workspace_members wm ON w.id = wm.workspace_id WHERE t.id = task_id AND (w.owner_id = auth.uid() OR wm.user_id = auth.uid())));

-- Comments
CREATE POLICY "Project members can view comments" ON public.comments FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.tasks t JOIN public.projects p ON t.project_id = p.id JOIN public.workspaces w ON p.workspace_id = w.id LEFT JOIN public.workspace_members wm ON w.id = wm.workspace_id WHERE t.id = task_id AND (w.owner_id = auth.uid() OR wm.user_id = auth.uid())));
CREATE POLICY "Project members can create comments" ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = author_id AND EXISTS (SELECT 1 FROM public.tasks t JOIN public.projects p ON t.project_id = p.id JOIN public.workspaces w ON p.workspace_id = w.id LEFT JOIN public.workspace_members wm ON w.id = wm.workspace_id WHERE t.id = task_id AND (w.owner_id = auth.uid() OR wm.user_id = auth.uid())));
CREATE POLICY "Authors can update comments" ON public.comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Authors can delete comments" ON public.comments FOR DELETE USING (auth.uid() = author_id);

-- Activities
CREATE POLICY "Project members can view activities" ON public.activities FOR SELECT USING (true);
CREATE POLICY "Users can create activities" ON public.activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to auto-create default workspace for new users
CREATE OR REPLACE FUNCTION public.create_default_workspace()
RETURNS TRIGGER AS $$
DECLARE
  workspace_id UUID;
BEGIN
  INSERT INTO public.workspaces (name, slug, description, owner_id)
  VALUES (
    COALESCE(NEW.full_name, 'My') || '''s Workspace',
    lower(replace(COALESCE(NEW.full_name, 'user-' || substr(NEW.id::text, 1, 8)), ' ', '-')),
    'Default workspace',
    NEW.id
  )
  RETURNING id INTO workspace_id;
  
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (workspace_id, NEW.id, 'owner');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto workspace creation
DROP TRIGGER IF EXISTS on_user_created ON public.users;
CREATE TRIGGER on_user_created
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.create_default_workspace();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
