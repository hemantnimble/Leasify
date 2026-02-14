// app/dashboard/lease/[id]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import PayDepositButton from "@/components/blockchain/PayDepositButton";
import NetworkWarning from "@/components/blockchain/NetworkWarning";
import { getClientLeaseContract } from "@/utils/blockchain/web3Client";
import PayRentButton from "@/components/blockchain/PayRentButton";
import LeaseActions from "@/components/blockchain/LeaseActions";

interface Lease {
  id: string;
  status: string;
  monthlyRent: number;
  securityDeposit: number;
  startDate: string;
  endDate: string;
  gracePeriodDays: number;
  lateFeePercentage: number;
  contractAddress?: string | null;
  deployedAt?: string | null;
  property: {
    id: string;
    title: string;
    location: string;
    images: string[];
  };
  landlord: { walletAddress: string; displayName?: string | null };
  tenant: { walletAddress: string; displayName?: string | null };
  payments: {
    id: string;
    amount: number;
    dueDate: string;
    paidAt?: string | null;
    status: string;
    transactionHash?: string | null;
    lateFee?: number | null;
  }[];
}

interface OnChainData {
  status: string;
  balance: string;
  accumulatedPenalties: string;
  totalRentPaid: string;
  isOverdue: boolean;
  daysRemaining: string;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-900/50 text-yellow-400",
  AWAITING_DEPOSIT: "bg-blue-900/50 text-blue-400",
  ACTIVE: "bg-green-900/50 text-green-400",
  REJECTED: "bg-red-900/50 text-red-400",
  COMPLETED: "bg-gray-800 text-gray-400",
  TERMINATED: "bg-gray-800 text-gray-400",
};

export default function LeaseDetailPage() {
  const { id } = useParams();
  const { role, walletAddress } = useWalletAuth();

  const [lease, setLease] = useState<Lease | null>(null);
  const [onChain, setOnChain] = useState<OnChainData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingChain, setIsLoadingChain] = useState(false);

  const fetchLease = async () => {
    try {
      const res = await fetch(`/api/lease/${id}`);
      const data = await res.json();
      if (res.ok) setLease(data.lease);
    } finally {
      setIsLoading(false);
    }
  };
  const pendingPayment = lease?.payments.find(
    (p) => p.status === "PENDING" || p.status === "MISSED"
  );
  const fetchOnChainData = async (contractAddress: string) => {
    setIsLoadingChain(true);
    try {
      const contract = getClientLeaseContract(contractAddress);

      const [details, balance, isOverdue, daysLeft] = await Promise.all([
        contract.methods.getLeaseDetails().call(),
        contract.methods.getContractBalance().call(),
        contract.methods.isRentOverdue().call(),
        contract.methods.daysRemaining().call(),
      ]);

      const statusMap: Record<string, string> = {
        "0": "AWAITING_DEPOSIT",
        "1": "ACTIVE",
        "2": "COMPLETED",
        "3": "TERMINATED",
      };

      setOnChain({
        status: statusMap[(details as any)[8]?.toString() ?? "0"],
        balance: (Number(balance) / 1e18).toFixed(6),
        accumulatedPenalties: (Number((details as any)[9]) / 1e18).toFixed(6),
        totalRentPaid: (Number((details as any)[10]) / 1e18).toFixed(6),
        isOverdue: Boolean(isOverdue),
        daysRemaining: daysLeft?.toString() ?? "0",
      });
    } catch (err) {
      console.error("Failed to fetch on-chain data:", err);
    } finally {
      setIsLoadingChain(false);
    }
  };

  useEffect(() => {
    if (id) fetchLease();
  }, [id]);

  useEffect(() => {
    if (lease?.contractAddress && lease.status !== "PENDING") {
      fetchOnChainData(lease.contractAddress);
    }
  }, [lease]);

  if (isLoading) {
    return (
      <div className="text-center py-20 text-gray-500">
        Loading lease...
      </div>
    );
  }

  if (!lease) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Lease not found</p>
        <Link
          href={role === "LANDLORD" ? "/dashboard/landlord" : "/dashboard/tenant"}
          className="text-blue-400 mt-4 inline-block"
        >
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const isTenant = walletAddress?.toLowerCase() ===
    lease.tenant.walletAddress.toLowerCase();

  return (
    <div className="max-w-4xl mx-auto">
      <NetworkWarning />

      <Link
        href={role === "LANDLORD" ? "/dashboard/landlord" : "/dashboard/tenant"}
        className="text-gray-400 hover:text-white text-sm transition-colors"
      >
        ← Back to Dashboard
      </Link>

      <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {lease.property.title}
          </h1>
          <p className="text-gray-400 mt-1">📍 {lease.property.location}</p>
        </div>
        <span className={`text-sm font-semibold px-4 py-2 rounded-full ${STATUS_COLORS[lease.status]}`}>
          {lease.status.replace("_", " ")}
        </span>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: Lease Terms ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Lease Terms Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4">Lease Terms</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Monthly Rent", value: `${lease.monthlyRent} ETH` },
                { label: "Security Deposit", value: `${lease.securityDeposit} ETH` },
                { label: "Start Date", value: new Date(lease.startDate).toLocaleDateString() },
                { label: "End Date", value: new Date(lease.endDate).toLocaleDateString() },
                { label: "Grace Period", value: `${lease.gracePeriodDays} days` },
                { label: "Late Fee", value: `${lease.lateFeePercentage}%` },
              ].map((item) => (
                <div key={item.label} className="bg-gray-800/50 rounded-xl p-4">
                  <p className="text-gray-500 text-xs">{item.label}</p>
                  <p className="text-white font-medium mt-1">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* On-Chain Data Card */}
          {lease.contractAddress && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold">Live Blockchain Data</h2>
                {isLoadingChain && (
                  <span className="text-gray-500 text-xs flex items-center gap-1">
                    <span className="w-2 h-2 border border-gray-500 border-t-white rounded-full animate-spin" />
                    Fetching...
                  </span>
                )}
              </div>

              {onChain ? (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      label: "Contract Status",
                      value: onChain.status,
                      color: onChain.status === "ACTIVE" ? "text-green-400" : "text-gray-300",
                    },
                    {
                      label: "ETH Held in Contract",
                      value: `${onChain.balance} ETH`,
                      color: "text-blue-400",
                    },
                    {
                      label: "Penalties Accumulated",
                      value: `${onChain.accumulatedPenalties} ETH`,
                      color: Number(onChain.accumulatedPenalties) > 0 ? "text-red-400" : "text-green-400",
                    },
                    {
                      label: "Days Remaining",
                      value: `${onChain.daysRemaining} days`,
                      color: "text-white",
                    },
                    {
                      label: "Rent Status",
                      value: onChain.isOverdue ? "⚠️ Overdue" : "✅ On Time",
                      color: onChain.isOverdue ? "text-red-400" : "text-green-400",
                    },
                    {
                      label: "Total Rent Paid",
                      value: `${onChain.totalRentPaid} ETH`,
                      color: "text-white",
                    },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-800/50 rounded-xl p-4">
                      <p className="text-gray-500 text-xs">{item.label}</p>
                      <p className={`font-medium mt-1 ${item.color}`}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  Connect MetaMask to view live data
                </p>
              )}
            </div>
          )}

          {/* Payment History */}
          {lease.payments.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-4">Payment History</h2>
              <div className="space-y-3">
                {lease.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between bg-gray-800/50 rounded-xl p-4"
                  >
                    <div>
                      <p className="text-white text-sm font-medium">
                        {payment.amount} ETH
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        Due: {new Date(payment.dueDate).toLocaleDateString()}
                      </p>
                      {payment.lateFee && payment.lateFee > 0 && (
                        <p className="text-red-400 text-xs mt-0.5">
                          Late fee: {payment.lateFee} ETH
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${payment.status === "PAID"
                        ? "bg-green-900/50 text-green-400"
                        : payment.status === "LATE"
                          ? "bg-red-900/50 text-red-400"
                          : "bg-yellow-900/50 text-yellow-400"
                        }`}>
                        {payment.status}
                      </span>
                      {payment.transactionHash && (
                        <a
                          href={`https://sepolia.etherscan.io/tx/${payment.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-blue-400 text-xs mt-1 hover:underline"
                        >
                          View tx ↗
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Actions ── */}
        <div className="space-y-4">

          {/* Pay Deposit */}
          {isTenant && lease.status === "AWAITING_DEPOSIT" && lease.contractAddress && (
            <PayDepositButton
              leaseId={lease.id}
              contractAddress={lease.contractAddress}
              depositAmount={lease.securityDeposit}
              onSuccess={() => {
                fetchLease();
                if (lease.contractAddress) {
                  fetchOnChainData(lease.contractAddress);
                }
              }}
            />
          )}

          {/* Pay Rent */}
          {isTenant &&
            lease.status === "ACTIVE" &&
            lease.contractAddress &&
            pendingPayment && (
              <PayRentButton
                leaseId={lease.id}
                contractAddress={lease.contractAddress}
                monthlyRent={lease.monthlyRent}
                currentPayment={pendingPayment}
                onSuccess={() => {
                  fetchLease();
                  if (lease.contractAddress) {
                    fetchOnChainData(lease.contractAddress);
                  }
                }}
              />
            )}

          <LeaseActions
            leaseId={lease.id}
            contractAddress={lease.contractAddress!}
            status={lease.status}
            startDate={lease.startDate}
            endDate={lease.endDate}
            role={role || ""}
            onSuccess={() => {
              fetchLease();
              if (lease.contractAddress) {
                fetchOnChainData(lease.contractAddress);
              }
            }}
          />

          {/* Contract Info */}
          {lease.contractAddress && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">
                Smart Contract
              </p>
              <p className="text-white text-xs font-mono break-all">
                {lease.contractAddress}
              </p>
              <a
                href={`https://sepolia.etherscan.io/address/${lease.contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block text-center text-blue-400 hover:text-blue-300 text-xs border border-blue-800/50 py-2 rounded-lg transition-colors"
              >
                View on Etherscan ↗
              </a>
              {lease.deployedAt && (
                <p className="text-gray-600 text-xs mt-2 text-center">
                  Deployed: {new Date(lease.deployedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {/* Parties */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">
                Landlord
              </p>
              <p className="text-white text-xs font-mono">
                {lease.landlord.walletAddress.slice(0, 8)}...
                {lease.landlord.walletAddress.slice(-6)}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">
                Tenant
              </p>
              <p className="text-white text-xs font-mono">
                {lease.tenant.walletAddress.slice(0, 8)}...
                {lease.tenant.walletAddress.slice(-6)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}