// app/dashboard/landlord/requests/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Lease {
  id: string;
  status: string;
  monthlyRent: number;
  securityDeposit: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  tenant: {
    walletAddress: string;
    displayName?: string | null;
  };
  property: {
    id: string;
    title: string;
    location: string;
    images: string[];
  };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-900/50 text-yellow-400 border-yellow-800/50",
  AWAITING_DEPOSIT: "bg-blue-900/50 text-blue-400 border-blue-800/50",
  ACTIVE: "bg-green-900/50 text-green-400 border-green-800/50",
  REJECTED: "bg-red-900/50 text-red-400 border-red-800/50",
  COMPLETED: "bg-gray-800 text-gray-400 border-gray-700",
  TERMINATED: "bg-gray-800 text-gray-400 border-gray-700",
};

export default function LandlordRequestsPage() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"PENDING" | "ALL">("PENDING");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchLeases = async () => {
    try {
      const url =
        activeTab === "PENDING"
          ? "/api/landlord/leases?status=PENDING"
          : "/api/landlord/leases";
      const res = await fetch(url);
      const data = await res.json();
      setLeases(data.leases || []);
    } catch (err) {
      console.error("Failed to fetch leases:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeases();
  }, [activeTab]);

  const handleAccept = async (leaseId: string) => {
    setProcessingId(leaseId);
    try {
      const res = await fetch("/api/lease/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaseId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchLeases();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (leaseId: string) => {
    setProcessingId(leaseId);
    try {
      const res = await fetch("/api/lease/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaseId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchLeases();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const pendingCount = leases.filter((l) => l.status === "PENDING").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/dashboard/landlord"
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            ← Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-white mt-2">Lease Requests</h1>
          <p className="text-gray-400 mt-1">
            Review and respond to tenant lease requests
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["PENDING", "ALL"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {tab === "PENDING" ? `Pending${pendingCount > 0 && activeTab === "PENDING" ? ` (${pendingCount})` : ""}` : "All Requests"}
          </button>
        ))}
      </div>

      {/* Lease Cards */}
      {isLoading ? (
        <div className="text-center py-20 text-gray-500">Loading...</div>
      ) : leases.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No lease requests found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leases.map((lease) => {
            const shortTenant =
              lease.tenant.walletAddress.slice(0, 6) +
              "..." +
              lease.tenant.walletAddress.slice(-4);

            return (
              <div
                key={lease.id}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
              >
                <div className="flex items-start justify-between gap-4">

                  {/* Left: Property + Tenant info */}
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
                        Tenant: {lease.tenant.displayName || shortTenant}
                      </p>
                    </div>
                  </div>

                  {/* Right: Status badge */}
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full border flex-shrink-0 ${
                      STATUS_COLORS[lease.status] || STATUS_COLORS.COMPLETED
                    }`}
                  >
                    {lease.status.replace("_", " ")}
                  </span>
                </div>

                {/* Lease Terms */}
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {[
                    {
                      label: "Monthly Rent",
                      value: `${lease.monthlyRent} ETH`,
                    },
                    {
                      label: "Deposit",
                      value: `${lease.securityDeposit} ETH`,
                    },
                    {
                      label: "Start",
                      value: new Date(lease.startDate).toLocaleDateString(),
                    },
                    {
                      label: "End",
                      value: new Date(lease.endDate).toLocaleDateString(),
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="bg-gray-800/50 rounded-xl p-3"
                    >
                      <p className="text-gray-500 text-xs">{item.label}</p>
                      <p className="text-white text-sm font-medium mt-1">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Action Buttons — only for PENDING */}
                {lease.status === "PENDING" && (
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => handleAccept(lease.id)}
                      disabled={processingId === lease.id}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-900 disabled:cursor-not-allowed text-white font-medium py-2 rounded-xl transition-colors text-sm"
                    >
                      {processingId === lease.id ? "Processing..." : "✓ Accept"}
                    </button>
                    <button
                      onClick={() => handleReject(lease.id)}
                      disabled={processingId === lease.id}
                      className="flex-1 bg-gray-800 hover:bg-red-900/50 disabled:cursor-not-allowed text-gray-300 hover:text-red-400 border border-gray-700 hover:border-red-800 font-medium py-2 rounded-xl transition-colors text-sm"
                    >
                      {processingId === lease.id ? "Processing..." : "✕ Reject"}
                    </button>
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