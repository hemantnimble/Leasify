"use client";

// components/auth/WalletConnectButton.tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useWalletAuth } from "@/hooks/useWalletAuth";

interface WalletConnectButtonProps {
  role: "LANDLORD" | "TENANT";
}

export default function WalletConnectButton({ role }: WalletConnectButtonProps) {
  const {
    connectWallet,
    isLoading,
    error,
    isAuthenticated,
    role: userRole,
  } = useWalletAuth();

  const { isConnected } = useAccount();
  const router = useRouter();

  // Gate: only allow redirect after a clean successful connect
  const [safeToRedirect, setSafeToRedirect] = useState(false);

  const isLandlord = role === "LANDLORD";
  const accent = isLandlord ? "#7C3AED" : "#2D5BE3";
  const accentBg = isLandlord ? "#F5F3FF" : "#EEF2FF";

  const handleConnect = async () => {
    setSafeToRedirect(false);
    await connectWallet(role);
    setSafeToRedirect(true);
  };

  useEffect(() => {
    if (isAuthenticated && userRole && safeToRedirect && !error) {
      if (userRole === "LANDLORD") {
        router.push("/dashboard/landlord");
      } else {
        router.push("/dashboard/tenant");
      }
    }
  }, [isAuthenticated, userRole, safeToRedirect, error, router]);

  // Button label reflects the current step
  const buttonLabel = () => {
    if (isLoading) return "Connecting...";
    if (!isConnected) return "Connect Wallet";
    return `Sign in as ${isLandlord ? "Landlord" : "Tenant"}`;
  };

  const buttonIcon = () => {
    if (isLoading) return null;
    if (!isConnected) return "🔗";
    return isLandlord ? "🔑" : "🏠";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

      {/* Error message */}
      {error && (
        <div
          style={{
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            color: "#DC2626",
            borderRadius: 12,
            padding: "12px 16px",
            fontSize: 12,
            lineHeight: 1.6,
          }}
        >
          {error}
        </div>
      )}

      {/* Connect button */}
      <button
        onClick={handleConnect}
        disabled={isLoading}
        style={{
          width: "100%",
          background: isLoading ? "#F3F4F6" : "#1A1A2E",
          color: isLoading ? "#9CA3AF" : "#fff",
          border: "none",
          padding: "16px",
          borderRadius: 14,
          fontSize: 14,
          fontWeight: 600,
          cursor: isLoading ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          transition: "background 0.2s, transform 0.2s, box-shadow 0.2s",
          letterSpacing: "0.01em",
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            (e.currentTarget as HTMLElement).style.boxShadow =
              "0 8px 24px rgba(26,26,46,0.2)";
            (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        }}
      >
        {isLoading ? (
          <>
            <span
              style={{
                width: 18,
                height: 18,
                border: "2px solid #D1D5DB",
                borderTopColor: "#6B7280",
                borderRadius: "50%",
                display: "inline-block",
                animation: "spin 0.8s linear infinite",
              }}
            />
            Connecting...
          </>
        ) : (
          <>
            {buttonIcon()} {buttonLabel()}
          </>
        )}
      </button>

      {/* Role chip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          background: accentBg,
          borderRadius: 10,
          padding: "10px",
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            background: accent,
            borderRadius: "50%",
            display: "inline-block",
          }}
        />
        <span
          style={{
            fontSize: 11,
            color: accent,
            letterSpacing: "0.04em",
            fontWeight: 500,
          }}
        >
          {isConnected
            ? `Wallet connected · Sign to authenticate`
            : `MetaMask, WalletConnect, Coinbase & more`}
        </span>
      </div>

      <p
        style={{
          fontSize: 11,
          color: "#D1D5DB",
          textAlign: "center",
          fontWeight: 300,
        }}
      >
        Signing is free — no gas required
      </p>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}