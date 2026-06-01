"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogOut, Trash2 } from "lucide-react"
import type { User as UserType } from "@/types/music"
import { deleteUser } from "@/lib/indexdb"
import { toast } from "@/hooks/use-toast"

interface UserProfileProps {
  user: UserType
  onLogout: () => void
}

export function UserProfile({ user, onLogout }: UserProfileProps) {
  const handleDeleteAccount = async () => {
    if (!confirm(`Delete account "${user.username}"? This removes all playlists and data.`)) return
    try {
      await deleteUser(user.id)
      onLogout()
      toast({ title: "Account Deleted", description: "Your account and all data have been deleted." })
    } catch {
      toast({ title: "Error", description: "Failed to delete account.", variant: "destructive" })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all hover:scale-105"
          style={{
            background: 'hsl(42 93% 58% / 0.12)',
            color: 'hsl(42 93% 58%)',
            border: '1px solid hsl(42 93% 58% / 0.2)',
          }}
        >
          {user.username.charAt(0).toUpperCase()}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-card border-border">
        <div className="px-2 py-2 text-xs text-muted-foreground border-b border-border mb-1">
          Signed in as <span className="font-semibold text-foreground">{user.username}</span>
        </div>
        <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-foreground">
          <LogOut className="w-3.5 h-3.5 mr-2" />
          Switch User
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDeleteAccount} className="cursor-pointer text-destructive focus:text-destructive">
          <Trash2 className="w-3.5 h-3.5 mr-2" />
          Delete Account
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
