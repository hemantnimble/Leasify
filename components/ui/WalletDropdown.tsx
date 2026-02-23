"use client";

// components/ui/WalletDropdown.tsx
// Drop-in replacement for the wallet button + dropdown menu in the navbar.
// Matches the Leasify dark theme: #1A1A2E bg, sharp white type, subtle borders.

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type Role = "LANDLORD" | "TENANT";

interface WalletDropdownProps {
  address: string;       // full wallet address
  role: Role;
  onDisconnect: () => void;
}

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

const NAV_ITEMS: Record<Role, { label: string; href: string; icon: string }[]> = {
  LANDLORD: [
    { label: "Profile",        href: "/profile",                  icon: "◎" },
    { label: "Dashboard",      href: "/dashboard/landlord",       icon: "▦" },
    { label: "Lease Requests", href: "/dashboard/landlord/requests", icon: "≡" },
    { label: "Active Leases",  href: "/dashboard/landlord/leases",  icon: "⌂" },
  ],
  TENANT: [
    { label: "Profile",        href: "/profile",                  icon: "◎" },
    { label: "Dashboard",      href: "/dashboard/tenant",         icon: "▦" },
    { label: "My Leases",      href: "/dashboard/tenant/leases",  icon: "⌂" },
    { label: "Browse",         href: "/properties",               icon: "◈" },
  ],
};

export default function WalletDropdown({
  address,
  role,
  onDisconnect,
}: WalletDropdownProps) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const items = NAV_ITEMS[role];

  return (
    <div ref={ref} style={{ position: "relative", userSelect: "none" }}>

      {/* ── Trigger button ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: open ? "#252540" : "#1A1A2E",
          border: "1.5px solid",
          borderColor: open ? "#3D3D6B" : "#2E2E50",
          borderRadius: 12,
          padding: "8px 14px",
          cursor: "pointer",
          transition: "all 0.18s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "#3D3D6B";
          (e.currentTarget as HTMLElement).style.background = "#252540";
        }}
        onMouseLeave={(e) => {
          if (!open) {
            (e.currentTarget as HTMLElement).style.borderColor = "#2E2E50";
            (e.currentTarget as HTMLElement).style.background = "#1A1A2E";
          }
        }}
      >
        {/* Wallet address */}
        <span
          style={{
            fontFamily: "'DM Mono', 'Courier New', monospace",
            fontSize: 12,
            fontWeight: 500,
            color: "#A8A8C8",
            letterSpacing: "0.04em",
          }}
        >
          {shortAddress(address)}
        </span>

        {/* Role pill */}
        <span
          style={{
            background: role === "LANDLORD" ? "#1A1A2E" : "#0F2027",
            border: `1px solid ${role === "LANDLORD" ? "#4B4BFF" : "#00C9A7"}`,
            color: role === "LANDLORD" ? "#7B7BFF" : "#00C9A7",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.12em",
            padding: "3px 8px",
            borderRadius: 6,
          }}
        >
          {role}
        </span>

        {/* Chevron */}
        <span
          style={{
            color: "#5A5A8A",
            fontSize: 10,
            display: "inline-block",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            lineHeight: 1,
          }}
        >
          ▾
        </span>
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: 240,
            background: "#12121F",
            border: "1.5px solid #2A2A45",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 24px 64px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.3)",
            zIndex: 1000,
            animation: "dropIn 0.15s ease",
          }}
        >
          {/* Header — wallet info */}
          <div
            style={{
              padding: "16px 18px",
              borderBottom: "1px solid #1E1E35",
            }}
          >
            <p
              style={{
                fontSize: 10,
                color: "#5A5A8A",
                letterSpacing: "0.1em",
                marginBottom: 5,
                fontWeight: 600,
              }}
            >
              CONNECTED AS
            </p>
            <p
              style={{
                fontFamily: "'DM Mono', 'Courier New', monospace",
                fontSize: 12,
                color: "#C8C8E8",
                letterSpacing: "0.04em",
              }}
            >
              {shortAddress(address)}
            </p>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                marginTop: 8,
                background: role === "LANDLORD" ? "rgba(75,75,255,0.08)" : "rgba(0,201,167,0.08)",
                border: `1px solid ${role === "LANDLORD" ? "rgba(75,75,255,0.25)" : "rgba(0,201,167,0.25)"}`,
                borderRadius: 6,
                padding: "3px 10px",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: role === "LANDLORD" ? "#4B4BFF" : "#00C9A7",
                  display: "inline-block",
                  boxShadow: `0 0 6px ${role === "LANDLORD" ? "#4B4BFF" : "#00C9A7"}`,
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: role === "LANDLORD" ? "#7B7BFF" : "#00C9A7",
                  letterSpacing: "0.1em",
                }}
              >
                {role}
              </span>
            </div>
          </div>

          {/* Nav links */}
          <div style={{ padding: "8px 0" }}>
            {items.map((item) => (
              <button
                key={item.href}
                onClick={() => {
                  setOpen(false);
                  router.push(item.href);
                }}
                onMouseEnter={() => setHovered(item.href)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  background: hovered === item.href ? "#1C1C32" : "transparent",
                  border: "none",
                  padding: "11px 18px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.12s ease",
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: hovered === item.href ? "#252545" : "#191930",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    color: hovered === item.href ? "#A8A8FF" : "#5A5A8A",
                    transition: "all 0.12s ease",
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: hovered === item.href ? "#FFFFFF" : "#A8A8C8",
                    transition: "color 0.12s ease",
                  }}
                >
                  {item.label}
                </span>
                {hovered === item.href && (
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 10,
                      color: "#3D3D6B",
                    }}
                  >
                    →
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Divider + Disconnect */}
          <div
            style={{
              borderTop: "1px solid #1E1E35",
              padding: "8px 0",
            }}
          >
            <button
              onClick={() => {
                setOpen(false);
                onDisconnect();
              }}
              onMouseEnter={() => setHovered("disconnect")}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                background: hovered === "disconnect" ? "rgba(255,59,59,0.06)" : "transparent",
                border: "none",
                padding: "11px 18px",
                cursor: "pointer",
                transition: "background 0.12s ease",
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: hovered === "disconnect" ? "rgba(255,59,59,0.12)" : "#191930",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  color: hovered === "disconnect" ? "#FF5E5E" : "#5A5A8A",
                  transition: "all 0.12s ease",
                  flexShrink: 0,
                }}
              >
                ⏻
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: hovered === "disconnect" ? "#FF5E5E" : "#5A5A8A",
                  transition: "color 0.12s ease",
                }}
              >
                Disconnect
              </span>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
      `}</style>
    </div>
  );
}