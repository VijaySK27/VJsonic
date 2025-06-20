"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card } from "@/components/ui/card"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Repeat,
  Shuffle,
} from "lucide-react"
import type { Song } from "@/types/music"
import { addToRecentlyPlayed } from "@/lib/indexdb"

interface MusicPlayerProps {
  song: Song
  isPlaying: boolean
  onPlayPause: () => void
  onNext: () => void
  onPrevious: () => void
  playlist: Song[]
  currentIndex: number
  autoplay: boolean
  onAutoplayToggle: () => void
  onSongEnd: () => void
  onRecentUpdate: () => void
  userId: string
}

export function MusicPlayer({
  song,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  playlist,
  currentIndex,
  autoplay,
  onAutoplayToggle,
  onSongEnd,
  onRecentUpdate,
  userId,
}: MusicPlayerProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(console.error)
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying])

  useEffect(() => {
    if (audioRef.current && song) {
      setIsLoading(true)
      audioRef.current.src = song.downloadUrl[4]?.url || song.downloadUrl[3]?.url || song.downloadUrl[2]?.url
      audioRef.current.load()

      if (isPlaying) {
        audioRef.current.play().catch(console.error)
      }
    }
  }, [song])

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
      setIsLoading(false)
    }
  }

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume
        setIsMuted(false)
      } else {
        audioRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  const handleSongEnd = async () => {
    await addToRecentlyPlayed(userId, song)
    onRecentUpdate()
    onSongEnd()
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const canGoNext = currentIndex < playlist.length - 1
  const canGoPrevious = currentIndex > 0

  if (!song) return null

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleSongEnd}
        preload="metadata"
      />

      {/* Mini Player */}
      {!isExpanded && (
        <Card className="fixed bottom-16 left-4 right-4 bg-white/95 backdrop-blur-sm border-0 shadow-xl z-30">
          <div className="flex items-center gap-4 p-4">
            <img
              src={song.image[1]?.url || "/placeholder.svg?height=60&width=60"}
              alt={song.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold truncate">{song.name}</h4>
              <p className="text-sm text-muted-foreground truncate">{song.artists.primary[0]?.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" onClick={onPrevious} disabled={!canGoPrevious} className="w-8 h-8">
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button size="icon" onClick={onPlayPause} disabled={isLoading} className="w-10 h-10">
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
              <Button size="icon" variant="ghost" onClick={onNext} disabled={!canGoNext} className="w-8 h-8">
                <SkipForward className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => setIsExpanded(true)} className="w-8 h-8">
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="px-4 pb-2">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="w-full"
            />
          </div>
        </Card>
      )}

      {/* Full Player */}
      {isExpanded && (
        <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 z-50 flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsExpanded(false)}
              className="absolute top-4 right-4 text-white hover:bg-white/20"
            >
              <Minimize2 className="w-6 h-6" />
            </Button>

            <div className="max-w-md w-full text-center">
              <img
                src={song.image[2]?.url || "/placeholder.svg?height=400&width=400"}
                alt={song.name}
                className="w-full aspect-square object-cover rounded-2xl shadow-2xl mb-8"
              />

              <h2 className="text-3xl font-bold text-white mb-2">{song.name}</h2>
              <p className="text-xl text-purple-200 mb-8">{song.artists.primary[0]?.name}</p>

              <div className="space-y-4 mb-8">
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={1}
                  onValueChange={handleSeek}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-purple-200">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-6 mb-8">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onAutoplayToggle}
                  className={`w-12 h-12 text-white hover:bg-white/20 ${autoplay ? "bg-white/20" : ""}`}
                >
                  <Repeat className="w-6 h-6" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onPrevious}
                  disabled={!canGoPrevious}
                  className="w-12 h-12 text-white hover:bg-white/20 disabled:opacity-50"
                >
                  <SkipBack className="w-6 h-6" />
                </Button>
                <Button
                  size="icon"
                  onClick={onPlayPause}
                  disabled={isLoading}
                  className="w-16 h-16 bg-white text-purple-900 hover:bg-white/90"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-purple-900 border-t-transparent rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onNext}
                  disabled={!canGoNext}
                  className="w-12 h-12 text-white hover:bg-white/20 disabled:opacity-50"
                >
                  <SkipForward className="w-6 h-6" />
                </Button>
                <Button size="icon" variant="ghost" className="w-12 h-12 text-white hover:bg-white/20">
                  <Shuffle className="w-6 h-6" />
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={toggleMute}
                  className="w-8 h-8 text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
