import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { CustomerDashboard } from "@/components/customer-dashboard"
import { OwnerDashboard } from "@/components/owner-dashboard"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  if (session.user.role === "CUSTOMER") {
    return <CustomerDashboard />
  } else if (session.user.role === "OWNER") {
    return <OwnerDashboard />
  }

  return <div>Unknown role</div>
}

