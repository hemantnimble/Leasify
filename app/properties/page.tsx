"use client";

// app/properties/page.tsx

import { useState, useEffect } from "react";
import Link from "next/link";

interface Property {
  id: string;
  title: string;
  location: string;
  monthlyRent: number;
  securityDeposit: number;
  minimumLeaseDuration: number;
  images: string[];
  status: string;
  landlord: { walletAddress: string; displayName?: string | null };
}

function PropertyCard({ p, index }: { p: Property; index: number }) {
  const [liked, setLiked] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: 22,
        overflow: "hidden",
        border: "1px solid",
        borderColor: hovered ? "#E5E7EB" : "#F0F0EE",
        boxShadow: hovered
          ? "0 16px 48px rgba(0,0,0,0.11)"
          : "0 2px 16px rgba(0,0,0,0.05)",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        transition: "all 0.3s ease",
        opacity: 1,
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", height: 210, overflow: "hidden" }}>
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
            transform: hovered ? "scale(1.05)" : "scale(1)",
            transition: "transform 0.5s ease",
          }}
        />

        {/* Status */}
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
          }}
        >
          {p.status === "AVAILABLE" ? "Available" : p.status}
        </div>

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
          }}
        >
          {p.monthlyRent} ETH
          <span style={{ fontWeight: 300, opacity: 0.6, fontSize: 10 }}>/mo</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "16px 18px 20px" }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 15,
            color: "#1A1A2E",
            marginBottom: 3,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {p.title}
        </div>
        <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 14 }}>
          📍 {p.location}
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            borderTop: "1px solid #F3F4F6",
            paddingTop: 12,
            marginBottom: 14,
          }}
        >
          {[
            { val: `${p.securityDeposit} ETH`, label: "Deposit" },
            { val: `${p.minimumLeaseDuration} mo`, label: "Min. Lease" },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                textAlign: "center",
                borderRight: i < 1 ? "1px solid #F3F4F6" : "none",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 13, color: "#1A1A2E" }}>
                {s.val}
              </div>
              <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 2 }}>
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
  );
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState("");
  const [maxRentFilter, setMaxRentFilter] = useState("");
  const [focused, setFocused] = useState<string | null>(null);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (locationFilter) params.set("location", locationFilter);
      if (maxRentFilter) params.set("maxRent", maxRentFilter);
      const res = await fetch(`/api/properties?${params.toString()}`);
      const data = await res.json();
      setProperties(data.properties || []);
    } catch (err) {
      console.error("Failed to fetch properties:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProperties();
  };

  const handleClear = () => {
    setLocationFilter("");
    setMaxRentFilter("");
    setTimeout(fetchProperties, 0);
  };

  const hasFilters = locationFilter || maxRentFilter;

  return (
    <>
      <style>{`
        .props-page {
          padding: 40px 48px 80px;
        }
        .props-search-bar {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }
        .props-search-location {
          flex: 1;
          min-width: 200px;
        }
        .props-search-rent {
          width: 160px;
        }
        .props-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }

        @media (max-width: 768px) {
          .props-page {
            padding: 20px 16px 80px;
          }
          .props-search-bar {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }
          .props-search-location {
            flex: unset;
            min-width: unset;
            width: 100%;
          }
          .props-search-rent {
            width: 100%;
          }
          .props-search-bar button {
            width: 100%;
          }
          .props-grid {
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
        }

        @media (max-width: 480px) {
          .props-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }
      `}</style>

      <div className="props-page" style={{ minHeight: "100vh", background: "#F8F8F6" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto",marginTop: "38px" }}>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.1em",
                color: "#9CA3AF",
                marginBottom: 8,
              }}
            >
              ALL LISTINGS
            </div>
            <h1
              style={{
                fontSize: 36,
                fontWeight: 800,
                letterSpacing: "-0.04em",
                color: "#1A1A2E",
                lineHeight: 1.1,
                marginBottom: 6,
              }}
            >
              Browse Properties
            </h1>
            <p style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 300 }}>
              Blockchain-secured lease agreements on every listing
            </p>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch}>
            <div
              style={{
                background: "#fff",
                borderRadius: 18,
                padding: "16px 20px",
                border: "1px solid #F0F0EE",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                marginBottom: 24,
              }}
            >
              <div className="props-search-bar">
                {/* Location */}
                <input
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  onFocus={() => setFocused("location")}
                  onBlur={() => setFocused(null)}
                  placeholder="🔍  Search by location..."
                  className="props-search-location"
                  style={{
                    background: "#F8F8F6",
                    border: "1.5px solid",
                    borderColor: focused === "location" ? "#1A1A2E" : "#E5E7EB",
                    color: "#1A1A2E",
                    borderRadius: 12,
                    padding: "11px 14px",
                    fontSize: 13,
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                />

                {/* Max rent */}
                <input
                  type="number"
                  step="0.001"
                  value={maxRentFilter}
                  onChange={(e) => setMaxRentFilter(e.target.value)}
                  onFocus={() => setFocused("rent")}
                  onBlur={() => setFocused(null)}
                  placeholder="Max rent (ETH)"
                  className="props-search-rent"
                  style={{
                    background: "#F8F8F6",
                    border: "1.5px solid",
                    borderColor: focused === "rent" ? "#1A1A2E" : "#E5E7EB",
                    color: "#1A1A2E",
                    borderRadius: 12,
                    padding: "11px 14px",
                    fontSize: 13,
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                />

                {/* Search button */}
                <button
                  type="submit"
                  style={{
                    background: "#1A1A2E",
                    color: "#fff",
                    border: "none",
                    padding: "11px 28px",
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "background 0.2s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = "#2D2D4E")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = "#1A1A2E")
                  }
                >
                  Search
                </button>

                {/* Clear */}
                {hasFilters && (
                  <button
                    type="button"
                    onClick={handleClear}
                    style={{
                      background: "transparent",
                      color: "#9CA3AF",
                      border: "1.5px solid #E5E7EB",
                      padding: "11px 20px",
                      borderRadius: 12,
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = "#1A1A2E";
                      el.style.color = "#1A1A2E";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = "#E5E7EB";
                      el.style.color = "#9CA3AF";
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Results count */}
          {!isLoading && (
            <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 20 }}>
              {properties.length} propert{properties.length === 1 ? "y" : "ies"} found
              {hasFilters && <span style={{ color: "#2D5BE3" }}> · filtered</span>}
            </div>
          )}

          {/* Grid */}
          {isLoading ? (
            <>
              <style>{`
                @keyframes shimmer {
                  0% { background-position: -200% 0; }
                  100% { background-position: 200% 0; }
                }
              `}</style>
              <div className="props-grid">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#fff",
                      borderRadius: 22,
                      overflow: "hidden",
                      border: "1px solid #F0F0EE",
                    }}
                  >
                    <div
                      style={{
                        height: 210,
                        background:
                          "linear-gradient(90deg,#F3F4F6 25%,#E5E7EB 50%,#F3F4F6 75%)",
                        backgroundSize: "200% 100%",
                        animation: "shimmer 1.5s infinite",
                      }}
                    />
                    <div
                      style={{
                        padding: "16px 18px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          height: 16,
                          width: "70%",
                          background: "#F3F4F6",
                          borderRadius: 6,
                        }}
                      />
                      <div
                        style={{
                          height: 12,
                          width: "50%",
                          background: "#F3F4F6",
                          borderRadius: 6,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : properties.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 0",
                background: "#fff",
                borderRadius: 24,
                border: "1px solid #F0F0EE",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏠</div>
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#1A1A2E",
                  marginBottom: 8,
                }}
              >
                No properties found
              </p>
              <p style={{ fontSize: 13, color: "#9CA3AF" }}>
                {hasFilters
                  ? "Try adjusting your search filters"
                  : "No listings available yet"}
              </p>
              {hasFilters && (
                <button
                  onClick={handleClear}
                  style={{
                    marginTop: 20,
                    background: "#1A1A2E",
                    color: "#fff",
                    border: "none",
                    padding: "11px 28px",
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="props-grid">
              {properties.map((p, i) => (
                <PropertyCard key={p.id} p={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}