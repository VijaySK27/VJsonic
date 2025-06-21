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
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            {currentSong ? (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Now Playing</h2>
                <div className="max-w-md mx-auto">
                  <img
                    src={currentSong.image[2]?.url || "/placeholder.svg?height=300&width=300"}
                    alt={currentSong.name}
                    className="w-full aspect-square object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-xl font-semibold text-white">{currentSong.name}</h3>
                  <p className="text-purple-200">{currentSong.artists.primary[0]?.name}</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-white">
                <Music className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                <p>No song selected. Search and play a song to get started!</p>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pb-32">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Music className="w-10 h-10 text-purple-400" />
            <div>
              <h1 className="text-4xl font-bold text-white">VJ Sonic</h1>
              <p className="text-purple-200">Your ultimate Tamil music experience</p>
            </div>
          </div>
          <UserProfile user={currentUser} onLogout={handleUserLogout} />
        </div>

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
