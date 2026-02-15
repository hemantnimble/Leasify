// components/layout/Navbar.tsx

"use client";

import Link from "next/link";
import { useState } from "react";
import { useWalletAuth } from "@/hooks/useWalletAuth";

export default function Navbar() {
  const { isAuthenticated, walletAddress, role, disconnectWallet } =
    useWalletAuth();
  const [showMenu, setShowMenu] = useState(false);

  const shortAddress = walletAddress
    ? walletAddress.slice(0, 6) + "..." + walletAddress.slice(-4)
    : null;

  return (
    <nav className="border-b border-gray-800 bg-gray-950 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="text-white font-bold text-xl">
        <img className="w-28 invert" src="/assets/logo.png" alt="" />
          {/* Leasify */}
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-6">
          <Link
            href="/properties"
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Browse Properties
          </Link>

          {/* Landlord links */}
          {isAuthenticated && role === "LANDLORD" && (
            <>
              <Link
                href="/dashboard/landlord"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/landlord/requests"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Requests
              </Link>
              <Link
                href="/dashboard/landlord/leases"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Active Leases
              </Link>
            </>
          )}

          {/* Tenant links */}
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
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-xl transition-colors"
              >
                <span className="text-gray-300 text-xs font-mono">
                  {shortAddress}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  role === "LANDLORD"
                    ? "bg-purple-900/50 text-purple-400"
                    : "bg-blue-900/50 text-blue-400"
                }`}>
                  {role}
                </span>
                <span className="text-gray-500 text-xs">▾</span>
              </button>

              {/* Dropdown */}
              {showMenu && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />

                  <div className="absolute right-0 top-full mt-2 w-52 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-20 overflow-hidden">

                    {/* Wallet address display */}
                    <div className="px-4 py-3 border-b border-gray-800">
                      <p className="text-gray-500 text-xs">Connected as</p>
                      <p className="text-white text-xs font-mono mt-0.5">
                        {shortAddress}
                      </p>
                    </div>

                    {/* Profile */}
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-2 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors"
                    >
                      👤 Profile
                    </Link>

                    {/* Dashboard */}
                    <Link
                      href={role === "LANDLORD"
                        ? "/dashboard/landlord"
                        : "/dashboard/tenant"}
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-2 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors"
                    >
                      📊 Dashboard
                    </Link>

                    {/* Landlord specific */}
                    {role === "LANDLORD" && (
                      <>
                        <Link
                          href="/dashboard/landlord/requests"
                          onClick={() => setShowMenu(false)}
                          className="flex items-center gap-2 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors"
                        >
                          📋 Lease Requests
                        </Link>
                        <Link
                          href="/dashboard/landlord/leases"
                          onClick={() => setShowMenu(false)}
                          className="flex items-center gap-2 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors"
                        >
                          🏠 Active Leases
                        </Link>
                      </>
                    )}

                    {/* Tenant specific */}
                    {role === "TENANT" && (
                      <Link
                        href="/dashboard/tenant"
                        onClick={() => setShowMenu(false)}
                        className="flex items-center gap-2 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 text-sm transition-colors"
                      >
                        📄 My Leases
                      </Link>
                    )}

                    <div className="border-t border-gray-800" />

                    {/* Disconnect */}
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        disconnectWallet();
                      }}
                      className="flex items-center gap-2 w-full text-left px-4 py-3 text-red-400 hover:text-red-300 hover:bg-gray-800 text-sm transition-colors"
                    >
                      🔌 Disconnect
                    </button>
                  </div>
                </>
              )}
            </div>
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