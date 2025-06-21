"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Play, MoreVertical, Trash2, Music, Clock, Edit } from "lucide-react"
import type { Song, Playlist } from "@/types/music"
import { createPlaylist, deletePlaylist, removeSongFromPlaylist } from "@/lib/indexdb"
import { toast } from "@/hooks/use-toast"

interface PlaylistSectionProps {
  playlists: Playlist[]
  onPlaySong: (song: Song, playlist: Song[], index: number) => void
  onPlaylistUpdate: () => void
  userId: string
}

export function PlaylistSection({ playlists, onPlaySong, onPlaylistUpdate, userId }: PlaylistSectionProps) {
  const [newPlaylistName, setNewPlaylistName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [renamePlaylist, setRenamePlaylist] = useState<Playlist | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [isRenaming, setIsRenaming] = useState(false)

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return

    setIsCreating(true)
    try {
      await createPlaylist(userId, newPlaylistName, [])
      setNewPlaylistName("")
      setIsDialogOpen(false)
      onPlaylistUpdate()
      toast({
        title: "Playlist Created",
        description: `"${newPlaylistName}" playlist created successfully.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create playlist.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleRenamePlaylist = async () => {
    if (!renameValue.trim() || !renamePlaylist) return

    setIsRenaming(true)
    try {
      await renamePlaylist(userId, renamePlaylist.id, renameValue.trim())
      setRenamePlaylist(null)
      setRenameValue("")
      onPlaylistUpdate()
      toast({
        title: "Playlist Renamed",
        description: `Playlist renamed to "${renameValue}" successfully.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to rename playlist.",
        variant: "destructive",
      })
    } finally {
      setIsRenaming(false)
    }
  }

  const openRenameDialog = (playlist: Playlist) => {
    setRenamePlaylist(playlist)
    setRenameValue(playlist.name)
  }

  const handleDeletePlaylist = async (playlistId: string, playlistName: string) => {
    if (!confirm(`Are you sure you want to delete "${playlistName}"? This action cannot be undone.`)) {
      return
    }

    try {
      await deletePlaylist(userId, playlistId)
      onPlaylistUpdate()
      toast({
        title: "Playlist Deleted",
        description: `"${playlistName}" playlist deleted successfully.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete playlist.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveSong = async (playlistId: string, songId: string) => {
    try {
      await removeSongFromPlaylist(userId, playlistId, songId)
      onPlaylistUpdate()
      toast({
        title: "Song Removed",
        description: "Song removed from playlist successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove song from playlist.",
        variant: "destructive",
      })
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">My Playlists</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Playlist
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Playlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Playlist name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCreatePlaylist()}
                className="bg-gray-800 border-gray-600 text-white"
              />
              <Button
                onClick={handleCreatePlaylist}
                disabled={isCreating || !newPlaylistName.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isCreating ? "Creating..." : "Create Playlist"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {playlists.length === 0 ? (
        <div className="text-center py-12">
          <Music className="w-16 h-16 mx-auto mb-4 text-purple-400" />
          <h3 className="text-xl font-semibold text-white mb-2">No Playlists Yet</h3>
          <p className="text-purple-200">Create your first playlist to organize your favorite songs</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {playlists.map((playlist) => (
            <Card
              key={playlist.id}
              className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-colors"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white truncate">{playlist.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="text-white hover:bg-white/20">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setSelectedPlaylist(playlist)} className="cursor-pointer">
                        <Music className="w-4 h-4 mr-2" />
                        View Songs
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openRenameDialog(playlist)} className="cursor-pointer">
                        <Edit className="w-4 h-4 mr-2" />
                        Rename Playlist
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeletePlaylist(playlist.id, playlist.name)}
                        className="text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Playlist
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-purple-200 text-sm">
                  {playlist.songs.length} song{playlist.songs.length !== 1 ? "s" : ""}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                {playlist.songs.length > 0 ? (
                  <div className="space-y-2">
                    {playlist.songs.slice(0, 3).map((song) => (
                      <div key={song.id} className="flex items-center gap-2">
                        <img
                          src={song.image[0]?.url || "/placeholder.svg?height=30&width=30"}
                          alt={song.name}
                          className="w-8 h-8 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm truncate">{song.name}</p>
                          <p className="text-purple-200 text-xs truncate">{song.artists.primary[0]?.name}</p>
                        </div>
                      </div>
                    ))}
                    {playlist.songs.length > 3 && (
                      <p className="text-purple-200 text-xs">+{playlist.songs.length - 3} more songs</p>
                    )}
                    <Button
                      size="sm"
                      onClick={() => onPlaySong(playlist.songs[0], playlist.songs, 0)}
                      className="w-full mt-3 bg-purple-600 hover:bg-purple-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Play All
                    </Button>
                  </div>
                ) : (
                  <p className="text-purple-200 text-sm">No songs in this playlist</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Rename Playlist Dialog */}
      {renamePlaylist && (
        <Dialog open={!!renamePlaylist} onOpenChange={() => setRenamePlaylist(null)}>
          <DialogContent className="bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Rename Playlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="New playlist name"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleRenamePlaylist()}
                className="bg-gray-800 border-gray-600 text-white"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleRenamePlaylist}
                  disabled={isRenaming || !renameValue.trim() || renameValue === renamePlaylist.name}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {isRenaming ? "Renaming..." : "Rename"}
                </Button>
                <Button
                  onClick={() => setRenamePlaylist(null)}
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Playlist Detail Dialog */}
      {selectedPlaylist && (
        <Dialog open={!!selectedPlaylist} onOpenChange={() => setSelectedPlaylist(null)}>
          <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">{selectedPlaylist.name}</DialogTitle>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {selectedPlaylist.songs.length === 0 ? (
                <p className="text-purple-200 text-center py-8">No songs in this playlist</p>
              ) : (
                selectedPlaylist.songs.map((song, index) => (
                  <div key={song.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10">
                    <img
                      src={song.image[1]?.url || "/placeholder.svg?height=50&width=50"}
                      alt={song.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">{song.name}</h4>
                      <p className="text-purple-200 text-sm truncate">{song.artists.primary[0]?.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="bg-purple-600/50 text-white text-xs">
                          {song.language}
                        </Badge>
                        <span className="text-xs text-purple-200 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(song.duration)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onPlaySong(song, selectedPlaylist.songs, index)}
                        className="w-8 h-8 text-white hover:bg-white/20"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveSong(selectedPlaylist.id, song.id)}
                        className="w-8 h-8 text-red-400 hover:bg-red-400/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
