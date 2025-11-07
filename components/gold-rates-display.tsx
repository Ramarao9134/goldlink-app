"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface GoldRate {
  karat: string
  pricePerGram: number
  fetchedAt: string
}

export function GoldRatesDisplay() {
  const [rates, setRates] = useState<GoldRate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRates()
    const interval = setInterval(fetchRates, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  const fetchRates = async () => {
    try {
      const res = await fetch("/api/gold-rates")
      if (res.ok) {
        const data = await res.json()
        setRates(data.rates || [])
      }
    } catch (error) {
      console.error("Failed to fetch gold rates:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Live Gold Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4">Loading rates...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Live Gold Rates</span>
          <span className="text-sm font-normal text-muted-foreground">
            Updated: {rates[0]?.fetchedAt ? new Date(rates[0].fetchedAt).toLocaleTimeString() : "N/A"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {rates.map((rate) => (
            <div
              key={rate.karat}
              className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg border border-amber-200"
            >
              <div className="text-sm text-gray-600 mb-1">{rate.karat} Gold</div>
              <div className="text-2xl font-bold text-amber-600">
                {formatCurrency(rate.pricePerGram)}
              </div>
              <div className="text-xs text-gray-500 mt-1">per gram</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

