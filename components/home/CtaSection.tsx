"use client";

// components/home/CtaSection.tsx

import { useState } from "react";
import Link from "next/link";
import { AnimSection } from "@/components/home/AnimSection";

export function CtaSection() {
  const [hoveredCard, setHoveredCard] = useState<"landlord" | "tenant" | null>(
    null
  );

  return (
    <section
      style={{
        padding: "0 48px 100px",
        background: "#F8F8F6",
      }}
    >
      <div className="lg:grid lg:grid-cols-2 flex gap-8 flex-wrap"
       
      >
        {/* ── Landlord card ── */}
        <AnimSection delay={0}>
          <div
            onMouseEnter={() => setHoveredCard("landlord")}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              background: "#1A1A2E",
              borderRadius: 28,
              padding: "52px 48px",
              color: "#fff",
              position: "relative",
              overflow: "hidden",
              minHeight: 340,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transform:
                hoveredCard === "landlord" ? "translateY(-6px)" : "translateY(0)",
              boxShadow:
                hoveredCard === "landlord"
                  ? "0 24px 64px rgba(0,0,0,0.22)"
                  : "0 4px 24px rgba(0,0,0,0.1)",
              transition: "transform 0.35s ease, box-shadow 0.35s ease",
            }}
          >
            {/* Background glow blobs */}
            <div
              style={{
                position: "absolute",
                top: -60,
                right: -60,
                width: 220,
                height: 220,
                background: "rgba(91,110,245,0.15)",
                borderRadius: "50%",
                filter: "blur(50px)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -40,
                left: -40,
                width: 160,
                height: 160,
                background: "rgba(167,139,250,0.1)",
                borderRadius: "50%",
                filter: "blur(40px)",
                pointerEvents: "none",
              }}
            />

            <div style={{ position: "relative" }}>
              {/* Label */}
              <div
                style={{
                  fontSize: 11,
                  //: "'DM Mono', monospace",
                  letterSpacing: "0.12em",
                  color: "#A78BFA",
                  marginBottom: 16,
                }}
              >
                FOR LANDLORDS
              </div>

              {/* Headline */}
              <h3
                style={{
                  fontSize: "clamp(24px, 2.5vw, 32px)",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.15,
                  marginBottom: 14,
                  //: "'Sora', sans-serif",
                }}
              >
                List your property.
                <br />
                Get paid on-chain.
              </h3>

              {/* Body */}
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 300,
                  color: "rgba(255,255,255,0.6)",
                  lineHeight: 1.7,
                  maxWidth: 320,
                  //: "'Sora', sans-serif",
                }}
              >
                Deploy a smart contract for every tenant. Rent arrives directly
                to your wallet. Deposits released automatically at lease end.
              </p>
            </div>

            {/* CTA button */}
            <Link
              href="/login/landlord"
              style={{
                display: "inline-block",
                alignSelf: "flex-start",
                marginTop: 36,
                background: "#fff",
                color: "#1A1A2E",
                border: "none",
                padding: "14px 28px",
                borderRadius: 14,
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
                //: "'Sora', sans-serif",
                transform:
                  hoveredCard === "landlord"
                    ? "translateY(-2px)"
                    : "translateY(0)",
                boxShadow:
                  hoveredCard === "landlord"
                    ? "0 8px 24px rgba(0,0,0,0.2)"
                    : "none",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
                position: "relative",
              }}
            >
              Start Listing →
            </Link>
          </div>
        </AnimSection>

        {/* ── Tenant card ── */}
        <AnimSection delay={0.12}>
          <div
            onMouseEnter={() => setHoveredCard("tenant")}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              background: "#EEF2FF",
              borderRadius: 28,
              padding: "52px 48px",
              position: "relative",
              overflow: "hidden",
              minHeight: 340,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transform:
                hoveredCard === "tenant" ? "translateY(-6px)" : "translateY(0)",
              boxShadow:
                hoveredCard === "tenant"
                  ? "0 24px 64px rgba(45,91,227,0.14)"
                  : "0 4px 24px rgba(0,0,0,0.05)",
              transition: "transform 0.35s ease, box-shadow 0.35s ease",
            }}
          >
            {/* Background glow */}
            <div
              style={{
                position: "absolute",
                bottom: -40,
                right: -40,
                width: 200,
                height: 200,
                background: "rgba(45,91,227,0.1)",
                borderRadius: "50%",
                filter: "blur(40px)",
                pointerEvents: "none",
              }}
            />

            <div style={{ position: "relative" }}>
              {/* Label */}
              <div
                style={{
                  fontSize: 11,
                  //: "'DM Mono', monospace",
                  letterSpacing: "0.12em",
                  color: "#2D5BE3",
                  marginBottom: 16,
                }}
              >
                FOR TENANTS
              </div>

              {/* Headline */}
              <h3
                style={{
                  fontSize: "clamp(24px, 2.5vw, 32px)",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.15,
                  color: "#1A1A2E",
                  marginBottom: 14,
                  //: "'Sora', sans-serif",
                }}
              >
                Find your home.
                <br />
                Lease it securely.
              </h3>

              {/* Body */}
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 300,
                  color: "#6B7280",
                  lineHeight: 1.7,
                  maxWidth: 320,
                  //: "'Sora', sans-serif",
                }}
              >
                Browse verified listings. Your deposit is protected by code.
                Track every payment. No shady landlords holding your money
                hostage.
              </p>
            </div>

            {/* CTA button */}
            <Link
              href="/properties"
              style={{
                display: "inline-block",
                alignSelf: "flex-start",
                marginTop: 36,
                background: "#1A1A2E",
                color: "#fff",
                border: "none",
                padding: "14px 28px",
                borderRadius: 14,
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
                //: "'Sora', sans-serif",
                transform:
                  hoveredCard === "tenant"
                    ? "translateY(-2px)"
                    : "translateY(0)",
                boxShadow:
                  hoveredCard === "tenant"
                    ? "0 8px 24px rgba(26,26,46,0.2)"
                    : "none",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
                position: "relative",
              }}
            >
              Find a Home →
            </Link>
          </div>
        </AnimSection>
      </div>
    </section>
  );
}