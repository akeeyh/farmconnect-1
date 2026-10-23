import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import ProductDeleteButton from "./ProductDeleteButton";

export const dynamic = "force-dynamic";

export default async function FarmerProductsPage() {
  const session = await getSessionUser();
  if (!session || session.role !== "FARMER") {
    redirect("/login");
  }

  const products = await prisma.product.findMany({
    where: { farmerId: session.userId },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
        <Link
          href="/farmer/products/new"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
        >
          + Add Product
        </Link>
      </div>

      {products.length > 0 ? (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Product</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Category</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Price</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Stock</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Listed</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      {product.farmingType !== "Conventional" && (
                        <span className="text-xs text-green-600">{product.farmingType}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {product.category.icon} {product.category.name}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {formatPrice(product.price)}/{product.unit}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {product.quantity} {product.unit}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          product.isAvailable && product.quantity > 0
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {product.isAvailable && product.quantity > 0
                          ? "Available"
                          : "Out of Stock"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(product.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ProductDeleteButton productId={product.id} productName={product.name} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border">
          <span className="text-5xl">📦</span>
          <h3 className="text-lg font-semibold text-gray-700 mt-4">
            No products yet
          </h3>
          <p className="text-gray-500 mt-2">
            Start listing your produce to reach buyers.
          </p>
          <Link
            href="/farmer/products/new"
            className="inline-block mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Add Your First Product
          </Link>
        </div>
      )}
    </div>
  );
}
