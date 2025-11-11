import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
const createApplicationSchema = z.object({
  ownerId: z.string(),
  karat: z.enum(["22K", "24K"]),
  weightGrams: z.number().positive(),
  photos: z.array(z.string().url()),
  notes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "CUSTOMER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validated = createApplicationSchema.parse(body)

    const application = await prisma.application.create({
      data: {
        customerId: session.user.id,
        ownerId: validated.ownerId,
        karat: validated.karat,
        weightGrams: validated.weightGrams,
        photos: validated.photos.join(","), // Convert array to comma-separated string
        notes: validated.notes,
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    return NextResponse.json({ application }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error creating application:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let applications

    if (session.user.role === "CUSTOMER") {
      const apps = await prisma.application.findMany({
        where: { customerId: session.user.id },
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
          settlement: {
            include: {
              payments: {
                orderBy: { createdAt: "desc" },
                take: 5,
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
      // Convert photos string to array
      applications = apps.map(app => ({
        ...app,
        photos: app.photos ? app.photos.split(",").filter(Boolean) : []
      }))
    } else if (session.user.role === "OWNER") {
      const apps = await prisma.application.findMany({
        where: { ownerId: session.user.id },
        include: {
          customer: {
            select: { id: true, name: true, email: true, phone: true },
          },
          settlement: true,
        },
        orderBy: { createdAt: "desc" },
      })
      // Convert photos string to array
      applications = apps.map(app => ({
        ...app,
        photos: app.photos ? app.photos.split(",").filter(Boolean) : []
      }))
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({ applications })
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

