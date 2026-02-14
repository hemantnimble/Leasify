// app/dashboard/tenant/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface Lease {
  id: string;
  status: string;
  monthlyRent: number;
  securityDeposit: number;
  startDate: string;
  endDate: string;
  contractAddress?: string | null;
  property: {
    id: string;
    title: string;
    location: string;
    images: string[];
  };
  landlord: {
    walletAddress: string;
    displayName?: string | null;
  };
  payments: {
    id: string;
    status: string;
    dueDate: string;
    amount: number;
  }[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-900/50 text-yellow-400",
  AWAITING_DEPOSIT: "bg-blue-900/50 text-blue-400",
  ACTIVE: "bg-green-900/50 text-green-400",
  REJECTED: "bg-red-900/50 text-red-400",
  COMPLETED: "bg-gray-800 text-gray-400",
  TERMINATED: "bg-gray-800 text-gray-400",
};

const STATUS_MESSAGES: Record<string, string> = {
  PENDING: "Waiting for landlord to respond",
  AWAITING_DEPOSIT: "Accepted! Pay deposit to activate lease",
  ACTIVE: "Lease is active",
  REJECTED: "Request was rejected",
  COMPLETED: "Lease completed",
  TERMINATED: "Lease terminated",
};

function TenantDashboardContent() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const justRequested = searchParams.get("requested") === "true";

  useEffect(() => {
    fetch("/api/tenant/leases")
      .then((res) => res.json())
      .then((data) => setLeases(data.leases || []))
      .finally(() => setIsLoading(false));
  }, []);

  const active = leases.filter((l) => l.status === "ACTIVE").length;
  const pending = leases.filter((l) => l.status === "PENDING").length;
  const awaitingDeposit = leases.filter(
    (l) => l.status === "AWAITING_DEPOSIT"
  ).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">My Leases</h1>
          <p className="text-gray-400 mt-1">
            Track your lease requests and active agreements
          </p>
        </div>
        <Link
          href="/properties"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
        >
          Browse Properties
        </Link>
      </div>

      {/* Success notification */}
      {justRequested && (
        <div className="bg-green-900/30 border border-green-700 text-green-400 rounded-xl p-4 mb-6 text-sm">
          ✓ Lease request submitted! The landlord will review it shortly.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Active Leases", value: active, color: "text-green-400" },
          { label: "Pending Requests", value: pending, color: "text-yellow-400" },
          { label: "Awaiting Deposit", value: awaitingDeposit, color: "text-blue-400" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
          >
            <p className="text-gray-400 text-sm">{stat.label}</p>
            <p className={`text-3xl font-bold mt-1 ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Leases List */}
      {isLoading ? (
        <div className="text-center py-20 text-gray-500">
          Loading your leases...
        </div>
      ) : leases.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No lease requests yet</p>
          <Link
            href="/properties"
            className="inline-block mt-4 text-blue-400 hover:text-blue-300"
          >
            Browse properties to get started →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {leases.map((lease) => {
            const shortLandlord =
              lease.landlord.walletAddress.slice(0, 6) +
              "..." +
              lease.landlord.walletAddress.slice(-4);

            return (
              <div
                key={lease.id}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
              >
                <div className="flex items-start justify-between gap-4">

                  {/* Property info */}
                  <div className="flex gap-4 items-start">
                    <div className="w-14 h-14 bg-gray-800 rounded-xl overflow-hidden flex-shrink-0">
                      {lease.property.images.length > 0 ? (
                        <img
                          src={lease.property.images[0]}
                          alt={lease.property.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">
                          🏠
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-semibold">
                        {lease.property.title}
                      </p>
                      <p className="text-gray-400 text-sm">
                        📍 {lease.property.location}
                      </p>
                      <p className="text-gray-500 text-xs mt-1 font-mono">
                        Landlord: {lease.landlord.displayName || shortLandlord}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${
                      STATUS_COLORS[lease.status]
                    }`}
                  >
                    {lease.status.replace("_", " ")}
                  </span>
                </div>

                {/* Status message */}
                <p className="text-gray-500 text-sm mt-3">
                  {STATUS_MESSAGES[lease.status]}
                </p>

                {/* Terms */}
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {[
                    { label: "Monthly Rent", value: `${lease.monthlyRent} ETH` },
                    { label: "Deposit", value: `${lease.securityDeposit} ETH` },
                    { label: "Start", value: new Date(lease.startDate).toLocaleDateString() },
                    { label: "End", value: new Date(lease.endDate).toLocaleDateString() },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-800/50 rounded-xl p-3">
                      <p className="text-gray-500 text-xs">{item.label}</p>
                      <p className="text-white text-sm font-medium mt-1">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Pay Deposit CTA — Phase 8 will wire this up */}
                {lease.status === "AWAITING_DEPOSIT" && (
                  <div className="mt-4 bg-blue-900/20 border border-blue-800/40 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-blue-400 text-sm font-medium">
                        Deposit Required
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        Pay {lease.securityDeposit} ETH to activate your lease
                      </p>
                    </div>
                    <button
                      disabled
                      className="bg-blue-600/50 text-blue-300 cursor-not-allowed text-sm font-medium px-5 py-2 rounded-xl"
                      title="Available in Phase 8"
                    >
                      Pay Deposit (Phase 8)
                    </button>
                  </div>
                )}

                {/* Contract address — Phase 7 will populate this */}
                {lease.contractAddress && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-gray-500 text-xs">Contract:</span>
                    <a
                      href={`https://sepolia.etherscan.io/address/${lease.contractAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 text-xs font-mono hover:underline"
                    >
                      {lease.contractAddress.slice(0, 10)}...
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Wrap in Suspense because useSearchParams needs it in Next.js 15
export default function TenantDashboard() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-500">Loading...</div>}>
      <TenantDashboardContent />
    </Suspense>
  );
}