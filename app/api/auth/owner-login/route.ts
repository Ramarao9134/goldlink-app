import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// Default owner credentials
const DEFAULT_OWNER_EMAIL = "owner@goldlink.com"
const DEFAULT_OWNER_PASSWORD = "Owner@GoldLink2024"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Check if owner exists, if not create default owner
    let owner = await prisma.user.findUnique({
      where: { email: DEFAULT_OWNER_EMAIL },
    })

    if (!owner) {
      // Create default owner
      const hashedPassword = await bcrypt.hash(DEFAULT_OWNER_PASSWORD, 10)
      owner = await prisma.user.create({
        data: {
          name: "GoldLink Owner",
          email: DEFAULT_OWNER_EMAIL,
          role: "OWNER",
          hashedPassword,
        },
      })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, owner.hashedPassword)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Only allow owner email
    if (owner.email !== DEFAULT_OWNER_EMAIL || owner.role !== "OWNER") {
      return NextResponse.json(
        { error: "Invalid owner credentials" },
        { status: 403 }
      )
    }

    // Return user data for NextAuth
    return NextResponse.json({
      success: true,
      message: "Owner login successful",
      user: {
        id: owner.id,
        email: owner.email,
        name: owner.name,
        role: owner.role,
        password: password, // Return password for NextAuth to verify
      },
    })
  } catch (error) {
    console.error("Owner login error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

