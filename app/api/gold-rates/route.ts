import { NextResponse } from "next/server"
import { getLatestGoldRates } from "@/lib/gold-rates-fetcher"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const rates = await getLatestGoldRates()
    return NextResponse.json({ rates })
  } catch (error) {
    console.error("Error fetching gold rates:", error)
    return NextResponse.json(
      { error: "Failed to fetch gold rates" },
      { status: 500 }
    )
  }
}

