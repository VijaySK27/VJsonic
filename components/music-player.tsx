"use client"

import { useState, useRef, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ChevronDown,
  Repeat,
  Shuffle,
  ChevronUp,
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
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime)
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
    if (audioRef.current) audioRef.current.volume = newVolume
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

  const progressPercent = duration ? (currentTime / duration) * 100 : 0
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

      {/* ── Mini Player ──────────────────────────────── */}
      {!isExpanded && (
        <div
          className="fixed bottom-[57px] left-3 right-3 rounded-2xl z-30 overflow-hidden"
          style={{
            background: 'hsl(240 43% 8% / 0.96)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid hsl(240 30% 17%)',
            boxShadow: '0 -4px 24px hsl(238 50% 4% / 0.6), 0 0 0 1px hsl(42 93% 58% / 0.04)',
          }}
        >
          {/* Gold progress hairline */}
          <div
            className="absolute top-0 left-0 h-[2px] transition-all duration-300"
            style={{
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, hsl(42 93% 58%), hsl(42 93% 75%))',
              boxShadow: '0 0 6px hsl(42 93% 58% / 0.8)',
            }}
          />
          {/* Clickable progress track */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px] cursor-pointer"
            style={{ background: 'hsl(240 30% 17%)' }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const ratio = (e.clientX - rect.left) / rect.width
              handleSeek([ratio * (duration || 100)])
            }}
          />

          <div className="flex items-center gap-3 px-3 py-2.5 mt-[2px]">
            {/* Album art */}
            <div className="relative flex-shrink-0">
              <img
                src={song.image[1]?.url || "/placeholder.svg?height=44&width=44"}
                alt={song.name}
                className="w-11 h-11 rounded-xl object-cover"
                style={{ boxShadow: isPlaying ? '0 0 12px hsl(42 93% 58% / 0.25)' : 'none', transition: 'box-shadow 0.4s ease' }}
              />
              {isPlaying && (
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 animate-glow-breathe"
                  style={{ background: 'hsl(42 93% 58%)', borderColor: 'hsl(240 43% 8%)' }}
                />
              )}
            </div>

            {/* Song info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate leading-tight">
                {song.name.replaceAll('&quot;', '"')}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {song.artists.primary[0]?.name}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={onPrevious}
                disabled={!canGoPrevious}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={onPlayPause}
                disabled={isLoading}
                className="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 active:scale-95"
                style={{
                  background: 'hsl(42 93% 58%)',
                  color: 'hsl(238 50% 4%)',
                  boxShadow: isPlaying ? '0 0 16px hsl(42 93% 58% / 0.5)' : 'none',
                }}
              >
                {isLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current" />
                )}
              </button>

              <button
                onClick={onNext}
                disabled={!canGoNext}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsExpanded(true)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Full Player ──────────────────────────────── */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex flex-col overflow-hidden" style={{ background: 'hsl(238 50% 4%)' }}>
          {/* Background blobs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[120px]"
              style={{ background: 'hsl(42 93% 58% / 0.12)' }}
            />
            <div
              className="absolute bottom-0 right-0 w-[350px] h-[350px] rounded-full blur-[100px]"
              style={{ background: 'hsl(322 80% 50% / 0.06)' }}
            />
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(circle, hsl(42 93% 58% / 0.04) 1.5px, transparent 1.5px)',
                backgroundSize: '28px 28px',
              }}
            />
          </div>

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between px-6 pt-12 pb-4">
            <button
              onClick={() => setIsExpanded(false)}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground transition-colors"
              style={{ background: 'hsl(240 38% 14%)' }}
            >
              <ChevronDown className="w-5 h-5" />
            </button>
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Now Playing</p>
            </div>
            <div className="w-10" />
          </div>

          {/* Scrollable content */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 pb-8 overflow-y-auto">
            <div className="w-full max-w-[340px]">

              {/* Vinyl album art */}
              <div className="relative mx-auto mb-8" style={{ width: 'min(280px, 72vw)', height: 'min(280px, 72vw)' }}>
                {/* Outer spinning ring */}
                <div
                  className={`absolute inset-[-10px] rounded-full ${isPlaying ? 'animate-vinyl-spin-slow' : ''}`}
                  style={{
                    background: isPlaying
                      ? 'conic-gradient(from 0deg, hsl(42 93% 58% / 0.6), hsl(42 93% 58% / 0.05), hsl(42 93% 58% / 0.4), hsl(42 93% 58% / 0.02), hsl(42 93% 58% / 0.6))'
                      : 'none',
                    border: !isPlaying ? '2px solid hsl(240 30% 17%)' : 'none',
                    transition: 'all 0.5s ease',
                  }}
                />
                {/* Inner separator */}
                <div className="absolute inset-[-4px] rounded-full" style={{ background: 'hsl(238 50% 4%)' }} />
                {/* Album art */}
                <img
                  src={song.image[2]?.url || "/placeholder.svg?height=280&width=280"}
                  alt={song.name}
                  className="absolute inset-0 w-full h-full rounded-full object-cover"
                  style={{
                    boxShadow: isPlaying
                      ? '0 0 50px hsl(42 93% 58% / 0.25), 0 16px 48px hsl(238 50% 4% / 0.8)'
                      : '0 16px 48px hsl(238 50% 4% / 0.8)',
                    transition: 'box-shadow 0.5s ease',
                  }}
                />
                {/* Vinyl center hole */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full z-10"
                  style={{
                    background: 'hsl(238 50% 4%)',
                    border: '2px solid hsl(42 93% 58% / 0.3)',
                    boxShadow: isPlaying ? '0 0 8px hsl(42 93% 58% / 0.6)' : 'none',
                  }}
                />
              </div>

              {/* Song info */}
              <div className="text-center mb-7">
                <h2 className="font-display text-[1.6rem] font-bold text-foreground leading-tight mb-1">
                  {song.name.replaceAll('&quot;', '"')}
                </h2>
                <p className="text-muted-foreground">{song.artists.primary[0]?.name}</p>
              </div>

              {/* Progress */}
              <div className="mb-7">
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={1}
                  onValueChange={handleSeek}
                  className="w-full"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-muted-foreground tabular-nums">{formatTime(currentTime)}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Main controls */}
              <div className="flex items-center justify-between mb-7">
                <button
                  onClick={onAutoplayToggle}
                  className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200"
                  style={{
                    color: autoplay ? 'hsl(42 93% 58%)' : 'hsl(252 12% 54%)',
                    background: autoplay ? 'hsl(42 93% 58% / 0.1)' : 'transparent',
                  }}
                >
                  <Repeat className="w-5 h-5" />
                </button>

                <button
                  onClick={onPrevious}
                  disabled={!canGoPrevious}
                  className="w-11 h-11 flex items-center justify-center rounded-xl text-foreground hover:text-primary disabled:opacity-30 transition-all duration-200"
                  style={{ background: 'hsl(240 38% 14%)' }}
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                <button
                  onClick={onPlayPause}
                  disabled={isLoading}
                  className="w-16 h-16 flex items-center justify-center rounded-2xl transition-all duration-200 active:scale-95"
                  style={{
                    background: 'hsl(42 93% 58%)',
                    color: 'hsl(238 50% 4%)',
                    boxShadow: '0 0 32px hsl(42 93% 58% / 0.45), 0 8px 24px hsl(238 50% 4% / 0.4)',
                  }}
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-7 h-7 fill-current" />
                  ) : (
                    <Play className="w-7 h-7 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  onClick={onNext}
                  disabled={!canGoNext}
                  className="w-11 h-11 flex items-center justify-center rounded-xl text-foreground hover:text-primary disabled:opacity-30 transition-all duration-200"
                  style={{ background: 'hsl(240 38% 14%)' }}
                >
                  <SkipForward className="w-5 h-5" />
                </button>

                <button
                  className="w-10 h-10 flex items-center justify-center rounded-xl transition-colors text-muted-foreground hover:text-foreground"
                >
                  <Shuffle className="w-5 h-5" />
                </button>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-3 px-1">
                <button
                  onClick={toggleMute}
                  className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.05}
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
