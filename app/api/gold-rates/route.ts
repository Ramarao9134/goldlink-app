import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Get latest rates for 22K and 24K
    const rates = await prisma.goldRate.findMany({
      where: {
        karat: {
          in: ["22K", "24K"],
        },
      },
      orderBy: {
        fetchedAt: "desc",
      },
      distinct: ["karat"],
      take: 2,
    })

    // If no rates exist, return default/placeholder rates
    if (rates.length === 0) {
      return NextResponse.json({
        rates: [
          {
            karat: "22K",
            pricePerGram: 5500,
            fetchedAt: new Date().toISOString(),
          },
          {
            karat: "24K",
            pricePerGram: 6000,
            fetchedAt: new Date().toISOString(),
          },
        ],
      })
    }

    return NextResponse.json({
      rates: rates.map((rate) => ({
        karat: rate.karat,
        pricePerGram: rate.pricePerGram,
        fetchedAt: rate.fetchedAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error("Error fetching gold rates:", error)
    return NextResponse.json(
      { error: "Failed to fetch gold rates" },
      { status: 500 }
    )
  }
}

