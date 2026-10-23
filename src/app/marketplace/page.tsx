"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, X } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { FARMING_TYPES } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  icon: string | null;
  _count: { products: number };
}

interface Product {
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
    farmProfile: {
      farmName: string;
      location: string;
    } | null;
  };
  category: {
    name: string;
    icon: string | null;
  };
}

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedFarmingType, setSelectedFarmingType] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedFarmingType) params.set("farmingType", selectedFarmingType);

    try {
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedFarmingType]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    // Check URL for category param
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    if (cat) setSelectedCategory(cat);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => fetchProducts(), 300);
    return () => clearTimeout(timeout);
  }, [fetchProducts]);

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedFarmingType("");
  };

  const hasFilters = search || selectedCategory || selectedFarmingType;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden flex items-center text-gray-600 border px-3 py-2 rounded-lg"
        >
          <Filter className="h-4 w-4 mr-2" /> Filters
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search vegetables, fruits, farmers..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
        />
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 shrink-0`}>
          <div className="bg-white rounded-xl border p-4 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-red-500 hover:underline flex items-center"
                >
                  <X className="h-3 w-3 mr-1" /> Clear all
                </button>
              )}
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Category</h4>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() =>
                      setSelectedCategory(
                        selectedCategory === cat.name ? "" : cat.name
                      )
                    }
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                      selectedCategory === cat.name
                        ? "bg-green-50 text-green-700 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {cat.icon} {cat.name}
                    <span className="text-xs text-gray-400 ml-1">
                      ({cat._count.products})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Farming Type
              </h4>
              <div className="space-y-1">
                {FARMING_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() =>
                      setSelectedFarmingType(
                        selectedFarmingType === type ? "" : type
                      )
                    }
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                      selectedFarmingType === type
                        ? "bg-green-50 text-green-700 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl border p-4 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <p className="text-sm text-gray-500 mb-4">
                {products.length} product{products.length !== 1 ? "s" : ""} found
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <span className="text-5xl">🔍</span>
              <h3 className="text-lg font-semibold text-gray-700 mt-4">
                No products found
              </h3>
              <p className="text-gray-500 mt-2">
                {hasFilters
                  ? "Try adjusting your filters or search terms."
                  : "No products are listed yet. Check back soon!"}
              </p>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-green-600 hover:underline text-sm font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
