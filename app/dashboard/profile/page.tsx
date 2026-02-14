// app/dashboard/profile/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import Link from "next/link";

export default function ProfilePage() {
  const { walletAddress, role } = useWalletAuth();
  const [displayName, setDisplayName]   = useState("");
  const [currentName, setCurrentName]   = useState<string | null>(null);
  const [isLoading, setIsLoading]       = useState(false);
  const [isFetching, setIsFetching]     = useState(true);
  const [success, setSuccess]           = useState(false);
  const [error, setError]               = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.displayName) {
          setCurrentName(data.user.displayName);
          setDisplayName(data.user.displayName);
        }
      })
      .finally(() => setIsFetching(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/user/profile", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ displayName }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setCurrentName(data.displayName);
      setSuccess(true);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const shortAddress = walletAddress
    ? walletAddress.slice(0, 6) + "..." + walletAddress.slice(-4)
    : "";

  const dashboardPath =
    role === "LANDLORD" ? "/dashboard/landlord" : "/dashboard/tenant";

  return (
    <div className="max-w-lg mx-auto">
      <Link
        href={dashboardPath}
        className="text-gray-400 hover:text-white text-sm transition-colors"
      >
        ← Dashboard
      </Link>

      <div className="mt-6">
        <h1 className="text-3xl font-bold text-white">Profile</h1>
        <p className="text-gray-400 mt-1">Manage your account settings</p>
      </div>

      {/* Wallet Info */}
      <div className="mt-6 bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <p className="text-gray-400 text-xs uppercase tracking-wider mb-4">
          Wallet Identity
        </p>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Address</span>
            <span className="text-white font-mono text-sm">{shortAddress}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Role</span>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
              role === "LANDLORD"
                ? "bg-purple-900/50 text-purple-400"
                : "bg-blue-900/50 text-blue-400"
            }`}>
              {role}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Display Name</span>
            <span className="text-white text-sm">
              {isFetching ? "..." : currentName || "Not set"}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Display Name */}
      <div className="mt-4 bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <p className="text-gray-400 text-xs uppercase tracking-wider mb-4">
          Display Name
        </p>
        <p className="text-gray-500 text-xs mb-4">
          This name shows to other users instead of your wallet address.
        </p>

        {success && (
          <div className="bg-green-900/30 border border-green-700 text-green-400 rounded-lg p-3 mb-4 text-sm">
            ✓ Display name updated successfully
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-400 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. John Landlord"
            maxLength={30}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
          />
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-xs">
              {displayName.length}/30 characters
            </span>
            <button
              type="submit"
              disabled={isLoading || displayName.trim().length === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed text-white font-medium px-6 py-2 rounded-xl transition-colors text-sm"
            >
              {isLoading ? "Saving..." : "Save Name"}
            </button>
          </div>
        </form>
      </div>

      {/* Etherscan Link */}
      {walletAddress && (
        <div className="mt-4 bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">
            On-Chain Activity
          </p>
          <a
            href={`https://sepolia.etherscan.io/address/${walletAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
          >
            View wallet on Etherscan ↗
          </a>
        </div>
      )}
    </div>
  );
}