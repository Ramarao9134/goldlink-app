import { prisma } from "@/lib/prisma"

// This function fetches gold rates from an API and stores them in the database
// You can integrate with a real gold price API here
export async function fetchAndStoreGoldRates() {
  try {
    // Example: Fetch from a gold price API
    // For now, we'll use mock data. Replace with actual API call
    const mockRates = [
      { karat: "22K", pricePerGram: 5500 },
      { karat: "24K", pricePerGram: 6000 },
    ]

    // In production, replace this with actual API call:
    // const response = await fetch('https://api.goldpriceapi.com/v1/...')
    // const data = await response.json()

    for (const rate of mockRates) {
      await prisma.goldRate.create({
        data: {
          karat: rate.karat,
          pricePerGram: rate.pricePerGram,
          source: "MOCK_API", // Replace with actual source
          fetchedAt: new Date(),
        },
      })
    }

    console.log("Gold rates fetched and stored successfully")
  } catch (error) {
    console.error("Error fetching gold rates:", error)
  }
}

