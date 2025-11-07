import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const rejectSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
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
        { error: "Only owners can reject applications" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = rejectSchema.parse(body)

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
      data: { status: "REJECTED" },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: session.user.id,
        action: "REJECT_APPLICATION",
        entityType: "Application",
        entityId: params.id,
        meta: JSON.stringify({
          reason: validatedData.reason,
        }), // Store as JSON string for SQLite
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error rejecting application:", error)
    return NextResponse.json(
      { error: "Failed to reject application" },
      { status: 500 }
    )
  }
}

