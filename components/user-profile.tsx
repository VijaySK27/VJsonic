"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { User, LogOut, Trash2 } from "lucide-react"
import type { User as UserType } from "@/types/music"
import { deleteUser } from "@/lib/indexdb"
import { toast } from "@/hooks/use-toast"

interface UserProfileProps {
  user: UserType
  onLogout: () => void
}

export function UserProfile({ user, onLogout }: UserProfileProps) {
  const handleDeleteAccount = async () => {
    if (
      confirm(
        `Are you sure you want to delete your account "${user.username}"? This will remove all your playlists and data.`,
      )
    ) {
      try {
        await deleteUser(user.id)
        onLogout()
        toast({
          title: "Account Deleted",
          description: "Your account and all data have been deleted.",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete account.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="w-12 h-12 rounded-full bg-white/20 text-white hover:bg-white/30">
          <User className="w-6 h-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5 text-sm font-medium">{user.username}</div>
        <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
          <LogOut className="w-4 h-4 mr-2" />
          Switch User
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDeleteAccount} className="cursor-pointer text-red-600">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Account
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
