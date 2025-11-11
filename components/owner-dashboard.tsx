"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"

interface Application {
  id: string
  karat: string
  weightGrams: number
  photos: string[] | string
  notes?: string
  status: string
  createdAt: string
  customer: { name: string; email: string; phone?: string }
  settlement?: any
}

export function OwnerDashboard() {
  const { data: session } = useSession()
  const [applications, setApplications] = useState<Application[]>([])
  const [settlements, setSettlements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [approveData, setApproveData] = useState<{
    appId: string
    principalAmount: string
  } | null>(null)

  useEffect(() => {
    if (session) {
      fetchData()
    }
  }, [session])

  const fetchData = async () => {
    try {
      const [appsRes, settlementsRes] = await Promise.all([
        fetch("/api/applications"),
        fetch("/api/settlements"),
      ])
      const appsData = await appsRes.json()
      const settlementsData = await settlementsRes.json()
      setApplications(appsData.applications || [])
      setSettlements(settlementsData.settlements || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (appId: string) => {
    if (!approveData || approveData.appId !== appId) {
      setApproveData({
        appId,
        principalAmount: "",
      })
      return
    }

    try {
      const res = await fetch(`/api/applications/${appId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          principalAmount: parseFloat(approveData.principalAmount),
          interestRateMonthlyPct: 0.8, // Fixed 0.8% interest rate
        }),
      })

      if (res.ok) {
        setApproveData(null)
        fetchData()
        alert("Application approved successfully!")
      } else {
        const error = await res.json()
        const errorMessage = error.error || error.details?.[0]?.message || "Failed to approve application"
        alert(errorMessage)
      }
    } catch (error) {
      console.error("Error approving application:", error)
      alert("Failed to approve application")
    }
  }

  const handleReject = async (appId: string) => {
    if (!confirm("Are you sure you want to reject this application?")) {
      return
    }

    try {
      const res = await fetch(`/api/applications/${appId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Rejected by owner" }),
      })

      if (res.ok) {
        fetchData()
        alert("Application rejected")
      } else {
        alert("Failed to reject application")
      }
    } catch (error) {
      console.error("Error rejecting application:", error)
      alert("Failed to reject application")
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  const pendingApps = applications.filter((app) => app.status === "PENDING")
  const activeSettlements = settlements.filter(
    (s) => s.status === "ACTIVE"
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 relative">
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `linear-gradient(to right, rgba(184,134,11,0.2) 1px, transparent 1px),
                         linear-gradient(to bottom, rgba(184,134,11,0.2) 1px, transparent 1px)`,
        backgroundSize: '20px 20px'
      }}></div>
      <div className="relative space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 bg-clip-text text-transparent">
            Owner Dashboard
          </h1>
          <div className="flex gap-2">
            <Link href="/dashboard/owner-profile">
              <Button variant="outline" size="sm">
                Profile Settings
              </Button>
            </Link>
            <Link href="/dashboard/owner-settings">
              <Button variant="outline" size="sm">
                Change Password
              </Button>
            </Link>
          </div>
        </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Incoming Applications</h2>
        <div className="grid gap-4">
          {pendingApps.map((app) => (
            <Card key={app.id} className="bg-white/80 backdrop-blur-sm shadow-lg border-amber-200">
              <CardHeader>
                <CardTitle>
                  {app.karat} - {app.weightGrams}g
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p>
                      <strong>Customer:</strong> {app.customer.name} (
                      {app.customer.email})
                    </p>
                    {app.customer.phone && (
                      <p>
                        <strong>Phone:</strong> {app.customer.phone}
                      </p>
                    )}
                    {app.notes && (
                      <p>
                        <strong>Notes:</strong> {app.notes}
                      </p>
                    )}
                  </div>
                  {app.photos && (
                    <div>
                      <p className="font-semibold mb-2">Photos:</p>
                      <div className="flex gap-2 flex-wrap">
                        {(() => {
                          const photoArray = Array.isArray(app.photos) 
                            ? app.photos 
                            : (typeof app.photos === 'string' ? app.photos.split(",").filter(Boolean) : [])
                          return photoArray.length > 0 ? photoArray.map((photo: string, idx: number) => (
                          <div key={idx} className="relative group">
                            <img
                              src={photo.trim()}
                              alt={`Item ${idx + 1}`}
                              className="w-32 h-32 object-cover rounded-lg border-2 border-amber-300 shadow-md hover:scale-105 transition-transform cursor-pointer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Crect fill='%23fbbf24'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='white' font-size='14'%3EImage%3C/text%3E%3C/svg%3E"
                              }}
                            />
                          </div>
                          )) : null
                        })()}
                      </div>
                    </div>
                  )}
                  {approveData?.appId === app.id ? (
                    <div className="space-y-2 p-4 bg-muted rounded-lg">
                      <Label>Principal Amount (₹)</Label>
                      <Input
                        type="number"
                        value={approveData.principalAmount}
                        onChange={(e) =>
                          setApproveData({
                            ...approveData,
                            principalAmount: e.target.value,
                          })
                        }
                        placeholder="Enter principal amount"
                      />
                      <div className="space-y-2">
                        <Label>Monthly Interest Rate (%)</Label>
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                          <p className="text-lg font-semibold text-amber-800">0.8%</p>
                          <p className="text-xs text-amber-700">Fixed interest rate for all loans</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(app.id)}
                          disabled={!approveData.principalAmount}
                        >
                          Confirm Approval
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setApproveData(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={() => handleApprove(app.id)}>
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleReject(app.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {pendingApps.length === 0 && (
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-amber-200">
              <CardContent className="py-8 text-center text-muted-foreground">
                No pending applications
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Active Settlements</h2>
        <div className="grid gap-4">
          {activeSettlements.map((settlement) => (
            <Card key={settlement.id} className="bg-white/80 backdrop-blur-sm shadow-lg border-amber-200">
              <CardHeader>
                <CardTitle>
                  Settlement - {formatCurrency(settlement.principalAmount)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-xs text-amber-700 mb-1">Customer</p>
                      <p className="font-semibold text-amber-900">{settlement.application.customer.name}</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-xs text-amber-700 mb-1">Principal Amount</p>
                      <p className="font-semibold text-amber-900">{formatCurrency(settlement.principalAmount)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-xs text-yellow-700 mb-1">Interest Rate</p>
                      <p className="font-semibold text-yellow-900">{settlement.interestRateMonthlyPct}% per month</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="text-xs text-orange-700 mb-1">Next Due Date</p>
                      <p className="font-semibold text-orange-900">{formatDate(settlement.nextDueDate)}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700 mb-1">Total Payments Received</p>
                    <p className="font-semibold text-blue-900 text-lg">{settlement.payments.length} payment(s)</p>
                    {settlement.payments.length > 0 && (
                      <p className="text-xs text-blue-600 mt-1">
                        Total: {formatCurrency(settlement.payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0))}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {activeSettlements.length === 0 && (
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-amber-200">
              <CardContent className="py-8 text-center text-muted-foreground">
                No active settlements
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}

