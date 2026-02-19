// components/layout/Navbar.tsx

"use client";

import Link from "next/link";
import { useState } from "react";
import { useWalletAuth } from "@/hooks/useWalletAuth";

export default function Navbar() {
  const { isAuthenticated, walletAddress, role, disconnectWallet } =
    useWalletAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showMobile, setShowMobile] = useState(false);

  const shortAddress = walletAddress
    ? walletAddress.slice(0, 6) + "..." + walletAddress.slice(-4)
    : null;

  const navLinks =
    isAuthenticated && role === "LANDLORD"
      ? [
          { href: "/properties", label: "Browse Properties" },
          { href: "/dashboard/landlord", label: "Dashboard" },
          { href: "/dashboard/landlord/requests", label: "Requests" },
          { href: "/dashboard/landlord/leases", label: "Active Leases" },
        ]
      : isAuthenticated && role === "TENANT"
      ? [
          { href: "/properties", label: "Browse Properties" },
          { href: "/dashboard/tenant", label: "My Leases" },
        ]
      : [{ href: "/properties", label: "Browse Properties" }];

  return (
    <>
      <nav className="border-b border-gray-100 bg-white px-4 md:px-6 py-4 fixed w-full z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">

          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <img className="w-24 md:w-28 invert" src="/assets/logo.png" alt="Leasify" />
          </Link>

          {/* Desktop nav links (centered) */}
          <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
            <Link
              href="/properties"
              className="text-gray-400 hover:text-black text-sm transition-colors"
            >
              Browse Properties
            </Link>

            {isAuthenticated && role === "LANDLORD" && (
              <>
                <Link href="/dashboard/landlord" className="text-gray-400 hover:text-black text-sm transition-colors">
                  Dashboard
                </Link>
                <Link href="/dashboard/landlord/requests" className="text-gray-400 hover:text-black text-sm transition-colors">
                  Requests
                </Link>
                <Link href="/dashboard/landlord/leases" className="text-gray-400 hover:text-black text-sm transition-colors">
                  Active Leases
                </Link>
              </>
            )}

            {isAuthenticated && role === "TENANT" && (
              <Link href="/dashboard/tenant" className="text-gray-400 hover:text-black text-sm transition-colors">
                My Leases
              </Link>
            )}
          </div>

          {/* Right side — desktop wallet + mobile buttons */}
          <div className="flex items-center gap-2">

            {/* Desktop wallet section */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="flex items-center gap-2 bg-gray-200 px-3 py-2 rounded-xl transition-colors"
                  >
                    <span className="text-black text-xs font-mono">{shortAddress}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      role === "LANDLORD" ? "bg-black text-purple-400" : "bg-black text-blue-400"
                    }`}>
                      {role}
                    </span>
                    <span className="text-gray-500 text-xs">▾</span>
                  </button>

                  {showMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                      <div className="absolute right-0 top-full mt-2 w-52 bg-gray-200 border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-400">
                          <p className="text-gray-500 text-xs">Connected as</p>
                          <p className="text-black text-xs font-mono mt-0.5">{shortAddress}</p>
                        </div>
                        <Link href="/dashboard/profile" onClick={() => setShowMenu(false)}
                          className="flex items-center gap-2 px-4 py-3 text-black hover:text-white hover:bg-gray-400 text-sm transition-colors">
                          👤 Profile
                        </Link>
                        <Link
                          href={role === "LANDLORD" ? "/dashboard/landlord" : "/dashboard/tenant"}
                          onClick={() => setShowMenu(false)}
                          className="flex items-center gap-2 px-4 py-3 text-black hover:text-white hover:bg-gray-400 text-sm transition-colors">
                          📊 Dashboard
                        </Link>
                        {role === "LANDLORD" && (
                          <>
                            <Link href="/dashboard/landlord/requests" onClick={() => setShowMenu(false)}
                              className="flex items-center gap-2 px-4 py-3 text-black hover:text-white hover:bg-gray-400 text-sm transition-colors">
                              📋 Lease Requests
                            </Link>
                            <Link href="/dashboard/landlord/leases" onClick={() => setShowMenu(false)}
                              className="flex items-center gap-2 px-4 py-3 text-black hover:text-white hover:bg-gray-400 text-sm transition-colors">
                              🏠 Active Leases
                            </Link>
                          </>
                        )}
                        {role === "TENANT" && (
                          <Link href="/dashboard/tenant" onClick={() => setShowMenu(false)}
                            className="flex items-center gap-2 px-4 py-3 text-black hover:text-white hover:bg-gray-400 text-sm transition-colors">
                            📄 My Leases
                          </Link>
                        )}
                        <div className="border-t border-gray-400" />
                        <button
                          onClick={() => { setShowMenu(false); disconnectWallet(); }}
                          className="flex items-center gap-2 w-full text-left px-4 py-3 text-red-400 hover:text-red-300 hover:bg-gray-400 text-sm transition-colors">
                          🔌 Disconnect
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link href="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
                  Connect Wallet
                </Link>
              )}
            </div>

            {/* Mobile: show short wallet chip if logged in */}
            {isAuthenticated && (
              <div className="md:hidden flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                <span className="text-xs font-mono text-gray-600">{shortAddress}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                  role === "LANDLORD" ? "bg-black text-purple-400" : "bg-black text-blue-400"
                }`}>
                  {role?.[0]}
                </span>
              </div>
            )}

            {/* Hamburger button — mobile only */}
            <button
              className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-lg hover:bg-gray-100 transition-colors gap-1.5"
              onClick={() => setShowMobile(!showMobile)}
              aria-label="Toggle menu"
            >
              <span className={`block h-0.5 w-5 bg-gray-700 transition-transform duration-200 ${showMobile ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block h-0.5 w-5 bg-gray-700 transition-opacity duration-200 ${showMobile ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-5 bg-gray-700 transition-transform duration-200 ${showMobile ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>

          </div>
        </div>
      </nav>

      {/* Mobile drawer — slides down below navbar */}
      <div className={`md:hidden fixed top-[65px] left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-lg transition-all duration-200 overflow-hidden ${
        showMobile ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
      }`}>
        <div className="px-4 py-3 flex flex-col">

          {/* Nav links */}
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setShowMobile(false)}
              className="flex items-center px-3 py-3.5 text-gray-700 hover:text-black hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors border-b border-gray-50 last:border-0"
            >
              {link.label}
            </Link>
          ))}

          {/* Authenticated extras */}
          {isAuthenticated && (
            <>
              <div className="my-2 border-t border-gray-100" />

              {/* Wallet info */}
              <div className="px-3 py-2 mb-1">
                <p className="text-xs text-gray-400">Connected wallet</p>
                <p className="text-xs font-mono text-gray-700 mt-0.5">{walletAddress}</p>
              </div>

              <Link href="/dashboard/profile" onClick={() => setShowMobile(false)}
                className="flex items-center gap-2 px-3 py-3.5 text-gray-700 hover:text-black hover:bg-gray-50 rounded-xl text-sm transition-colors">
                👤 Profile
              </Link>

              <button
                onClick={() => { setShowMobile(false); disconnectWallet(); }}
                className="flex items-center gap-2 w-full text-left px-3 py-3.5 text-red-500 hover:bg-red-50 rounded-xl text-sm transition-colors mt-1"
              >
                🔌 Disconnect Wallet
              </button>
            </>
          )}

          {/* Not authenticated */}
          {!isAuthenticated && (
            <Link href="/login" onClick={() => setShowMobile(false)}
              className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-colors text-center">
              Connect Wallet
            </Link>
          )}

          <div className="h-4" />
        </div>
      </div>

      {/* Mobile backdrop */}
      {showMobile && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/10"
          onClick={() => setShowMobile(false)}
        />
      )}
    </>
  );
}