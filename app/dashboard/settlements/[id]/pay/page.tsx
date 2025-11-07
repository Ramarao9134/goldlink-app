"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import Script from "next/script"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function PayPage() {
  const router = useRouter()
  const params = useParams()
  const settlementId = params.id as string
  const [loading, setLoading] = useState(false)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (paymentData) {
      handleRazorpayPayment()
    }
  }, [paymentData])

  const handlePay = async () => {
    setLoading(true)
    setError("")

    try {
      const res = await fetch(`/api/settlements/${settlementId}/pay`, {
        method: "POST",
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to initiate payment")
        setLoading(false)
        return
      }

      setPaymentData(data)
    } catch (err) {
      setError("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  const handleRazorpayPayment = () => {
    if (!window.Razorpay || !paymentData) return

    const options = {
      key: paymentData.keyId,
      amount: paymentData.amount * 100,
      currency: paymentData.currency,
      name: "GoldLink",
      description: "Monthly Interest Payment",
      order_id: paymentData.orderId,
      handler: function (response: any) {
        // Payment successful
        router.push(`/dashboard/settlements/${settlementId}/success`)
      },
      prefill: {
        // You can prefill customer details here
      },
      theme: {
        color: "#F59E0B",
      },
      modal: {
        ondismiss: function () {
          setLoading(false)
        },
      },
    }

    const razorpay = new window.Razorpay(options)
    razorpay.open()
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => {
          if (paymentData) {
            handleRazorpayPayment()
          }
        }}
      />

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
            <CardTitle>Pay Monthly Interest</CardTitle>
            <CardDescription>Complete your payment securely</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Amount to Pay</div>
                <div className="text-2xl font-bold">
                  {paymentData ? formatCurrency(paymentData.amount) : "Loading..."}
                </div>
              </div>

              <Button
                onClick={handlePay}
                className="w-full"
                disabled={loading}
                size="lg"
              >
                {loading ? "Processing..." : "Pay with Razorpay"}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Your payment is secured by Razorpay
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

