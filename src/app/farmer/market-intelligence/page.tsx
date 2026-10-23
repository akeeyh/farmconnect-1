import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MarketIntelligencePage() {
  const session = await getSessionUser();
  if (!session || session.role !== "FARMER") {
    redirect("/login");
  }

  // Fetch Market Intelligence Data from our local DB
  const products = await prisma.product.findMany({
    where: { isAvailable: true }
  });

  const priceStats: Record<string, { total: number, count: number, min: number, max: number }> = {};
  
  products.forEach(p => {
    const name = p.name.toLowerCase().trim();
    if (!priceStats[name]) {
      priceStats[name] = { total: 0, count: 0, min: p.price, max: p.price };
    }
    priceStats[name].total += p.price;
    priceStats[name].count += 1;
    if (p.price < priceStats[name].min) priceStats[name].min = p.price;
    if (p.price > priceStats[name].max) priceStats[name].max = p.price;
  });

  const intelligence = Object.keys(priceStats).map(name => {
    const stat = priceStats[name];
    const avgPrice = stat.total / stat.count;
    
    // Simulate Demand based on scarcity
    const demandScore = stat.count < 3 ? "HIGH" : stat.count < 6 ? "MEDIUM" : "LOW";
    
    return {
      productName: name.charAt(0).toUpperCase() + name.slice(1),
      avgPrice,
      minPrice: stat.min,
      maxPrice: stat.max,
      activeListings: stat.count,
      demandScore,
    };
  }).sort((a, b) => b.activeListings - a.activeListings);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📊 Market Intelligence</h1>
          <p className="text-gray-500">Real-time AI analysis of market prices and demand trends.</p>
        </div>
      </div>

      {intelligence.length > 0 ? (
        <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium text-gray-500">Crop / Product</th>
                <th className="px-6 py-4 font-medium text-gray-500">Avg Market Price</th>
                <th className="px-6 py-4 font-medium text-gray-500">Price Range</th>
                <th className="px-6 py-4 font-medium text-gray-500">Active Competitors</th>
                <th className="px-6 py-4 font-medium text-gray-500">Predicted Demand</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {intelligence.map((data, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{data.productName}</td>
                  <td className="px-6 py-4 font-bold text-green-700">{formatPrice(data.avgPrice)}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {formatPrice(data.minPrice)} - {formatPrice(data.maxPrice)}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{data.activeListings} listings</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      data.demandScore === "HIGH" ? "bg-red-100 text-red-700" :
                      data.demandScore === "MEDIUM" ? "bg-yellow-100 text-yellow-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {data.demandScore}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border shadow-sm">
          <span className="text-5xl">📈</span>
          <h3 className="text-lg font-semibold text-gray-700 mt-4">Not enough data</h3>
          <p className="text-gray-500 mt-2">The market intelligence engine needs more products to be listed before it can analyze trends.</p>
        </div>
      )}

      {/* AI Insights Card */}
      <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
        <h2 className="text-lg font-bold text-green-900 flex items-center gap-2">
          <span>🤖</span> AI Market Insights
        </h2>
        <ul className="mt-4 space-y-3 text-sm text-green-800">
          {intelligence.length > 0 ? (
            <>
              {intelligence.filter(i => i.demandScore === "HIGH").map(i => (
                <li key={`insight-${i.productName}`} className="flex items-start gap-2">
                  <span className="mt-0.5">💡</span>
                  <span><strong>{i.productName}</strong> is currently in high demand with low supply. Consider planting or listing this crop to maximize profits.</span>
                </li>
              ))}
              {intelligence.filter(i => i.demandScore === "LOW").map(i => (
                <li key={`insight-${i.productName}`} className="flex items-start gap-2">
                  <span className="mt-0.5">⚠️</span>
                  <span>The market is saturated with <strong>{i.productName}</strong>. Expect higher competition and downward pressure on prices.</span>
                </li>
              ))}
            </>
          ) : (
             <li>Add products to the marketplace to see AI-generated insights.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
