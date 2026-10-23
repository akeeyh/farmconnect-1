"use client";

import { useRouter } from "next/navigation";
import { ORDER_STATUSES } from "@/lib/utils";

const STATUS_FLOW: Record<string, string> = {
  PLACED: "ACCEPTED",
  ACCEPTED: "PREPARING",
  PREPARING: "READY",
  READY: "PICKED_UP",
  PICKED_UP: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "DELIVERED",
};

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

export default function OrderStatusUpdater({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();

  const nextStatus = STATUS_FLOW[currentStatus];

  const handleUpdate = async (status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to update order status");
      }
    } catch {
      alert("Something went wrong");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={`text-xs px-2 py-1 rounded-full font-medium ${
          STATUS_COLORS[currentStatus] || "bg-gray-100 text-gray-700"
        }`}
      >
        {currentStatus.replace(/_/g, " ")}
      </span>
      {nextStatus && (
        <button
          onClick={() => handleUpdate(nextStatus)}
          className="text-xs bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-700 transition"
        >
          → {nextStatus.replace(/_/g, " ")}
        </button>
      )}
      {currentStatus !== "DELIVERED" && currentStatus !== "CANCELLED" && (
        <button
          onClick={() => {
            if (confirm("Cancel this order? Inventory will be restored.")) {
              handleUpdate("CANCELLED");
            }
          }}
          className="text-xs text-red-500 hover:text-red-700 px-2 py-1"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
