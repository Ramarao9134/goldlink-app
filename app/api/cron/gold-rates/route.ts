import { NextResponse } from "next/server"
import { fetchAndStoreGoldRates } from "@/lib/gold-rates-fetcher"

// This endpoint can be called by a cron job service (e.g., Vercel Cron, cron-job.org)
// to periodically fetch and update gold rates
export async function GET(request: Request) {
  try {
    // Optional: Add authentication/authorization check
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await fetchAndStoreGoldRates()

    return NextResponse.json({ success: true, message: "Gold rates updated" })
  } catch (error) {
    console.error("Error in gold rates cron job:", error)
    return NextResponse.json(
      { error: "Failed to update gold rates" },
      { status: 500 }
    )
  }
}

