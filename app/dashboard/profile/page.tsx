// app/dashboard/profile/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import Link from "next/link";

export default function ProfilePage() {
  const { walletAddress, role } = useWalletAuth();
  const [displayName, setDisplayName] = useState("");
  const [currentName, setCurrentName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.displayName) {
          setCurrentName(data.user.displayName);
          setDisplayName(data.user.displayName);
        }
        if (data.user?.createdAt) {
          setCreatedAt(data.user.createdAt);
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
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCurrentName(data.displayName);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
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

  const memberSince = createdAt
    ? new Date(createdAt).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8F8F6",
        padding: "40px 48px 80px",
      }}
    >
      <div style={{ maxWidth: 600, margin: "0 auto" }}>

        {/* Back */}
        <Link
          href={dashboardPath}
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
            {role} · ACCOUNT
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
            Profile
          </h1>
          <p style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 300 }}>
            Manage your account settings and identity
          </p>
        </div>

        {/* Wallet Identity Card */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #F0F0EE",
            borderRadius: 20,
            padding: "28px 32px",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.1em",
              color: "#9CA3AF",
              marginBottom: 20,
              textTransform: "uppercase",
            }}
          >
            Wallet Identity
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Address */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: 16,
                borderBottom: "1px solid #F5F5F3",
              }}
            >
              <span style={{ fontSize: 13, color: "#6B7280" }}>Wallet Address</span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    fontSize: 13,
                    //: "'DM Mono', monospace",
                    color: "#1A1A2E",
                    fontWeight: 500,
                    background: "#F5F5F3",
                    padding: "4px 12px",
                    borderRadius: 8,
                  }}
                >
                  {shortAddress}
                </span>
              </div>
            </div>

            {/* Role */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: 16,
                borderBottom: "1px solid #F5F5F3",
              }}
            >
              <span style={{ fontSize: 13, color: "#6B7280" }}>Role</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "4px 14px",
                  borderRadius: 100,
                  background: role === "LANDLORD" ? "#F3F0FF" : "#EEF2FF",
                  color: role === "LANDLORD" ? "#7C3AED" : "#2D5BE3",
                  border: `1px solid ${role === "LANDLORD" ? "#DDD6FE" : "#C7D7FD"}`,
                }}
              >
                {role}
              </span>
            </div>

            {/* Display Name (current) */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                ...(memberSince ? { paddingBottom: 16, borderBottom: "1px solid #F5F5F3" } : {}),
              }}
            >
              <span style={{ fontSize: 13, color: "#6B7280" }}>Display Name</span>
              <span style={{ fontSize: 13, color: "#1A1A2E", fontWeight: 500 }}>
                {isFetching ? "..." : currentName || (
                  <span style={{ color: "#9CA3AF", fontStyle: "italic" }}>Not set</span>
                )}
              </span>
            </div>

            {/* Member since */}
            {memberSince && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#6B7280" }}>Member Since</span>
                <span style={{ fontSize: 13, color: "#1A1A2E", fontWeight: 500 }}>
                  {memberSince}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Edit Display Name Card */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #F0F0EE",
            borderRadius: 20,
            padding: "28px 32px",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.1em",
              color: "#9CA3AF",
              marginBottom: 6,
              textTransform: "uppercase",
            }}
          >
            Update Display Name
          </div>
          <p style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 20, fontWeight: 300 }}>
            This name is shown to other users instead of your wallet address.
          </p>

          {success && (
            <div
              style={{
                background: "#F0FDF4",
                border: "1px solid #BBF7D0",
                color: "#059669",
                borderRadius: 12,
                padding: "12px 16px",
                fontSize: 12,
                marginBottom: 16,
                fontWeight: 500,
              }}
            >
              ✓ Display name updated successfully
            </div>
          )}

          {error && (
            <div
              style={{
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                color: "#DC2626",
                borderRadius: 12,
                padding: "12px 16px",
                fontSize: 12,
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. John Landlord"
              maxLength={30}
              style={{
                width: "100%",
                border: "1.5px solid #E5E7EB",
                borderRadius: 12,
                padding: "12px 16px",
                fontSize: 13,
                color: "#1A1A2E",
                outline: "none",
                marginBottom: 12,
                boxSizing: "border-box",
                //: "'Sora', sans-serif",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#1A1A2E")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#9CA3AF" }}>
                {displayName.length}/30 characters
              </span>
              <button
                type="submit"
                disabled={isLoading || displayName.trim().length === 0}
                style={{
                  background: isLoading || displayName.trim().length === 0 ? "#F3F4F6" : "#1A1A2E",
                  color: isLoading || displayName.trim().length === 0 ? "#9CA3AF" : "#fff",
                  border: "none",
                  padding: "10px 24px",
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: isLoading || displayName.trim().length === 0 ? "not-allowed" : "pointer",
                  //: "'Sora', sans-serif",
                  transition: "all 0.2s",
                }}
              >
                {isLoading ? "Saving..." : "Save Name"}
              </button>
            </div>
          </form>
        </div>

        {/* Etherscan Link */}
        {walletAddress && (
          <div
            style={{
              background: "#fff",
              border: "1px solid #F0F0EE",
              borderRadius: 20,
              padding: "24px 32px",
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.1em",
                color: "#9CA3AF",
                marginBottom: 14,
                textTransform: "uppercase",
              }}
            >
              On-Chain Activity
            </div>
            <a
              href={`https://sepolia.etherscan.io/address/${walletAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 13,
                color: "#2D5BE3",
                textDecoration: "none",
                fontWeight: 500,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.7")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
            >
              View full address on Etherscan ↗
            </a>
          </div>
        )}
      </div>
    </div>
  );
}