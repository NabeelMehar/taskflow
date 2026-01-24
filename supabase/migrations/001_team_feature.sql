-- Migration: Team Feature
-- Description: Adds tables for team invitations, comment mentions, notifications, and notification settings

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Team Invitations Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  invited_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for team_invitations
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON public.team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON public.team_invitations(token);
CREATE INDEX IF NOT EXISTS idx_team_invitations_workspace ON public.team_invitations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_status ON public.team_invitations(status) WHERE status = 'pending';

-- ============================================
-- 2. Comment Mentions Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.comment_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Indexes for comment_mentions
CREATE INDEX IF NOT EXISTS idx_comment_mentions_user ON public.comment_mentions(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_mentions_comment ON public.comment_mentions(comment_id);

-- ============================================
-- 3. Notifications Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'task_assigned',
    'mentioned_in_comment',
    'comment_on_task',
    'team_invitation',
    'invitation_accepted'
  )),
  title VARCHAR(255) NOT NULL,
  message TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  entity_type VARCHAR(50), -- 'task', 'comment', 'invitation', 'workspace'
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id) WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- ============================================
-- 4. User Notification Settings Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  task_assigned BOOLEAN NOT NULL DEFAULT TRUE,
  mentioned_in_comment BOOLEAN NOT NULL DEFAULT TRUE,
  comment_on_task BOOLEAN NOT NULL DEFAULT TRUE,
  team_invitation BOOLEAN NOT NULL DEFAULT TRUE,
  due_date_reminders BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Row Level Security Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_settings ENABLE ROW LEVEL SECURITY;

-- Team Invitations Policies
CREATE POLICY "Workspace admins can view invitations"
  ON public.team_invitations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = team_invitations.workspace_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Workspace admins can create invitations"
  ON public.team_invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = team_invitations.workspace_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Workspace admins can update invitations"
  ON public.team_invitations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = team_invitations.workspace_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Workspace admins can delete invitations"
  ON public.team_invitations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = team_invitations.workspace_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Anyone can view invitation by token"
  ON public.team_invitations FOR SELECT
  USING (true);

-- Comment Mentions Policies
CREATE POLICY "Anyone can view mentions"
  ON public.comment_mentions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create mentions"
  ON public.comment_mentions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authors can delete mentions"
  ON public.comment_mentions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.comments
      WHERE comments.id = comment_mentions.comment_id
      AND comments.author_id = auth.uid()
    )
  );

-- Notifications Policies
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- User Notification Settings Policies
CREATE POLICY "Users can view own settings"
  ON public.user_notification_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own settings"
  ON public.user_notification_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON public.user_notification_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- Triggers for updated_at
-- ============================================

-- Function for auto-updating updated_at (if not exists)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for team_invitations
DROP TRIGGER IF EXISTS set_team_invitations_updated_at ON public.team_invitations;
CREATE TRIGGER set_team_invitations_updated_at
  BEFORE UPDATE ON public.team_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for notifications
DROP TRIGGER IF EXISTS set_notifications_updated_at ON public.notifications;
CREATE TRIGGER set_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for user_notification_settings
DROP TRIGGER IF EXISTS set_user_notification_settings_updated_at ON public.user_notification_settings;
CREATE TRIGGER set_user_notification_settings_updated_at
  BEFORE UPDATE ON public.user_notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- Function to create default notification settings
-- ============================================
CREATE OR REPLACE FUNCTION public.create_default_notification_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_notification_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create notification settings for new users
DROP TRIGGER IF EXISTS on_user_created_notification_settings ON public.users;
CREATE TRIGGER on_user_created_notification_settings
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_notification_settings();
