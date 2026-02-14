// app/dashboard/landlord/leases/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import NetworkWarning from "@/components/blockchain/NetworkWarning";

interface Lease {
  id: string;
  status: string;
  monthlyRent: number;
  securityDeposit: number;
  startDate: string;
  endDate: string;
  contractAddress?: string | null;
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
  payments: {
    id: string;
    status: string;
    dueDate: string;
    amount: number;
  }[];
}

const STATUS_COLORS: Record<string, string> = {
  AWAITING_DEPOSIT: "bg-blue-900/50 text-blue-400",
  ACTIVE:           "bg-green-900/50 text-green-400",
};

export default function LandlordActiveLeasesPage() {
  const [leases, setLeases]     = useState<Lease[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/landlord/leases/active")
      .then((res) => res.json())
      .then((data) => setLeases(data.leases || []))
      .finally(() => setIsLoading(false));
  }, []);

  const active           = leases.filter((l) => l.status === "ACTIVE").length;
  const awaitingDeposit  = leases.filter((l) => l.status === "AWAITING_DEPOSIT").length;

  return (
    <div>
      <NetworkWarning />

      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/dashboard/landlord"
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            ← Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-white mt-2">Active Leases</h1>
          <p className="text-gray-400 mt-1">
            Manage your running lease agreements
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[
          { label: "Active",           value: active,          color: "text-green-400" },
          { label: "Awaiting Deposit", value: awaitingDeposit, color: "text-blue-400"  },
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

      {isLoading ? (
        <div className="text-center py-20 text-gray-500">
          Loading leases...
        </div>
      ) : leases.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No active leases yet</p>
          <p className="text-gray-600 text-sm mt-2">
            Active leases appear here once tenants pay their deposit
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {leases.map((lease) => {
            const shortTenant =
              lease.tenant.walletAddress.slice(0, 6) +
              "..." +
              lease.tenant.walletAddress.slice(-4);

            const pendingPayment = lease.payments[0];
            const rentDueDate    = pendingPayment
              ? new Date(pendingPayment.dueDate)
              : null;
            const isRentOverdue  = rentDueDate
              ? new Date() > rentDueDate
              : false;
            const daysUntilDue   = rentDueDate
              ? Math.ceil(
                  (rentDueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                )
              : null;
            const leaseEnded     = new Date() >= new Date(lease.endDate);

            return (
              <div
                key={lease.id}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
              >
                <div className="flex items-start justify-between gap-4">

                  {/* Property + Tenant */}
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

                  {/* Status */}
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${STATUS_COLORS[lease.status]}`}>
                    {lease.status.replace("_", " ")}
                  </span>
                </div>

                {/* Terms */}
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {[
                    { label: "Monthly Rent", value: `${lease.monthlyRent} ETH`     },
                    { label: "Deposit",      value: `${lease.securityDeposit} ETH` },
                    { label: "Start",        value: new Date(lease.startDate).toLocaleDateString() },
                    { label: "End",          value: new Date(lease.endDate).toLocaleDateString()   },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-800/50 rounded-xl p-3">
                      <p className="text-gray-500 text-xs">{item.label}</p>
                      <p className="text-white text-sm font-medium mt-1">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Rent status alert */}
                {lease.status === "ACTIVE" && rentDueDate && (
                  <div className={`mt-3 rounded-xl p-3 ${
                    isRentOverdue
                      ? "bg-red-900/20 border border-red-800/40"
                      : daysUntilDue !== null && daysUntilDue <= 3
                      ? "bg-yellow-900/20 border border-yellow-800/40"
                      : "bg-gray-800/50 border border-gray-700"
                  }`}>
                    <p className={`text-xs font-medium ${
                      isRentOverdue
                        ? "text-red-400"
                        : daysUntilDue !== null && daysUntilDue <= 3
                        ? "text-yellow-400"
                        : "text-gray-400"
                    }`}>
                      {isRentOverdue
                        ? "⚠️ Tenant rent is overdue"
                        : daysUntilDue !== null && daysUntilDue <= 3
                        ? `⏰ Tenant rent due in ${daysUntilDue} day${daysUntilDue === 1 ? "" : "s"}`
                        : `Next rent due: ${rentDueDate.toLocaleDateString()}`}
                    </p>
                  </div>
                )}

                {/* Lease ended alert */}
                {leaseEnded && lease.status === "ACTIVE" && (
                  <div className="mt-3 bg-green-900/20 border border-green-800/40 rounded-xl p-3">
                    <p className="text-green-400 text-xs font-medium">
                      🏁 Lease duration ended — complete it to release deposit
                    </p>
                  </div>
                )}

                {/* Contract + Details link */}
                <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
                  {lease.contractAddress ? (
                    <a
                      href={`https://sepolia.etherscan.io/address/${lease.contractAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-blue-400 text-xs font-mono transition-colors"
                    >
                      {lease.contractAddress.slice(0, 10)}...↗
                    </a>
                  ) : (
                    <span />
                  )}
                  <Link
                    href={`/dashboard/lease/${lease.id}`}
                    className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                  >
                    Manage Lease →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}