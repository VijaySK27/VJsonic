"use client"

import { useState, useEffect } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronLeft, ChevronRight, Play, Plus, MoreVertical, Clock } from "lucide-react"
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
        toast({ title: "Added to Playlist", description: `"${song.name}" added successfully.` })
      } else {
        const playlistName = `My Playlist ${Date.now()}`
        await createPlaylist(userId, playlistName, [song])
        toast({ title: "Playlist Created", description: `"${playlistName}" created.` })
        onPlaylistUpdate()
      }
    } catch {
      toast({ title: "Error", description: "Failed to add song to playlist.", variant: "destructive" })
    }
  }

  const scrollCarousel = (categoryIndex: number, direction: "left" | "right") => {
    const carousel = document.getElementById(`carousel-${categoryIndex}`)
    if (carousel) {
      carousel.scrollBy({ left: direction === "left" ? -300 : 300, behavior: "smooth" })
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h2 className="font-display text-3xl font-bold text-foreground mb-1">
          Good listening.
        </h2>
        <p className="text-muted-foreground text-sm">Curated Tamil music, always fresh</p>
      </div>

      {categories.map((category, categoryIndex) => (
        <div key={category.title} className="space-y-3">
          {/* Section header */}
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-semibold text-foreground">{category.title}</h3>
            <div className="hidden md:flex gap-1">
              <button
                onClick={() => scrollCarousel(categoryIndex, "left")}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                style={{ background: 'hsl(240 38% 14%)' }}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => scrollCarousel(categoryIndex, "right")}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                style={{ background: 'hsl(240 38% 14%)' }}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Cards */}
          {category.loading ? (
            <div className="flex gap-3 overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-44 rounded-xl overflow-hidden" style={{ background: 'hsl(240 43% 8%)' }}>
                  <div
                    className="w-full h-28 rounded-t-none"
                    style={{
                      background: 'linear-gradient(90deg, hsl(240 43% 8%) 25%, hsl(240 38% 14%) 50%, hsl(240 43% 8%) 75%)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer-pass 1.8s infinite',
                    }}
                  />
                  <div className="p-3 space-y-2">
                    <div
                      className="h-3 rounded-full w-3/4"
                      style={{
                        background: 'linear-gradient(90deg, hsl(240 43% 8%) 25%, hsl(240 38% 14%) 50%, hsl(240 43% 8%) 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer-pass 1.8s 0.1s infinite',
                      }}
                    />
                    <div
                      className="h-2.5 rounded-full w-1/2"
                      style={{
                        background: 'linear-gradient(90deg, hsl(240 43% 8%) 25%, hsl(240 38% 14%) 50%, hsl(240 43% 8%) 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer-pass 1.8s 0.2s infinite',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              id={`carousel-${categoryIndex}`}
              className="flex gap-3 overflow-x-auto scrollbar-hide pb-1"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {category.songs.map((song, songIndex) => (
                <div
                  key={song.id}
                  className="flex-shrink-0 w-44 rounded-xl overflow-hidden group cursor-pointer transition-all duration-200"
                  style={{
                    background: 'hsl(240 43% 8%)',
                    border: '1px solid hsl(240 30% 17%)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'hsl(42 93% 58% / 0.3)'
                    ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 20px hsl(42 93% 58% / 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'hsl(240 30% 17%)'
                    ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
                  }}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden">
                    <img
                      src={song.image[2]?.url || "/placeholder.svg?height=128&width=192"}
                      alt={song.name}
                      className="w-full h-28 object-cover transition-transform duration-300 group-hover:scale-105"
                      onClick={() => onPlaySong(song, category.songs, songIndex)}
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                      <button
                        className="w-9 h-9 flex items-center justify-center rounded-xl transition-all active:scale-95"
                        style={{ background: 'hsl(42 93% 58%)', color: 'hsl(238 50% 4%)', boxShadow: '0 0 16px hsl(42 93% 58% / 0.5)' }}
                        onClick={() => onPlaySong(song, category.songs, songIndex)}
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="w-9 h-9 flex items-center justify-center rounded-xl text-foreground transition-colors"
                            style={{ background: 'hsl(240 38% 14%)' }}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
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
                          {playlists.length === 0 && (
                            <DropdownMenuItem disabled>No playlists available</DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-3">
                    <p className="text-sm font-semibold text-foreground truncate mb-0.5">
                      {song.name.replaceAll('&quot;', '"')}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mb-2">{song.artists.primary[0]?.name}</p>
                    <div className="flex items-center justify-between">
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
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
