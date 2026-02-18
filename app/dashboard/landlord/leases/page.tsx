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

const STATUS_CONFIG: Record<
  string,
  { bg: string; color: string; border: string; label: string }
> = {
  AWAITING_DEPOSIT: {
    bg: "#EFF6FF",
    color: "#2D5BE3",
    border: "#BFDBFE",
    label: "Awaiting Deposit",
  },
  ACTIVE: {
    bg: "#F0FDF4",
    color: "#059669",
    border: "#BBF7D0",
    label: "Active",
  },
};

function LeaseCard({ lease }: { lease: Lease }) {
  const [hovered, setHovered] = useState(false);

  const shortTenant =
    lease.tenant.walletAddress.slice(0, 6) +
    "..." +
    lease.tenant.walletAddress.slice(-4);

  const pendingPayment = lease.payments[0];
  const rentDueDate = pendingPayment ? new Date(pendingPayment.dueDate) : null;
  const isRentOverdue = rentDueDate ? new Date() > rentDueDate : false;
  const daysUntilDue = rentDueDate
    ? Math.ceil((rentDueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  const leaseEnded = new Date() >= new Date(lease.endDate);

  const cfg = STATUS_CONFIG[lease.status] ?? {
    bg: "#F5F5F3",
    color: "#6B7280",
    border: "#E5E7EB",
    label: lease.status,
  };

  return (
    <Link
      href={`/dashboard/lease/${lease.id}`}
      style={{ textDecoration: "none" }}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: "#fff",
          border: "1px solid",
          borderColor: hovered ? "#1A1A2E" : "#F0F0EE",
          borderRadius: 20,
          padding: "24px 28px",
          transition: "all 0.2s ease",
          cursor: "pointer",
          boxShadow: hovered ? "0 8px 24px rgba(26,26,46,0.08)" : "none",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 20,
          }}
        >
          {/* Property + Tenant Info */}
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                overflow: "hidden",
                flexShrink: 0,
                background: "#F5F5F3",
              }}
            >
              <img
                src={
                  lease.property.images[0] ||
                  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&q=80"
                }
                alt={lease.property.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div>
              <p
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#1A1A2E",
                  marginBottom: 3,
                }}
              >
                {lease.property.title}
              </p>
              <p style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 3 }}>
                📍 {lease.property.location}
              </p>
              <p
                style={{
                  fontSize: 11,
                  color: "#9CA3AF",
                  //: "'DM Mono', monospace",
                }}
              >
                Tenant:{" "}
                {lease.tenant.displayName ||
                  `${shortTenant}`}
              </p>
            </div>
          </div>

          {/* Status Badge */}
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
            }}
          >
            {cfg.label}
          </div>
        </div>

        {/* Terms grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 10,
            marginBottom: 16,
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
                padding: "12px 14px",
              }}
            >
              <p style={{ fontSize: 10, color: "#9CA3AF", marginBottom: 4 }}>
                {item.label}
              </p>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#1A1A2E" }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Rent status row */}
        {lease.status === "ACTIVE" && pendingPayment && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              borderRadius: 12,
              background: isRentOverdue ? "#FEF2F2" : leaseEnded ? "#F0FDF4" : "#F8F8F6",
              border: `1px solid ${isRentOverdue ? "#FECACA" : leaseEnded ? "#BBF7D0" : "#F0F0EE"}`,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: isRentOverdue ? "#DC2626" : leaseEnded ? "#059669" : "#6B7280",
              }}
            >
              {leaseEnded
                ? "🏁 Lease period ended"
                : isRentOverdue
                ? `⚠️ Rent overdue by ${Math.abs(daysUntilDue!)} days`
                : `✓ Rent due in ${daysUntilDue} days`}
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#1A1A2E",
                //: "'DM Mono', monospace",
              }}
            >
              {pendingPayment.amount} ETH
            </span>
          </div>
        )}

        {/* Awaiting deposit note */}
        {lease.status === "AWAITING_DEPOSIT" && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              background: "#EFF6FF",
              border: "1px solid #BFDBFE",
              fontSize: 12,
              color: "#2D5BE3",
              fontWeight: 500,
            }}
          >
            ⏳ Waiting for tenant to pay security deposit
          </div>
        )}
      </div>
    </Link>
  );
}

export default function LandlordActiveLeasesPage() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/landlord/leases/active")
      .then((res) => res.json())
      .then((data) => setLeases(data.leases || []))
      .finally(() => setIsLoading(false));
  }, []);

  const active = leases.filter((l) => l.status === "ACTIVE").length;
  const awaitingDeposit = leases.filter(
    (l) => l.status === "AWAITING_DEPOSIT"
  ).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8F8F6",
        padding: "40px 48px 80px",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <NetworkWarning />

        {/* Back */}
        <Link
          href="/dashboard/landlord"
          style={{
            fontSize: 13,
            color: "#9CA3AF",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 32,
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.color = "#1A1A2E")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.color = "#9CA3AF")
          }
        >
          ← Dashboard
        </Link>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.1em",
              color: "#9CA3AF",
              marginBottom: 8,
            }}
          >
            LANDLORD · LEASES
          </div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "#1A1A2E",
              lineHeight: 1.1,
              marginBottom: 6,
            }}
          >
            Active Leases
          </h1>
          <p style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 300 }}>
            Manage your running lease agreements
          </p>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 16,
            marginBottom: 28,
          }}
        >
          {[
            { label: "Active Leases", value: active, color: "#059669", bg: "#F0FDF4" },
            { label: "Awaiting Deposit", value: awaitingDeposit, color: "#2D5BE3", bg: "#EFF6FF" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "#fff",
                border: "1px solid #F0F0EE",
                borderRadius: 18,
                padding: "24px 28px",
              }}
            >
              <p style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 8 }}>
                {stat.label}
              </p>
              <p
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  color: stat.color,
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 0",
              color: "#9CA3AF",
              fontSize: 13,
            }}
          >
            Loading leases...
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
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <p
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#1A1A2E",
                marginBottom: 8,
              }}
            >
              No active leases yet
            </p>
            <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 24 }}>
              Active leases appear here once tenants pay their deposit
            </p>
            <Link
              href="/dashboard/landlord/requests"
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
              View Lease Requests
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {leases.map((lease) => (
              <LeaseCard key={lease.id} lease={lease} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}