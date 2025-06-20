export interface Song {
  id: string
  name: string
  type: string
  year: string
  releaseDate: string | null
  duration: number
  label: string
  explicitContent: boolean
  playCount: number
  language: string
  hasLyrics: boolean
  lyricsId: string | null
  url: string
  copyright: string
  album: {
    id: string
    name: string
    url: string
  }
  artists: {
    primary: Artist[]
    featured: Artist[]
    all: Artist[]
  }
  image: ImageQuality[]
  downloadUrl: DownloadQuality[]
}

export interface Artist {
  id: string
  name: string
  role: string
  image: ImageQuality[]
  type: string
  url: string
}

export interface ImageQuality {
  quality: string
  url: string
}

export interface DownloadQuality {
  quality: string
  url: string
}

export interface Playlist {
  id: string
  name: string
  songs: Song[]
  createdAt: number
  userId: string
}

export interface User {
  id: string
  username: string
  password: string
  createdAt: number
}

export interface SearchResponse {
  success: boolean
  data: {
    total: number
    start: number
    results: Song[]
  }
}
