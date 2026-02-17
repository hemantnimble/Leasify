"use client";

// components/home/FeaturesSection.tsx

import { useState } from "react";
import { AnimSection } from "@/components/home/AnimSection";

const FEATURES = [
  {
    icon: "🔐",
    title: "Escrow Protection",
    body: "Security deposits locked in smart contracts. Released only when both parties agree — no disputes, no delays, ever.",
    accent: "#2D5BE3",
  },
  {
    icon: "📊",
    title: "Live Contract State",
    body: "See your deposit balance, accumulated penalties, and days remaining — fetched directly from Ethereum in real time.",
    accent: "#059669",
  },
  {
    icon: "⚖️",
    title: "Fair Late Fees",
    body: "Grace periods and late fee percentages agreed upfront and encoded in the contract. No surprises, no renegotiation.",
    accent: "#D97706",
  },
  {
    icon: "🌐",
    title: "Zero Intermediaries",
    body: "No bank holding your deposit. No property manager taking a cut. Just landlord, tenant, and immutable code.",
    accent: "#7C3AED",
  },
  {
    icon: "📱",
    title: "Any Wallet",
    body: "MetaMask, WalletConnect, Coinbase Wallet, Trust Wallet — connect from desktop or mobile with one tap.",
    accent: "#DB2777",
  },
  {
    icon: "✅",
    title: "Verified On-Chain",
    body: "Every transaction verifiable on Etherscan. Your lease history is a permanent, tamper-proof record on the blockchain.",
    accent: "#059669",
  },
];

function FeatureCard({
  f,
  index,
}: {
  f: (typeof FEATURES)[0];
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <AnimSection delay={index * 0.08}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: "#fff",
          borderRadius: 22,
          padding: "28px",
          border: "1px solid",
          borderColor: hovered ? f.accent + "33" : "#F0F0EE",
          boxShadow: hovered
            ? `0 16px 48px rgba(0,0,0,0.09)`
            : "0 1px 4px rgba(0,0,0,0.04)",
          transform: hovered ? "translateY(-5px)" : "translateY(0)",
          transition: "all 0.3s ease",
          height: "100%",
          cursor: "default",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: hovered ? f.accent + "12" : "#F8F8F6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            marginBottom: 18,
            transition: "background 0.3s",
          }}
        >
          {f.icon}
        </div>

        {/* Title */}
        <div
          style={{
            fontWeight: 700,
            fontSize: 15,
            color: "#1A1A2E",
            marginBottom: 8,
            //: "'Sora', sans-serif",
          }}
        >
          {f.title}
        </div>

        {/* Body */}
        <div
          style={{
            fontSize: 12.5,
            color: "#6B7280",
            lineHeight: 1.7,
            fontWeight: 300,
            //: "'Sora', sans-serif",
          }}
        >
          {f.body}
        </div>
      </div>
    </AnimSection>
  );
}

export function FeaturesSection() {
  return (
    <section
      style={{
        padding: "100px 48px",
        background: "#F8F8F6",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>

        {/* Header */}
        <AnimSection>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "#F0F0F8",
                color: "#4B5563",
                padding: "6px 14px",
                borderRadius: 100,
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.04em",
                //: "'DM Mono', monospace",
                marginBottom: 16,
              }}
            >
              Why Leasify
            </div>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 52px)",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                color: "#1A1A2E",
                lineHeight: 1.1,
                //: "'Sora', sans-serif",
              }}
            >
              Renting reimagined
              <br />
              for Web3
            </h2>
          </div>
        </AnimSection>

        {/* Grid */}
        <div className="flex flex-row flex-wrap gap-4 lg:grid-cols-3 lg:grid "
    
        >
          {FEATURES.map((f, i) => (
            <FeatureCard key={i} f={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}