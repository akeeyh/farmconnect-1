"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore, CartProduct } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    unit: string;
    quantity: number;
    farmingType: string | null;
    isAvailable: boolean;
    images: string | null;
    farmer: {
      id: string;
      name: string;
      farmProfile?: {
        farmName: string;
        location: string;
      } | null;
    };
    category: {
      name: string;
      icon: string | null;
    };
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    const cartProduct: CartProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      farmerId: product.farmer.id,
      farmerName: product.farmer.farmProfile?.farmName || product.farmer.name,
      maxQuantity: product.quantity,
    };
    addItem(cartProduct, 1);
  };

  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="h-48 bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
          <span className="text-6xl">{product.category?.icon || "🌿"}</span>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-green-700 transition">
                {product.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {product.farmer.farmProfile?.farmName || product.farmer.name}
              </p>
              <p className="text-xs text-gray-400">
                📍 {product.farmer.farmProfile?.location || "Local"}
              </p>
            </div>
            {product.farmingType && product.farmingType !== "Conventional" && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                {product.farmingType}
              </span>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-green-700">
                {formatPrice(product.price)}
              </span>
              <span className="text-sm text-gray-500">/{product.unit}</span>
            </div>
            {product.isAvailable && product.quantity > 0 ? (
              <button
                onClick={handleAddToCart}
                className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition"
                title="Add to cart"
              >
                <ShoppingCart className="h-4 w-4" />
              </button>
            ) : (
              <span className="text-xs text-red-500 font-medium">Out of stock</span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {product.quantity} {product.unit} available
          </p>
        </div>
      </div>
    </Link>
  );
}
