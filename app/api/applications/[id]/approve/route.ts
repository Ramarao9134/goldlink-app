import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const approveSchema = z.object({
  principalAmount: z.number().positive(),
  interestRateMonthlyPct: z.number().min(0.5).max(5),
})

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validated = approveSchema.parse(body)

    const application = await prisma.application.findUnique({
      where: { id: params.id },
    })

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      )
    }

    if (application.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (application.status !== "PENDING") {
      return NextResponse.json(
        { error: "Application already processed" },
        { status: 400 }
      )
    }

    // Calculate next due date (30 days from now)
    const nextDueDate = new Date()
    nextDueDate.setDate(nextDueDate.getDate() + 30)

    const result = await prisma.$transaction(async (tx) => {
      // Update application status
      const updatedApplication = await tx.application.update({
        where: { id: params.id },
        data: { status: "APPROVED" },
      })

      // Create settlement
      const settlement = await tx.settlement.create({
        data: {
          applicationId: params.id,
          customerId: application.customerId,
          principalAmount: validated.principalAmount,
          interestRateMonthlyPct: validated.interestRateMonthlyPct,
          nextDueDate,
        },
        include: {
          application: true,
          customer: {
            select: { id: true, name: true, email: true },
          },
        },
      })

      // Create audit log
      await tx.auditLog.create({
        data: {
          actorUserId: session.user.id,
          action: "APPROVE_APPLICATION",
          entityType: "Application",
          entityId: params.id,
          meta: JSON.stringify({
            principalAmount: validated.principalAmount,
            interestRateMonthlyPct: validated.interestRateMonthlyPct,
          }),
        },
      })

      return { application: updatedApplication, settlement }
    })

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => {
        if (err.path.includes("interestRateMonthlyPct")) {
          return `Interest rate must be between 0.5% and 5% per month. You entered ${err.input || "invalid value"}.`
        }
        if (err.path.includes("principalAmount")) {
          return `Principal amount must be a positive number.`
        }
        return err.message
      })
      return NextResponse.json(
        { error: errorMessages.join(" ") || "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error approving application:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

