// components/layout/Navbar.tsx

"use client";

import Link from "next/link";
import { useWalletAuth } from "@/hooks/useWalletAuth";

export default function Navbar() {
  const { isAuthenticated, walletAddress, role, disconnectWallet } =
    useWalletAuth();

  const shortAddress = walletAddress
    ? walletAddress.slice(0, 6) + "..." + walletAddress.slice(-4)
    : null;

  return (
    <nav className="border-b border-gray-800 bg-gray-950 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="text-white font-bold text-xl">
          Leasify
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-6">
          <Link
            href="/properties"
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Browse Properties
          </Link>

          {isAuthenticated && role === "LANDLORD" && (
            <>
              <Link href="/dashboard/landlord" className="text-gray-400 hover:text-white text-sm transition-colors">
                My Dashboard
              </Link>
              <Link href="/dashboard/landlord/requests" className="text-gray-400 hover:text-white text-sm transition-colors">
                Requests
              </Link>
            </>
          )}

          {isAuthenticated && role === "TENANT" && (
            <Link
              href="/dashboard/tenant"
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              My Leases
            </Link>
          )}
        </div>

        {/* Wallet section */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="bg-gray-800 text-gray-300 text-xs font-mono px-3 py-2 rounded-lg">
                {shortAddress}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${role === "LANDLORD"
                    ? "bg-purple-900/50 text-purple-400"
                    : "bg-blue-900/50 text-blue-400"
                  }`}
              >
                {role}
              </span>
              <button
                onClick={disconnectWallet}
                className="text-gray-500 hover:text-red-400 text-sm transition-colors"
              >
                Disconnect
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              Connect Wallet
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}