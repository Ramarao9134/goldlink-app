"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

export default function OwnerProfilePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    companyAddress: "",
    companyRanks: "",
    quality: "",
    achievements: "",
  })

  useEffect(() => {
    if (!session || session.user.role !== "OWNER") {
      router.push("/dashboard")
      return
    }
    fetchProfile()
  }, [session, router])

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/owner/profile")
      const data = await res.json()
      if (res.ok && data.owner) {
        setFormData({
          name: data.owner.name || "",
          companyName: data.owner.companyName || "",
          companyAddress: data.owner.companyAddress || "",
          companyRanks: data.owner.companyRanks || "",
          quality: data.owner.quality || "",
          achievements: data.owner.achievements || "",
        })
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const res = await fetch("/api/owner/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to update profile")
        return
      }

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-amber-200">
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
              Owner Profile Settings
            </CardTitle>
            <CardDescription>
              Update your company information and profile details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Owner Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                    placeholder="Enter company name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyAddress">Company Address</Label>
                <Textarea
                  id="companyAddress"
                  value={formData.companyAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, companyAddress: e.target.value })
                  }
                  placeholder="Enter full company address"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyRanks">Company Ranks & Certifications</Label>
                <Textarea
                  id="companyRanks"
                  value={formData.companyRanks}
                  onChange={(e) =>
                    setFormData({ ...formData, companyRanks: e.target.value })
                  }
                  placeholder="e.g., ISO Certified, Hallmark Certified, BIS Certified, etc."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Enter ranks and certifications (one per line or comma-separated)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quality">Quality Standards</Label>
                <Textarea
                  id="quality"
                  value={formData.quality}
                  onChange={(e) =>
                    setFormData({ ...formData, quality: e.target.value })
                  }
                  placeholder="e.g., 22K, 24K purity standards, Quality assurance processes, etc."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Describe your quality standards and certifications
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="achievements">Achievements & Awards</Label>
                <Textarea
                  id="achievements"
                  value={formData.achievements}
                  onChange={(e) =>
                    setFormData({ ...formData, achievements: e.target.value })
                  }
                  placeholder="e.g., Best Jeweler Award 2023, Customer Excellence Award, etc."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  List your achievements and awards (one per line or comma-separated)
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-600">
                  Profile updated successfully!
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

