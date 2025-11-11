"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LocalUploadButton } from "@/components/local-upload-button"

interface Owner {
  id: string
  name: string
  email: string
}

export default function ApplyPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [owners, setOwners] = useState<Owner[]>([])
  const [formData, setFormData] = useState({
    ownerId: "",
    karat: "22K" as "22K" | "24K",
    weightGrams: "",
    photos: [] as string[],
    notes: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!session) {
      router.push("/auth/login")
      return
    }

    fetchOwners()
  }, [session, router])

  const fetchOwners = async () => {
    try {
      const res = await fetch("/api/users")
      const data = await res.json()
      setOwners(data.owners || [])
    } catch (error) {
      console.error("Error fetching owners:", error)
    }
  }

  const handleUploadComplete = (urls: string[]) => {
    setFormData({ ...formData, photos: [...formData.photos, ...urls] })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!formData.ownerId) {
      setError("Please select an owner")
      setLoading(false)
      return
    }

    if (formData.photos.length === 0) {
      setError("Please upload at least one photo")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          weightGrams: parseFloat(formData.weightGrams),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to create application")
        return
      }

      router.push("/dashboard")
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Apply to Owner</CardTitle>
            <CardDescription>
              Submit your gold item details for review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="owner">Select Owner</Label>
                <select
                  id="owner"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.ownerId}
                  onChange={(e) =>
                    setFormData({ ...formData, ownerId: e.target.value })
                  }
                  required
                >
                  <option value="">Select an owner...</option>
                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} ({owner.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="karat">Karat</Label>
                <select
                  id="karat"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.karat}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      karat: e.target.value as "22K" | "24K",
                    })
                  }
                  required
                >
                  <option value="22K">22K</option>
                  <option value="24K">24K</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weightGrams">Weight (grams)</Label>
                <Input
                  id="weightGrams"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Enter weight in grams"
                  value={formData.weightGrams}
                  onChange={(e) =>
                    setFormData({ ...formData, weightGrams: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Photos</Label>
                <LocalUploadButton onUploadComplete={handleUploadComplete} />
                {formData.photos.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {formData.photos.map((photo, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={photo}
                          alt={`Item ${idx + 1}`}
                          className="w-full h-32 object-cover rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              photos: formData.photos.filter((_, i) => i !== idx),
                            })
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <textarea
                  id="notes"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Any additional information..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Application"}
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

