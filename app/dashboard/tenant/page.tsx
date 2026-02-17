"use client";

// app/dashboard/tenant/page.tsx

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

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

const STATUS_CONFIG: Record<
  string,
  { bg: string; color: string; border: string; label: string; message: string }
> = {
  PENDING: {
    bg: "#FFFBEB",
    color: "#D97706",
    border: "#FDE68A",
    label: "Pending",
    message: "Waiting for landlord to respond",
  },
  AWAITING_DEPOSIT: {
    bg: "#EFF6FF",
    color: "#2D5BE3",
    border: "#BFDBFE",
    label: "Awaiting Deposit",
    message: "Accepted! Pay deposit to activate your lease",
  },
  ACTIVE: {
    bg: "#F0FDF4",
    color: "#059669",
    border: "#BBF7D0",
    label: "Active",
    message: "Your lease is active",
  },
  REJECTED: {
    bg: "#FEF2F2",
    color: "#DC2626",
    border: "#FECACA",
    label: "Rejected",
    message: "This request was rejected by the landlord",
  },
  COMPLETED: {
    bg: "#F9FAFB",
    color: "#6B7280",
    border: "#E5E7EB",
    label: "Completed",
    message: "Lease completed successfully",
  },
  TERMINATED: {
    bg: "#F9FAFB",
    color: "#6B7280",
    border: "#E5E7EB",
    label: "Terminated",
    message: "Lease was terminated early",
  },
};

function LeaseCard({ lease }: { lease: Lease }) {
  const [hovered, setHovered] = useState(false);
  const cfg = STATUS_CONFIG[lease.status] || STATUS_CONFIG.COMPLETED;

  const shortLandlord =
    lease.landlord.walletAddress.slice(0, 6) +
    "..." +
    lease.landlord.walletAddress.slice(-4);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: 20,
        border: "1px solid",
        borderColor: hovered ? "#E5E7EB" : "#F0F0EE",
        boxShadow: hovered
          ? "0 8px 32px rgba(0,0,0,0.08)"
          : "0 2px 12px rgba(0,0,0,0.04)",
        transition: "all 0.3s ease",
        overflow: "hidden",
      }}
    >
      {/* Top */}
      <div style={{ padding: "20px 22px 20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 16,
          }}
        >
          {/* Property info */}
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                overflow: "hidden",
                flexShrink: 0,
                background: "#F3F4F6",
              }}
            >
              <img
                src={
                  lease.property.images?.[0] ||
                  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&q=80"
                }
                alt={lease.property.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#1A1A2E",
                  marginBottom: 2,
                  //: "'Sora', sans-serif",
                }}
              >
                {lease.property.title}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#9CA3AF",
                  //: "'Sora', sans-serif",
                }}
              >
                📍 {lease.property.location}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#9CA3AF",
                  //: "'DM Mono', monospace",
                  marginTop: 3,
                }}
              >
                Landlord: {lease.landlord.displayName || shortLandlord}
              </div>
            </div>
          </div>

          {/* Status */}
          <div
            style={{
              background: cfg.bg,
              color: cfg.color,
              border: `1px solid ${cfg.border}`,
              padding: "5px 14px",
              borderRadius: 100,
              fontSize: 11,
              fontWeight: 600,
              whiteSpace: "nowrap",
              flexShrink: 0,
              //: "'Sora', sans-serif",
            }}
          >
            {cfg.label}
          </div>
        </div>

        {/* Status message */}
        <div
          style={{
            fontSize: 12,
            color: cfg.color,
            background: cfg.bg,
            border: `1px solid ${cfg.border}`,
            borderRadius: 10,
            padding: "8px 12px",
            marginBottom: 16,
            //: "'Sora', sans-serif",
          }}
        >
          {cfg.message}
        </div>

        {/* Terms grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 10,
          }}
        >
          {[
            { label: "Monthly Rent", value: `${lease.monthlyRent} ETH` },
            { label: "Deposit", value: `${lease.securityDeposit} ETH` },
            {
              label: "Start",
              value: new Date(lease.startDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
            },
            {
              label: "End",
              value: new Date(lease.endDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: "#F8F8F6",
                borderRadius: 12,
                padding: "10px 12px",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: "#9CA3AF",
                  marginBottom: 4,
                  //: "'Sora', sans-serif",
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#1A1A2E",
                  //: "'Sora', sans-serif",
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* Awaiting deposit CTA */}
        {lease.status === "AWAITING_DEPOSIT" && (
          <div
            style={{
              marginTop: 16,
              background: "#EFF6FF",
              border: "1px solid #BFDBFE",
              borderRadius: 14,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 13,
                  color: "#2D5BE3",
                  marginBottom: 2,
                  //: "'Sora', sans-serif",
                }}
              >
                Deposit Required
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#6B7280",
                  //: "'Sora', sans-serif",
                }}
              >
                Pay {lease.securityDeposit} ETH to activate your lease
              </div>
            </div>
            <button
              disabled
              title="Available in next phase"
              style={{
                background: "#BFDBFE",
                color: "#93C5FD",
                border: "none",
                padding: "10px 20px",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 600,
                cursor: "not-allowed",
                //: "'Sora', sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              Pay Deposit
            </button>
          </div>
        )}

        {/* Contract address */}
        {lease.contractAddress && (
          <div
            style={{
              marginTop: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#F0FDF4",
              border: "1px solid #BBF7D0",
              borderRadius: 10,
              padding: "8px 12px",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                background: "#059669",
                borderRadius: "50%",
                flexShrink: 0,
                animation: "blink 2s infinite",
              }}
            />
            <a
              href={`https://sepolia.etherscan.io/address/${lease.contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 11,
                color: "#059669",
                //: "'DM Mono', monospace",
                textDecoration: "none",
              }}
            >
              {lease.contractAddress.slice(0, 14)}...{lease.contractAddress.slice(-6)} ↗
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

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
    <div
      style={{
        minHeight: "100vh",
        background: "#F8F8F6",
        padding: "40px 48px 80px",
        //: "'Sora', sans-serif",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 32,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                //: "'DM Mono', monospace",
                letterSpacing: "0.1em",
                color: "#9CA3AF",
                marginBottom: 8,
              }}
            >
              TENANT DASHBOARD
            </div>
            <h1
              style={{
                fontSize: 32,
                fontWeight: 800,
                letterSpacing: "-0.04em",
                color: "#1A1A2E",
                lineHeight: 1.1,
              }}
            >
              My Leases
            </h1>
          </div>
          <Link
            href="/properties"
            style={{
              background: "#1A1A2E",
              color: "#fff",
              padding: "12px 28px",
              borderRadius: 14,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              whiteSpace: "nowrap",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "#2D2D4E")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "#1A1A2E")
            }
          >
            Browse Properties
          </Link>
        </div>

        {/* Success toast */}
        {justRequested && (
          <div
            style={{
              background: "#F0FDF4",
              border: "1px solid #BBF7D0",
              color: "#059669",
              borderRadius: 14,
              padding: "14px 18px",
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 10,
              //: "'Sora', sans-serif",
            }}
          >
            ✓ Lease request submitted! The landlord will review it shortly.
          </div>
        )}

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            marginBottom: 32,
          }}
        >
          {[
            { label: "Active Leases", value: active, accent: "#059669" },
            { label: "Pending Requests", value: pending, accent: "#D97706" },
            { label: "Awaiting Deposit", value: awaitingDeposit, accent: "#2D5BE3" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "#fff",
                borderRadius: 18,
                padding: "24px 28px",
                border: "1px solid #F0F0EE",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 8 }}>
                {s.label}
              </div>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  color: s.accent,
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Leases */}
        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  height: 200,
                  overflow: "hidden",
                  border: "1px solid #F0F0EE",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    background:
                      "linear-gradient(90deg,#F3F4F6 25%,#E5E7EB 50%,#F3F4F6 75%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.5s infinite",
                  }}
                />
              </div>
            ))}
            <style>{`
              @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
              }
              @keyframes blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.3; }
              }
            `}</style>
          </div>
        ) : leases.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 0",
              background: "#fff",
              borderRadius: 24,
              border: "1px solid #F0F0EE",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏠</div>
            <p
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#1A1A2E",
                marginBottom: 8,
              }}
            >
              No lease requests yet
            </p>
            <p
              style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 24 }}
            >
              Browse properties and submit a lease request to get started
            </p>
            <Link
              href="/properties"
              style={{
                display: "inline-block",
                background: "#1A1A2E",
                color: "#fff",
                padding: "12px 28px",
                borderRadius: 14,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {leases.map((lease) => (
              <LeaseCard key={lease.id} lease={lease} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TenantDashboard() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            background: "#F8F8F6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9CA3AF",
            //: "'Sora', sans-serif",
            fontSize: 13,
          }}
        >
          Loading...
        </div>
      }
    >
      <TenantDashboardContent />
    </Suspense>
  );
}