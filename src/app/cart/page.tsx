"use client";

import { useCartStore } from "@/store/cart";
import Link from "next/link";
import { Trash2, Minus, Plus } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, getDeliveryFee, clearCart } =
    useCartStore();

  const total = getTotal();
  const deliveryFee = getDeliveryFee();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <span className="text-6xl">🛒</span>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">Your cart is empty</h1>
        <p className="text-gray-500 mt-2">
          Browse the marketplace to find fresh produce from local farmers.
        </p>
        <Link
          href="/marketplace"
          className="inline-block mt-6 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
        >
          Browse Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="text-sm text-red-500 hover:text-red-700"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="bg-white rounded-xl border p-4 flex items-center gap-4"
            >
              <div className="h-20 w-20 bg-green-50 rounded-lg flex items-center justify-center text-3xl">
                🌿
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                <p className="text-sm text-gray-500">{item.product.farmerName}</p>
                <p className="text-sm font-medium text-green-700">
                  {formatPrice(item.product.price)}/{item.product.unit}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    updateQuantity(item.product.id, item.quantity - 1)
                  }
                  className="p-1 border rounded hover:bg-gray-100"
                  disabled={item.quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center font-medium">
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    updateQuantity(item.product.id, item.quantity + 1)
                  }
                  className="p-1 border rounded hover:bg-gray-100"
                  disabled={item.quantity >= item.product.maxQuantity}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">
                  {formatPrice(item.product.price * item.quantity)}
                </p>
                <button
                  onClick={() => removeItem(item.product.id)}
                  className="text-red-400 hover:text-red-600 mt-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl border p-6 h-fit sticky top-20">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="text-gray-900">
                {deliveryFee === 0 ? (
                  <span className="text-green-600">FREE</span>
                ) : (
                  formatPrice(deliveryFee)
                )}
              </span>
            </div>
            {total > 0 && total <= 500 && (
              <p className="text-xs text-green-600">
                Add {formatPrice(500 - total)} more for free delivery!
              </p>
            )}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-green-700">
                  {formatPrice(total + deliveryFee)}
                </span>
              </div>
            </div>
          </div>
          <Link
            href="/checkout"
            className="block w-full bg-green-600 text-white text-center py-3 rounded-lg font-medium hover:bg-green-700 transition mt-4"
          >
            Proceed to Checkout
          </Link>
          <Link
            href="/marketplace"
            className="block w-full text-center text-green-600 hover:underline text-sm mt-3"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
