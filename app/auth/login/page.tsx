"use client"

import { useState, useEffect, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Scene3D } from "@/components/3d-scene"
import Link from "next/link"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isOwnerLogin, setIsOwnerLogin] = useState(false)

  useEffect(() => {
    if (searchParams?.get("registered") === "true") {
      setSuccess(true)
    }
    if (searchParams?.get("owner") === "true") {
      setIsOwnerLogin(true)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Handle owner login - NextAuth will handle it directly now
      if (isOwnerLogin) {
        // Ensure email is set correctly
        const ownerEmail = "owner@goldlink.com"
        if (email !== ownerEmail) {
          setEmail(ownerEmail)
        }
      }
      
      // Use NextAuth for both customer and owner login
      const result = await signIn("credentials", {
        email: isOwnerLogin ? "owner@goldlink.com" : email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(isOwnerLogin ? "Invalid owner credentials" : "Invalid email or password")
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-amber-900 via-yellow-900 to-orange-900">
      <Scene3D />
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-md shadow-2xl border-amber-300">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Login</CardTitle>
            <CardDescription className="text-center">
              Sign in to your <span className="font-semibold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">GoldLink</span> account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {success && (
                <p className="text-sm text-green-600 bg-green-50 p-3 rounded">
                  Registration successful! Please sign in.
                </p>
              )}
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            <div className="mt-4 space-y-2">
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Don&apos;t have an account? </span>
                <Link href="/auth/register" className="text-primary hover:underline">
                  Register
                </Link>
              </div>
              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-xs"
                  onClick={() => {
                    setIsOwnerLogin(!isOwnerLogin)
                    setEmail(isOwnerLogin ? "" : "owner@goldlink.com")
                  }}
                >
                  {isOwnerLogin ? "Customer Login" : "Owner Login"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-amber-900 via-yellow-900 to-orange-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

