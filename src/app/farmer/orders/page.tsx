import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import OrderStatusUpdater from "./OrderStatusUpdater";

export const dynamic = "force-dynamic";

export default async function FarmerOrdersPage() {
  const session = await getSessionUser();
  if (!session || session.role !== "FARMER") {
    redirect("/login");
  }

  const orders = await prisma.order.findMany({
    where: { farmerId: session.userId },
    include: {
      items: {
        include: {
          product: { select: { name: true, unit: true } },
        },
      },
      buyer: { select: { name: true, email: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Orders</h1>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <Link href={`/orders/${order.id}`} className="text-lg font-semibold text-gray-900 hover:text-green-700">
                    Order #{order.orderNumber}
                  </Link>
                  <p className="text-sm text-gray-500">
                    {order.buyer.name} • {formatDate(order.createdAt)}
                  </p>
                  {order.buyer.phone && (
                    <p className="text-sm text-gray-400">📞 {order.buyer.phone}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-2 md:mt-0">
                  <span className="text-lg font-bold text-green-700">
                    {formatPrice(order.totalAmount)}
                  </span>
                  <OrderStatusUpdater
                    orderId={order.id}
                    currentStatus={order.status}
                  />
                </div>
              </div>
              <div className="border-t pt-3">
                <div className="space-y-1">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.product.name} × {item.quantity} {item.product.unit}
                      </span>
                      <span className="text-gray-900">{formatPrice(item.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border">
          <span className="text-5xl">📋</span>
          <h3 className="text-lg font-semibold text-gray-700 mt-4">No orders yet</h3>
          <p className="text-gray-500 mt-2">When buyers order your products, their orders will appear here.</p>
        </div>
      )}
    </div>
  );
}
