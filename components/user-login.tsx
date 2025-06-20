"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Music, User, Trash2, Eye, EyeOff } from "lucide-react"
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
      toast({
        title: "Missing Information",
        description: "Please enter both username and password.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const user = await loginUser(username.trim(), password)
      onLogin(user)
      toast({
        title: "Welcome back!",
        description: `Successfully signed in as ${username}.`,
      })
    } catch (error) {
      toast({
        title: "Sign In Failed",
        description: error instanceof Error ? error.message : "Invalid credentials.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUser = async () => {
    if (!username.trim() || !password.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter username and password.",
        variant: "destructive",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const user = await createUser(username.trim(), password)
      onLogin(user)
      toast({
        title: "Account Created!",
        description: `Welcome to VJ Sonic, ${username}!`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create account.",
        variant: "destructive",
      })
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

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return
    }

    try {
      await deleteUser(userId)
      setExistingUsers(existingUsers.filter((user) => user.id !== userId))
      toast({
        title: "User Deleted",
        description: `User "${username}" deleted successfully.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      })
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Music className="w-16 h-16 text-purple-400" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">VJ</span>
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">VJ Sonic</CardTitle>
          <p className="text-purple-200">Your ultimate Tamil music experience</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showExistingUsers ? (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                  />
                </div>
                <div className="space-y-2 relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (isLogin ? handleLogin() : handleCreateUser())}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/70 pr-10"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 text-white/70 hover:text-white hover:bg-white/10"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {!isLogin && (
                  <div className="space-y-2 relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleCreateUser()}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/70 pr-10"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 text-white/70 hover:text-white hover:bg-white/10"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                )}
                {!isLogin && <p className="text-xs text-purple-200">Password must be at least 6 characters long</p>}
              </div>
              <Button
                onClick={isLogin ? handleLogin : handleCreateUser}
                disabled={
                  isLoading ||
                  !username.trim() ||
                  !password.trim() ||
                  (!isLogin && password !== confirmPassword) ||
                  (!isLogin && password.length < 6)
                }
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? (isLogin ? "Signing in..." : "Creating...") : isLogin ? "Sign In" : "Create Account"}
              </Button>
              <Button
                onClick={() => {
                  setIsLogin(!isLogin)
                  setPassword("")
                  setConfirmPassword("")
                }}
                variant="outline"
                className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                {isLogin ? "Create New Account" : "Already have an account? Sign In"}
              </Button>
              <Button
                onClick={loadExistingUsers}
                variant="outline"
                className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <User className="w-4 h-4 mr-2" />
                Browse Users
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <h3 className="text-white font-semibold">Select User</h3>
                {existingUsers.length === 0 ? (
                  <p className="text-purple-200 text-sm">No users found.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {existingUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                      >
                        <button
                          onClick={() => handleSelectUser(user)}
                          className="flex items-center gap-3 flex-1 text-left"
                        >
                          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-white">{user.username}</span>
                        </button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteUser(user.id, user.username)}
                          className="w-8 h-8 text-red-400 hover:bg-red-400/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button
                onClick={resetForm}
                variant="outline"
                className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                Back to Login
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
