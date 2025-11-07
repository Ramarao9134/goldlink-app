"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/utils"
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"

interface Application {
  id: string
  karat: string
  weightGrams: number
  photos: string[]
  notes: string | null
  status: string
  createdAt: string
  customer: {
    name: string
    email: string
  }
}

interface Settlement {
  id: string
  principalAmount: number
  interestRateMonthlyPct: number
  nextDueDate: string
  status: string
  customer: {
    name: string
  }
}

export function OwnerDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchData()
    }
  }, [session])

  const fetchData = async () => {
    try {
      const [appsRes, settlementsRes] = await Promise.all([
        fetch("/api/applications?role=owner"),
        fetch("/api/settlements?role=owner"),
      ])

      if (appsRes.ok) {
        const appsData = await appsRes.json()
        setApplications(appsData.applications || [])
      }

      if (settlementsRes.ok) {
        const settlementsData = await settlementsRes.json()
        setSettlements(settlementsData.settlements || [])
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (applicationId: string) => {
    const principalAmount = prompt("Enter principal amount (INR):")
    const interestRate = prompt("Enter monthly interest rate (%):")

    if (!principalAmount || !interestRate) return

    try {
      const res = await fetch(`/api/applications/${applicationId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          principalAmount: parseFloat(principalAmount),
          interestRateMonthlyPct: parseFloat(interestRate),
        }),
      })

      if (res.ok) {
        fetchData()
      } else {
        alert("Failed to approve application")
      }
    } catch (error) {
      console.error("Error approving application:", error)
      alert("An error occurred")
    }
  }

  const handleReject = async (applicationId: string) => {
    const reason = prompt("Enter rejection reason:")

    if (!reason) return

    try {
      const res = await fetch(`/api/applications/${applicationId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      })

      if (res.ok) {
        fetchData()
      } else {
        alert("Failed to reject application")
      }
    } catch (error) {
      console.error("Error rejecting application:", error)
      alert("An error occurred")
    }
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  if (loading) {
    return <div className="container mx-auto p-8">Loading...</div>
  }

  const pendingApps = applications.filter((app) => app.status === "PENDING")

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-amber-600">GoldLink - Owner Dashboard</h1>
          <div className="flex gap-4 items-center">
            <span className="text-sm text-gray-600">Welcome, {session?.user?.name}</span>
            <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8">Owner Dashboard</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Pending Applications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Pending Applications ({pendingApps.length})
              </CardTitle>
              <CardDescription>Review and approve/reject applications</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingApps.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No pending applications</p>
              ) : (
                <div className="space-y-4">
                  {pendingApps.map((app) => (
                    <div key={app.id} className="p-4 border rounded-lg">
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{app.karat} Gold</span>
                          <span className="text-sm text-gray-600">
                            {app.weightGrams}g
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Customer: {app.customer.name} ({app.customer.email})
                        </div>
                        {app.notes && (
                          <div className="text-sm text-gray-600 mt-1">
                            Notes: {app.notes}
                          </div>
                        )}
                        {(() => {
                          try {
                            const photos = typeof app.photos === 'string' ? JSON.parse(app.photos) : app.photos;
                            return photos && photos.length > 0 && (
                              <div className="mt-2 flex gap-2">
                                {photos.slice(0, 3).map((photo: string, idx: number) => (
                                  <img
                                    key={idx}
                                    src={photo}
                                    alt={`Item ${idx + 1}`}
                                    className="w-16 h-16 object-cover rounded border"
                                  />
                                ))}
                              </div>
                            );
                          } catch {
                            return null;
                          }
                        })()}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(app.id)}
                          className="flex-1"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(app.id)}
                          className="flex-1"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Settlements */}
          <Card>
            <CardHeader>
              <CardTitle>Active Settlements</CardTitle>
              <CardDescription>Track active loans and payments</CardDescription>
            </CardHeader>
            <CardContent>
              {settlements.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No active settlements</p>
              ) : (
                <div className="space-y-4">
                  {settlements.map((settlement) => {
                    const overdue = isOverdue(settlement.nextDueDate)

                    return (
                      <div
                        key={settlement.id}
                        className={`p-4 border rounded-lg ${
                          overdue ? "border-red-300 bg-red-50" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">
                            {formatCurrency(settlement.principalAmount)}
                          </span>
                          {overdue && (
                            <span className="text-xs text-red-600 font-semibold flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              OVERDUE
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          Customer: {settlement.customer.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          Interest: {settlement.interestRateMonthlyPct}% per month
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          Next Due: {formatDate(settlement.nextDueDate)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

