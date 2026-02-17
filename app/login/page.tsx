// app/login/page.tsx
'use client';
import Link from "next/link";

export default function LoginPage() {
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
      {/* Back to home */}
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

      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div
          style={{
            width: 52,
            height: 52,
            background: "#1A1A2E",
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            margin: "0 auto 16px",
          }}
        >
          🏠
        </div>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            color: "#1A1A2E",
            marginBottom: 8,
          }}
        >
          Welcome to Leasify
        </h1>
        <p style={{ fontSize: 14, color: "#9CA3AF", fontWeight: 300 }}>
          Choose how you want to sign in
        </p>
      </div>

      {/* Role cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          width: "100%",
          maxWidth: 520,
        }}
      >
        {/* Tenant */}
        <Link
          href="/login/tenant"
          style={{ textDecoration: "none" }}
        >
          <div
            style={{
              background: "#fff",
              border: "1.5px solid #E5E7EB",
              borderRadius: 24,
              padding: "36px 28px",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "#2D5BE3";
              el.style.boxShadow = "0 12px 40px rgba(45,91,227,0.1)";
              el.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "#E5E7EB";
              el.style.boxShadow = "none";
              el.style.transform = "translateY(0)";
            }}
          >
            <div style={{ fontSize: 44, marginBottom: 16 }}>🏠</div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 18,
                color: "#1A1A2E",
                marginBottom: 8,
                letterSpacing: "-0.02em",
              }}
            >
              Tenant
            </div>
            <p
              style={{
                fontSize: 12,
                color: "#9CA3AF",
                lineHeight: 1.6,
                marginBottom: 24,
                fontWeight: 300,
              }}
            >
              Browse properties and sign lease agreements
            </p>
            <div
              style={{
                background: "#EEF2FF",
                color: "#2D5BE3",
                padding: "10px",
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Sign in as Tenant
            </div>
          </div>
        </Link>

        {/* Landlord */}
        <Link href="/login/landlord" style={{ textDecoration: "none" }}>
          <div
            style={{
              background: "#fff",
              border: "1.5px solid #E5E7EB",
              borderRadius: 24,
              padding: "36px 28px",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "#7C3AED";
              el.style.boxShadow = "0 12px 40px rgba(124,58,237,0.1)";
              el.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "#E5E7EB";
              el.style.boxShadow = "none";
              el.style.transform = "translateY(0)";
            }}
          >
            <div style={{ fontSize: 44, marginBottom: 16 }}>🔑</div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 18,
                color: "#1A1A2E",
                marginBottom: 8,
                letterSpacing: "-0.02em",
              }}
            >
              Landlord
            </div>
            <p
              style={{
                fontSize: 12,
                color: "#9CA3AF",
                lineHeight: 1.6,
                marginBottom: 24,
                fontWeight: 300,
              }}
            >
              List properties and manage lease agreements
            </p>
            <div
              style={{
                background: "#F5F3FF",
                color: "#7C3AED",
                padding: "10px",
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Sign in as Landlord
            </div>
          </div>
        </Link>
      </div>

      <p
        style={{
          marginTop: 28,
          fontSize: 11,
          color: "#D1D5DB",
          textAlign: "center",
          maxWidth: 340,
          lineHeight: 1.6,
        }}
      >
        Signing in requires MetaMask. Your wallet address is your identity — no
        password needed.
      </p>
    </div>
  );
}