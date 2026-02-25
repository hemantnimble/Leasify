"use client";

// components/ui/DemoBanner.tsx
// Shows a sticky read-only warning when user is in demo mode

import { useSession } from "next-auth/react";

export default function DemoBanner() {
  const { data: session } = useSession();

  // Only show if this is a demo session
  if (!(session?.user as any)?.isDemo) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        background: "#1A1A2E",
        color: "#fff",
        borderRadius: 100,
        padding: "10px 22px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontSize: 12,
        fontWeight: 500,
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        whiteSpace: "nowrap",
        fontFamily: "'Sora', sans-serif",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Amber dot */}
      <span
        style={{
          width: 7,
          height: 7,
          background: "#F59E0B",
          borderRadius: "50%",
          display: "inline-block",
          flexShrink: 0,
          animation: "demoBlink 2s infinite",
        }}
      />
      <span style={{ color: "#F59E0B", fontWeight: 700, letterSpacing: "0.05em", fontSize: 10 }}>
        DEMO MODE
      </span>
      <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>·</span>
      <span style={{ color: "rgba(255,255,255,0.7)" }}>Read-only · No real transactions</span>

      <style>{`
        @keyframes demoBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}