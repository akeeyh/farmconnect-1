import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function FarmersPage() {
  const farmers = await prisma.user.findMany({
    where: { role: "FARMER", farmProfile: { isNot: null } },
    include: {
      farmProfile: true,
      _count: {
        select: { products: { where: { isAvailable: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900">Meet Our Farmers</h1>
        <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
          Connect directly with the hardworking individuals growing your food. Support local agriculture and source fresh produce directly from the farm.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {farmers.map((farmer) => (
          <div key={farmer.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition">
            <div className="h-32 bg-green-100 flex items-center justify-center">
              <span className="text-5xl">🚜</span>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900">{farmer.farmProfile?.farmName}</h2>
              <p className="text-sm text-gray-500 mt-1">Managed by {farmer.name}</p>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">📍</span> {farmer.farmProfile?.location}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">🌱</span> {farmer.farmProfile?.farmingType} Farming
                </div>
                <div className="flex items-center text-sm font-medium text-green-700">
                  <span className="mr-2">📦</span> {farmer._count.products} Active Products
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href={`/marketplace?farmerId=${farmer.id}`}
                  className="block w-full text-center bg-gray-50 text-green-700 border border-green-200 font-medium py-2 rounded-lg hover:bg-green-50 transition"
                >
                  View Products
                </Link>
              </div>
            </div>
          </div>
        ))}

        {farmers.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No farmers have joined the platform yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
