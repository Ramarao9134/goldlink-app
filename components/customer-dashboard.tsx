"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { GoldRatesDisplay } from "./gold-rates-display"
import { formatCurrency, formatDate, isOverdue } from "@/lib/utils"
import Link from "next/link"

interface Application {
  id: string
  karat: string
  weightGrams: number
  status: string
  createdAt: string
  owner: { name: string; email: string }
  settlement?: {
    id: string
    principalAmount: number
    interestRateMonthlyPct: number
    nextDueDate: string
    status: string
    payments: any[]
  }
}

export function CustomerDashboard() {
  const { data: session } = useSession()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchApplications()
    }
  }, [session])

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/applications")
      const data = await res.json()
      setApplications(data.applications || [])
    } catch (error) {
      console.error("Error fetching applications:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async (settlementId: string) => {
    try {
      const res = await fetch(`/api/settlements/${settlementId}/pay`, {
        method: "POST",
      })
      const data = await res.json()

      if (data.success) {
        // Mock payment success
        alert(data.message || "Payment successful!")
        fetchApplications()
      } else if (data.orderId) {
        // Initialize Razorpay
        const script = document.createElement("script")
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        script.onload = () => {
          const options = {
            key: data.key,
            amount: data.amount * 100,
            currency: data.currency,
            name: "GoldLink",
            description: "Monthly Interest Payment",
            order_id: data.orderId,
            handler: function (response: any) {
              alert("Payment successful!")
              fetchApplications()
            },
            prefill: {
              email: session?.user?.email,
            },
            theme: {
              color: "#FFD700",
            },
          }
          const rzp = new (window as any).Razorpay(options)
          rzp.open()
        }
        document.body.appendChild(script)
      } else {
        alert(data.error || "Payment initiation failed")
      }
    } catch (error) {
      console.error("Error initiating payment:", error)
      alert("Payment initiation failed")
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 relative">
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
                         linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)`,
        backgroundSize: '20px 20px'
      }}></div>
      <div className="relative space-y-6 p-6">
        <div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
            Customer Dashboard
          </h1>
          <GoldRatesDisplay />
        </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">My Applications</h2>
        <Link href="/dashboard/apply">
          <Button>Apply to Owner</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {applications.map((app) => (
          <Card key={app.id} className="bg-white/80 backdrop-blur-sm shadow-lg border-amber-200">
            <CardHeader>
              <CardTitle>
                Application - {app.karat} ({app.weightGrams}g)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <strong>Status:</strong> {app.status}
                </p>
                <p>
                  <strong>Owner:</strong> {app.owner.name}
                </p>
                <p>
                  <strong>Applied:</strong> {formatDate(app.createdAt)}
                </p>
                {app.settlement && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-2">Settlement Details</h3>
                    <p>
                      <strong>Principal:</strong>{" "}
                      {formatCurrency(app.settlement.principalAmount)}
                    </p>
                    <p>
                      <strong>Interest Rate:</strong>{" "}
                      {app.settlement.interestRateMonthlyPct}% per month
                    </p>
                    <p>
                      <strong>Next Due:</strong>{" "}
                      {formatDate(app.settlement.nextDueDate)}
                      {isOverdue(app.settlement.nextDueDate) && (
                        <span className="ml-2 text-red-500 font-semibold">
                          (Overdue)
                        </span>
                      )}
                    </p>
                    {app.settlement.status === "ACTIVE" && (
                      <Button
                        className="mt-4"
                        onClick={() => handlePayment(app.settlement!.id)}
                      >
                        Pay Monthly Interest
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {applications.length === 0 && (
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-amber-200">
            <CardContent className="py-8 text-center text-muted-foreground">
              No applications yet. Apply to an owner to get started.
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    </div>
  )
}

