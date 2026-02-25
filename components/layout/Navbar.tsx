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
  const [menuHovered, setMenuHovered] = useState<string | null>(null);

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
      : [{ href: "/properties", label: "Browse Properties" },];

  const menuItems =
    role === "LANDLORD"
      ? [
          { href: "/dashboard/profile",           label: "Profile",        icon: "◎" },
          { href: "/dashboard/landlord",          label: "Dashboard",      icon: "▦" },
          { href: "/dashboard/landlord/requests", label: "Lease Requests", icon: "≡" },
          { href: "/dashboard/landlord/leases",   label: "Active Leases",  icon: "⌂" },
        ]
      : [
          { href: "/dashboard/profile", label: "Profile",   icon: "◎" },
          { href: "/dashboard/tenant",  label: "Dashboard", icon: "▦" },
          { href: "/dashboard/tenant",  label: "My Leases", icon: "⌂" },
        ];

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
            <Link href='/demo'><button className="text-gray-400 hover:text-black text-sm transition-colors">Demo Mode</button></Link>
            <Link href="/properties" className="text-gray-400 hover:text-black text-sm transition-colors">
              Browse Properties
            </Link>
            {isAuthenticated && role === "LANDLORD" && (
              <>
                <Link href="/dashboard/landlord" className="text-gray-400 hover:text-black text-sm transition-colors">Dashboard</Link>
                <Link href="/dashboard/landlord/requests" className="text-gray-400 hover:text-black text-sm transition-colors">Requests</Link>
                <Link href="/dashboard/landlord/leases" className="text-gray-400 hover:text-black text-sm transition-colors">Active Leases</Link>
              </>
            )}
            {isAuthenticated && role === "TENANT" && (
              <Link href="/dashboard/tenant" className="text-gray-400 hover:text-black text-sm transition-colors">My Leases</Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">

            {/* Desktop wallet section */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <div className="relative">

                  {/* Trigger button */}
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
                    <span className="text-gray-500 text-xs" style={{
                      display: "inline-block",
                      transform: showMenu ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}>▾</span>
                  </button>

                  {/* Themed light dropdown */}
                  {showMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                      <div style={{
                        position: "absolute",
                        right: 0,
                        top: "calc(100% + 8px)",
                        width: 232,
                        background: "#FFFFFF",
                        borderWidth: 1,
                        borderStyle: "solid",
                        borderColor: "#E5E7EB",
                        borderRadius: 16,
                        overflow: "hidden",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
                        zIndex: 20,
                        animation: "dropIn 0.15s ease",
                      }}>

                        {/* Header */}
                        <div style={{ padding: "14px 16px", borderBottom: "1px solid #F3F4F6", background: "#FAFAFA" }}>
                          <p style={{ fontSize: 10, color: "#9CA3AF", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 4 }}>
                            CONNECTED AS
                          </p>
                          <p style={{ fontFamily: "'DM Mono', 'Courier New', monospace", fontSize: 12, color: "#374151", letterSpacing: "0.03em" }}>
                            {shortAddress}
                          </p>
                          <div style={{
                            display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8,
                            background: role === "LANDLORD" ? "#F5F3FF" : "#F0FDF4",
                            borderWidth: 1, borderStyle: "solid",
                            borderColor: role === "LANDLORD" ? "#DDD6FE" : "#BBF7D0",
                            borderRadius: 6, padding: "3px 10px",
                          }}>
                            <span style={{
                              width: 6, height: 6, borderRadius: "50%", display: "inline-block",
                              background: role === "LANDLORD" ? "#7C3AED" : "#059669",
                            }} />
                            <span style={{
                              fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
                              color: role === "LANDLORD" ? "#7C3AED" : "#059669",
                            }}>
                              {role}
                            </span>
                          </div>
                        </div>

                        {/* Nav items */}
                        <div style={{ padding: "6px 0" }}>
                          {menuItems.map((item) => (
                            <Link
                              key={item.label}
                              href={item.href}
                              onClick={() => setShowMenu(false)}
                              onMouseEnter={() => setMenuHovered(item.label)}
                              onMouseLeave={() => setMenuHovered(null)}
                              style={{
                                display: "flex", alignItems: "center", gap: 10,
                                padding: "10px 14px",
                                background: menuHovered === item.label ? "#F9FAFB" : "transparent",
                                textDecoration: "none",
                                transition: "background 0.1s ease",
                              }}
                            >
                              <span style={{
                                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                                background: menuHovered === item.label ? "#F3F4F6" : "#F9FAFB",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 12,
                                color: menuHovered === item.label ? "#111827" : "#9CA3AF",
                                transition: "all 0.1s ease",
                              }}>
                                {item.icon}
                              </span>
                              <span style={{
                                fontSize: 13, fontWeight: 500,
                                color: menuHovered === item.label ? "#111827" : "#374151",
                                transition: "color 0.1s ease",
                              }}>
                                {item.label}
                              </span>
                            </Link>
                          ))}
                        </div>
                        {/* Disconnect */}
                        <div style={{ borderTop: "1px solid #F3F4F6", padding: "6px 0" }}>
                          <button
                            onClick={() => { setShowMenu(false); disconnectWallet(); }}
                            onMouseEnter={() => setMenuHovered("disconnect")}
                            onMouseLeave={() => setMenuHovered(null)}
                            style={{
                              display: "flex", alignItems: "center", gap: 10,
                              width: "100%", border: "none", cursor: "pointer",
                              padding: "10px 14px",
                              background: menuHovered === "disconnect" ? "#FEF2F2" : "transparent",
                              transition: "background 0.1s ease",
                            }}
                          >
                            <span style={{
                              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                              background: menuHovered === "disconnect" ? "#FEE2E2" : "#F9FAFB",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 12,
                              color: menuHovered === "disconnect" ? "#DC2626" : "#9CA3AF",
                              transition: "all 0.1s ease",
                            }}>
                              ⏻
                            </span>
                            <span style={{
                              fontSize: 13, fontWeight: 500,
                              color: menuHovered === "disconnect" ? "#DC2626" : "#6B7280",
                              transition: "color 0.1s ease",
                            }}>
                              Disconnect
                            </span>
                          </button>
                        </div>

                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
                  Connect Wallet
                </Link>
              )}
            </div>

            {/* Mobile: wallet chip */}
            {isAuthenticated && (
              <div className="md:hidden flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                <span className="text-xs font-mono text-gray-600">{shortAddress}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${role === "LANDLORD" ? "bg-black text-purple-400" : "bg-black text-blue-400"}`}>
                  {role?.[0]}
                </span>
              </div>
            )}

            {/* Hamburger */}
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

      {/* Mobile drawer */}
      <div className={`md:hidden fixed top-[65px] left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-lg transition-all duration-200 overflow-hidden ${showMobile ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-4 py-3 flex flex-col">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setShowMobile(false)}
              className="flex items-center px-3 py-3.5 text-gray-700 hover:text-black hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors border-b border-gray-50 last:border-0">
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <>
              <div className="my-2 border-t border-gray-100" />
              <div className="px-3 py-2 mb-1">
                <p className="text-xs text-gray-400">Connected wallet</p>
                <p className="text-xs font-mono text-gray-700 mt-0.5">{walletAddress}</p>
              </div>
              <Link href="/dashboard/profile" onClick={() => setShowMobile(false)}
                className="flex items-center gap-2 px-3 py-3.5 text-gray-700 hover:text-black hover:bg-gray-50 rounded-xl text-sm transition-colors">
                👤 Profile
              </Link>
              <button onClick={() => { setShowMobile(false); disconnectWallet(); }}
                className="flex items-center gap-2 w-full text-left px-3 py-3.5 text-red-500 hover:bg-red-50 rounded-xl text-sm transition-colors mt-1">
                🔌 Disconnect Wallet
              </button>
            </>
          )}
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
        <div className="md:hidden fixed inset-0 z-30 bg-black/10" onClick={() => setShowMobile(false)} />
      )}

      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}