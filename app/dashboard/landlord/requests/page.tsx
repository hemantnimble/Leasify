"use client";

// app/dashboard/landlord/requests/page.tsx

import { useState, useEffect } from "react";
import Link from "next/link";

interface Lease {
  id: string;
  status: string;
  monthlyRent: number;
  securityDeposit: number;
  startDate: string;
  endDate: string;
  createdAt: string;
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
}

const STATUS_CONFIG: Record<
  string,
  { bg: string; color: string; border: string; label: string }
> = {
  PENDING: {
    bg: "#FFFBEB",
    color: "#D97706",
    border: "#FDE68A",
    label: "Pending",
  },
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
  REJECTED: {
    bg: "#FEF2F2",
    color: "#DC2626",
    border: "#FECACA",
    label: "Rejected",
  },
  COMPLETED: {
    bg: "#F9FAFB",
    color: "#6B7280",
    border: "#E5E7EB",
    label: "Completed",
  },
  TERMINATED: {
    bg: "#F9FAFB",
    color: "#6B7280",
    border: "#E5E7EB",
    label: "Terminated",
  },
};

function LeaseCard({
  lease,
  onAccept,
  onReject,
  processingId,
}: {
  lease: Lease;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  processingId: string | null;
}) {
  const [hovered, setHovered] = useState(false);
  const cfg = STATUS_CONFIG[lease.status] || STATUS_CONFIG.COMPLETED;
  const isProcessing = processingId === lease.id;

  const shortTenant =
    lease.tenant.walletAddress.slice(0, 6) +
    "..." +
    lease.tenant.walletAddress.slice(-4);

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
      {/* Top row */}
      <div style={{ padding: "20px 22px 0" }}>
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
                Tenant: {lease.tenant.displayName || shortTenant}
              </div>
            </div>
          </div>

          {/* Status badge */}
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

        {/* Terms grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 10,
            marginBottom: 20,
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
      </div>

      {/* Action bar — only for pending */}
      {lease.status === "PENDING" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            borderTop: "1px solid #F3F4F6",
          }}
        >
          <button
            onClick={() => onAccept(lease.id)}
            disabled={isProcessing}
            style={{
              background: "transparent",
              border: "none",
              borderRight: "1px solid #F3F4F6",
              padding: "14px",
              fontSize: 13,
              fontWeight: 600,
              color: isProcessing ? "#9CA3AF" : "#059669",
              cursor: isProcessing ? "not-allowed" : "pointer",
              //: "'Sora', sans-serif",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!isProcessing)
                (e.currentTarget as HTMLElement).style.background = "#F0FDF4";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            {isProcessing ? "Processing..." : "✓ Accept Lease"}
          </button>
          <button
            onClick={() => onReject(lease.id)}
            disabled={isProcessing}
            style={{
              background: "transparent",
              border: "none",
              padding: "14px",
              fontSize: 13,
              fontWeight: 600,
              color: isProcessing ? "#9CA3AF" : "#DC2626",
              cursor: isProcessing ? "not-allowed" : "pointer",
              //: "'Sora', sans-serif",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!isProcessing)
                (e.currentTarget as HTMLElement).style.background = "#FEF2F2";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            {isProcessing ? "Processing..." : "✕ Reject"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function LandlordRequestsPage() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"PENDING" | "ALL">("PENDING");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchLeases = async () => {
    try {
      const url =
        activeTab === "PENDING"
          ? "/api/landlord/leases?status=PENDING"
          : "/api/landlord/leases";
      const res = await fetch(url);
      const data = await res.json();
      setLeases(data.leases || []);
    } catch (err) {
      console.error("Failed to fetch leases:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchLeases();
  }, [activeTab]);

  const handleAccept = async (leaseId: string) => {
    setProcessingId(leaseId);
    try {
      const res = await fetch("/api/lease/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaseId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchLeases();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (leaseId: string) => {
    setProcessingId(leaseId);
    try {
      const res = await fetch("/api/lease/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaseId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchLeases();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const pendingCount = leases.filter((l) => l.status === "PENDING").length;

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

        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              fontSize: 11,
              //: "'DM Mono', monospace",
              letterSpacing: "0.1em",
              color: "#9CA3AF",
              marginBottom: 8,
            }}
          >
            LANDLORD · REQUESTS
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
            Lease Requests
          </h1>
          <p style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 300, marginTop: 6 }}>
            Review and respond to tenant requests
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
          {(["PENDING", "ALL"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "9px 22px",
                borderRadius: 100,
                border: "1.5px solid",
                borderColor: activeTab === tab ? "#1A1A2E" : "#E5E7EB",
                background: activeTab === tab ? "#1A1A2E" : "#fff",
                color: activeTab === tab ? "#fff" : "#6B7280",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                //: "'Sora', sans-serif",
                transition: "all 0.2s",
              }}
            >
              {tab === "PENDING"
                ? `Pending${pendingCount > 0 ? ` (${pendingCount})` : ""}`
                : "All Requests"}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  height: 180,
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
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <p
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#1A1A2E",
                marginBottom: 8,
              }}
            >
              {activeTab === "PENDING"
                ? "No pending requests"
                : "No lease requests yet"}
            </p>
            <p style={{ fontSize: 13, color: "#9CA3AF" }}>
              {activeTab === "PENDING"
                ? "You're all caught up"
                : "Requests from tenants will appear here"}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {leases.map((lease) => (
              <LeaseCard
                key={lease.id}
                lease={lease}
                onAccept={handleAccept}
                onReject={handleReject}
                processingId={processingId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}