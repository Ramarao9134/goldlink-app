"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

interface GoldRate {
  id: string
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
      const data = await res.json()
      setRates(data.rates || [])
    } catch (error) {
      console.error("Error fetching gold rates:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex gap-4">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex gap-4 flex-wrap">
      {rates.map((rate) => (
        <Card key={rate.id} className="flex-1 min-w-[200px] bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-300 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-amber-800">{rate.karat} Gold</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold bg-gradient-to-r from-amber-700 to-yellow-700 bg-clip-text text-transparent">
              ₹{rate.pricePerGram.toFixed(2)}
            </p>
            <p className="text-sm text-amber-700/70 mt-2 font-medium">per gram</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

