import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Razorpay from "razorpay"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "CUSTOMER") {
      return NextResponse.json(
        { error: "Only customers can make payments" },
        { status: 403 }
      )
    }

    // Get settlement
    const settlement = await prisma.settlement.findUnique({
      where: { id: params.id },
    })

    if (!settlement) {
      return NextResponse.json(
        { error: "Settlement not found" },
        { status: 404 }
      )
    }

    if (settlement.customerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (settlement.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Settlement is not active" },
        { status: 400 }
      )
    }

    // Calculate monthly interest amount
    const amount =
      (settlement.principalAmount * settlement.interestRateMonthlyPct) / 100

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: "INR",
      receipt: `settlement_${settlement.id}_${Date.now()}`,
      notes: {
        settlementId: settlement.id,
        customerId: session.user.id,
        type: "monthly_interest",
      },
    }

    const order = await razorpay.orders.create(options)

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        settlementId: settlement.id,
        amount,
        gateway: "RAZORPAY",
        gatewayPaymentId: order.id,
        status: "FAILED", // Will be updated on webhook
      },
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount / 100,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      paymentId: payment.id,
    })
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    )
  }
}

