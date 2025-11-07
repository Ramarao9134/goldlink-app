import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")

    if (role === "owner") {
      // Owner sees settlements where they are the owner
      // We need to join through applications
      const settlements = await prisma.settlement.findMany({
        where: {
          application: {
            ownerId: session.user.id,
          },
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          application: {
            select: {
              karat: true,
              weightGrams: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })

      return NextResponse.json({ settlements })
    } else {
      // Customer sees their own settlements
      const settlements = await prisma.settlement.findMany({
        where: {
          customerId: session.user.id,
          status: "ACTIVE",
        },
        include: {
          application: {
            select: {
              karat: true,
              weightGrams: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })

      return NextResponse.json({ settlements })
    }
  } catch (error) {
    console.error("Error fetching settlements:", error)
    return NextResponse.json(
      { error: "Failed to fetch settlements" },
      { status: 500 }
    )
  }
}

