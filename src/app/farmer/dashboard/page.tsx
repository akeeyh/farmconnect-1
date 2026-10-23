import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function FarmerDashboardPage() {
  const session = await getSessionUser();
  if (!session || session.role !== "FARMER") {
    redirect("/login");
  }

  const farmProfile = await prisma.farmProfile.findUnique({
    where: { userId: session.userId },
  });

  if (!farmProfile) {
    redirect("/farmer/setup");
  }

  const products = await prisma.product.findMany({
    where: { farmerId: session.userId },
  });

  const orders = await prisma.order.findMany({
    where: { farmerId: session.userId },
    include: {
      items: true,
      buyer: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // --- AI Matching Engine ---
  // Fetch bulk requirements from buyers
  const bulkRequirements = await prisma.bulkRequirement.findMany({
    where: { isActive: true },
    include: { buyer: { select: { name: true } } }
  });

  // Match: Requirement product name contains farmer's product name, and farmer has enough quantity
  const matches = bulkRequirements.filter(req => 
    products.some(p => 
      req.productName.toLowerCase().includes(p.name.toLowerCase()) &&
      p.quantity >= req.quantity * 0.5 // Show match if farmer can fulfill at least 50%
    )
  );

  // --- Waste Prevention Engine ---
  const today = new Date();
  const atRiskProducts = products.filter(p => {
    if (!p.harvestDate || !p.freshnessDays || !p.isAvailable || p.quantity <= 0) return false;
    const expiryDate = new Date(p.harvestDate);
    expiryDate.setDate(expiryDate.getDate() + p.freshnessDays);
    const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return daysLeft <= 3 && daysLeft >= 0; // Flag if expiring in <= 3 days
  });


  const pendingOrders = orders.filter((o) => ["PLACED", "ACCEPTED", "PREPARING", "READY"].includes(o.status));
  const totalRevenue = orders
    .filter((o) => o.status === "DELIVERED")
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const totalInventory = products.reduce((sum, p) => sum + p.quantity, 0);

  const todaySales = orders
    .filter((o) => o.status === "DELIVERED" && new Date(o.createdAt).toDateString() === today.toDateString())
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Farm Dashboard</h1>
          <p className="text-gray-500">{farmProfile.farmName} • {farmProfile.location}</p>
        </div>
        <Link
          href="/farmer/products/new"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
        >
          + Add Product
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm text-gray-500">Today&apos;s Sales</p>
          <p className="text-2xl font-bold text-green-700">{formatPrice(todaySales)}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm text-gray-500">Pending Orders</p>
          <p className="text-2xl font-bold text-orange-600">{pendingOrders.length}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm text-gray-500">Products Listed</p>
          <p className="text-2xl font-bold text-blue-600">{products.length}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm text-gray-500">Total Inventory</p>
          <p className="text-2xl font-bold text-purple-600">{totalInventory.toFixed(0)} kg</p>
        </div>
      </div>

      {/* AI Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        
        {/* Waste Prevention Alerts */}
        <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
          <div className="bg-red-50 p-4 border-b border-red-100 flex items-center gap-2">
            <span className="text-xl">♻️</span>
            <h2 className="text-lg font-bold text-red-800">Waste Prevention Alerts</h2>
          </div>
          <div className="p-4">
            {atRiskProducts.length > 0 ? (
              <div className="space-y-3">
                {atRiskProducts.map(p => (
                  <div key={p.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-red-900">{p.name}</p>
                      <p className="text-sm text-red-700">{p.quantity} {p.unit} in stock</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold bg-red-200 text-red-800 px-2 py-1 rounded">Expiring Soon</span>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-gray-500 mt-2">AI Suggestion: Consider matching these with Institutional buyers or applying a discount to move inventory.</p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No inventory is currently at risk of expiring. Great job managing your supply!</p>
            )}
          </div>
        </div>

        {/* AI Buyer Matching */}
        <div className="bg-white rounded-xl border border-blue-200 overflow-hidden">
          <div className="bg-blue-50 p-4 border-b border-blue-100 flex items-center gap-2">
            <span className="text-xl">🤝</span>
            <h2 className="text-lg font-bold text-blue-800">AI Buyer Matches</h2>
          </div>
          <div className="p-4">
            {matches.length > 0 ? (
              <div className="space-y-3">
                {matches.slice(0, 3).map(m => (
                  <div key={m.id} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex justify-between">
                      <p className="font-semibold text-blue-900">{m.buyer.name}</p>
                      <span className="text-xs font-bold bg-blue-200 text-blue-800 px-2 py-1 rounded">Match</span>
                    </div>
                    <p className="text-sm text-blue-800 mt-1">Needs: {m.quantity} {m.unit} of {m.productName}</p>
                    {m.priceMax && <p className="text-xs text-blue-700 mt-1">Willing to pay up to: {formatPrice(m.priceMax)}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No active bulk buyers match your current inventory right now.</p>
            )}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Quick Links */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/farmer/market-intelligence" className="p-3 bg-emerald-50 rounded-lg text-center hover:bg-emerald-100 transition border border-emerald-100">
              <span className="text-2xl">📊</span>
              <p className="text-sm font-medium text-emerald-800 mt-1">Market Intel</p>
            </Link>
            <Link href="/farmer/products" className="p-3 bg-green-50 rounded-lg text-center hover:bg-green-100 transition">
              <span className="text-2xl">📦</span>
              <p className="text-sm font-medium text-gray-700 mt-1">My Products</p>
            </Link>
            <Link href="/farmer/orders" className="p-3 bg-orange-50 rounded-lg text-center hover:bg-orange-100 transition">
              <span className="text-2xl">📋</span>
              <p className="text-sm font-medium text-gray-700 mt-1">Orders</p>
            </Link>
            <Link href="/farmer/setup" className="p-3 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition">
              <span className="text-2xl">⚙️</span>
              <p className="text-sm font-medium text-gray-700 mt-1">Farm Settings</p>
            </Link>
          </div>
        </div>
        
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Link href="/farmer/orders" className="text-green-600 text-sm hover:underline">View all</Link>
          </div>
          {orders.length > 0 ? (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition border"
                >
                  <div>
                    <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">{order.buyer.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatPrice(order.totalAmount)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === "DELIVERED" ? "bg-green-100 text-green-700" :
                      order.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No orders yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
