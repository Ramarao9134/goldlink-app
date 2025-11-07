import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { addMonths } from "date-fns"

const approveSchema = z.object({
  principalAmount: z.number().positive(),
  interestRateMonthlyPct: z
    .number()
    .min(0.5, "Interest rate must be at least 0.5%")
    .max(5, "Interest rate must be at most 5%"),
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

    if (session.user.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only owners can approve applications" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = approveSchema.parse(body)

    // Check if application exists and belongs to this owner
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
        { error: "Application is not pending" },
        { status: 400 }
      )
    }

    // Update application status
    await prisma.application.update({
      where: { id: params.id },
      data: { status: "APPROVED" },
    })

    // Create settlement
    const nextDueDate = addMonths(new Date(), 1)
    const settlement = await prisma.settlement.create({
      data: {
        applicationId: params.id,
        customerId: application.customerId,
        principalAmount: validatedData.principalAmount,
        interestRateMonthlyPct: validatedData.interestRateMonthlyPct,
        nextDueDate,
        status: "ACTIVE",
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: session.user.id,
        action: "APPROVE_APPLICATION",
        entityType: "Application",
        entityId: params.id,
        meta: JSON.stringify({
          principalAmount: validatedData.principalAmount,
          interestRateMonthlyPct: validatedData.interestRateMonthlyPct,
          settlementId: settlement.id,
        }), // Store as JSON string for SQLite
      },
    })

    return NextResponse.json({ settlement }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error approving application:", error)
    return NextResponse.json(
      { error: "Failed to approve application" },
      { status: 500 }
    )
  }
}

