import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "node:crypto"
import { addMonths } from "date-fns"

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || ""

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-razorpay-signature")

    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest("hex")

    if (signature !== expectedSignature) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      )
    }

    const event = JSON.parse(body)

    // Handle payment success
    if (event.event === "payment.captured") {
      const paymentData = event.payload.payment.entity

      // Find payment by gateway payment ID
      const payment = await prisma.payment.findFirst({
        where: {
          gatewayPaymentId: paymentData.id,
        },
        include: {
          settlement: true,
        },
      })

      if (payment && payment.status === "FAILED") {
        // Update payment status
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "SUCCESS",
            paidAt: new Date(),
            receiptUrl: paymentData.receipt || null,
          },
        })

        // Update settlement next due date
        const nextDueDate = addMonths(new Date(), 1)
        await prisma.settlement.update({
          where: { id: payment.settlementId },
          data: { nextDueDate },
        })

        // Create audit log
        await prisma.auditLog.create({
          data: {
            actorUserId: payment.settlement.customerId,
            action: "PAYMENT_SUCCESS",
            entityType: "Payment",
            entityId: payment.id,
            meta: JSON.stringify({
              amount: payment.amount,
              gatewayPaymentId: paymentData.id,
            }), // Store as JSON string for SQLite
          },
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}

