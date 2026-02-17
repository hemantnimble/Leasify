"use client";

// components/home/FinalCtaSection.tsx

import { useState } from "react";
import Link from "next/link";
import { AnimSection } from "@/components/home/AnimSection";

export function FinalCtaSection() {
  const [hov1, setHov1] = useState(false);
  const [hov2, setHov2] = useState(false);

  return (
    <section
      style={{
        padding: "100px 48px",
        background: "#fff",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <AnimSection>
          {/* Tag */}
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
              marginBottom: 24,
            }}
          >
            Get Started Today
          </div>

          {/* Headline */}
          <h2
            style={{
              fontSize: "clamp(36px, 5vw, 64px)",
              fontWeight: 800,
              letterSpacing: "-0.045em",
              lineHeight: 1.05,
              color: "#1A1A2E",
              marginBottom: 20,
              //: "'Sora', sans-serif",
            }}
          >
            Your next home is
            <br />
            one signature away.
          </h2>

          {/* Subtext */}
          <p
            style={{
              fontSize: 15,
              fontWeight: 300,
              color: "#6B7280",
              lineHeight: 1.7,
              maxWidth: 460,
              margin: "0 auto 40px",
              //: "'Sora', sans-serif",
            }}
          >
            No credit checks. No bank approvals. Connect your wallet, find a
            home, and sign your lease on-chain — in minutes.
          </p>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              gap: 14,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/login"
              onMouseEnter={() => setHov1(true)}
              onMouseLeave={() => setHov1(false)}
              style={{
                display: "inline-block",
                background: "#1A1A2E",
                color: "#fff",
                padding: "16px 44px",
                borderRadius: 14,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
                //: "'Sora', sans-serif",
                transform: hov1 ? "translateY(-2px)" : "translateY(0)",
                boxShadow: hov1
                  ? "0 10px 32px rgba(26,26,46,0.25)"
                  : "0 2px 8px rgba(26,26,46,0.1)",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
              }}
            >
              Connect Wallet
            </Link>

            <Link
              href="/properties"
              onMouseEnter={() => setHov2(true)}
              onMouseLeave={() => setHov2(false)}
              style={{
                display: "inline-block",
                background: "transparent",
                color: "#1A1A2E",
                border: "1.5px solid",
                borderColor: hov2 ? "#1A1A2E" : "#E5E7EB",
                padding: "15px 44px",
                borderRadius: 14,
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
                //: "'Sora', sans-serif",
                background2: hov2 ? "#F3F4F6" : "transparent",
                transition: "border-color 0.2s, background 0.2s",
              } as React.CSSProperties}
            >
              Browse Properties
            </Link>
          </div>
        </AnimSection>
      </div>
    </section>
  );
}