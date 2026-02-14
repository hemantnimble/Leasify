// app/properties/page.tsx

"use client";

import { useState, useEffect } from "react";
import PropertyCard from "@/components/property/PropertyCard";

interface Property {
  id: string;
  title: string;
  location: string;
  monthlyRent: number;
  securityDeposit: number;
  minimumLeaseDuration: number;
  images: string[];
  status: string;
  landlord: { walletAddress: string; displayName?: string | null };
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [locationFilter, setLocationFilter] = useState("");
  const [maxRentFilter, setMaxRentFilter] = useState("");

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (locationFilter) params.set("location", locationFilter);
      if (maxRentFilter) params.set("maxRent", maxRentFilter);

      const res = await fetch(`/api/properties?${params.toString()}`);
      const data = await res.json();
      setProperties(data.properties || []);
    } catch (err) {
      console.error("Failed to fetch properties:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProperties();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Browse Properties</h1>
        <p className="text-gray-400 mt-1">
          Find your next home with blockchain-secured lease agreements
        </p>
      </div>

      {/* Filters */}
      <form
        onSubmit={handleSearch}
        className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8 flex gap-4 flex-wrap"
      >
        <input
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          placeholder="Search by location..."
          className="flex-1 min-w-[200px] bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
        />
        <input
          type="number"
          step="0.001"
          value={maxRentFilter}
          onChange={(e) => setMaxRentFilter(e.target.value)}
          placeholder="Max rent (ETH)"
          className="w-48 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl transition-colors"
        >
          Search
        </button>
      </form>

      {/* Results */}
      {isLoading ? (
        <div className="text-center py-20 text-gray-500">
          Loading properties...
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No properties found</p>
          <p className="text-gray-600 text-sm mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <p className="text-gray-400 text-sm mb-4">
            {properties.length} propert{properties.length === 1 ? "y" : "ies"} found
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}