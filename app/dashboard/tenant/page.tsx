"use client";

// app/dashboard/tenant/page.tsx

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PayDepositButton from "@/components/blockchain/PayDepositButton";

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

function LeaseCard({ lease, onRefresh }: { lease: Lease; onRefresh: () => void }) {
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
      {/* Property image + header */}
      <div style={{ display: "flex", gap: 0 }}>
        {lease.property.images?.[0] && (
          <div
            style={{
              width: 100,
              flexShrink: 0,
              background: "#F3F4F6",
              overflow: "hidden",
            }}
          >
            <img
              src={lease.property.images[0]}
              alt={lease.property.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        )}

        <div style={{ flex: 1, padding: "20px 22px" }}>
          {/* Status + title row */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 10,
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#1A1A2E",
                  marginBottom: 3,
                }}
              >
                {lease.property.title}
              </div>
              <div style={{ fontSize: 12, color: "#9CA3AF" }}>
                📍 {lease.property.location}
              </div>
            </div>

            <span
              style={{
                background: cfg.bg,
                color: cfg.color,
                border: `1px solid ${cfg.border}`,
                borderRadius: 20,
                padding: "4px 12px",
                fontSize: 11,
                fontWeight: 600,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {cfg.label}
            </span>
          </div>

          {/* Status message */}
          <div
            style={{
              background: cfg.bg,
              border: `1px solid ${cfg.border}`,
              color: cfg.color,
              borderRadius: 10,
              padding: "8px 12px",
              marginBottom: 16,
              fontSize: 12,
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
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#1A1A2E",
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* ── AWAITING DEPOSIT: Real PayDepositButton ── */}
          {lease.status === "AWAITING_DEPOSIT" && lease.contractAddress && (
            <div style={{ marginTop: 16 }}>
              <PayDepositButton
                leaseId={lease.id}
                contractAddress={lease.contractAddress}
                depositAmount={lease.securityDeposit}
                onSuccess={onRefresh}
                variant="light"
              />
            </div>
          )}

          {/* AWAITING_DEPOSIT but no contract address yet (shouldn't happen, but safety net) */}
          {lease.status === "AWAITING_DEPOSIT" && !lease.contractAddress && (
            <div
              style={{
                marginTop: 16,
                background: "#FEF9C3",
                border: "1px solid #FDE68A",
                borderRadius: 12,
                padding: "12px 16px",
                fontSize: 12,
                color: "#92400E",
              }}
            >
              ⏳ Smart contract is being deployed. Please refresh in a moment.
            </div>
          )}

          {/* Contract address chip */}
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
              <span style={{ fontSize: 10, color: "#059669", fontWeight: 600 }}>
                ON-CHAIN
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: "#6B7280",
                  // : "monospace",
                }}
              >
                {lease.contractAddress.slice(0, 10)}...
                {lease.contractAddress.slice(-8)}
              </span>
              <a
                href={`https://sepolia.etherscan.io/address/${lease.contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 10, color: "#059669", marginLeft: "auto" }}
              >
                Etherscan ↗
              </a>
            </div>
          )}

          {/* Landlord + View Details row */}
          <div
            style={{
              marginTop: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ fontSize: 11, color: "#9CA3AF" }}>
              Landlord:{" "}
              <span style={{ color: "#1A1A2E" }}>
                {shortLandlord}
              </span>
            </div>
            <Link
              href={`/dashboard/lease/${lease.id}`}
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#2D5BE3",
                textDecoration: "none",
                border: "1px solid #BFDBFE",
                borderRadius: 8,
                padding: "6px 14px",
                background: "#EEF2FF",
                transition: "all 0.2s",
              }}
            >
              View Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function TenantDashboardContent() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  const fetchLeases = async () => {
    try {
      const res = await fetch("/api/tenant/leases");
      const data = await res.json();
      setLeases(data.leases || []);
    } catch (err) {
      console.error("Failed to fetch leases", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeases();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#F8F8F6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9CA3AF",
          fontSize: 13,
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8F8F6",
        padding: "32px 24px",
      }}
    >
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 28,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: "#1A1A2E",
                letterSpacing: "-0.035em",
                marginBottom: 4,
              }}
            >
              My Leases
            </h1>
            <p style={{ fontSize: 13, color: "#9CA3AF" }}>
              {leases.length} lease{leases.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <Link
            href="/properties"
            style={{
              background: "#1A1A2E",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            + Browse Properties
          </Link>
        </div>

        {/* Lease list */}
        {leases.length === 0 ? (
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
              <LeaseCard key={lease.id} lease={lease} onRefresh={fetchLeases} />
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