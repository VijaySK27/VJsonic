"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
      toast({
        title: "Search Failed",
        description: "Unable to search songs. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToPlaylist = async (song: Song, playlistId?: string) => {
    try {
      if (playlistId) {
        await addSongToPlaylist(userId, playlistId, song)
        toast({
          title: "Added to Playlist",
          description: `"${song.name}" added to playlist successfully.`,
        })
      } else {
        // Create new playlist
        const playlistName = `My Playlist ${Date.now()}`
        await createPlaylist(userId, playlistName, [song])
        toast({
          title: "Playlist Created",
          description: `New playlist "${playlistName}" created with "${song.name}".`,
        })
      }
      onAddToPlaylist()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add song to playlist.",
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
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search for Tamil songs..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isLoading || !query.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Search Results</h2>
          <div className="grid gap-4">
            {results.map((song, index) => (
              <Card
                key={song.id}
                className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={song.image[1]?.url || "/placeholder.svg?height=60&width=60"}
                      alt={song.name}
                      className="w-15 h-15 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{song.name}</h3>
                      <p className="text-purple-200 truncate">{song.artists.primary[0]?.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="bg-purple-600/50 text-white">
                          {song.language}
                        </Badge>
                        <span className="text-sm text-purple-200 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(song.duration)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        onClick={() => onPlaySong(song, results, index)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="text-white hover:bg-white/20">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
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
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {results.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 mx-auto mb-4 text-purple-400" />
          <h3 className="text-xl font-semibold text-white mb-2">Search Tamil Songs</h3>
          <p className="text-purple-200">Enter a song name, artist, or album to get started</p>
        </div>
      )}
    </div>
  )
}
