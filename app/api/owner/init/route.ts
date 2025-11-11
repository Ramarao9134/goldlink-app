import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const dynamic = 'force-dynamic'

// Default owner credentials
const DEFAULT_OWNER_EMAIL = "owner@goldlink.com"
const DEFAULT_OWNER_PASSWORD = "Owner@GoldLink2024"

export async function POST() {
  try {
    // Check if owner already exists
    const existingOwner = await prisma.user.findUnique({
      where: { email: DEFAULT_OWNER_EMAIL },
    })

    if (existingOwner) {
      // Reset password to default if owner exists
      const hashedPassword = await bcrypt.hash(DEFAULT_OWNER_PASSWORD, 10)
      await prisma.user.update({
        where: { email: DEFAULT_OWNER_EMAIL },
        data: {
          hashedPassword,
          role: "OWNER", // Ensure role is correct
        },
      })

      return NextResponse.json({
        message: "Owner account exists, password reset to default",
        email: DEFAULT_OWNER_EMAIL,
        password: DEFAULT_OWNER_PASSWORD,
        reset: true,
        exists: true,
      })
    }

    // Create owner account
    const hashedPassword = await bcrypt.hash(DEFAULT_OWNER_PASSWORD, 10)
    const owner = await prisma.user.create({
      data: {
        name: "GoldLink Owner",
        email: DEFAULT_OWNER_EMAIL,
        role: "OWNER",
        hashedPassword,
      },
    })

    return NextResponse.json({
      message: "Owner account created successfully",
      email: DEFAULT_OWNER_EMAIL,
      password: DEFAULT_OWNER_PASSWORD,
      created: true,
    })
  } catch (error) {
    console.error("Error initializing owner:", error)
    return NextResponse.json(
      { error: "Failed to initialize owner account", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const owner = await prisma.user.findUnique({
      where: { email: DEFAULT_OWNER_EMAIL },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    if (owner) {
      return NextResponse.json({
        exists: true,
        email: owner.email,
        message: "Owner account exists",
      })
    }

    return NextResponse.json({
      exists: false,
      email: DEFAULT_OWNER_EMAIL,
      defaultPassword: DEFAULT_OWNER_PASSWORD,
      message: "Owner account does not exist. Use POST to create it.",
    })
  } catch (error) {
    console.error("Error checking owner:", error)
    return NextResponse.json(
      { error: "Failed to check owner account" },
      { status: 500 }
    )
  }
}

