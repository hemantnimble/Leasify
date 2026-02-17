"use client";

// components/home/HomeFooter.tsx

import Link from "next/link";

const COLS = [
  {
    title: "Product",
    links: [
      { label: "Browse Homes",    href: "/properties" },
      { label: "List Property",   href: "/login/landlord" },
      { label: "How it Works",    href: "/#how-it-works" },
      { label: "Dashboard",       href: "/login" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About",    href: "#" },
      { label: "Blog",     href: "#" },
      { label: "Careers",  href: "#" },
      { label: "Press",    href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy",       href: "#" },
      { label: "Terms",         href: "#" },
      { label: "Cookie Policy", href: "#" },
      { label: "Security",      href: "#" },
    ],
  },
];

export function HomeFooter() {
  return (
    <footer
      style={{
        background: "#1A1A2E",
        padding: "64px 48px 40px",
        color: "#fff",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>

        {/* Top row */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 60,
            marginBottom: 60,
          }}
        >
          {/* Brand col */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                }}
              >
                🏠
              </div>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: 18,
                  letterSpacing: "-0.03em",
                  //: "'Sora', sans-serif",
                }}
              >
                Leasify
              </span>
            </div>

            <p
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.4)",
                lineHeight: 1.7,
                maxWidth: 260,
                fontWeight: 300,
                //: "'Sora', sans-serif",
                marginBottom: 20,
              }}
            >
              Blockchain-powered rental platform. Lease agreements secured by
              Ethereum smart contracts on Sepolia testnet.
            </p>

            {/* Contract badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                padding: "8px 14px",
                borderRadius: 10,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  background: "#059669",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "blink 2s infinite",
                }}
              />
              <span
                style={{
                  //: "'DM Mono', monospace",
                  fontSize: 10,
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                Sepolia · 0x6379...ED12
              </span>
            </div>
          </div>

          {/* Link cols */}
          {COLS.map((col) => (
            <div key={col.title}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  color: "rgba(255,255,255,0.25)",
                  marginBottom: 20,
                  //: "'DM Mono', monospace",
                  textTransform: "uppercase",
                }}
              >
                {col.title}
              </div>
              {col.links.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  style={{
                    display: "block",
                    fontSize: 13,
                    color: "rgba(255,255,255,0.45)",
                    marginBottom: 12,
                    fontWeight: 300,
                    //: "'Sora', sans-serif",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.color = "#fff")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.color =
                      "rgba(255,255,255,0.45)")
                  }
                >
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.07)",
            paddingTop: 28,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.25)",
              fontWeight: 300,
              //: "'Sora', sans-serif",
            }}
          >
            © 2026 Leasify. All rights reserved.
          </div>
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.2)",
              //: "'DM Mono', monospace",
            }}
          >
            Built on Ethereum · Sepolia Testnet
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </footer>
  );
}