import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import AddToCartButton from "./AddToCartButton";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      farmer: {
        select: {
          id: true,
          name: true,
          phone: true,
          isVerified: true,
          farmProfile: true,
          reviewsReceived: {
            select: { rating: true },
          },
        },
      },
      category: true,
      reviews: {
        include: {
          author: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const avgRating =
    product.farmer.reviewsReceived.length > 0
      ? (
          product.farmer.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) /
          product.farmer.reviewsReceived.length
        ).toFixed(1)
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl flex items-center justify-center h-80 md:h-96">
          <span className="text-8xl">{product.category?.icon || "🌿"}</span>
        </div>

        {/* Product Info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href={`/marketplace?category=${encodeURIComponent(product.category.name)}`}
              className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full hover:bg-green-200"
            >
              {product.category.icon} {product.category.name}
            </Link>
            {product.farmingType && product.farmingType !== "Conventional" && (
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                {product.farmingType}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

          <div className="mt-4">
            <span className="text-3xl font-bold text-green-700">
              {formatPrice(product.price)}
            </span>
            <span className="text-lg text-gray-500">/{product.unit}</span>
          </div>

          {product.description && (
            <p className="mt-4 text-gray-600">{product.description}</p>
          )}

          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <p>📦 Available: <strong>{product.quantity} {product.unit}</strong></p>
            {product.harvestDate && (
              <p>🌾 Harvested: <strong>{formatDate(product.harvestDate)}</strong></p>
            )}
            {product.freshnessDays && (
              <p>⏳ Freshness: <strong>{product.freshnessDays} days</strong></p>
            )}
            {product.minOrderQty && product.minOrderQty > 1 && (
              <p>🛍️ Minimum order: <strong>{product.minOrderQty} {product.unit}</strong></p>
            )}
          </div>

          {product.isAvailable && product.quantity > 0 ? (
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                unit: product.unit,
                farmerId: product.farmer.id,
                farmerName:
                  product.farmer.farmProfile?.farmName || product.farmer.name,
                maxQuantity: product.quantity,
              }}
            />
          ) : (
            <div className="mt-6 bg-red-50 text-red-600 p-4 rounded-lg text-center font-medium">
              This product is currently out of stock
            </div>
          )}
        </div>
      </div>

      {/* Farmer Info */}
      <div className="mt-12 bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">About the Farmer</h2>
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center text-2xl">
            👨‍🌾
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {product.farmer.farmProfile?.farmName || product.farmer.name}
              {product.farmer.isVerified && (
                <span className="text-green-600 ml-2 text-sm">✓ Verified</span>
              )}
            </h3>
            <p className="text-sm text-gray-500">{product.farmer.name}</p>
            {product.farmer.farmProfile && (
              <>
                <p className="text-sm text-gray-500">
                  📍 {product.farmer.farmProfile.location}
                </p>
                {product.farmer.farmProfile.farmSize && (
                  <p className="text-sm text-gray-500">
                    🌾 {product.farmer.farmProfile.farmSize}{" "}
                    {product.farmer.farmProfile.farmSizeUnit} •{" "}
                    {product.farmer.farmProfile.farmingType} Farming
                  </p>
                )}
              </>
            )}
            {avgRating && (
              <p className="text-sm text-gray-600 mt-1">
                ⭐ {avgRating}/5 ({product.farmer.reviewsReceived.length} reviews)
              </p>
            )}
            {product.farmer.farmProfile?.description && (
              <p className="text-sm text-gray-500 mt-2">
                {product.farmer.farmProfile.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Reviews */}
      {product.reviews.length > 0 && (
        <div className="mt-8 bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Reviews ({product.reviews.length})
          </h2>
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{review.author.name}</span>
                  <span className="text-yellow-500">
                    {"⭐".repeat(review.rating)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
