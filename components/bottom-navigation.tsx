"use client"

import { Button } from "@/components/ui/button"
import { Home, Search, List, Clock, Music } from "lucide-react"

interface BottomNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: "home", icon: Home, label: "Home" },
    { id: "search", icon: Search, label: "Search" },
    { id: "playlists", icon: List, label: "Playlists" },
    { id: "recent", icon: Clock, label: "Recent" },
    { id: "player", icon: Music, label: "Player" },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-white/20 z-40">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Button
              key={tab.id}
              size="icon"
              variant="ghost"
              onClick={() => onTabChange(tab.id)}
              className={`w-12 h-12 flex flex-col items-center justify-center gap-1 ${
                activeTab === tab.id
                  ? "text-purple-600 bg-purple-100"
                  : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{tab.label}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
