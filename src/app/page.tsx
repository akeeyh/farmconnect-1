import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  const featuredProducts = await prisma.product.findMany({
    where: { isAvailable: true, quantity: { gt: 0 } },
    include: {
      farmer: {
        select: {
          id: true,
          name: true,
          farmProfile: {
            select: { farmName: true, location: true, farmingType: true },
          },
        },
      },
      category: true,
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const farmerCount = await prisma.user.count({ where: { role: "FARMER" } });
  const productCount = await prisma.product.count({ where: { isAvailable: true } });
  const orderCount = await prisma.order.count();

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              From Farm to Buyer,
              <br />
              <span className="text-green-200">Smarter and Direct</span>
            </h1>
            <p className="mt-4 text-lg text-green-100">
              Connect directly with local farmers. Get fresh produce at fair prices.
              No middlemen, no uncertainty.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/marketplace"
                className="bg-white text-green-700 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition"
              >
                Browse Marketplace
              </Link>
              <Link
                href="/register"
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
              >
                Start Selling
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-green-700">{farmerCount}</p>
              <p className="text-sm text-gray-500 mt-1">Registered Farmers</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-700">{productCount}</p>
              <p className="text-sm text-gray-500 mt-1">Products Listed</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-700">{orderCount}</p>
              <p className="text-sm text-gray-500 mt-1">Orders Completed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/marketplace?category=${encodeURIComponent(cat.name)}`}
              className="flex flex-col items-center p-4 bg-white rounded-xl border hover:shadow-md hover:border-green-300 transition"
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-sm font-medium text-gray-700 mt-2 text-center">
                {cat.name}
              </span>
              <span className="text-xs text-gray-400">{cat._count.products} items</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Fresh Produce</h2>
          <Link href="/marketplace" className="text-green-600 hover:underline text-sm font-medium">
            View all →
          </Link>
        </div>
        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border">
            <span className="text-5xl">🌱</span>
            <h3 className="text-lg font-semibold text-gray-700 mt-4">
              No products yet
            </h3>
            <p className="text-gray-500 mt-2">
              Be the first farmer to list produce on FarmConnect!
            </p>
            <Link
              href="/register"
              className="inline-block mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Register as Farmer
            </Link>
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            How FarmConnect Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">👨🌾</span>
              </div>
              <h3 className="text-lg font-semibold mt-4">Farmers List Produce</h3>
              <p className="text-gray-500 mt-2 text-sm">
                Farmers register, set up their farm profile, and list their fresh produce with prices and availability.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">🛒</span>
              </div>
              <h3 className="text-lg font-semibold mt-4">Buyers Shop Directly</h3>
              <p className="text-gray-500 mt-2 text-sm">
                Consumers, retailers, and restaurants browse, compare, and order fresh produce directly from farms.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">🚚</span>
              </div>
              <h3 className="text-lg font-semibold mt-4">Fresh Delivery</h3>
              <p className="text-gray-500 mt-2 text-sm">
                Orders are prepared by farmers and delivered fresh. Track your order from farm to doorstep.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
