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
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user) {
            // Check if it's owner login attempt
            if (credentials.email === "owner@goldlink.com") {
              console.log("Owner account not found, creating new owner...")
              // Create owner if doesn't exist with default password
              const defaultPassword = "Owner@GoldLink2024"
              const hashedPassword = await bcrypt.hash(defaultPassword, 10)
              const newOwner = await prisma.user.create({
                data: {
                  name: "GoldLink Owner",
                  email: "owner@goldlink.com",
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
              console.log("Password mismatch for new owner account")
              // If password doesn't match, return null (don't reveal account was just created)
              return null
            }
            console.log("User not found and not owner email")
            return null
          }

          // If owner exists, verify password
          if (user.email === "owner@goldlink.com" && user.role === "OWNER") {
            console.log("Owner account found, verifying password...")
            const isPasswordValid = await bcrypt.compare(
              credentials.password,
              user.hashedPassword
            )

            if (!isPasswordValid) {
              console.log("Invalid password for owner account")
              // If password is wrong, check if they're using default password
              // and reset it if needed (for recovery)
              const defaultPassword = "Owner@GoldLink2024"
              const defaultPasswordHash = await bcrypt.hash(defaultPassword, 10)
              const isDefaultPassword = await bcrypt.compare(defaultPassword, user.hashedPassword)
              
              if (!isDefaultPassword) {
                // Password was changed, user needs to use their current password
                return null
              }
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

          // Regular user login
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.hashedPassword
          )

          if (!isPasswordValid) {
            console.log("Invalid password for user")
            return null
          }

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

