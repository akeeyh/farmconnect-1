import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  PLACED: "bg-blue-100 text-blue-700",
  ACCEPTED: "bg-indigo-100 text-indigo-700",
  PREPARING: "bg-yellow-100 text-yellow-700",
  READY: "bg-orange-100 text-orange-700",
  PICKED_UP: "bg-purple-100 text-purple-700",
  OUT_FOR_DELIVERY: "bg-cyan-100 text-cyan-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function OrdersPage() {
  const session = await getSessionUser();
  if (!session) {
    redirect("/login");
  }

  const where = session.role === "FARMER"
    ? { farmerId: session.userId }
    : { buyerId: session.userId };

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: {
        include: {
          product: { select: { name: true, unit: true } },
        },
      },
      buyer: { select: { name: true } },
      farmer: {
        select: {
          name: true,
          farmProfile: { select: { farmName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block bg-white rounded-xl border p-6 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900">
                    Order #{order.orderNumber}
                  </p>
                  <p className="text-sm text-gray-500">
                    {session.role === "FARMER"
                      ? `Buyer: ${order.buyer.name}`
                      : `From: ${order.farmer.farmProfile?.farmName || order.farmer.name}`}
                    {" "}• {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-700">
                    {formatPrice(order.totalAmount)}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      STATUS_COLORS[order.status] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {order.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
              <div className="border-t pt-3">
                <div className="flex flex-wrap gap-2">
                  {order.items.map((item) => (
                    <span
                      key={item.id}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                    >
                      {item.product.name} × {item.quantity} {item.product.unit}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border">
          <span className="text-5xl">📦</span>
          <h3 className="text-lg font-semibold text-gray-700 mt-4">
            No orders yet
          </h3>
          <p className="text-gray-500 mt-2">
            {session.role === "FARMER"
              ? "When buyers order your products, their orders will appear here."
              : "Browse the marketplace and place your first order!"}
          </p>
          {session.role !== "FARMER" && (
            <Link
              href="/marketplace"
              className="inline-block mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Browse Marketplace
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
