import { prisma } from "./prisma"

// Mock gold rates API - Replace with actual API
async function fetchGoldRatesFromAPI(): Promise<{ karat: string; pricePerGram: number }[]> {
  // This is a placeholder - replace with actual gold rates API
  // Example: https://api.metals.live/v1/spot/gold
  // For now, using mock data with realistic Indian gold prices
  
  const basePrice24K = 6500 // Approximate 24K gold price per gram in INR
  const basePrice22K = basePrice24K * 0.916 // 22K is 91.6% pure
  
  return [
    { karat: "24K", pricePerGram: basePrice24K + (Math.random() * 100 - 50) },
    { karat: "22K", pricePerGram: basePrice22K + (Math.random() * 100 - 50) },
  ]
}

export async function fetchAndStoreGoldRates() {
  try {
    const rates = await fetchGoldRatesFromAPI()
    
    for (const rate of rates) {
      await prisma.goldRate.create({
        data: {
          karat: rate.karat,
          pricePerGram: rate.pricePerGram,
          source: "API",
          fetchedAt: new Date(),
        },
      })
    }
    
    return rates
  } catch (error) {
    console.error("Error fetching gold rates:", error)
    throw error
  }
}

export async function getLatestGoldRates() {
  const rates = await prisma.goldRate.findMany({
    where: {
      fetchedAt: {
        gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
      },
    },
    orderBy: {
      fetchedAt: "desc",
    },
    distinct: ["karat"],
    take: 2,
  })

  // If no recent rates, fetch new ones
  if (rates.length === 0) {
    await fetchAndStoreGoldRates()
    return getLatestGoldRates()
  }

  return rates
}

