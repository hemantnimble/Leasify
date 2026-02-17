"use client";

// app/properties/[id]/page.tsx

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useWalletAuth } from "@/hooks/useWalletAuth";

interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  monthlyRent: number;
  securityDeposit: number;
  minimumLeaseDuration: number;
  images: string[];
  status: string;
  createdAt: string;
  landlord: {
    walletAddress: string;
    displayName?: string | null;
  };
}

export default function PropertyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated, role } = useWalletAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!id) return;
    const fetchProperty = async () => {
      try {
        const res = await fetch(`/api/properties/${id}`);
        const text = await res.text();
        if (!text) { setError("Empty response"); return; }
        const data = JSON.parse(text);
        if (!res.ok) { setError(data.error || "Failed to load"); return; }
        setProperty(data.property);
      } catch (err) {
        setError("Failed to load property");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#F8F8F6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          //: "'Sora', sans-serif",
          color: "#9CA3AF",
          fontSize: 13,
        }}
      >
        Loading property...
      </div>
    );
  }

  if (error || !property) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#F8F8F6",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          //: "'Sora', sans-serif",
          gap: 12,
        }}
      >
        <div style={{ fontSize: 48 }}>🏠</div>
        <p style={{ fontSize: 16, fontWeight: 700, color: "#1A1A2E" }}>
          {error || "Property not found"}
        </p>
        <Link
          href="/properties"
          style={{
            color: "#2D5BE3",
            fontSize: 13,
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          ← Back to listings
        </Link>
      </div>
    );
  }

  const shortAddress =
    property.landlord?.walletAddress
      ? property.landlord.walletAddress.slice(0, 6) +
        "..." +
        property.landlord.walletAddress.slice(-4)
      : "Unknown";

  const images =
    property.images?.length > 0
      ? property.images
      : [
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=80",
        ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8F8F6",
        padding: "40px 48px 80px",
        //: "'Sora', sans-serif",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Back */}
        <Link
          href="/properties"
          style={{
            fontSize: 13,
            color: "#9CA3AF",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 32,
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.color = "#1A1A2E")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.color = "#9CA3AF")
          }
        >
          ← All Properties
        </Link>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 360px",
            gap: 32,
            alignItems: "start",
          }}
        >
          {/* ── LEFT ── */}
          <div>
            {/* Main image */}
            <div
              style={{
                borderRadius: 24,
                overflow: "hidden",
                height: 420,
                marginBottom: 12,
                position: "relative",
              }}
            >
              <img
                src={images[activeImage]}
                alt={property.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {/* Status badge */}
              <div
                style={{
                  position: "absolute",
                  top: 18,
                  left: 18,
                  background:
                    property.status === "AVAILABLE"
                      ? "rgba(240,253,244,0.95)"
                      : "rgba(249,250,251,0.95)",
                  color:
                    property.status === "AVAILABLE" ? "#059669" : "#6B7280",
                  border: `1px solid ${
                    property.status === "AVAILABLE" ? "#BBF7D0" : "#E5E7EB"
                  }`,
                  padding: "5px 14px",
                  borderRadius: 100,
                  fontSize: 11,
                  fontWeight: 600,
                  backdropFilter: "blur(8px)",
                }}
              >
                {property.status === "AVAILABLE" ? "● Available" : property.status}
              </div>
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
                {images.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveImage(i)}
                    style={{
                      width: 72,
                      height: 52,
                      borderRadius: 12,
                      overflow: "hidden",
                      cursor: "pointer",
                      border: `2px solid ${
                        i === activeImage ? "#1A1A2E" : "transparent"
                      }`,
                      opacity: i === activeImage ? 1 : 0.6,
                      transition: "all 0.2s",
                    }}
                  >
                    <img
                      src={img}
                      alt={`view ${i + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Title + location */}
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: "-0.04em",
                color: "#1A1A2E",
                marginBottom: 6,
                lineHeight: 1.15,
              }}
            >
              {property.title}
            </h1>
            <p
              style={{
                fontSize: 13,
                color: "#9CA3AF",
                marginBottom: 28,
                //: "'Sora', sans-serif",
              }}
            >
              📍 {property.location}
            </p>

            {/* Description */}
            <div
              style={{
                background: "#fff",
                borderRadius: 20,
                padding: "28px 28px",
                border: "1px solid #F0F0EE",
                marginBottom: 20,
              }}
            >
              <h2
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#1A1A2E",
                  marginBottom: 12,
                  letterSpacing: "-0.01em",
                }}
              >
                About this property
              </h2>
              <p
                style={{
                  fontSize: 13,
                  color: "#6B7280",
                  lineHeight: 1.8,
                  fontWeight: 300,
                }}
              >
                {property.description}
              </p>
            </div>

            {/* Contract info */}
            <div
              style={{
                background: "#F0F7FF",
                border: "1px solid #BFDBFE",
                borderRadius: 20,
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  background: "#DBEAFE",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                ⛓️
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    color: "#1A1A2E",
                    marginBottom: 3,
                  }}
                >
                  Smart Contract Lease
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#6B7280",
                    fontWeight: 300,
                    lineHeight: 1.6,
                  }}
                >
                  Accepting this lease deploys an Ethereum contract on Sepolia
                  testnet. Your deposit is held in escrow until lease end.
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div style={{ position: "sticky", top: 32 }}>

            {/* Pricing card */}
            <div
              style={{
                background: "#fff",
                borderRadius: 22,
                padding: "28px",
                border: "1px solid #F0F0EE",
                boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                marginBottom: 16,
              }}
            >
              {/* Price */}
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    fontSize: 36,
                    fontWeight: 800,
                    letterSpacing: "-0.04em",
                    color: "#1A1A2E",
                    lineHeight: 1,
                  }}
                >
                  {property.monthlyRent} ETH
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#9CA3AF",
                    marginTop: 4,
                  }}
                >
                  per month
                </div>
              </div>

              {/* Details */}
              <div
                style={{
                  borderTop: "1px solid #F3F4F6",
                  paddingTop: 18,
                  marginBottom: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {[
                  {
                    label: "Security Deposit",
                    value: `${property.securityDeposit} ETH`,
                  },
                  {
                    label: "Min. Duration",
                    value: `${property.minimumLeaseDuration} months`,
                  },
                  {
                    label: "Status",
                    value: property.status,
                    accent:
                      property.status === "AVAILABLE" ? "#059669" : "#6B7280",
                  },
                  {
                    label: "Listed",
                    value: new Date(property.createdAt).toLocaleDateString(
                      "en-IN",
                      { day: "numeric", month: "short", year: "numeric" }
                    ),
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{ fontSize: 12, color: "#9CA3AF" }}
                    >
                      {item.label}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: item.accent || "#1A1A2E",
                      }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              {!isAuthenticated ? (
                <Link
                  href="/login"
                  style={{
                    display: "block",
                    textAlign: "center",
                    background: "#1A1A2E",
                    color: "#fff",
                    padding: "14px",
                    borderRadius: 14,
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: "none",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background =
                      "#2D2D4E")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background =
                      "#1A1A2E")
                  }
                >
                  Connect Wallet to Request Lease
                </Link>
              ) : role === "TENANT" &&
                property.status === "AVAILABLE" ? (
                <button
                  onClick={() =>
                    router.push(`/properties/${property.id}/request`)
                  }
                  style={{
                    width: "100%",
                    background: "#1A1A2E",
                    color: "#fff",
                    border: "none",
                    padding: "14px",
                    borderRadius: 14,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    //: "'Sora', sans-serif",
                    transition: "background 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "#2D2D4E";
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 8px 24px rgba(26,26,46,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "#1A1A2E";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                >
                  Request Lease →
                </button>
              ) : role === "LANDLORD" ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "14px",
                    background: "#F8F8F6",
                    borderRadius: 14,
                    fontSize: 12,
                    color: "#9CA3AF",
                  }}
                >
                  Viewing as Landlord
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "14px",
                    background: "#F8F8F6",
                    borderRadius: 14,
                    fontSize: 12,
                    color: "#9CA3AF",
                  }}
                >
                  Property not available
                </div>
              )}
            </div>

            {/* Landlord card */}
            <div
              style={{
                background: "#fff",
                borderRadius: 18,
                padding: "18px 22px",
                border: "1px solid #F0F0EE",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  //: "'DM Mono', monospace",
                  letterSpacing: "0.1em",
                  color: "#9CA3AF",
                  marginBottom: 12,
                }}
              >
                LANDLORD
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: "#F0F0F8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  🔑
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 13,
                      color: "#1A1A2E",
                      marginBottom: 2,
                    }}
                  >
                    {property.landlord?.displayName || "Anonymous Landlord"}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#9CA3AF",
                      //: "'DM Mono', monospace",
                    }}
                  >
                    {shortAddress}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}