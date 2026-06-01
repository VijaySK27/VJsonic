"use client"

import { useState, useEffect } from "react"
import { MusicPlayer } from "@/components/music-player"
import { SearchSection } from "@/components/search-section"
import { PlaylistSection } from "@/components/playlist-section"
import { RecentlyPlayed } from "@/components/recently-played"
import { HomePage } from "@/components/home-page"
import { UserProfile } from "@/components/user-profile"
import { UserLogin } from "@/components/user-login"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Music } from "lucide-react"
import type { Song, Playlist, User } from "@/types/music"
import { initDB, getPlaylists, getRecentlyPlayed, getCurrentUser } from "@/lib/indexdb"

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentPlaylist, setCurrentPlaylist] = useState<Song[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([])
  const [autoplay, setAutoplay] = useState(true)
  const [activeTab, setActiveTab] = useState("home")

  useEffect(() => {
    initDB().then(async () => {
      const user = await getCurrentUser()
      if (user) {
        setCurrentUser(user)
        loadUserData(user.id)
      }
    })
  }, [])

  const loadUserData = async (userId: string) => {
    const savedPlaylists = await getPlaylists(userId)
    const recent = await getRecentlyPlayed(userId)
    setPlaylists(savedPlaylists)
    setRecentlyPlayed(recent)
  }

  const handleUserLogin = (user: User) => {
    setCurrentUser(user)
    loadUserData(user.id)
  }

  const handleUserLogout = () => {
    setCurrentUser(null)
    setPlaylists([])
    setRecentlyPlayed([])
    setCurrentSong(null)
    setIsPlaying(false)
    setActiveTab("home")
  }

  const playSong = (song: Song, playlist: Song[] = [], index = 0) => {
    setCurrentSong(song)
    setCurrentPlaylist(playlist.length > 0 ? playlist : [song])
    setCurrentIndex(index)
    setIsPlaying(true)
  }

  const playNext = () => {
    if (currentPlaylist.length > 0 && currentIndex < currentPlaylist.length - 1) {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      setCurrentSong(currentPlaylist[nextIndex])
    }
  }

  const playPrevious = () => {
    if (currentPlaylist.length > 0 && currentIndex > 0) {
      const prevIndex = currentIndex - 1
      setCurrentIndex(prevIndex)
      setCurrentSong(currentPlaylist[prevIndex])
    }
  }

  const refreshUserData = () => {
    if (currentUser) {
      loadUserData(currentUser.id)
    }
  }

  if (!currentUser) {
    return <UserLogin onLogin={handleUserLogin} />
  }

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <HomePage
            onPlaySong={playSong}
            userId={currentUser.id}
            playlists={playlists}
            onPlaylistUpdate={refreshUserData}
          />
        )
      case "search":
        return (
          <SearchSection
            onPlaySong={playSong}
            onAddToPlaylist={refreshUserData}
            playlists={playlists}
            userId={currentUser.id}
          />
        )
      case "playlists":
        return (
          <PlaylistSection
            playlists={playlists}
            onPlaySong={playSong}
            onPlaylistUpdate={refreshUserData}
            userId={currentUser.id}
          />
        )
      case "recent":
        return <RecentlyPlayed recentlyPlayed={recentlyPlayed} onPlaySong={playSong} />
      case "player":
        return (
          <div className="rounded-2xl bg-card border border-border p-8">
            {currentSong ? (
              <div className="text-center">
                <p className="text-xs font-medium text-primary uppercase tracking-[0.2em] mb-4">Now Playing</p>
                <div className="max-w-xs mx-auto">
                  <div className="relative">
                    <div
                      className="absolute inset-[-3px] rounded-3xl"
                      style={{ boxShadow: isPlaying ? '0 0 40px hsl(42 93% 58% / 0.35)' : 'none', transition: 'box-shadow 0.5s ease' }}
                    />
                    <img
                      src={currentSong.image[2]?.url || "/placeholder.svg?height=300&width=300"}
                      alt={currentSong.name}
                      className="w-full aspect-square object-cover rounded-2xl"
                    />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground mt-5 mb-1">{currentSong.name}</h3>
                  <p className="text-muted-foreground">{currentSong.artists.primary[0]?.name}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary border border-border mb-4">
                  <Music className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">Nothing playing</h3>
                <p className="text-muted-foreground text-sm">Search and play a song to get started</p>
              </div>
            )}
          </div>
        )
      default:
        return (
          <HomePage
            onPlaySong={playSong}
            userId={currentUser.id}
            playlists={playlists}
            onPlaylistUpdate={refreshUserData}
          />
        )
    }
  }

  return (
    <div className="relative min-h-screen bg-background pb-36 overflow-x-hidden">
      {/* Atmosphere blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute top-[-20%] left-[-8%] w-[700px] h-[700px] rounded-full blur-[160px] animate-float-a"
          style={{ background: 'hsl(42 93% 58% / 0.07)' }}
        />
        <div
          className="absolute bottom-[-25%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[130px] animate-float-b"
          style={{ background: 'hsl(322 80% 50% / 0.05)' }}
        />
        {/* Kolam dot grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, hsl(42 93% 58% / 0.05) 1.5px, transparent 1.5px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-secondary border border-border">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" style={{ color: 'hsl(42 93% 58%)' }}>
                <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3z" />
              </svg>
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[8px] font-black flex items-center justify-center"
                style={{ background: 'hsl(42 93% 58%)', color: 'hsl(238 50% 4%)' }}
              >
                VJ
              </span>
            </div>
            <div>
              <h1 className="font-display text-3xl font-black text-gold-gradient tracking-tight leading-none">
                VJ Sonic
              </h1>
              <p className="text-[11px] text-muted-foreground mt-0.5">Tamil music · unlimited</p>
            </div>
          </div>
          <UserProfile user={currentUser} onLogout={handleUserLogout} />
        </header>

        <div className="space-y-6">{renderContent()}</div>
      </div>

      {currentSong && (
        <MusicPlayer
          song={currentSong}
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onNext={playNext}
          onPrevious={playPrevious}
          playlist={currentPlaylist}
          currentIndex={currentIndex}
          autoplay={autoplay}
          onAutoplayToggle={() => setAutoplay(!autoplay)}
          onSongEnd={() => {
            if (autoplay && currentIndex < currentPlaylist.length - 1) {
              playNext()
            } else {
              setIsPlaying(false)
            }
          }}
          onRecentUpdate={refreshUserData}
          userId={currentUser.id}
        />
      )}

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
