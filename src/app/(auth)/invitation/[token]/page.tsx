'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, XCircle, Loader2, Users, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase/client'
import { notifyInvitationAccepted } from '@/lib/notifications'
import { TeamInvitation, User } from '@/types'

type InvitationState = 'loading' | 'valid' | 'expired' | 'invalid' | 'accepted' | 'error'

export default function InvitationPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const supabase = createClient()
  const token = params.token as string

  const [state, setState] = useState<InvitationState>('loading')
  const [invitation, setInvitation] = useState<TeamInvitation | null>(null)
  const [inviter, setInviter] = useState<User | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isAccepting, setIsAccepting] = useState(false)

  useEffect(() => {
    const loadInvitation = async () => {
      try {
        // Check if user is logged in
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (authUser) {
          // Get user profile
          const { data: userProfile } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single()

          setCurrentUser(userProfile)
        }

        // Fetch invitation by token
        const { data: invitationData, error } = await supabase
          .from('team_invitations')
          .select(`
            *,
            workspace:workspaces(*),
            inviter:users!team_invitations_invited_by_fkey(*)
          `)
          .eq('token', token)
          .single()

        if (error || !invitationData) {
          setState('invalid')
          return
        }

        setInvitation(invitationData)
        setInviter(invitationData.inviter)

        // Check if expired
        if (new Date(invitationData.expires_at) < new Date()) {
          setState('expired')
          return
        }

        // Check if already accepted
        if (invitationData.status === 'accepted') {
          setState('accepted')
          return
        }

        // Check if declined
        if (invitationData.status === 'declined') {
          setState('invalid')
          return
        }

        setState('valid')
      } catch (error) {
        console.error('Error loading invitation:', error)
        setState('error')
      }
    }

    if (token) {
      loadInvitation()
    }
  }, [token, supabase])

  const handleAccept = async () => {
    if (!invitation || !currentUser) {
      // Redirect to signup with return URL
      router.push(`/signup?redirect=/invitation/${token}`)
      return
    }

    setIsAccepting(true)
    try {
      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('workspace_members')
        .select('id')
        .eq('workspace_id', invitation.workspace_id)
        .eq('user_id', currentUser.id)
        .single()

      if (existingMember) {
        toast({
          title: 'Already a member',
          description: 'You are already a member of this team.',
        })
        router.push('/dashboard')
        return
      }

      // Add user to workspace
      const { error: memberError } = await supabase.from('workspace_members').insert({
        workspace_id: invitation.workspace_id,
        user_id: currentUser.id,
        role: invitation.role,
      })

      if (memberError) throw memberError

      // Update invitation status
      const { error: updateError } = await supabase
        .from('team_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id)

      if (updateError) throw updateError

      // Notify the inviter
      await notifyInvitationAccepted(
        supabase,
        invitation.invited_by,
        invitation.workspace_id,
        currentUser.full_name || currentUser.email
      )

      toast({
        title: 'Welcome to the team!',
        description: `You have joined ${invitation.workspace?.name || 'the team'}.`,
      })

      router.push('/dashboard')
    } catch (error) {
      console.error('Error accepting invitation:', error)
      toast({
        title: 'Failed to accept invitation',
        description: 'Please try again or contact the team owner.',
        variant: 'destructive',
      })
    } finally {
      setIsAccepting(false)
    }
  }

  const handleDecline = async () => {
    if (!invitation) return

    try {
      await supabase
        .from('team_invitations')
        .update({ status: 'declined' })
        .eq('id', invitation.id)

      toast({
        title: 'Invitation declined',
        description: 'You have declined the team invitation.',
      })

      router.push('/')
    } catch (error) {
      console.error('Error declining invitation:', error)
    }
  }

  if (state === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">Loading invitation...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (state === 'invalid') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <CardTitle className="mt-4">Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation link is invalid or has already been used.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild>
              <Link href="/">Go to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (state === 'expired') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
            <CardTitle className="mt-4">Invitation Expired</CardTitle>
            <CardDescription>
              This invitation has expired. Please ask the team owner to send a new
              invitation.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild>
              <Link href="/">Go to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (state === 'accepted') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
            <CardTitle className="mt-4">Already Accepted</CardTitle>
            <CardDescription>
              This invitation has already been accepted.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <CardTitle className="mt-4">Something went wrong</CardTitle>
            <CardDescription>
              Unable to load the invitation. Please try again later.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild>
              <Link href="/">Go to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="mt-4">Team Invitation</CardTitle>
          <CardDescription>
            {inviter?.full_name || 'Someone'} has invited you to join{' '}
            <span className="font-medium">
              {invitation?.workspace?.name || 'their team'}
            </span>{' '}
            as a <span className="font-medium">{invitation?.role}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!currentUser && (
            <div className="rounded-lg border bg-muted/50 p-4 text-center text-sm">
              <p className="text-muted-foreground">
                You need to sign in or create an account to accept this invitation.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleDecline}
            disabled={isAccepting}
          >
            Decline
          </Button>
          <Button className="flex-1" onClick={handleAccept} disabled={isAccepting}>
            {isAccepting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {currentUser ? 'Accept Invitation' : 'Sign in to Accept'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
