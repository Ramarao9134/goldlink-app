"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { UploadButton } from "@/components/upload-button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function ApplyPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [formData, setFormData] = useState({
    ownerId: "",
    karat: "22K",
    weightGrams: "",
    notes: "",
  })
  const [photos, setPhotos] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Fetch owners list
  const [owners, setOwners] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    fetch("/api/users?role=OWNER")
      .then((res) => res.json())
      .then((data) => {
        if (data.users) {
          setOwners(data.users)
          if (data.users.length > 0) {
            setFormData((prev) => ({ ...prev, ownerId: data.users[0].id }))
          }
        }
      })
      .catch(console.error)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!formData.ownerId) {
      setError("Please select an owner")
      setLoading(false)
      return
    }

    if (photos.length === 0) {
      setError("Please upload at least one photo")
      setLoading(false)
      return
    }

    if (parseFloat(formData.weightGrams) <= 0) {
      setError("Weight must be greater than 0")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId: formData.ownerId,
          karat: formData.karat,
          weightGrams: parseFloat(formData.weightGrams),
          photos,
          notes: formData.notes || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to submit application")
        setLoading(false)
        return
      }

      router.push("/dashboard")
    } catch (err) {
      setError("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-amber-600">GoldLink</h1>
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Apply to Owner</CardTitle>
            <CardDescription>
              Submit your gold item details for review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="ownerId">Select Owner/Jeweler</Label>
                <select
                  id="ownerId"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.ownerId}
                  onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
                  required
                >
                  <option value="">Select an owner</option>
                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="karat">Karat</Label>
                <select
                  id="karat"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.karat}
                  onChange={(e) => setFormData({ ...formData, karat: e.target.value })}
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
                  placeholder="10.5"
                  value={formData.weightGrams}
                  onChange={(e) =>
                    setFormData({ ...formData, weightGrams: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Item Photos</Label>
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    const urls = res.map((file) => file.url)
                    setPhotos((prev) => [...prev, ...urls])
                  }}
                  onUploadError={(error) => {
                    setError(`Upload failed: ${error.message}`)
                  }}
                />
                {photos.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {photos.map((photo, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={photo}
                          alt={`Item ${idx + 1}`}
                          className="w-full h-24 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <textarea
                  id="notes"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Any additional details about your gold item..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Submitting..." : "Submit Application"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

