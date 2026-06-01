"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Play, MoreVertical, Trash2, Music, Clock, Edit } from "lucide-react"
import type { Song, Playlist } from "@/types/music"
import { createPlaylist, deletePlaylist, removeSongFromPlaylist, renamePlaylist as doRenamePlaylist } from "@/lib/indexdb"
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
      toast({ title: "Playlist Created", description: `"${newPlaylistName}" created successfully.` })
    } catch {
      toast({ title: "Error", description: "Failed to create playlist.", variant: "destructive" })
    } finally {
      setIsCreating(false)
    }
  }

  const handleRenamePlaylist = async () => {
    if (!renameValue.trim() || !renamePlaylist) return
    setIsRenaming(true)
    try {
      await doRenamePlaylist(userId, renamePlaylist.id, renameValue.trim())
      setRenamePlaylist(null)
      setRenameValue("")
      onPlaylistUpdate()
      toast({ title: "Playlist Renamed", description: `Renamed to "${renameValue}".` })
    } catch {
      toast({ title: "Error", description: "Failed to rename playlist.", variant: "destructive" })
    } finally {
      setIsRenaming(false)
    }
  }

  const openRenameDialog = (playlist: Playlist) => {
    setRenamePlaylist(playlist)
    setRenameValue(playlist.name)
  }

  const handleDeletePlaylist = async (playlistId: string, playlistName: string) => {
    if (!confirm(`Delete "${playlistName}"? This cannot be undone.`)) return
    try {
      await deletePlaylist(userId, playlistId)
      onPlaylistUpdate()
      toast({ title: "Playlist Deleted", description: `"${playlistName}" deleted.` })
    } catch {
      toast({ title: "Error", description: "Failed to delete playlist.", variant: "destructive" })
    }
  }

  const handleRemoveSong = async (playlistId: string, songId: string) => {
    try {
      await removeSongFromPlaylist(userId, playlistId, songId)
      onPlaylistUpdate()
      toast({ title: "Song Removed", description: "Song removed from playlist." })
    } catch {
      toast({ title: "Error", description: "Failed to remove song.", variant: "destructive" })
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const inputClass = "h-11 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-2xl font-bold text-foreground">My Playlists</h2>
          {playlists.length > 0 && (
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: 'hsl(42 93% 58% / 0.12)', color: 'hsl(42 93% 58%)' }}
            >
              {playlists.length}
            </span>
          )}
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button
              className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'hsl(42 93% 58%)', color: 'hsl(238 50% 4%)' }}
            >
              <Plus className="w-4 h-4" />
              New Playlist
            </button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-display text-foreground">New Playlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <Input
                placeholder="Playlist name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCreatePlaylist()}
                className={inputClass}
                autoFocus
              />
              <button
                onClick={handleCreatePlaylist}
                disabled={isCreating || !newPlaylistName.trim()}
                className="w-full h-11 rounded-xl text-sm font-semibold disabled:opacity-50 transition-all"
                style={{ background: 'hsl(42 93% 58%)', color: 'hsl(238 50% 4%)' }}
              >
                {isCreating ? "Creating…" : "Create Playlist"}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {playlists.length === 0 ? (
        <div className="text-center py-16">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'hsl(240 38% 14%)', border: '1px solid hsl(240 30% 17%)' }}
          >
            <Music className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground mb-1">No Playlists Yet</h3>
          <p className="text-muted-foreground text-sm">Create a playlist to organize your favorite songs</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="rounded-xl overflow-hidden transition-all duration-200"
              style={{ background: 'hsl(240 43% 8%)', border: '1px solid hsl(240 30% 17%)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'hsl(42 93% 58% / 0.25)'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'hsl(240 30% 17%)'
              }}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-display font-semibold text-foreground truncate">{playlist.name}</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 mt-0.5">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setSelectedPlaylist(playlist)}>
                        <Music className="w-4 h-4 mr-2" />
                        View Songs
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openRenameDialog(playlist)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeletePlaylist(playlist.id, playlist.name)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {playlist.songs.length} song{playlist.songs.length !== 1 ? "s" : ""}
                </p>

                {playlist.songs.length > 0 ? (
                  <div className="space-y-2">
                    {playlist.songs.slice(0, 3).map((song) => (
                      <div key={song.id} className="flex items-center gap-2">
                        <img
                          src={song.image[0]?.url || "/placeholder.svg?height=28&width=28"}
                          alt={song.name}
                          className="w-7 h-7 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{song.name.replaceAll('&quot;', '"')}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{song.artists.primary[0]?.name}</p>
                        </div>
                      </div>
                    ))}
                    {playlist.songs.length > 3 && (
                      <p className="text-[10px] text-muted-foreground pl-9">+{playlist.songs.length - 3} more</p>
                    )}
                    <button
                      onClick={() => onPlaySong(playlist.songs[0], playlist.songs, 0)}
                      className="w-full mt-2 h-9 flex items-center justify-center gap-2 rounded-xl text-xs font-semibold transition-all"
                      style={{ background: 'hsl(42 93% 58% / 0.12)', color: 'hsl(42 93% 58%)' }}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Play All
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No songs added yet</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rename Dialog */}
      {renamePlaylist && (
        <Dialog open={!!renamePlaylist} onOpenChange={() => setRenamePlaylist(null)}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-display text-foreground">Rename Playlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <Input
                placeholder="New name"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleRenamePlaylist()}
                className={inputClass}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleRenamePlaylist}
                  disabled={isRenaming || !renameValue.trim() || renameValue === renamePlaylist.name}
                  className="flex-1 h-11 rounded-xl text-sm font-semibold disabled:opacity-50 transition-all"
                  style={{ background: 'hsl(42 93% 58%)', color: 'hsl(238 50% 4%)' }}
                >
                  {isRenaming ? "Renaming…" : "Rename"}
                </button>
                <button
                  onClick={() => setRenamePlaylist(null)}
                  className="h-11 px-5 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors"
                  style={{ background: 'hsl(240 38% 14%)', border: '1px solid hsl(240 30% 17%)' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Playlist Detail Dialog */}
      {selectedPlaylist && (
        <Dialog open={!!selectedPlaylist} onOpenChange={() => setSelectedPlaylist(null)}>
          <DialogContent className="bg-card border-border max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-foreground">{selectedPlaylist.name}</DialogTitle>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto space-y-1.5 pr-1">
              {selectedPlaylist.songs.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">No songs in this playlist</p>
              ) : (
                selectedPlaylist.songs.map((song, index) => (
                  <div
                    key={song.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary transition-colors"
                  >
                    <img
                      src={song.image[1]?.url || "/placeholder.svg?height=44&width=44"}
                      alt={song.name}
                      className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{song.name.replaceAll('&quot;', '"')}</p>
                      <p className="text-xs text-muted-foreground truncate">{song.artists.primary[0]?.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                          style={{ background: 'hsl(42 93% 58% / 0.12)', color: 'hsl(42 93% 58%)' }}
                        >
                          {song.language}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {formatDuration(song.duration)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => onPlaySong(song, selectedPlaylist.songs, index)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemoveSong(selectedPlaylist.id, song.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
