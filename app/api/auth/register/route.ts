import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

export const dynamic = 'force-dynamic'

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional().or(z.literal("")),
  role: z.enum(["CUSTOMER", "OWNER"]).default("CUSTOMER"),
})

export async function POST(req: NextRequest) {
  try {
    let body
    try {
      body = await req.json()
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError)
      return NextResponse.json(
        { error: "Invalid request body. Please check your input." },
        { status: 400 }
      )
    }
    
    console.log("Registration attempt for:", body.email)
    
    // Ensure role defaults to CUSTOMER if not provided
    if (!body.role) {
      body.role = "CUSTOMER"
    }
    
    // Convert empty phone string to null/undefined
    if (body.phone === "" || body.phone === null) {
      body.phone = undefined
    }
    
    let validated
    try {
      validated = registerSchema.parse(body)
    } catch (validationError) {
      console.error("Validation error:", validationError)
      if (validationError instanceof z.ZodError) {
        const errorMessage = validationError.errors.map(e => e.message).join(", ")
        return NextResponse.json(
          { error: errorMessage || "Invalid input", details: validationError.errors },
          { status: 400 }
        )
      }
      throw validationError
    }

    // Normalize email
    const normalizedEmail = validated.email.toLowerCase().trim()
    
    let existingUser
    try {
      existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      })
    } catch (dbError: any) {
      console.error("Database error checking existing user:", dbError)
      console.error("Error code:", dbError?.code)
      console.error("Error message:", dbError?.message)
      console.error("Error stack:", dbError?.stack)
      
      // Check if it's a connection error or database file issue
      if (dbError?.code === 'P1001' || dbError?.code === 'P1003' || 
          dbError?.message?.includes('connect') || 
          dbError?.message?.includes('ENOENT') ||
          dbError?.message?.includes('no such file')) {
        return NextResponse.json(
          { error: "Database is not available. The server may be initializing. Please try again in a moment." },
          { status: 503 }
        )
      }
      
      return NextResponse.json(
        { error: "Database error. Please try again later." },
        { status: 500 }
      )
    }

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists. Please use a different email or login instead." },
        { status: 400 }
      )
    }

    let hashedPassword
    try {
      hashedPassword = await bcrypt.hash(validated.password, 10)
    } catch (hashError) {
      console.error("Password hashing error:", hashError)
      return NextResponse.json(
        { error: "Failed to process password. Please try again." },
        { status: 500 }
      )
    }

    let user
    try {
      user = await prisma.user.create({
        data: {
          name: validated.name.trim(),
          email: normalizedEmail,
          phone: validated.phone ? validated.phone.trim() : null,
          role: validated.role,
          hashedPassword,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      })
      console.log("User created successfully:", user.email)
    } catch (createError: any) {
      console.error("User creation error:", createError)
      console.error("Error code:", createError?.code)
      console.error("Error message:", createError?.message)
      console.error("Error stack:", createError?.stack)
      
      // Handle Prisma unique constraint error
      if (createError?.code === 'P2002') {
        return NextResponse.json(
          { error: "A user with this email already exists" },
          { status: 400 }
        )
      }
      
      // Handle connection/database file errors
      if (createError?.code === 'P1001' || createError?.code === 'P1003' ||
          createError?.message?.includes('connect') ||
          createError?.message?.includes('ENOENT') ||
          createError?.message?.includes('no such file')) {
        return NextResponse.json(
          { error: "Database is not available. Please try again in a moment." },
          { status: 503 }
        )
      }
      
      // Handle other Prisma errors
      if (createError?.code) {
        console.error("Prisma error code:", createError.code)
        return NextResponse.json(
          { error: "Failed to create account. Please check your input and try again." },
          { status: 500 }
        )
      }
      
      throw createError
    }

    return NextResponse.json({ 
      success: true,
      message: "Account created successfully",
      user 
    }, { status: 201 })
  } catch (error: any) {
    console.error("Unexpected registration error:", error)
    console.error("Error stack:", error?.stack)
    
    // Handle Zod validation errors (shouldn't reach here if validation is done above)
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => e.message).join(", ")
      return NextResponse.json(
        { error: errorMessage || "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    
    // Handle Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: "A user with this email already exists" },
          { status: 400 }
        )
      }
      console.error("Prisma error:", error.code, error.message)
    }
    
    // Generic error response
    return NextResponse.json(
      { 
        error: "An unexpected error occurred. Please try again later.",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}


