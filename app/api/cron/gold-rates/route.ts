import { NextRequest, NextResponse } from "next/server"
import { fetchAndStoreGoldRates } from "@/lib/gold-rates-fetcher"

export async function GET(req: NextRequest) {
  // Verify cron secret if needed
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await fetchAndStoreGoldRates()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in gold rates cron:", error)
    return NextResponse.json(
      { error: "Failed to update gold rates" },
      { status: 500 }
    )
  }
}

