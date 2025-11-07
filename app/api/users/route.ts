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

    if (role === "OWNER") {
      const owners = await prisma.user.findMany({
        where: { role: "OWNER" },
        select: {
          id: true,
          name: true,
          email: true,
        },
      })

      return NextResponse.json({ users: owners })
    }

    return NextResponse.json({ users: [] })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}

