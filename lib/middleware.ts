import { getServerSession } from "next-auth"
import { authOptions } from "./auth"

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error("Unauthorized")
  }
  return session
}

export async function requireRole(role: "CUSTOMER" | "OWNER") {
  const session = await requireAuth()
  if (session.user.role !== role) {
    throw new Error("Forbidden")
  }
  return session
}

