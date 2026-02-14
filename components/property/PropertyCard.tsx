// components/property/PropertyCard.tsx

"use client";

import Link from "next/link";

interface Property {
  id: string;
  title: string;
  location: string;
  monthlyRent: number;
  securityDeposit: number;
  minimumLeaseDuration: number;
  images: string[];
  status: string;
  landlord?: {                          // ✅ mark as optional
    walletAddress: string;
    displayName?: string | null;
  };
  leases?: { id: string; status: string }[];
}

interface PropertyCardProps {
  property: Property;
  showActions?: boolean;
  onUnlist?: (id: string) => void;
}

export default function PropertyCard({
  property,
  showActions = false,
  onUnlist,
}: PropertyCardProps) {
  // ✅ Safe fallback if landlord is undefined
  const shortAddress = property.landlord?.walletAddress
    ? property.landlord.walletAddress.slice(0, 6) +
      "..." +
      property.landlord.walletAddress.slice(-4)
    : "Unknown";

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-600 transition-colors duration-200">

      {/* Image */}
      <div className="h-48 bg-gray-800 relative">
        {property.images.length > 0 ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            <span className="text-4xl">🏠</span>
          </div>
        )}

        {/* Status badge */}
        <span
          className={`absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-full ${
            property.status === "AVAILABLE"
              ? "bg-green-900/80 text-green-400"
              : property.status === "RENTED"
              ? "bg-blue-900/80 text-blue-400"
              : "bg-gray-800/80 text-gray-400"
          }`}
        >
          {property.status}
        </span>
      </div>

      {/* Details */}
      <div className="p-5">
        <h3 className="text-white font-semibold text-lg truncate">
          {property.title}
        </h3>
        <p className="text-gray-400 text-sm mt-1">📍 {property.location}</p>

        {/* Pricing */}
        <div className="mt-4 flex justify-between items-center">
          <div>
            <p className="text-blue-400 font-bold text-xl">
              {property.monthlyRent} ETH
              <span className="text-gray-500 text-sm font-normal">/month</span>
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Deposit: {property.securityDeposit} ETH
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">
              Min. {property.minimumLeaseDuration} months
            </p>
            {/* ✅ Only show if landlord exists */}
            {property.landlord?.walletAddress && (
              <p className="text-gray-600 text-xs mt-1 font-mono">
                {shortAddress}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <Link
            href={`/properties/${property.id}`}
            className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-xl transition-colors"
          >
            View Details
          </Link>

          {showActions && (
            <button
              onClick={() => onUnlist?.(property.id)}
              className="text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-800 text-sm font-medium py-2 px-4 rounded-xl transition-colors"
            >
              {property.status === "UNLISTED" ? "Relist" : "Unlist"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}