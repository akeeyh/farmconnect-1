"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FARMING_TYPES } from "@/lib/utils";

export default function FarmerSetupPage() {
  const [farmName, setFarmName] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [farmSize, setFarmSize] = useState("");
  const [farmingType, setFarmingType] = useState("Conventional");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/farm-profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) {
          setIsEdit(true);
          setFarmName(data.profile.farmName);
          setLocation(data.profile.location);
          setAddress(data.profile.address || "");
          setFarmSize(data.profile.farmSize?.toString() || "");
          setFarmingType(data.profile.farmingType || "Conventional");
          setDescription(data.profile.description || "");
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/farm-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmName,
          location,
          address,
          farmSize,
          farmingType,
          description,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save farm profile");
        return;
      }

      router.push("/farmer/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <span className="text-4xl">🌾</span>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">
          {isEdit ? "Edit Farm Profile" : "Set Up Your Farm"}
        </h1>
        <p className="text-gray-500 mt-1">
          Tell buyers about your farm so they can find and trust you.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border p-6 space-y-4"
      >
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Farm Name *
          </label>
          <input
            type="text"
            value={farmName}
            onChange={(e) => setFarmName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            required
            placeholder="e.g. Green Valley Farm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location *
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            required
            placeholder="e.g. Kottayam, Kerala"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Address
          </label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            rows={2}
            placeholder="Full farm address"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Farm Size (acres)
            </label>
            <input
              type="number"
              value={farmSize}
              onChange={(e) => setFarmSize(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              step="0.1"
              min="0"
              placeholder="e.g. 4.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Farming Type
            </label>
            <select
              value={farmingType}
              onChange={(e) => setFarmingType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            >
              {FARMING_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            About Your Farm
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            rows={3}
            placeholder="Tell buyers about your farm, farming practices, specialties..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : isEdit
              ? "Update Farm Profile"
              : "Create Farm Profile"}
        </button>
      </form>
    </div>
  );
}
