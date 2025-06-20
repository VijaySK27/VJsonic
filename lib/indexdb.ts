import type { Song, Playlist, User } from "@/types/music"

const DB_NAME = "VJSonicPlayer"
const DB_VERSION = 2
const USERS_STORE = "users"
const PLAYLISTS_STORE = "playlists"
const RECENTLY_PLAYED_STORE = "recentlyPlayed"
const CURRENT_USER_STORE = "currentUser"

let db: IDBDatabase | null = null

export async function initDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve()
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result

      // Create users store
      if (!database.objectStoreNames.contains(USERS_STORE)) {
        const usersStore = database.createObjectStore(USERS_STORE, { keyPath: "id" })
        usersStore.createIndex("username", "username", { unique: true })
      }

      // Create playlists store
      if (!database.objectStoreNames.contains(PLAYLISTS_STORE)) {
        const playlistsStore = database.createObjectStore(PLAYLISTS_STORE, { keyPath: "id" })
        playlistsStore.createIndex("userId", "userId", { unique: false })
      }

      // Create recently played store
      if (!database.objectStoreNames.contains(RECENTLY_PLAYED_STORE)) {
        const recentStore = database.createObjectStore(RECENTLY_PLAYED_STORE, { keyPath: "id" })
        recentStore.createIndex("userId", "userId", { unique: false })
        recentStore.createIndex("timestamp", "timestamp", { unique: false })
      }

      // Create current user store
      if (!database.objectStoreNames.contains(CURRENT_USER_STORE)) {
        database.createObjectStore(CURRENT_USER_STORE, { keyPath: "id" })
      }
    }
  })
}

// User functions
export async function createUser(username: string, password: string): Promise<User> {
  if (!db) throw new Error("Database not initialized")

  const user: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    username,
    password,
    createdAt: Date.now(),
  }

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([USERS_STORE, CURRENT_USER_STORE], "readwrite")
    const usersStore = transaction.objectStore(USERS_STORE)
    const currentUserStore = transaction.objectStore(CURRENT_USER_STORE)

    // Check if username already exists
    const usernameIndex = usersStore.index("username")
    const checkRequest = usernameIndex.get(username)

    checkRequest.onsuccess = () => {
      if (checkRequest.result) {
        reject(new Error("Username already exists"))
        return
      }

      // Add user
      const addRequest = usersStore.add(user)
      addRequest.onerror = () => reject(addRequest.error)
      addRequest.onsuccess = () => {
        // Set as current user
        const setCurrentRequest = currentUserStore.put({ id: "current", userId: user.id })
        setCurrentRequest.onerror = () => reject(setCurrentRequest.error)
        setCurrentRequest.onsuccess = () => resolve(user)
      }
    }

    checkRequest.onerror = () => reject(checkRequest.error)
  })
}

export async function loginUser(username: string, password: string): Promise<User> {
  if (!db) throw new Error("Database not initialized")

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([USERS_STORE, CURRENT_USER_STORE], "readwrite")
    const usersStore = transaction.objectStore(USERS_STORE)
    const currentUserStore = transaction.objectStore(CURRENT_USER_STORE)

    const usernameIndex = usersStore.index("username")
    const request = usernameIndex.get(username)

    request.onsuccess = () => {
      const user = request.result
      if (!user) {
        reject(new Error("User not found"))
        return
      }

      if (user.password !== password) {
        reject(new Error("Invalid password"))
        return
      }

      // Set as current user
      const setCurrentRequest = currentUserStore.put({ id: "current", userId: user.id })
      setCurrentRequest.onerror = () => reject(setCurrentRequest.error)
      setCurrentRequest.onsuccess = () => resolve(user)
    }

    request.onerror = () => reject(request.error)
  })
}

export async function getAllUsers(): Promise<User[]> {
  if (!db) throw new Error("Database not initialized")

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([USERS_STORE], "readonly")
    const store = transaction.objectStore(USERS_STORE)
    const request = store.getAll()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result || [])
  })
}

export async function getCurrentUser(): Promise<User | null> {
  if (!db) throw new Error("Database not initialized")

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([CURRENT_USER_STORE, USERS_STORE], "readonly")
    const currentUserStore = transaction.objectStore(CURRENT_USER_STORE)
    const usersStore = transaction.objectStore(USERS_STORE)

    const getCurrentRequest = currentUserStore.get("current")
    getCurrentRequest.onerror = () => reject(getCurrentRequest.error)
    getCurrentRequest.onsuccess = () => {
      const currentUserData = getCurrentRequest.result
      if (!currentUserData) {
        resolve(null)
        return
      }

      const getUserRequest = usersStore.get(currentUserData.userId)
      getUserRequest.onerror = () => reject(getUserRequest.error)
      getUserRequest.onsuccess = () => resolve(getUserRequest.result || null)
    }
  })
}

export async function deleteUser(userId: string): Promise<void> {
  if (!db) throw new Error("Database not initialized")

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(
      [USERS_STORE, PLAYLISTS_STORE, RECENTLY_PLAYED_STORE, CURRENT_USER_STORE],
      "readwrite",
    )
    const usersStore = transaction.objectStore(USERS_STORE)
    const playlistsStore = transaction.objectStore(PLAYLISTS_STORE)
    const recentStore = transaction.objectStore(RECENTLY_PLAYED_STORE)
    const currentUserStore = transaction.objectStore(CURRENT_USER_STORE)

    // Delete user
    const deleteUserRequest = usersStore.delete(userId)
    deleteUserRequest.onerror = () => reject(deleteUserRequest.error)

    // Delete user's playlists
    const playlistIndex = playlistsStore.index("userId")
    const playlistRequest = playlistIndex.openCursor(IDBKeyRange.only(userId))
    playlistRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result
      if (cursor) {
        cursor.delete()
        cursor.continue()
      }
    }

    // Delete user's recently played
    const recentIndex = recentStore.index("userId")
    const recentRequest = recentIndex.openCursor(IDBKeyRange.only(userId))
    recentRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result
      if (cursor) {
        cursor.delete()
        cursor.continue()
      }
    }

    // Clear current user if it's this user
    const getCurrentRequest = currentUserStore.get("current")
    getCurrentRequest.onsuccess = () => {
      const currentUserData = getCurrentRequest.result
      if (currentUserData && currentUserData.userId === userId) {
        currentUserStore.delete("current")
      }
    }

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

// Playlist functions
export async function createPlaylist(userId: string, name: string, songs: Song[]): Promise<string> {
  if (!db) throw new Error("Database not initialized")

  const playlist: Playlist = {
    id: `playlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    songs,
    createdAt: Date.now(),
    userId,
  }

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([PLAYLISTS_STORE], "readwrite")
    const store = transaction.objectStore(PLAYLISTS_STORE)
    const request = store.add(playlist)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(playlist.id)
  })
}

export async function getPlaylists(userId: string): Promise<Playlist[]> {
  if (!db) throw new Error("Database not initialized")

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([PLAYLISTS_STORE], "readonly")
    const store = transaction.objectStore(PLAYLISTS_STORE)
    const index = store.index("userId")
    const request = index.getAll(userId)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result || [])
  })
}

export async function addSongToPlaylist(userId: string, playlistId: string, song: Song): Promise<void> {
  if (!db) throw new Error("Database not initialized")

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([PLAYLISTS_STORE], "readwrite")
    const store = transaction.objectStore(PLAYLISTS_STORE)
    const getRequest = store.get(playlistId)

    getRequest.onerror = () => reject(getRequest.error)
    getRequest.onsuccess = () => {
      const playlist = getRequest.result
      if (!playlist || playlist.userId !== userId) {
        reject(new Error("Playlist not found or access denied"))
        return
      }

      // Check if song already exists in playlist
      const songExists = playlist.songs.some((s: Song) => s.id === song.id)
      if (songExists) {
        resolve()
        return
      }

      playlist.songs.push(song)

      const putRequest = store.put(playlist)
      putRequest.onerror = () => reject(putRequest.error)
      putRequest.onsuccess = () => resolve()
    }
  })
}

export async function removeSongFromPlaylist(userId: string, playlistId: string, songId: string): Promise<void> {
  if (!db) throw new Error("Database not initialized")

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([PLAYLISTS_STORE], "readwrite")
    const store = transaction.objectStore(PLAYLISTS_STORE)
    const getRequest = store.get(playlistId)

    getRequest.onerror = () => reject(getRequest.error)
    getRequest.onsuccess = () => {
      const playlist = getRequest.result
      if (!playlist || playlist.userId !== userId) {
        reject(new Error("Playlist not found or access denied"))
        return
      }

      playlist.songs = playlist.songs.filter((song: Song) => song.id !== songId)

      const putRequest = store.put(playlist)
      putRequest.onerror = () => reject(putRequest.error)
      putRequest.onsuccess = () => resolve()
    }
  })
}

export async function deletePlaylist(userId: string, playlistId: string): Promise<void> {
  if (!db) throw new Error("Database not initialized")

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([PLAYLISTS_STORE], "readwrite")
    const store = transaction.objectStore(PLAYLISTS_STORE)
    const getRequest = store.get(playlistId)

    getRequest.onerror = () => reject(getRequest.error)
    getRequest.onsuccess = () => {
      const playlist = getRequest.result
      if (!playlist || playlist.userId !== userId) {
        reject(new Error("Playlist not found or access denied"))
        return
      }

      const deleteRequest = store.delete(playlistId)
      deleteRequest.onerror = () => reject(deleteRequest.error)
      deleteRequest.onsuccess = () => resolve()
    }
  })
}

// Recently played functions
export async function addToRecentlyPlayed(userId: string, song: Song): Promise<void> {
  if (!db) throw new Error("Database not initialized")

  const recentItem = {
    id: `${userId}_${song.id}`,
    userId,
    ...song,
    timestamp: Date.now(),
  }

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([RECENTLY_PLAYED_STORE], "readwrite")
    const store = transaction.objectStore(RECENTLY_PLAYED_STORE)

    // Remove existing entry if it exists
    const deleteRequest = store.delete(recentItem.id)
    deleteRequest.onsuccess = () => {
      // Add the song with new timestamp
      const addRequest = store.add(recentItem)
      addRequest.onerror = () => reject(addRequest.error)
      addRequest.onsuccess = () => {
        // Keep only the last 50 items for this user
        cleanupRecentlyPlayed(userId)
          .then(() => resolve())
          .catch(reject)
      }
    }
    deleteRequest.onerror = () => {
      // If delete fails (item doesn't exist), just add it
      const addRequest = store.add(recentItem)
      addRequest.onerror = () => reject(addRequest.error)
      addRequest.onsuccess = () => {
        cleanupRecentlyPlayed(userId)
          .then(() => resolve())
          .catch(reject)
      }
    }
  })
}

async function cleanupRecentlyPlayed(userId: string): Promise<void> {
  if (!db) return

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([RECENTLY_PLAYED_STORE], "readwrite")
    const store = transaction.objectStore(RECENTLY_PLAYED_STORE)
    const index = store.index("userId")
    const request = index.openCursor(IDBKeyRange.only(userId), "prev")

    let count = 0
    const itemsToDelete: string[] = []

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result
      if (cursor) {
        count++
        if (count > 50) {
          itemsToDelete.push(cursor.value.id)
        }
        cursor.continue()
      } else {
        // Delete excess items
        const deletePromises = itemsToDelete.map((id) => {
          return new Promise<void>((deleteResolve, deleteReject) => {
            const deleteRequest = store.delete(id)
            deleteRequest.onsuccess = () => deleteResolve()
            deleteRequest.onerror = () => deleteReject(deleteRequest.error)
          })
        })

        Promise.all(deletePromises)
          .then(() => resolve())
          .catch(reject)
      }
    }

    request.onerror = () => reject(request.error)
  })
}

export async function getRecentlyPlayed(userId: string): Promise<Song[]> {
  if (!db) throw new Error("Database not initialized")

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([RECENTLY_PLAYED_STORE], "readonly")
    const store = transaction.objectStore(RECENTLY_PLAYED_STORE)
    const index = store.index("userId")
    const request = index.openCursor(IDBKeyRange.only(userId), "prev")

    const results: Song[] = []

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result
      if (cursor) {
        const { timestamp, userId: _, ...song } = cursor.value
        results.push(song as Song)
        cursor.continue()
      } else {
        resolve(results)
      }
    }

    request.onerror = () => reject(request.error)
  })
}
