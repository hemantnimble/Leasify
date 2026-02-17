"use client";

// components/home/PropertiesSection.tsx

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimSection } from "@/components/home/AnimSection";

interface Property {
  id: string;
  title: string;
  location: string;
  monthlyRent: number;
  securityDeposit: number;
  minimumLeaseDuration: number;
  images: string[];
  status: string;
  landlord?: {
    walletAddress: string;
    displayName?: string | null;
  };
}

const FILTERS = ["All", "Studio", "1 BHK", "2 BHK", "Villa", "Penthouse"];

function PropertyCard({ p, index }: { p: Property; index: number }) {
  const [liked, setLiked] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <AnimSection delay={index * 0.1}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: "#fff",
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: hovered
            ? "0 16px 48px rgba(0,0,0,0.13)"
            : "0 2px 20px rgba(0,0,0,0.06)",
          transform: hovered ? "translateY(-6px)" : "translateY(0)",
          transition: "box-shadow 0.35s ease, transform 0.35s ease",
          cursor: "pointer",
        }}
      >
        {/* Image */}
        <div style={{ position: "relative", height: 220, overflow: "hidden" }}>
          <img
            src={
              p.images?.[0] ||
              "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80"
            }
            alt={p.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: hovered ? "scale(1.06)" : "scale(1)",
              transition: "transform 0.5s ease",
            }}
          />

          {/* Status tag */}
          <div
            style={{
              position: "absolute",
              top: 14,
              left: 14,
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(8px)",
              padding: "4px 12px",
              borderRadius: 100,
              fontSize: 11,
              fontWeight: 600,
              color: "#1A1A2E",
              //: "'Sora', sans-serif",
            }}
          >
            {p.status === "AVAILABLE" ? "Available" : p.status}
          </div>

          {/* Like */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setLiked(!liked);
            }}
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(8px)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            {liked ? "❤️" : "🤍"}
          </button>

          {/* Price */}
          <div
            style={{
              position: "absolute",
              bottom: 14,
              right: 14,
              background: "#1A1A2E",
              color: "#fff",
              padding: "6px 14px",
              borderRadius: 100,
              fontSize: 13,
              fontWeight: 700,
              //: "'Sora', sans-serif",
            }}
          >
            {p.monthlyRent} ETH
            <span style={{ fontWeight: 300, opacity: 0.7, fontSize: 10 }}>
              /mo
            </span>
          </div>
        </div>

        {/* Card body */}
        <div style={{ padding: "18px 20px 20px" }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 16,
              color: "#1A1A2E",
              marginBottom: 4,
              //: "'Sora', sans-serif",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {p.title}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#9CA3AF",
              marginBottom: 14,
              //: "'Sora', sans-serif",
            }}
          >
            📍 {p.location}
          </div>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              borderTop: "1px solid #F3F4F6",
              paddingTop: 14,
              marginBottom: 14,
            }}
          >
            {[
              { val: p.securityDeposit + " ETH", label: "Deposit" },
              { val: p.minimumLeaseDuration + " mo", label: "Min. Lease" },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  textAlign: "center",
                  borderRight: i < 1 ? "1px solid #F3F4F6" : "none",
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: "#1A1A2E",
                    //: "'Sora', sans-serif",
                  }}
                >
                  {s.val}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#9CA3AF",
                    marginTop: 2,
                    //: "'Sora', sans-serif",
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link
            href={`/properties/${p.id}`}
            style={{
              display: "block",
              textAlign: "center",
              background: "#1A1A2E",
              color: "#fff",
              padding: "11px",
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              //: "'Sora', sans-serif",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "#2D2D4E")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "#1A1A2E")
            }
          >
            View Details
          </Link>
        </div>
      </div>
    </AnimSection>
  );
}

export function PropertiesSection() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    fetch("/api/properties")
      .then((r) => r.json())
      .then((d) => setProperties(d.properties || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Filter by keyword match against title/location, then cap at 4
  const FILTER_KEYWORDS: Record<string, string[]> = {
    "All":       [],
    "Studio":    ["studio", "1rk"],
    "1 BHK":     ["1 bhk", "1bhk", "1 bedroom", "one bedroom"],
    "2 BHK":     ["2 bhk", "2bhk", "2 bedroom", "two bedroom"],
    "Villa":     ["villa", "bungalow", "house"],
    "Penthouse": ["penthouse", "penthouse"],
  };

  const filtered =
    activeFilter === "All"
      ? properties
      : properties.filter((p) => {
          const haystack = (p.title + " " + p.location).toLowerCase();
          const keywords = FILTER_KEYWORDS[activeFilter] || [];
          return keywords.some((kw) => haystack.includes(kw));
        });

  const displayed = filtered.slice(0, 4);

  return (
    <section
      style={{
        padding: "80px 48px 100px",
        maxWidth: 1280,
        margin: "0 auto",
      }}
    >
      {/* Header row */}
      <AnimSection>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 40,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
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
                marginBottom: 14,
              }}
            >
              Featured Listings
            </div>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 48px)",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                lineHeight: 1.1,
                color: "#1A1A2E",
                //: "'Sora', sans-serif",
              }}
            >
              Homes waiting
              <br />
              for a tenant
            </h2>
          </div>

          <Link
            href="/properties"
            style={{
              background: "transparent",
              color: "#1A1A2E",
              border: "1.5px solid #E5E7EB",
              padding: "11px 24px",
              borderRadius: 14,
              //: "'Sora', sans-serif",
              fontSize: 13,
              fontWeight: 500,
              textDecoration: "none",
              transition: "border-color 0.2s, background 0.2s",
              whiteSpace: "nowrap",
              alignSelf: "flex-end",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "#1A1A2E";
              el.style.background = "#F3F4F6";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "#E5E7EB";
              el.style.background = "transparent";
            }}
          >
            View All →
          </Link>
        </div>
      </AnimSection>

      {/* Filter pills */}
      <AnimSection delay={0.1}>
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 36,
            flexWrap: "wrap",
          }}
        >
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                padding: "8px 20px",
                borderRadius: 100,
                border: "1.5px solid",
                borderColor: activeFilter === f ? "#1A1A2E" : "#E5E7EB",
                background: activeFilter === f ? "#1A1A2E" : "#fff",
                color: activeFilter === f ? "#fff" : "#6B7280",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                //: "'Sora', sans-serif",
                transition: "all 0.2s",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </AnimSection>

      {/* Skeleton loading */}
      {loading ? (
        <>
          <style>{`
            @keyframes shimmer {
              0%   { background-position: -200% 0; }
              100% { background-position:  200% 0; }
            }
          `}</style>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  borderRadius: 24,
                  overflow: "hidden",
                  boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    height: 220,
                    background:
                      "linear-gradient(90deg,#F3F4F6 25%,#E5E7EB 50%,#F3F4F6 75%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.5s infinite",
                  }}
                />
                <div
                  style={{
                    padding: "16px 20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      height: 16,
                      width: "70%",
                      background: "#F3F4F6",
                      borderRadius: 8,
                    }}
                  />
                  <div
                    style={{
                      height: 12,
                      width: "50%",
                      background: "#F3F4F6",
                      borderRadius: 8,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : displayed.length === 0 ? (
        /* Empty state */
        <div
          style={{
            textAlign: "center",
            padding: "80px 0",
            color: "#9CA3AF",
            //: "'Sora', sans-serif",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏠</div>
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: "#1A1A2E" }}>
            {activeFilter === "All"
              ? "No properties listed yet"
              : `No ${activeFilter} properties found`}
          </p>
          <p style={{ fontSize: 13 }}>
            {activeFilter === "All"
              ? "Be the first landlord to list a property"
              : "Try a different filter or browse all properties"}
          </p>
          <Link
            href={activeFilter === "All" ? "/login/landlord" : "/properties"}
            style={{
              display: "inline-block",
              marginTop: 20,
              color: "#2D5BE3",
              fontWeight: 600,
              textDecoration: "none",
              fontSize: 13,
            }}
          >
            {activeFilter === "All" ? "List your property →" : "Browse all properties →"}
          </Link>
        </div>
      ) : (
        /* Property cards grid */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 24,
          }}
        >
          {displayed.map((p, i) => (
            <PropertyCard key={p.id} p={p} index={i} />
          ))}
        </div>
      )}

      {/* See all CTA if more than 4 results */}
      {filtered.length > 4 && (
        <AnimSection delay={0.2}>
          <div style={{ textAlign: "center", marginTop: 48 }}>
            <Link
              href="/properties"
              style={{
                display: "inline-block",
                background: "#1A1A2E",
                color: "#fff",
                padding: "14px 40px",
                borderRadius: 14,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
                //: "'Sora', sans-serif",
              }}
            >
              See all {filtered.length} properties
            </Link>
          </div>
        </AnimSection>
      )}
    </section>
  );
}