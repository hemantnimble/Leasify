// app/properties/[id]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useWalletAuth } from "@/hooks/useWalletAuth";

interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  monthlyRent: number;
  securityDeposit: number;
  minimumLeaseDuration: number;
  images: string[];
  status: string;
  createdAt: string;
  landlord: {
    walletAddress: string;
    displayName?: string | null;
  };
}

export default function PropertyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated, role } = useWalletAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // ✅ track error

  useEffect(() => {
    if (!id) return;

    const fetchProperty = async () => {
      try {
        console.log("Fetching property:", id); // ✅ debug

        const res = await fetch(`/api/properties/${id}`);

        console.log("Response status:", res.status); // ✅ debug

        // ✅ Read as text first to avoid empty body crash
        const text = await res.text();
        console.log("Raw response:", text); // ✅ debug

        if (!text) {
          setError("Empty response from server");
          return;
        }

        const data = JSON.parse(text);

        if (!res.ok) {
          setError(data.error || "Failed to load property");
          return;
        }

        setProperty(data.property);

      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load property");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (isLoading) {
    return (
      <div className="text-center py-20 text-gray-500">
        Loading property...
      </div>
    );
  }

  // ✅ Show actual error message instead of blank page
  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 text-xl mb-2">Error</p>
        <p className="text-gray-500 text-sm mb-6">{error}</p>
        <Link href="/properties" className="text-blue-400 hover:text-blue-300">
          ← Back to listings
        </Link>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-xl">Property not found</p>
        <Link href="/properties" className="text-blue-400 mt-4 inline-block">
          ← Back to listings
        </Link>
      </div>
    );
  }

  const shortAddress = property.landlord?.walletAddress
    ? property.landlord.walletAddress.slice(0, 6) +
      "..." +
      property.landlord.walletAddress.slice(-4)
    : "Unknown";

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/properties"
        className="text-gray-400 hover:text-white text-sm transition-colors"
      >
        ← Back to listings
      </Link>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: Main Info */}
        <div className="lg:col-span-2">
          <div className="h-72 bg-gray-800 rounded-2xl overflow-hidden mb-6">
            {property.images.length > 0 ? (
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">
                🏠
              </div>
            )}
          </div>

          <h1 className="text-3xl font-bold text-white">{property.title}</h1>
          <p className="text-gray-400 mt-2">📍 {property.location}</p>

          <div className="mt-6">
            <h2 className="text-white font-semibold mb-3">About this property</h2>
            <p className="text-gray-400 leading-relaxed">{property.description}</p>
          </div>
        </div>

        {/* Right: Pricing + Action */}
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <p className="text-blue-400 font-bold text-3xl">
              {property.monthlyRent} ETH
            </p>
            <p className="text-gray-400 text-sm">per month</p>

            <div className="border-t border-gray-800 mt-4 pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Security Deposit</span>
                <span className="text-white font-medium">
                  {property.securityDeposit} ETH
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Min. Duration</span>
                <span className="text-white font-medium">
                  {property.minimumLeaseDuration} months
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Status</span>
                <span className={property.status === "AVAILABLE" ? "text-green-400" : "text-gray-400"}>
                  {property.status}
                </span>
              </div>
            </div>

            <div className="mt-6">
              {!isAuthenticated ? (
                <Link
                  href="/login"
                  className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  Connect Wallet to Request Lease
                </Link>
              ) : role === "TENANT" && property.status === "AVAILABLE" ? (
                <button
                  onClick={() => router.push(`/properties/${property.id}/request`)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  Request Lease
                </button>
              ) : role === "LANDLORD" ? (
                <p className="text-center text-gray-500 text-sm">
                  You are viewing as a Landlord
                </p>
              ) : (
                <p className="text-center text-gray-500 text-sm">
                  Property not available
                </p>
              )}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">
              Landlord
            </p>
            <p className="text-white font-medium">
              {property.landlord?.displayName || "Anonymous Landlord"}
            </p>
            <p className="text-gray-500 text-xs font-mono mt-1">{shortAddress}</p>
          </div>
        </div>
      </div>
    </div>
  );
}