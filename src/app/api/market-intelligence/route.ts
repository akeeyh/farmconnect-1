import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "FARMER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 1. Get all products to calculate average prices
    const products = await prisma.product.findMany({
      where: { isAvailable: true }
    });

    const priceStats: Record<string, { total: number, count: number, min: number, max: number }> = {};
    
    products.forEach(p => {
      const name = p.name.toLowerCase();
      if (!priceStats[name]) {
        priceStats[name] = { total: 0, count: 0, min: p.price, max: p.price };
      }
      priceStats[name].total += p.price;
      priceStats[name].count += 1;
      if (p.price < priceStats[name].min) priceStats[name].min = p.price;
      if (p.price > priceStats[name].max) priceStats[name].max = p.price;
    });

    const marketIntelligence = Object.keys(priceStats).map(name => {
      const stat = priceStats[name];
      const avgPrice = stat.total / stat.count;
      
      // Simulate "Trend" and "Demand" based on real data points
      // If many farmers are listing it, supply is high.
      const supplyLevel = stat.count > 5 ? "HIGH" : stat.count > 2 ? "MEDIUM" : "LOW";
      
      return {
        productName: name.charAt(0).toUpperCase() + name.slice(1),
        avgPrice: avgPrice.toFixed(2),
        minPrice: stat.min,
        maxPrice: stat.max,
        activeListings: stat.count,
        supplyLevel,
      };
    }).sort((a, b) => b.activeListings - a.activeListings);

    return NextResponse.json({ intelligence: marketIntelligence });
  } catch (error) {
    console.error("Market intelligence error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
