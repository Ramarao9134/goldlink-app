import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Authorize: Missing credentials")
          return null
        }

        try {
          // Normalize email (lowercase and trim)
          const normalizedEmail = credentials.email.toLowerCase().trim()
          const defaultOwnerEmail = "owner@goldlink.com"
          const defaultPassword = "Owner@GoldLink2024"
          
          console.log("Login attempt for:", normalizedEmail, "isOwner:", normalizedEmail === defaultOwnerEmail)
          
          let user
          try {
            user = await prisma.user.findUnique({
              where: { email: normalizedEmail }
            })
          } catch (dbError) {
            console.error("Database error during user lookup:", dbError)
            return null
          }

          if (!user) {
            // Check if it's owner login attempt
            if (normalizedEmail === defaultOwnerEmail) {
              console.log("Owner account not found, creating new owner...")
              try {
                // Create owner if doesn't exist with default password
                const hashedPassword = await bcrypt.hash(defaultPassword, 10)
                const newOwner = await prisma.user.create({
                  data: {
                    name: "GoldLink Owner",
                    email: defaultOwnerEmail,
                    role: "OWNER",
                    hashedPassword,
                  },
                })
                console.log("New owner created, verifying password...")
                // Verify password for new owner (must use default password)
                const isValid = await bcrypt.compare(credentials.password, newOwner.hashedPassword)
                if (isValid) {
                  console.log("Owner login successful (new account)")
                  return {
                    id: newOwner.id,
                    email: newOwner.email,
                    name: newOwner.name,
                    role: newOwner.role,
                  }
                }
                console.log("Password mismatch for new owner account - provided password doesn't match default")
                console.log("Expected password:", defaultPassword)
                // If password doesn't match, return null (don't reveal account was just created)
                return null
              } catch (createError) {
                console.error("Error creating owner account:", createError)
                // If creation fails, still try to verify with default password in case account exists
                return null
              }
            }
            console.log("User not found and not owner email")
            return null
          }

          // If owner exists, verify password
          if (user.email.toLowerCase() === defaultOwnerEmail && user.role === "OWNER") {
            console.log("Owner account found, verifying password...")
            console.log("User role:", user.role, "Email:", user.email)
            
            let isPasswordValid = false
            try {
              isPasswordValid = await bcrypt.compare(
                credentials.password,
                user.hashedPassword
              )
            } catch (compareError) {
              console.error("Error comparing password:", compareError)
              return null
            }

            if (!isPasswordValid) {
              console.log("Password doesn't match stored hash, checking if default password was provided...")
              // If password is wrong, check if they're using default password
              // If they are, reset the stored password to default (for recovery)
              if (credentials.password === defaultPassword) {
                console.log("Default password provided, resetting owner password to default...")
                try {
                  const hashedDefaultPassword = await bcrypt.hash(defaultPassword, 10)
                  await prisma.user.update({
                    where: { id: user.id },
                    data: { hashedPassword: hashedDefaultPassword }
                  })
                  console.log("Owner password reset to default, login successful")
                  return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                  }
                } catch (updateError) {
                  console.error("Error updating owner password:", updateError)
                  return null
                }
              }
              console.log("Invalid password for owner account")
              console.log("Provided password length:", credentials.password.length)
              console.log("Expected default password:", defaultPassword)
              return null
            }

            console.log("Owner login successful (existing account)")
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            }
          }

          // Regular user login (non-owner)
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.hashedPassword
          )

          if (!isPasswordValid) {
            console.log("Invalid password for user:", normalizedEmail)
            return null
          }

          console.log("User login successful:", normalizedEmail)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error("Authorize error:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

