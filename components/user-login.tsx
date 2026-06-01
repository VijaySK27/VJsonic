"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, User, Trash2, ChevronLeft } from "lucide-react"
import type { User as UserType } from "@/types/music"
import { createUser, getAllUsers, deleteUser, loginUser } from "@/lib/indexdb"
import { toast } from "@/hooks/use-toast"

interface UserLoginProps {
  onLogin: (user: UserType) => void
}

export function UserLogin({ onLogin }: UserLoginProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [existingUsers, setExistingUsers] = useState<UserType[]>([])
  const [showExistingUsers, setShowExistingUsers] = useState(false)

  const loadExistingUsers = async () => {
    const users = await getAllUsers()
    setExistingUsers(users)
    setShowExistingUsers(true)
  }

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      toast({ title: "Missing Information", description: "Please enter both username and password.", variant: "destructive" })
      return
    }
    setIsLoading(true)
    try {
      const user = await loginUser(username.trim(), password)
      onLogin(user)
      toast({ title: "Welcome back!", description: `Signed in as ${username}.` })
    } catch (error) {
      toast({ title: "Sign In Failed", description: error instanceof Error ? error.message : "Invalid credentials.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUser = async () => {
    if (!username.trim() || !password.trim()) {
      toast({ title: "Missing Information", description: "Please enter username and password.", variant: "destructive" })
      return
    }
    if (password !== confirmPassword) {
      toast({ title: "Password Mismatch", description: "Passwords do not match.", variant: "destructive" })
      return
    }
    if (password.length < 6) {
      toast({ title: "Weak Password", description: "Password must be at least 6 characters.", variant: "destructive" })
      return
    }
    setIsLoading(true)
    try {
      const user = await createUser(username.trim(), password)
      onLogin(user)
      toast({ title: "Account Created!", description: `Welcome to VJ Sonic, ${username}!` })
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to create account.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectUser = (user: UserType) => {
    setUsername(user.username)
    setPassword("")
    setIsLogin(true)
    setShowExistingUsers(false)
  }

  const handleDeleteUser = async (userId: string, uname: string) => {
    if (!confirm(`Delete user "${uname}"? This cannot be undone.`)) return
    try {
      await deleteUser(userId)
      setExistingUsers(existingUsers.filter((u) => u.id !== userId))
      toast({ title: "User Deleted", description: `"${uname}" deleted successfully.` })
    } catch {
      toast({ title: "Error", description: "Failed to delete user.", variant: "destructive" })
    }
  }

  const resetForm = () => {
    setUsername("")
    setPassword("")
    setConfirmPassword("")
    setIsLogin(true)
    setShowExistingUsers(false)
  }

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center p-6 overflow-hidden">
      {/* Background atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[140px] animate-float-a"
          style={{ background: 'hsl(42 93% 58% / 0.1)' }}
        />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[450px] h-[450px] rounded-full blur-[120px] animate-float-b"
          style={{ background: 'hsl(322 80% 50% / 0.06)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, hsl(42 93% 58% / 0.05) 1.5px, transparent 1.5px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[380px] animate-scale-in">
        {!showExistingUsers ? (
          <>
            {/* Logo */}
            <div className="text-center mb-10">
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 border"
                style={{
                  background: 'hsl(42 93% 58% / 0.08)',
                  borderColor: 'hsl(42 93% 58% / 0.2)',
                  boxShadow: '0 0 32px hsl(42 93% 58% / 0.15)',
                }}
              >
                <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current" style={{ color: 'hsl(42 93% 58%)' }}>
                  <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3z" />
                </svg>
              </div>
              <h1 className="font-display text-5xl font-black text-gold-gradient tracking-tight mb-2">
                VJ Sonic
              </h1>
              <p className="text-muted-foreground text-sm">Your ultimate Tamil music experience</p>
            </div>

            {/* Tab toggle */}
            <div className="flex rounded-xl p-1 mb-6" style={{ background: 'hsl(240 38% 14%)' }}>
              <button
                onClick={() => { setIsLogin(true); setPassword(""); setConfirmPassword("") }}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: isLogin ? 'hsl(42 93% 58%)' : 'transparent',
                  color: isLogin ? 'hsl(238 50% 4%)' : 'hsl(252 12% 54%)',
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsLogin(false); setPassword(""); setConfirmPassword("") }}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: !isLogin ? 'hsl(42 93% 58%)' : 'transparent',
                  color: !isLogin ? 'hsl(238 50% 4%)' : 'hsl(252 12% 54%)',
                }}
              >
                Create Account
              </button>
            </div>

            {/* Form fields */}
            <div className="space-y-3 mb-5">
              <Input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
              />
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (isLogin ? handleLogin() : handleCreateUser())}
                  className="h-12 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {!isLogin && (
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleCreateUser()}
                    className="h-12 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              )}
              {!isLogin && (
                <p className="text-xs text-muted-foreground pl-1">Password must be at least 6 characters</p>
              )}
            </div>

            {/* Primary CTA */}
            <button
              onClick={isLogin ? handleLogin : handleCreateUser}
              disabled={
                isLoading ||
                !username.trim() ||
                !password.trim() ||
                (!isLogin && password !== confirmPassword) ||
                (!isLogin && password.length < 6)
              }
              className="w-full h-12 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
              style={{
                background: 'hsl(42 93% 58%)',
                color: 'hsl(238 50% 4%)',
                boxShadow: '0 0 24px hsl(42 93% 58% / 0.3)',
              }}
            >
              {isLoading ? (isLogin ? "Signing in…" : "Creating…") : isLogin ? "Sign In" : "Create Account"}
            </button>

            {/* Browse users */}
            <button
              onClick={loadExistingUsers}
              className="w-full h-11 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
              style={{ background: 'hsl(240 38% 14%)', border: '1px solid hsl(240 30% 17%)' }}
            >
              <User className="w-4 h-4" />
              Browse existing accounts
            </button>
          </>
        ) : (
          <>
            {/* Existing users panel */}
            <button
              onClick={resetForm}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to login
            </button>

            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold text-foreground mb-1">Choose Account</h2>
              <p className="text-sm text-muted-foreground">Select an account to sign in</p>
            </div>

            {existingUsers.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground text-sm">No accounts found.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {existingUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border transition-all duration-200 group hover:border-primary/30"
                    style={{ background: 'hsl(240 38% 14%)' }}
                  >
                    <button
                      onClick={() => handleSelectUser(user)}
                      className="flex items-center gap-3 flex-1 text-left"
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm"
                        style={{ background: 'hsl(42 93% 58% / 0.15)', color: 'hsl(42 93% 58%)' }}
                      >
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-foreground font-medium">{user.username}</span>
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
