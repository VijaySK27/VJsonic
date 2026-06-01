"use client"

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
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="font-display text-2xl font-bold text-foreground">Recently Played</h2>
        {recentlyPlayed.length > 0 && (
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ background: 'hsl(42 93% 58% / 0.12)', color: 'hsl(42 93% 58%)' }}
          >
            {recentlyPlayed.length}
          </span>
        )}
      </div>

      {recentlyPlayed.length === 0 ? (
        <div className="text-center py-16">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'hsl(240 38% 14%)', border: '1px solid hsl(240 30% 17%)' }}
          >
            <Clock className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground mb-1">Nothing yet</h3>
          <p className="text-muted-foreground text-sm">Songs you play will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {recentlyPlayed.map((song, index) => (
            <div
              key={`${song.id}-${index}`}
              className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group"
              style={{ background: 'hsl(240 43% 8%)', border: '1px solid hsl(240 30% 17%)' }}
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
                className="w-[52px] h-[52px] rounded-xl object-cover flex-shrink-0"
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
              <button
                onClick={() => onPlaySong(song, recentlyPlayed, index)}
                className="w-9 h-9 flex items-center justify-center rounded-xl transition-all active:scale-95 flex-shrink-0"
                style={{ background: 'hsl(42 93% 58%)', color: 'hsl(238 50% 4%)' }}
              >
                <Play className="w-4 h-4 fill-current" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
