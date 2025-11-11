import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export const dynamic = 'force-dynamic'

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  companyName: z.string().optional(),
  companyAddress: z.string().optional(),
  companyRanks: z.string().optional(),
  quality: z.string().optional(),
  achievements: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const owner = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        companyName: true,
        companyAddress: true,
        companyRanks: true,
        quality: true,
        achievements: true,
      },
    })

    if (!owner) {
      return NextResponse.json(
        { error: "Owner not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ owner })
  } catch (error) {
    console.error("Error fetching owner profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validated = updateProfileSchema.parse(body)

    const owner = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(validated.name && { name: validated.name }),
        ...(validated.companyName !== undefined && { companyName: validated.companyName }),
        ...(validated.companyAddress !== undefined && { companyAddress: validated.companyAddress }),
        ...(validated.companyRanks !== undefined && { companyRanks: validated.companyRanks }),
        ...(validated.quality !== undefined && { quality: validated.quality }),
        ...(validated.achievements !== undefined && { achievements: validated.achievements }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        companyName: true,
        companyAddress: true,
        companyRanks: true,
        quality: true,
        achievements: true,
      },
    })

    return NextResponse.json({ owner, message: "Profile updated successfully" })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error updating owner profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

