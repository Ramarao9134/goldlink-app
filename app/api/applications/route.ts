import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const applicationSchema = z.object({
  ownerId: z.string().min(1),
  karat: z.enum(["22K", "24K"]),
  weightGrams: z.number().positive("Weight must be greater than 0"),
  photos: z.array(z.string().url()).min(1, "At least one photo is required"),
  notes: z.string().nullable().optional(),
})

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")

    if (role === "owner") {
      // Owner sees applications assigned to them
      const applications = await prisma.application.findMany({
        where: { ownerId: session.user.id },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })

      return NextResponse.json({ applications })
    } else {
      // Customer sees their own applications
      const applications = await prisma.application.findMany({
        where: { customerId: session.user.id },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })

      return NextResponse.json({ applications })
    }
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "CUSTOMER") {
      return NextResponse.json(
        { error: "Only customers can create applications" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = applicationSchema.parse(body)

    const application = await prisma.application.create({
      data: {
        customerId: session.user.id,
        ownerId: validatedData.ownerId,
        karat: validatedData.karat,
        weightGrams: validatedData.weightGrams,
        photos: JSON.stringify(validatedData.photos), // Store as JSON string for SQLite
        notes: validatedData.notes || null,
        status: "PENDING",
      },
      include: {
        owner: {
          select: {
            name: true,
          },
        },
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: session.user.id,
        action: "CREATE_APPLICATION",
        entityType: "Application",
        entityId: application.id,
        meta: JSON.stringify({
          karat: validatedData.karat,
          weightGrams: validatedData.weightGrams,
        }), // Store as JSON string for SQLite
      },
    })

    return NextResponse.json({ application }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Error creating application:", error)
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    )
  }
}

