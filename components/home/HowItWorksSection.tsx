"use client";

// components/home/HowItWorksSection.tsx

import { useState } from "react";
import { AnimSection } from "@/components/home/AnimSection";

const STEPS = [
  {
    num: "01",
    title: "Connect Your Wallet",
    body: "Sign in with MetaMask or any WalletConnect wallet. No passwords, no email — your wallet is your identity on Leasify.",
    icon: "🔗",
    color: "#1A1A2E",
    img: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=700&q=80",
  },
  {
    num: "02",
    title: "Browse & Filter",
    body: "Explore verified listings. Filter by location, price in ETH, and lease duration. Every property has on-chain verified terms.",
    icon: "🏠",
    color: "#2D5BE3",
    img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=700&q=80",
  },
  {
    num: "03",
    title: "Sign Lease On-Chain",
    body: "Request a lease. Once your landlord accepts, a smart contract is automatically deployed — your agreement, immutable forever.",
    icon: "📋",
    color: "#059669",
    img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=700&q=80",
  },
  {
    num: "04",
    title: "Pay & Track Live",
    body: "Pay deposit and monthly rent directly from your wallet. Track every payment and contract state in real time on Ethereum.",
    icon: "⚡",
    color: "#D97706",
    img: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=700&q=80",
  },
];

export function HowItWorksSection() {
  const [active, setActive] = useState(0);

  return (
    <section style={{ background: "#fff", padding: "100px 48px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>

        {/* Header */}
        <AnimSection>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
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
              Simple Process
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
              From search to signed
              <br />
              in four steps
            </h2>
          </div>
        </AnimSection>

        {/* Two-col layout */}
        <div 
        // className="lg:grid lg:grid-cols-1 gap-8 flex"
        className="gap-8 lg:flex"
          // style={{
          //   display: "grid",
          //   gridTemplateColumns: "1fr 1fr",
          //   gap: 72,
          //   alignItems: "start",
          // }}
        >
          {/* ── Left: step list ── */}
          <div>
            {STEPS.map((s, i) => (
              <AnimSection key={i} delay={i * 0.08}>
                <div
                  onClick={() => setActive(i)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 16,
                    padding: "20px 22px",
                    borderRadius: 20,
                    background: active === i ? "#F8F8F6" : "transparent",
                    border: `1.5px solid ${active === i ? "#E5E7EB" : "transparent"}`,
                    marginBottom: 10,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow:
                      active === i ? "0 4px 24px rgba(0,0,0,0.06)" : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (active !== i)
                      (e.currentTarget as HTMLElement).style.background =
                        "#FAFAFA";
                  }}
                  onMouseLeave={(e) => {
                    if (active !== i)
                      (e.currentTarget as HTMLElement).style.background =
                        "transparent";
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 15,
                      flexShrink: 0,
                      background: active === i ? s.color : "#F3F4F6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                      transition: "background 0.3s",
                    }}
                  >
                    {s.icon}
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, paddingTop: 4 }}>
                    <div
                      style={{
                        //: "'DM Mono', monospace",
                        fontSize: 9,
                        letterSpacing: "0.12em",
                        color: active === i ? s.color : "#9CA3AF",
                        marginBottom: 4,
                        fontWeight: 500,
                        transition: "color 0.3s",
                      }}
                    >
                      {s.num}
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 15,
                        color: "#1A1A2E",
                        marginBottom: active === i ? 8 : 0,
                        //: "'Sora', sans-serif",
                        transition: "margin 0.3s",
                      }}
                    >
                      {s.title}
                    </div>

                    {/* Expand body on active */}
                    <div
                      style={{
                        fontSize: 12,
                        color: "#6B7280",
                        lineHeight: 1.65,
                        fontWeight: 300,
                        //: "'Sora', sans-serif",
                        maxHeight: active === i ? 80 : 0,
                        overflow: "hidden",
                        opacity: active === i ? 1 : 0,
                        transition: "max-height 0.4s ease, opacity 0.3s ease",
                      }}
                    >
                      {s.body}
                    </div>

                    {/* Progress bar */}
                    {active === i && (
                      <div
                        style={{
                          marginTop: 12,
                          height: 3,
                          background: "#E5E7EB",
                          borderRadius: 2,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            borderRadius: 2,
                            background: s.color,
                            animation: "stepFill 3s linear forwards",
                          }}
                          onAnimationEnd={() =>
                            setActive((prev) => (prev + 1) % STEPS.length)
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
              </AnimSection>
            ))}
          </div>

          {/* ── Right: image panel ── */}
          <AnimSection delay={0.15} from="right">
            <div style={{ position: "sticky", top: 120 }}>
              <div
                style={{
                  borderRadius: 28,
                  overflow: "hidden",
                  aspectRatio: "4/3",
                  boxShadow: "0 24px 64px rgba(0,0,0,0.13)",
                  position: "relative",
                  transition: "transform 0.4s ease",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.transform =
                    "scale(1.02)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.transform = "scale(1)")
                }
              >
                {/* Image — key forces re-mount so CSS animation replays */}
                <img
                  key={active}
                  src={STEPS[active].img}
                  alt={STEPS[active].title}
                  className="img-switch"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />

                {/* Bottom overlay */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background:
                      "linear-gradient(transparent, rgba(0,0,0,0.7))",
                    padding: "40px 24px 24px",
                  }}
                >
                  <div
                    style={{
                      color: "rgba(255,255,255,0.55)",
                      fontSize: 10,
                      //: "'DM Mono', monospace",
                      letterSpacing: "0.12em",
                      marginBottom: 6,
                    }}
                  >
                    STEP {active + 1} OF 4
                  </div>
                  <div
                    style={{
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 18,
                      //: "'Sora', sans-serif",
                    }}
                  >
                    {STEPS[active].title}
                  </div>
                </div>

                {/* Dot nav */}
                <div
                  style={{
                    position: "absolute",
                    top: 20,
                    right: 20,
                    display: "flex",
                    gap: 6,
                  }}
                >
                  {STEPS.map((_, i) => (
                    <div
                      key={i}
                      onClick={() => setActive(i)}
                      style={{
                        width: i === active ? 20 : 6,
                        height: 6,
                        borderRadius: 3,
                        background:
                          i === active ? "#fff" : "rgba(255,255,255,0.4)",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </AnimSection>
        </div>
      </div>

      <style>{`
        @keyframes stepFill {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </section>
  );
}