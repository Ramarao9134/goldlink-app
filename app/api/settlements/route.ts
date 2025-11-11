import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let settlements

    if (session.user.role === "CUSTOMER") {
      settlements = await prisma.settlement.findMany({
        where: { customerId: session.user.id },
        include: {
          application: {
            include: {
              owner: {
                select: { id: true, name: true, email: true },
              },
            },
          },
          payments: {
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    } else if (session.user.role === "OWNER") {
      // Owner sees settlements for applications they own
      settlements = await prisma.settlement.findMany({
        where: {
          application: {
            ownerId: session.user.id,
          },
        },
        include: {
          application: {
            include: {
              customer: {
                select: { id: true, name: true, email: true, phone: true },
              },
            },
          },
          payments: {
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({ settlements })
  } catch (error) {
    console.error("Error fetching settlements:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

