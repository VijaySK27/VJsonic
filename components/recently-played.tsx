"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Clock } from "lucide-react"
import type { Song } from "@/types/music"

interface RecentlyPlayedProps {
  recentlyPlayed: Song[]
  onPlaySong: (song: Song, playlist: Song[], index: number) => void
}

export function RecentlyPlayed({ recentlyPlayed, onPlaySong }: RecentlyPlayedProps) {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Recently Played</h2>

      {recentlyPlayed.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 mx-auto mb-4 text-purple-400" />
          <h3 className="text-xl font-semibold text-white mb-2">No Recent Songs</h3>
          <p className="text-purple-200">Songs you play will appear here</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {recentlyPlayed.map((song, index) => (
            <Card
              key={`${song.id}-${index}`}
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
                  <Button
                    size="icon"
                    onClick={() => onPlaySong(song, recentlyPlayed, index)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
