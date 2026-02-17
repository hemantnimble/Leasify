"use client";

// app/login/tenant/page.tsx

import Link from "next/link";
import WalletConnectButton from "@/components/auth/WalletConnectButton";

export default function TenantLoginPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8F8F6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        fontFamily: "'Sora', sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 28,
          padding: "48px 44px",
          width: "100%",
          maxWidth: 440,
          boxShadow: "0 8px 48px rgba(0,0,0,0.08)",
          border: "1px solid #F0F0EE",
        }}
      >
        {/* Back */}
        <Link
          href="/login"
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
          ← Back
        </Link>

        {/* Icon + header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div
            style={{
              width: 64,
              height: 64,
              background: "#EEF2FF",
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              margin: "0 auto 20px",
            }}
          >
            🏠
          </div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: "-0.035em",
              color: "#1A1A2E",
              marginBottom: 6,
            }}
          >
            Tenant Sign In
          </h1>
          <p style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 300 }}>
            Browse properties and manage your leases
          </p>
        </div>

        {/* Connect button — existing component, unchanged */}
        <WalletConnectButton role="TENANT" />

        {/* Info box */}
        <div
          style={{
            marginTop: 20,
            background: "#F0F7FF",
            border: "1px solid #BFDBFE",
            borderRadius: 14,
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#2D5BE3",
              marginBottom: 4,
              fontFamily: "'DM Mono', monospace",
              letterSpacing: "0.04em",
            }}
          >
            FIRST TIME?
          </div>
          <p
            style={{
              fontSize: 11,
              color: "#6B7280",
              lineHeight: 1.6,
              fontWeight: 300,
            }}
          >
            A new tenant account is created automatically using your wallet
            address.
          </p>
          <div
            style={{
              marginTop: 8,
              paddingTop: 8,
              borderTop: "1px solid #BFDBFE",
              fontSize: 11,
              color: "#9CA3AF",
              lineHeight: 1.6,
              fontWeight: 300,
            }}
          >
            ⚠️ Each wallet can only be registered under one role. Use a
            separate wallet for your landlord account.
          </div>
        </div>
      </div>
    </div>
  );
}