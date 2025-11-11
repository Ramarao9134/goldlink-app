import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get("x-razorpay-signature")

    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || ""
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex")

    if (signature !== expectedSignature) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      )
    }

    const event = JSON.parse(body)

    if (event.event === "payment.captured") {
      const paymentData = event.payload.payment.entity
      const orderId = paymentData.order_id

      // Fetch order to get settlement ID from notes
      const order = await fetch(
        `https://api.razorpay.com/v1/orders/${orderId}`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
            ).toString("base64")}`,
          },
        }
      ).then((res) => res.json())

      const settlementId = order.notes?.settlementId
      const customerId = order.notes?.customerId

      if (settlementId) {
        // Find the most recent pending payment for this settlement
        const payment = await prisma.payment.findFirst({
          where: {
            settlementId,
            gatewayPaymentId: null,
            status: "FAILED",
          },
          orderBy: { createdAt: "desc" },
        })

        if (payment) {
          const nextDueDate = new Date()
          nextDueDate.setDate(nextDueDate.getDate() + 30)

          await prisma.$transaction(async (tx) => {
            await tx.payment.update({
              where: { id: payment.id },
              data: {
                gatewayPaymentId: paymentData.id,
                status: "SUCCESS",
                paidAt: new Date(),
                receiptUrl: paymentData.receipt || null,
              },
            })

            // Update settlement next due date
            await tx.settlement.update({
              where: { id: settlementId },
              data: { nextDueDate },
            })

            // Create audit log
            if (customerId) {
              await tx.auditLog.create({
                data: {
                  actorUserId: customerId,
                  action: "PAYMENT_SUCCESS",
                  entityType: "Payment",
                  entityId: payment.id,
                  meta: JSON.stringify({
                    amount: paymentData.amount / 100,
                    gatewayPaymentId: paymentData.id,
                    orderId: orderId,
                  }),
                },
              })
            }
          })
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

