"use client"

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
    <div
      className="fixed bottom-0 left-0 right-0 z-40 border-t"
      style={{
        background: 'hsl(240 43% 8% / 0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderColor: 'hsl(240 30% 17%)',
      }}
    >
      <div className="flex items-center justify-around px-2 py-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl min-w-[56px] transition-all duration-200"
              style={{
                color: isActive ? 'hsl(42 93% 58%)' : 'hsl(252 12% 54%)',
                background: isActive ? 'hsl(42 93% 58% / 0.08)' : 'transparent',
              }}
            >
              {/* Active indicator dot */}
              <div
                className="w-1 h-1 rounded-full mb-0.5 transition-all duration-200"
                style={{
                  background: isActive ? 'hsl(42 93% 58%)' : 'transparent',
                  boxShadow: isActive ? '0 0 6px hsl(42 93% 58% / 0.8)' : 'none',
                }}
              />
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
