"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCartStore, CartProduct } from "@/store/cart";

export default function AddToCartButton({ product }: { product: CartProduct }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="mt-6 flex items-center gap-4">
      <div className="flex items-center border rounded-lg">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="px-3 py-2 text-gray-600 hover:bg-gray-100"
        >
          −
        </button>
        <input
          type="number"
          value={quantity}
          onChange={(e) =>
            setQuantity(
              Math.max(1, Math.min(product.maxQuantity, Number(e.target.value)))
            )
          }
          className="w-16 text-center border-x py-2 outline-none"
          min={1}
          max={product.maxQuantity}
        />
        <button
          onClick={() =>
            setQuantity(Math.min(product.maxQuantity, quantity + 1))
          }
          className="px-3 py-2 text-gray-600 hover:bg-gray-100"
        >
          +
        </button>
      </div>
      <span className="text-sm text-gray-500">{product.unit}</span>
      <button
        onClick={handleAdd}
        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition ${
          added
            ? "bg-green-100 text-green-700"
            : "bg-green-600 text-white hover:bg-green-700"
        }`}
      >
        {added ? (
          <>
            <Check className="h-5 w-5" /> Added to Cart
          </>
        ) : (
          <>
            <ShoppingCart className="h-5 w-5" /> Add to Cart
          </>
        )}
      </button>
    </div>
  );
}
