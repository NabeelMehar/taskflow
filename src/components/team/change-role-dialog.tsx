'use client'

import { useState } from 'react'
import { Loader2, Shield, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { User, WorkspaceMember } from '@/types'

interface ChangeRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: User | null
  currentRole: WorkspaceMember['role']
  onConfirm: (newRole: WorkspaceMember['role']) => Promise<void>
}

export function ChangeRoleDialog({
  open,
  onOpenChange,
  member,
  currentRole,
  onConfirm,
}: ChangeRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<WorkspaceMember['role']>(currentRole)
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    if (selectedRole === currentRole) {
      onOpenChange(false)
      return
    }

    setIsLoading(true)
    try {
      await onConfirm(selectedRole)
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  if (!member) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Role</DialogTitle>
          <DialogDescription>
            Update the role for {member.full_name || member.email}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup
            value={selectedRole}
            onValueChange={(value) => setSelectedRole(value as WorkspaceMember['role'])}
          >
            <div className="flex items-start space-x-3 rounded-lg border p-4">
              <RadioGroupItem value="admin" id="admin" className="mt-1" />
              <Label htmlFor="admin" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Admin</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Can manage team members, projects, and team settings
                </p>
              </Label>
            </div>
            <div className="flex items-start space-x-3 rounded-lg border p-4">
              <RadioGroupItem value="member" id="member" className="mt-1" />
              <Label htmlFor="member" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Member</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Can view and edit tasks, but cannot manage team settings
                </p>
              </Label>
            </div>
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading || selectedRole === currentRole}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
