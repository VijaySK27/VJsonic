"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronLeft, ChevronRight, Play, Clock, MoreVertical, Plus } from "lucide-react"
import type { Song, Playlist } from "@/types/music"
import { searchSongs } from "@/lib/api"
import { addSongToPlaylist, createPlaylist } from "@/lib/indexdb"
import { toast } from "@/hooks/use-toast"

interface HomePageProps {
  onPlaySong: (song: Song, playlist: Song[], index: number) => void
  userId: string
  playlists: Playlist[]
  onPlaylistUpdate: () => void
}

interface SongCategory {
  title: string
  query: string
  songs: Song[]
  loading: boolean
}

export function HomePage({ onPlaySong, userId, playlists, onPlaylistUpdate }: HomePageProps) {
  const [categories, setCategories] = useState<SongCategory[]>([
    { title: "Trending Tamil Songs", query: "tamil trending", songs: [], loading: true },
    { title: "Love Tamil Songs", query: "tamil love songs", songs: [], loading: true },
    { title: "Mass Tamil Songs", query: "tamil mass", songs: [], loading: true },
    { title: "Melody Tamil Songs", query: "tamil melody", songs: [], loading: true },
    { title: "AR Rahman Hits", query: "ar rahman tamil", songs: [], loading: true },
    { title: "Ilayaraja Classics", query: "ilayaraja tamil", songs: [], loading: true },
    { title: "Anirudh Ravichander", query: "anirudh ravichander tamil", songs: [], loading: true },
    { title: "Sid Sriram Vocals", query: "sid sriram tamil", songs: [], loading: true },
    { title: "Hip Hop Tamizha", query: "hip hop tamizha adhi tamil", songs: [], loading: true },
  ])

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    const updatedCategories = await Promise.all(
      categories.map(async (category) => {
        try {
          const songs = await searchSongs(category.query)
          return { ...category, songs: songs.slice(0, 10), loading: false }
        } catch (error) {
          console.error(`Failed to load ${category.title}:`, error)
          return { ...category, songs: [], loading: false }
        }
      }),
    )
    setCategories(updatedCategories)
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
        onPlaylistUpdate()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add song to playlist.",
        variant: "destructive",
      })
    }
  }

  const scrollCarousel = (categoryIndex: number, direction: "left" | "right") => {
    const carousel = document.getElementById(`carousel-${categoryIndex}`)
    if (carousel) {
      const scrollAmount = 300
      carousel.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Welcome to VJ Sonic</h2>
        <p className="text-purple-200">Your ultimate destination for Tamil music</p>
      </div>

      {categories.map((category, categoryIndex) => (
        <div key={category.title} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">{category.title}</h3>
            <div className="hidden md:flex gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => scrollCarousel(categoryIndex, "left")}
                className="w-8 h-8 text-white hover:bg-white/20"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => scrollCarousel(categoryIndex, "right")}
                className="w-8 h-8 text-white hover:bg-white/20"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {category.loading ? (
            <div className="flex gap-4 overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="flex-shrink-0 w-48 bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-4">
                    <div className="w-full h-32 bg-white/20 rounded-lg mb-3 animate-pulse" />
                    <div className="h-4 bg-white/20 rounded mb-2 animate-pulse" />
                    <div className="h-3 bg-white/20 rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div
              id={`carousel-${categoryIndex}`}
              className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {category.songs.map((song, songIndex) => (
                <Card
                  key={song.id}
                  className="flex-shrink-0 w-48 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-colors group"
                >
                  <CardContent className="p-4">
                    <div className="relative mb-3">
                      <img
                        src={song.image[2]?.url || "/placeholder.svg?height=128&width=192"}
                        alt={song.name}
                        className="w-full h-32 object-cover rounded-lg cursor-pointer"
                        onClick={() => onPlaySong(song, category.songs, songIndex)}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            className="bg-purple-600 hover:bg-purple-700"
                            onClick={() => onPlaySong(song, category.songs, songIndex)}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="secondary" className="bg-white/20 hover:bg-white/30">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleAddToPlaylist(song)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create New Playlist
                              </DropdownMenuItem>
                              {playlists.map((playlist) => (
                                <DropdownMenuItem
                                  key={playlist.id}
                                  onClick={() => handleAddToPlaylist(song, playlist.id)}
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add to {playlist.name}
                                </DropdownMenuItem>
                              ))}
                              {playlists.length === 0 && (
                                <DropdownMenuItem disabled>No playlists available</DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                    <h4 className="font-semibold text-white text-sm truncate mb-1">{song.name}</h4>
                    <p className="text-purple-200 text-xs truncate mb-2">{song.artists.primary[0]?.name}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-purple-600/50 text-white text-xs">
                        {song.language}
                      </Badge>
                      <span className="text-xs text-purple-200 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(song.duration)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
