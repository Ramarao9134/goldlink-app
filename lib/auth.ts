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
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          // Check if it's owner login attempt
          if (credentials.email === "owner@goldlink.com") {
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
            // Verify password for new owner (must use default password)
            const isValid = await bcrypt.compare(credentials.password, newOwner.hashedPassword)
            if (isValid) {
              return {
                id: newOwner.id,
                email: newOwner.email,
                name: newOwner.name,
                role: newOwner.role,
              }
            }
            // If password doesn't match, return null (don't reveal account was just created)
            return null
          }
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
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

