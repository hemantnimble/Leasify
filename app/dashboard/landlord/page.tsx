// app/dashboard/landlord/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  leases: { id: string; status: string }[];
}

export default function LandlordDashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProperties = async () => {
    try {
      const res = await fetch("/api/landlord/properties");
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

  const handleUnlist = async (propertyId: string) => {
    const property = properties.find((p) => p.id === propertyId);
    if (!property) return;

    const newStatus =
      property.status === "UNLISTED" ? "AVAILABLE" : "UNLISTED";

    try {
      await fetch(`/api/properties/${propertyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchProperties(); // Refresh
    } catch (err) {
      console.error("Failed to update property:", err);
    }
  };

  // Stats
  const available = properties.filter((p) => p.status === "AVAILABLE").length;
  const rented = properties.filter((p) => p.status === "RENTED").length;
  const activeLeases = properties.reduce(
    (sum, p) =>
      sum +
      p.leases.filter((l) =>
        ["ACTIVE", "AWAITING_DEPOSIT"].includes(l.status)
      ).length,
    0
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Landlord Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage your properties and leases</p>
        </div>
        <Link
          href="/dashboard/landlord/add"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          + Add Property
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Properties", value: properties.length, color: "text-white" },
          { label: "Available", value: available, color: "text-green-400" },
          { label: "Active Leases", value: activeLeases, color: "text-blue-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <p className="text-gray-400 text-sm">{stat.label}</p>
            <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>
      {/* Pending Requests Alert */}
      {properties.some((p) =>
        p.leases.some((l) => l.status === "PENDING")
      ) && (
          <Link
            href="/dashboard/landlord/requests"
            className="flex items-center justify-between bg-yellow-900/20 border border-yellow-800/40 rounded-2xl p-5 mb-6 hover:border-yellow-700 transition-colors"
          >
            <div>
              <p className="text-yellow-400 font-semibold">
                Pending Lease Requests
              </p>
              <p className="text-gray-400 text-sm mt-1">
                You have tenant requests waiting for your response
              </p>
            </div>
            <span className="text-yellow-400 text-2xl">→</span>
          </Link>
        )}

      {/* Properties Grid */}
      {isLoading ? (
        <div className="text-center py-20 text-gray-500">Loading properties...</div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No properties yet</p>
          <Link
            href="/dashboard/landlord/add"
            className="inline-block mt-4 text-blue-400 hover:text-blue-300"
          >
            List your first property →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              showActions={true}
              onUnlist={handleUnlist}
            />
          ))}
        </div>
      )}
    </div>
  );
}