"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GoldRatesDisplay } from "@/components/gold-rates-display"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"
import { Plus, Clock, CheckCircle, XCircle } from "lucide-react"

interface Application {
  id: string
  karat: string
  weightGrams: number
  status: string
  createdAt: string
  owner: {
    name: string
  }
}

interface Settlement {
  id: string
  principalAmount: number
  interestRateMonthlyPct: number
  nextDueDate: string
  status: string
}

export function CustomerDashboard() {
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
        fetch("/api/applications"),
        fetch("/api/settlements"),
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "REJECTED":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />
    }
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  if (loading) {
    return <div className="container mx-auto p-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-amber-600">GoldLink</h1>
          <div className="flex gap-4 items-center">
            <span className="text-sm text-gray-600">Welcome, {session?.user?.name}</span>
            <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <GoldRatesDisplay />
        </div>

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold">My Dashboard</h2>
          <Link href="/dashboard/apply">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Apply to Owner
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Applications */}
          <Card>
            <CardHeader>
              <CardTitle>My Applications</CardTitle>
              <CardDescription>Applications submitted to jewelers</CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No applications yet</p>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(app.status)}
                          <span className="font-semibold">{app.karat} Gold</span>
                        </div>
                        <span className="text-sm text-gray-600">{app.status}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Weight: {app.weightGrams}g | Owner: {app.owner.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(app.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settlements */}
          <Card>
            <CardHeader>
              <CardTitle>Active Settlements</CardTitle>
              <CardDescription>Your active gold loans</CardDescription>
            </CardHeader>
            <CardContent>
              {settlements.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No active settlements</p>
              ) : (
                <div className="space-y-4">
                  {settlements.map((settlement) => {
                    const overdue = isOverdue(settlement.nextDueDate)
                    const monthlyInterest =
                      (settlement.principalAmount * settlement.interestRateMonthlyPct) / 100

                    return (
                      <div
                        key={settlement.id}
                        className={`p-4 border rounded-lg ${
                          overdue ? "border-red-300 bg-red-50" : "hover:bg-gray-50"
                        } transition`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">
                            {formatCurrency(settlement.principalAmount)}
                          </span>
                          {overdue && (
                            <span className="text-xs text-red-600 font-semibold">OVERDUE</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          Interest: {settlement.interestRateMonthlyPct}% per month
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                          Monthly Payment: {formatCurrency(monthlyInterest)}
                        </div>
                        <div className="text-xs text-gray-500 mb-3">
                          Next Due: {formatDate(settlement.nextDueDate)}
                        </div>
                        <Link href={`/dashboard/settlements/${settlement.id}/pay`}>
                          <Button className="w-full" variant={overdue ? "destructive" : "default"}>
                            Pay Now
                          </Button>
                        </Link>
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

