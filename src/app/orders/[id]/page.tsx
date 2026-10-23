import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import OrderStatusUpdater from "@/app/farmer/orders/OrderStatusUpdater";

export const dynamic = "force-dynamic";

const STATUS_STEPS = [
  "PLACED",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "PICKED_UP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  const { id } = await params;
  const { success } = await searchParams;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, unit: true },
          },
        },
      },
      buyer: {
        select: { id: true, name: true, email: true, phone: true },
      },
      farmer: {
        select: {
          id: true,
          name: true,
          phone: true,
          farmProfile: {
            select: { farmName: true, location: true },
          },
        },
      },
    },
  });

  if (!order) notFound();

  if (
    order.buyerId !== session.userId &&
    order.farmerId !== session.userId &&
    session.role !== "ADMIN"
  ) {
    redirect("/orders");
  }

  const currentStepIndex = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6 text-center">
          <span className="text-2xl">✅</span>
          <p className="font-semibold mt-1">Order placed successfully!</p>
          <p className="text-sm">The farmer has been notified and will prepare your order.</p>
        </div>
      )}

      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Order #{order.orderNumber}
            </h1>
            <p className="text-sm text-gray-500 mb-3">
              Placed on {formatDate(order.createdAt)}
            </p>
            {session.userId === order.farmerId && !isCancelled && (
              <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-700">
              {formatPrice(order.totalAmount)}
            </p>
            <p className="text-xs text-gray-500">
              Payment: {order.paymentMethod} • {order.paymentStatus}
            </p>
          </div>
        </div>

        {/* Status Tracker */}
        {!isCancelled ? (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {STATUS_STEPS.map((step, index) => (
                <div key={step} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      index <= currentStepIndex
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {index <= currentStepIndex ? "✓" : index + 1}
                  </div>
                  <p
                    className={`text-xs mt-1 text-center hidden sm:block ${
                      index <= currentStepIndex
                        ? "text-green-700 font-medium"
                        : "text-gray-400"
                    }`}
                  >
                    {step.replace(/_/g, " ")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 text-center font-medium">
            This order has been cancelled
          </div>
        )}

        {/* Items */}
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Order Items</h2>
        <div className="space-y-2 mb-6">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <Link
                  href={`/products/${item.product.id}`}
                  className="font-medium text-gray-900 hover:text-green-700"
                >
                  {item.product.name}
                </Link>
                <p className="text-sm text-gray-500">
                  {item.quantity} {item.product.unit} × {formatPrice(item.price)}
                </p>
              </div>
              <p className="font-medium text-gray-900">{formatPrice(item.total)}</p>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span>{formatPrice(order.totalAmount - order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Delivery Fee</span>
            <span>
              {order.deliveryFee === 0 ? (
                <span className="text-green-600">FREE</span>
              ) : (
                formatPrice(order.deliveryFee)
              )}
            </span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total</span>
            <span className="text-green-700">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>

        {/* Delivery Address */}
        {order.deliveryAddress && (
          <div className="mt-6 border-t pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              Delivery Address
            </h3>
            <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
          </div>
        )}

        {/* Farmer / Buyer Info */}
        <div className="mt-6 border-t pt-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            {session.userId === order.buyerId ? "Farmer" : "Buyer"} Details
          </h3>
          {session.userId === order.buyerId ? (
            <div className="text-sm text-gray-600">
              <p>👨‍🌾 {order.farmer.farmProfile?.farmName || order.farmer.name}</p>
              <p>📍 {order.farmer.farmProfile?.location}</p>
              {order.farmer.phone && <p>📞 {order.farmer.phone}</p>}
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              <p>👤 {order.buyer.name}</p>
              <p>📧 {order.buyer.email}</p>
              {order.buyer.phone && <p>📞 {order.buyer.phone}</p>}
            </div>
          )}
        </div>

        {order.notes && (
          <div className="mt-6 border-t pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-1">Notes</h3>
            <p className="text-sm text-gray-600">{order.notes}</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-4">
        <Link
          href="/orders"
          className="text-green-600 hover:underline text-sm font-medium"
        >
          ← Back to Orders
        </Link>
        <Link
          href="/marketplace"
          className="text-green-600 hover:underline text-sm font-medium"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
