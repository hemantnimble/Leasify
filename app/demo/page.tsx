"use client";

// app/demo/page.tsx
// Demo login page — no wallet required

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DemoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<"LANDLORD" | "TENANT" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loginAs = async (role: "LANDLORD" | "TENANT") => {
    setLoading(role);
    setError(null);

    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to start demo");

      // Hard navigate so session cookie is picked up
      window.location.href = data.redirectTo;
    } catch (err: any) {
      setError(err.message);
      setLoading(null);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8F8F6",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        fontFamily: "'Sora', sans-serif",
      }}
    >
      {/* Back */}
      <Link
        href="/"
        style={{
          position: "absolute",
          top: 32,
          left: 48,
          fontSize: 13,
          color: "#9CA3AF",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: 6,
          transition: "color 0.2s",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLElement).style.color = "#1A1A2E")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.color = "#9CA3AF")
        }
      >
        ← Back to Leasify
      </Link>

      {/* Logo + header */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div
          style={{
            width: 56,
            height: 56,
            background: "#1A1A2E",
            borderRadius: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            margin: "0 auto 16px",
          }}
        >
          🏠
        </div>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            color: "#1A1A2E",
            marginBottom: 8,
          }}
        >
          Try the Demo
        </h1>
        <p style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 300, maxWidth: 320 }}>
          Explore Leasify without a wallet. Choose a role to enter a pre-loaded
          demo environment.
        </p>
      </div>

      {/* Read-only badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "#FFFBEB",
          border: "1px solid #FDE68A",
          color: "#92400E",
          padding: "8px 18px",
          borderRadius: 100,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.05em",
          marginBottom: 36,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            background: "#D97706",
            borderRadius: "50%",
            display: "inline-block",
          }}
        />
        READ-ONLY DEMO · No wallet required
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            color: "#DC2626",
            borderRadius: 12,
            padding: "12px 20px",
            fontSize: 12,
            marginBottom: 24,
            maxWidth: 440,
            width: "100%",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

      {/* Role cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          width: "100%",
          maxWidth: 500,
        }}
      >
        {/* Landlord */}
        <button
          onClick={() => loginAs("LANDLORD")}
          disabled={!!loading}
          style={{
            background: "#fff",
            border: "1.5px solid",
            borderColor: loading === "LANDLORD" ? "#7C3AED" : "#E5E7EB",
            borderRadius: 22,
            padding: "32px 24px",
            textAlign: "center",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.25s ease",
            opacity: loading && loading !== "LANDLORD" ? 0.5 : 1,
            fontFamily: "'Sora', sans-serif",
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "#7C3AED";
              el.style.boxShadow = "0 12px 40px rgba(124,58,237,0.1)";
              el.style.transform = "translateY(-4px)";
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "#E5E7EB";
              el.style.boxShadow = "none";
              el.style.transform = "translateY(0)";
            }
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 14 }}>
            {loading === "LANDLORD" ? (
              <span
                style={{
                  display: "inline-block",
                  width: 36,
                  height: 36,
                  border: "3px solid #DDD6FE",
                  borderTopColor: "#7C3AED",
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                }}
              />
            ) : "🔑"}
          </div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 16,
              color: "#1A1A2E",
              marginBottom: 6,
              letterSpacing: "-0.02em",
            }}
          >
            {loading === "LANDLORD" ? "Entering..." : "Landlord"}
          </div>
          <p
            style={{
              fontSize: 11,
              color: "#9CA3AF",
              lineHeight: 1.6,
              marginBottom: 20,
              fontWeight: 300,
            }}
          >
            View properties, lease requests & active leases
          </p>
          <div
            style={{
              background: "#F5F3FF",
              color: "#7C3AED",
              padding: "9px",
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Enter as Landlord
          </div>
        </button>

        {/* Tenant */}
        <button
          onClick={() => loginAs("TENANT")}
          disabled={!!loading}
          style={{
            background: "#fff",
            border: "1.5px solid",
            borderColor: loading === "TENANT" ? "#2D5BE3" : "#E5E7EB",
            borderRadius: 22,
            padding: "32px 24px",
            textAlign: "center",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.25s ease",
            opacity: loading && loading !== "TENANT" ? 0.5 : 1,
            fontFamily: "'Sora', sans-serif",
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "#2D5BE3";
              el.style.boxShadow = "0 12px 40px rgba(45,91,227,0.1)";
              el.style.transform = "translateY(-4px)";
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "#E5E7EB";
              el.style.boxShadow = "none";
              el.style.transform = "translateY(0)";
            }
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 14 }}>
            {loading === "TENANT" ? (
              <span
                style={{
                  display: "inline-block",
                  width: 36,
                  height: 36,
                  border: "3px solid #BFDBFE",
                  borderTopColor: "#2D5BE3",
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                }}
              />
            ) : "🏠"}
          </div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 16,
              color: "#1A1A2E",
              marginBottom: 6,
              letterSpacing: "-0.02em",
            }}
          >
            {loading === "TENANT" ? "Entering..." : "Tenant"}
          </div>
          <p
            style={{
              fontSize: 11,
              color: "#9CA3AF",
              lineHeight: 1.6,
              marginBottom: 20,
              fontWeight: 300,
            }}
          >
            Browse properties, view leases & payment history
          </p>
          <div
            style={{
              background: "#EEF2FF",
              color: "#2D5BE3",
              padding: "9px",
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Enter as Tenant
          </div>
        </button>
      </div>

      {/* What's pre-loaded */}
      <div
        style={{
          marginTop: 28,
          background: "#fff",
          border: "1px solid #F0F0EE",
          borderRadius: 18,
          padding: "20px 24px",
          width: "100%",
          maxWidth: 500,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: "#9CA3AF",
            marginBottom: 14,
          }}
        >
          WHAT'S INCLUDED IN THE DEMO
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          {[
            { icon: "🏠", text: "3 demo properties" },
            { icon: "📋", text: "Active lease agreements" },
            { icon: "💸", text: "Payment history" },
            { icon: "⛓️", text: "On-chain contract data" },
          ].map((item) => (
            <div
              key={item.text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                color: "#6B7280",
              }}
            >
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Note */}
      <p
        style={{
          marginTop: 20,
          fontSize: 11,
          color: "#D1D5DB",
          textAlign: "center",
          maxWidth: 340,
          lineHeight: 1.6,
        }}
      >
        Demo session expires in 2 hours. No real transactions or data
        modifications are made.
      </p>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}