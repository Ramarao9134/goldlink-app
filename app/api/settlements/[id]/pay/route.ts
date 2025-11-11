import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Razorpay from "razorpay"

// Initialize Razorpay only if keys are provided
let razorpay: Razorpay | null = null
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  try {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  } catch (error) {
    console.error("Razorpay initialization failed:", error)
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "CUSTOMER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const settlement = await prisma.settlement.findUnique({
      where: { id: params.id },
      include: {
        application: true,
      },
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

    if (settlement.status === "CLOSED") {
      return NextResponse.json(
        { error: "Settlement is closed" },
        { status: 400 }
      )
    }

    // monthly interest in INR
    const monthlyInterestInInr =
      Number(settlement.principalAmount) *
      (Number(settlement.interestRateMonthlyPct) / 100)

    // always a number, rounded to paise
    const amountInPaise = Math.round(monthlyInterestInInr * 100)

    // For testing without Razorpay keys, create a mock payment
    if (!razorpay || !process.env.RAZORPAY_KEY_ID) {
      // Create payment record with mock order
      const payment = await prisma.payment.create({
        data: {
          settlementId: settlement.id,
          amount: monthlyInterestInInr,
          gateway: "MOCK",
          status: "SUCCESS",
          paidAt: new Date(),
          gatewayPaymentId: `mock_${Date.now()}`,
        },
      })

      // Update settlement next due date
      const nextDueDate = new Date()
      nextDueDate.setDate(nextDueDate.getDate() + 30)
      await prisma.settlement.update({
        where: { id: settlement.id },
        data: { nextDueDate },
      })

      return NextResponse.json({
        success: true,
        message: "Payment processed successfully (Mock mode)",
        paymentId: payment.id,
        amount: monthlyInterestInInr,
      })
    }

    // Create payment record (status will be updated on webhook)
    const payment = await prisma.payment.create({
      data: {
        settlementId: settlement.id,
        amount: monthlyInterestInInr,
        gateway: "RAZORPAY",
        status: "FAILED", // Will be updated on webhook
      },
    })

    // create Razorpay order using our numeric amount
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: payment.id, // or `${payment.id}`
      notes: {
        settlementId: settlement.id,
        customerId: session.user.id,
        type: "monthly_interest",
      },
    })

    // respond using the same numeric amount we computed
    return NextResponse.json({
      orderId: order.id,
      amount: amountInPaise / 100, // back to INR for UI
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID,
      paymentId: payment.id,
    })
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

