"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Play, Plus, MoreVertical, Clock } from "lucide-react"
import type { Song, Playlist } from "@/types/music"
import { searchSongs } from "@/lib/api"
import { addSongToPlaylist, createPlaylist } from "@/lib/indexdb"
import { toast } from "@/hooks/use-toast"

interface SearchSectionProps {
  onPlaySong: (song: Song, playlist: Song[], index: number) => void
  onAddToPlaylist: () => void
  playlists: Playlist[]
  userId: string
}

export function SearchSection({ onPlaySong, onAddToPlaylist, playlists, userId }: SearchSectionProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setIsLoading(true)
    try {
      const searchResults = await searchSongs(query)
      setResults(searchResults)
    } catch (error) {
      console.error("Search failed:", error)
      toast({ title: "Search Failed", description: "Unable to search. Please try again.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToPlaylist = async (song: Song, playlistId?: string) => {
    try {
      if (playlistId) {
        await addSongToPlaylist(userId, playlistId, song)
        toast({ title: "Added to Playlist", description: `"${song.name}" added successfully.` })
      } else {
        const playlistName = `My Playlist ${Date.now()}`
        await createPlaylist(userId, playlistName, [song])
        toast({ title: "Playlist Created", description: `"${playlistName}" created.` })
      }
      onAddToPlaylist()
    } catch {
      toast({ title: "Error", description: "Failed to add song to playlist.", variant: "destructive" })
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div
        className="flex gap-2 p-1.5 rounded-2xl"
        style={{ background: 'hsl(240 38% 14%)', border: '1px solid hsl(240 30% 17%)' }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Song, artist, or album…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="pl-9 h-11 bg-transparent border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={isLoading || !query.trim()}
          className="h-11 px-5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 flex items-center gap-2 flex-shrink-0"
          style={{
            background: 'hsl(42 93% 58%)',
            color: 'hsl(238 50% 4%)',
          }}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          Search
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl font-bold text-foreground">Results</h2>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: 'hsl(42 93% 58% / 0.12)', color: 'hsl(42 93% 58%)' }}
            >
              {results.length}
            </span>
          </div>
          <div className="space-y-2">
            {results.map((song, index) => (
              <div
                key={song.id}
                className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group"
                style={{
                  background: 'hsl(240 43% 8%)',
                  border: '1px solid hsl(240 30% 17%)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'hsl(42 93% 58% / 0.25)'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'hsl(240 30% 17%)'
                }}
              >
                <img
                  src={song.image[1]?.url || "/placeholder.svg?height=52&width=52"}
                  alt={song.name}
                  className="w-13 h-13 rounded-xl object-cover flex-shrink-0"
                  style={{ width: '52px', height: '52px' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate text-sm">{song.name.replaceAll('&quot;', '"')}</p>
                  <p className="text-muted-foreground text-xs truncate mt-0.5">{song.artists.primary[0]?.name}</p>
                  <div className="flex items-center gap-2 mt-1.5">
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
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => onPlaySong(song, results, index)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl transition-all active:scale-95"
                    style={{ background: 'hsl(42 93% 58%)', color: 'hsl(238 50% 4%)' }}
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground transition-colors"
                        style={{ background: 'hsl(240 38% 14%)' }}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleAddToPlaylist(song)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Playlist
                      </DropdownMenuItem>
                      {playlists.map((playlist) => (
                        <DropdownMenuItem key={playlist.id} onClick={() => handleAddToPlaylist(song, playlist.id)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add to {playlist.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {results.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'hsl(240 38% 14%)', border: '1px solid hsl(240 30% 17%)' }}
          >
            <Search className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground mb-1">Discover Tamil Music</h3>
          <p className="text-muted-foreground text-sm">Enter a song name, artist, or album to find music</p>
        </div>
      )}
    </div>
  )
}
