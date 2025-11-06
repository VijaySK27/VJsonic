import type { Song, SearchResponse } from "@/types/music"

const API_BASE_URL = "https://saavn.sumit.co/api";

export async function searchSongs(query: string): Promise<Song[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/search/songs?query=${encodeURIComponent(query)}`)

    if (!response.ok) {
      throw new Error("Search request failed")
    }

    const data: SearchResponse = await response.json()

    if (!data.success) {
      throw new Error("Search was not successful")
    }

    return data.data.results
  } catch (error) {
    console.error("Error searching songs:", error)
    throw error
  }
}
