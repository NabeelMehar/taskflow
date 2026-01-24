'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
  User,
  Bell,
  Shield,
  Palette,
  LogOut,
  Save,
  Upload,
  Trash2,
  Sun,
  Moon,
  Monitor,
  Loader2,
  AlertTriangle
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from '@/components/ui/use-toast'
import { getInitials } from '@/lib/utils'
import { updateNotificationSettings } from '@/lib/notifications'

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { user, setUser, notificationSettings, setNotificationSettings } = useAppStore()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)

  // Notification settings
  const [savingSettings, setSavingSettings] = useState(false)

  type NotificationSettingKey = 'email_enabled' | 'task_assigned' | 'mentioned_in_comment' | 'comment_on_task' | 'team_invitation' | 'due_date_reminders'

  // Helper function to update notification settings
  const handleNotificationSettingChange = async (
    key: NotificationSettingKey,
    value: boolean
  ) => {
    if (!user?.id) return

    setSavingSettings(true)
    const updated = await updateNotificationSettings(supabase, user.id, { [key]: value })
    setSavingSettings(false)

    if (updated) {
      setNotificationSettings(updated)
    } else {
      toast({
        title: 'Error',
        description: 'Failed to update notification settings',
        variant: 'destructive',
      })
    }
  }

  const handleUpdateProfile = async () => {
    if (!user) return

    setLoading(true)

    const { error } = await supabase
      .from('users')
      .update({ full_name: fullName, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    setLoading(false)

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      })
      return
    }

    setUser({ ...user, full_name: fullName })
    toast({
      title: 'Profile updated',
      description: 'Your profile has been updated successfully',
    })
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        variant: 'destructive',
      })
      return
    }

    if (file.type === "image/heic") {
      toast({
        title: "Unsupported format",
        description: "Please upload JPG or PNG instead of HEIC",
        variant: "destructive",
      })
      return
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image must be less than 2MB',
        variant: 'destructive',
      })
      return
    }

    setUploadingAvatar(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', user.id)

      if (updateError) throw updateError

      setUser({ ...user, avatar_url: publicUrl })
      toast({
        title: 'Avatar updated',
        description: 'Your profile picture has been updated',
      })
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload avatar',
        variant: 'destructive',
      })
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return

    setDeleting(true)

    try {
      // Delete user data (cascade will handle related data)
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', user?.id)

      if (error) throw error

      // Sign out
      await supabase.auth.signOut()

      toast({
        title: 'Account deleted',
        description: 'Your account has been permanently deleted',
      })

      router.push('/login')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete account',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
      setDeleteModalOpen(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ]

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>Profile</CardTitle>
          </div>
          <CardDescription>
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.avatar_url || ''} />
              <AvatarFallback className="text-2xl">
                {getInitials(user?.full_name || 'U')}
              </AvatarFallback>
            </Avatar>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {uploadingAvatar ? 'Uploading...' : 'Change Avatar'}
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                JPG, GIF or PNG. Max size 2MB.
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>
          </div>

          <Button onClick={handleUpdateProfile} disabled={loading} className="gap-2">
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Appearance Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            <CardTitle>Appearance</CardTitle>
          </div>
          <CardDescription>
            Customize the look and feel of the app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Theme</Label>
            <div className="grid grid-cols-3 gap-4">
              {themeOptions.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                      theme === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-transparent bg-muted/50 hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>
            Configure how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email notifications for important updates
              </p>
            </div>
            <Switch
              checked={notificationSettings?.email_enabled ?? true}
              onCheckedChange={(checked) => handleNotificationSettingChange('email_enabled', checked)}
              disabled={savingSettings}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <Label className="text-muted-foreground">Notify me when:</Label>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Task assigned to me</p>
                <p className="text-xs text-muted-foreground">
                  When someone assigns a task to you
                </p>
              </div>
              <Switch
                checked={notificationSettings?.task_assigned ?? true}
                onCheckedChange={(checked) => handleNotificationSettingChange('task_assigned', checked)}
                disabled={savingSettings}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Mentioned in comments</p>
                <p className="text-xs text-muted-foreground">
                  When someone @mentions you in a comment
                </p>
              </div>
              <Switch
                checked={notificationSettings?.mentioned_in_comment ?? true}
                onCheckedChange={(checked) => handleNotificationSettingChange('mentioned_in_comment', checked)}
                disabled={savingSettings}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Task comments</p>
                <p className="text-xs text-muted-foreground">
                  When someone comments on your task
                </p>
              </div>
              <Switch
                checked={notificationSettings?.comment_on_task ?? true}
                onCheckedChange={(checked) => handleNotificationSettingChange('comment_on_task', checked)}
                disabled={savingSettings}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Due date reminders</p>
                <p className="text-xs text-muted-foreground">
                  Remind me before tasks are due
                </p>
              </div>
              <Switch
                checked={notificationSettings?.due_date_reminders ?? true}
                onCheckedChange={(checked) => handleNotificationSettingChange('due_date_reminders', checked)}
                disabled={savingSettings}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-500" />
            <CardTitle className="text-red-500">Danger Zone</CardTitle>
          </div>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Sign out</p>
              <p className="text-sm text-muted-foreground">
                Sign out of your account on this device
              </p>
            </div>
            <Button variant="outline" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setDeleteModalOpen(true)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <AlertDialogTitle>Delete Account</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="space-y-4">
              <p>
                This action cannot be undone. This will permanently delete your account
                and remove all your data from our servers, including:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>All your tasks and comments</li>
                <li>All your projects</li>
                <li>Your workspace membership</li>
                <li>Your profile information</li>
              </ul>
              <div className="space-y-2">
                <Label htmlFor="confirmDelete" className="text-foreground">
                  Type <span className="font-bold">DELETE</span> to confirm
                </Label>
                <Input
                  id="confirmDelete"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="border-red-200 focus-visible:ring-red-500"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmText('')}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'DELETE' || deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              {deleting ? 'Deleting...' : 'Delete Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
