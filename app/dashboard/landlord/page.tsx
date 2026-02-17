"use client";

// app/dashboard/landlord/page.tsx

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
  leases: { id: string; status: string }[];
}

function PropertyCard({
  property,
  onUnlist,
}: {
  property: Property;
  onUnlist: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);

  const activeLeases = property.leases.filter((l) =>
    ["ACTIVE", "AWAITING_DEPOSIT"].includes(l.status)
  ).length;

  const statusColor =
    property.status === "AVAILABLE"
      ? { bg: "#F0FDF4", color: "#059669", border: "#BBF7D0" }
      : property.status === "RENTED"
      ? { bg: "#EFF6FF", color: "#2D5BE3", border: "#BFDBFE" }
      : { bg: "#F9FAFB", color: "#9CA3AF", border: "#E5E7EB" };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: 20,
        overflow: "hidden",
        border: "1px solid",
        borderColor: hovered ? "#E5E7EB" : "#F0F0EE",
        boxShadow: hovered
          ? "0 12px 40px rgba(0,0,0,0.09)"
          : "0 2px 12px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.3s ease",
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", height: 180, overflow: "hidden" }}>
        <img
          src={
            property.images?.[0] ||
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80"
          }
          alt={property.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: hovered ? "scale(1.04)" : "scale(1)",
            transition: "transform 0.5s ease",
          }}
        />
        {/* Status badge */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            background: statusColor.bg,
            color: statusColor.color,
            border: `1px solid ${statusColor.border}`,
            padding: "4px 12px",
            borderRadius: 100,
            fontSize: 11,
            fontWeight: 600,
            //: "'Sora', sans-serif",
          }}
        >
          {property.status}
        </div>
        {activeLeases > 0 && (
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "#1A1A2E",
              color: "#fff",
              padding: "4px 12px",
              borderRadius: 100,
              fontSize: 11,
              fontWeight: 600,
              //: "'Sora', sans-serif",
            }}
          >
            {activeLeases} active lease{activeLeases > 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "16px 18px 18px" }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 15,
            color: "#1A1A2E",
            marginBottom: 3,
            //: "'Sora', sans-serif",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {property.title}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#9CA3AF",
            marginBottom: 14,
            //: "'Sora', sans-serif",
          }}
        >
          📍 {property.location}
        </div>

        {/* Rent */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 12,
            borderTop: "1px solid #F3F4F6",
            marginBottom: 14,
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 16,
                color: "#1A1A2E",
                //: "'Sora', sans-serif",
              }}
            >
              {property.monthlyRent} ETH
            </div>
            <div
              style={{
                fontSize: 10,
                color: "#9CA3AF",
                //: "'Sora', sans-serif",
              }}
            >
              per month
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: 13,
                color: "#1A1A2E",
                //: "'Sora', sans-serif",
              }}
            >
              {property.securityDeposit} ETH
            </div>
            <div
              style={{
                fontSize: 10,
                color: "#9CA3AF",
                //: "'Sora', sans-serif",
              }}
            >
              deposit
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <Link
            href={`/properties/${property.id}`}
            style={{
              flex: 1,
              textAlign: "center",
              background: "#1A1A2E",
              color: "#fff",
              padding: "10px",
              borderRadius: 10,
              fontSize: 12,
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
            View
          </Link>
          <button
            onClick={() => onUnlist(property.id)}
            style={{
              flex: 1,
              background: "transparent",
              color: property.status === "UNLISTED" ? "#059669" : "#6B7280",
              border: "1.5px solid",
              borderColor: property.status === "UNLISTED" ? "#BBF7D0" : "#E5E7EB",
              padding: "10px",
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              //: "'Sora', sans-serif",
              transition: "all 0.2s",
            }}
          >
            {property.status === "UNLISTED" ? "Relist" : "Unlist"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LandlordDashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProperties = async () => {
    try {
      const res = await fetch("/api/landlord/properties");
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

  const handleUnlist = async (propertyId: string) => {
    const property = properties.find((p) => p.id === propertyId);
    if (!property) return;
    const newStatus = property.status === "UNLISTED" ? "AVAILABLE" : "UNLISTED";
    try {
      await fetch(`/api/properties/${propertyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchProperties();
    } catch (err) {
      console.error("Failed to update property:", err);
    }
  };

  const available = properties.filter((p) => p.status === "AVAILABLE").length;
  const rented = properties.filter((p) => p.status === "RENTED").length;
  const activeLeases = properties.reduce(
    (sum, p) =>
      sum +
      p.leases.filter((l) => ["ACTIVE", "AWAITING_DEPOSIT"].includes(l.status))
        .length,
    0
  );
  const hasPending = properties.some((p) =>
    p.leases.some((l) => l.status === "PENDING")
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8F8F6",
        padding: "40px 48px 80px",
        //: "'Sora', sans-serif",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "40px auto" }}>

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 40,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                //: "'DM Mono', monospace",
                letterSpacing: "0.1em",
                color: "#9CA3AF",
                marginBottom: 8,
              }}
            >
              LANDLORD DASHBOARD
            </div>
            <h1
              style={{
                fontSize: 32,
                fontWeight: 800,
                letterSpacing: "-0.04em",
                color: "#1A1A2E",
                lineHeight: 1.1,
              }}
            >
              My Properties
            </h1>
          </div>
          <Link
            href="/dashboard/landlord/add"
            style={{
              background: "#1A1A2E",
              color: "#fff",
              padding: "12px 28px",
              borderRadius: 14,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
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
            + Add Property
          </Link>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            marginBottom: 28,
          }}
        >
          {[
            { label: "Total Properties", value: properties.length, accent: "#1A1A2E" },
            { label: "Available", value: available, accent: "#059669" },
            { label: "Active Leases", value: activeLeases, accent: "#2D5BE3" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "#fff",
                borderRadius: 18,
                padding: "24px 28px",
                border: "1px solid #F0F0EE",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 8 }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  color: s.accent,
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Pending requests alert */}
        {hasPending && (
          <Link
            href="/dashboard/landlord/requests"
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                background: "#FFFBEB",
                border: "1px solid #FDE68A",
                borderRadius: 16,
                padding: "16px 22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 28,
                cursor: "pointer",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor = "#F59E0B")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor = "#FDE68A")
              }
            >
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    color: "#92400E",
                    marginBottom: 2,
                  }}
                >
                  🔔 Pending Lease Requests
                </div>
                <div style={{ fontSize: 12, color: "#B45309" }}>
                  You have tenant requests waiting for your response
                </div>
              </div>
              <div style={{ color: "#D97706", fontSize: 20 }}>→</div>
            </div>
          </Link>
        )}

        {/* Nav links */}
        <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
          {[
            { label: "Properties", href: "/dashboard/landlord" },
            { label: "Lease Requests", href: "/dashboard/landlord/requests" },
          ].map((nav) => (
            <Link
              key={nav.label}
              href={nav.href}
              style={{
                padding: "8px 20px",
                borderRadius: 100,
                border: "1.5px solid #E5E7EB",
                background: "#fff",
                fontSize: 12,
                fontWeight: 500,
                color: "#6B7280",
                textDecoration: "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "#1A1A2E";
                el.style.color = "#1A1A2E";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "#E5E7EB";
                el.style.color = "#6B7280";
              }}
            >
              {nav.label}
            </Link>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 20,
            }}
          >
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  height: 320,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: 180,
                    background:
                      "linear-gradient(90deg,#F3F4F6 25%,#E5E7EB 50%,#F3F4F6 75%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.5s infinite",
                  }}
                />
                <div style={{ padding: "16px 18px" }}>
                  <div
                    style={{
                      height: 16,
                      width: "70%",
                      background: "#F3F4F6",
                      borderRadius: 8,
                      marginBottom: 8,
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
            <style>{`
              @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
              }
            `}</style>
          </div>
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
              No properties yet
            </p>
            <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 24 }}>
              List your first property to start receiving lease requests
            </p>
            <Link
              href="/dashboard/landlord/add"
              style={{
                display: "inline-block",
                background: "#1A1A2E",
                color: "#fff",
                padding: "12px 28px",
                borderRadius: 14,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              + Add Property
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 20,
            }}
          >
            {properties.map((p) => (
              <PropertyCard key={p.id} property={p} onUnlist={handleUnlist} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}