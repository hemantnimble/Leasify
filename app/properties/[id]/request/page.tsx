"use client";

// app/properties/[id]/request/page.tsx

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useWalletAuth } from "@/hooks/useWalletAuth";

interface Property {
  id: string;
  title: string;
  location: string;
  monthlyRent: number;
  securityDeposit: number;
  minimumLeaseDuration: number;
  images: string[];
}

const FIELD_STYLE = {
  width: "100%",
  background: "#F8F8F6",
  border: "1.5px solid #E5E7EB",
  color: "#1A1A2E",
  borderRadius: 12,
  padding: "13px 16px",
  fontSize: 13,
  //: "'Sora', sans-serif",
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box" as const,
};

export default function LeaseRequestPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated, role } = useWalletAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoadingProperty, setIsLoadingProperty] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);

  const [startDate, setStartDate] = useState("");
  const [durationMonths, setDurationMonths] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/properties/${id}`)
      .then((res) => res.json())
      .then((data) => setProperty(data.property))
      .finally(() => setIsLoadingProperty(false));
  }, [id]);

  const totalRent = property
    ? property.monthlyRent * parseInt(durationMonths || "0")
    : 0;

  const endDate =
    startDate && durationMonths
      ? (() => {
          const d = new Date(startDate);
          d.setMonth(d.getMonth() + parseInt(durationMonths));
          return d.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
        })()
      : null;

  const showSummary =
    startDate &&
    durationMonths &&
    parseInt(durationMonths) >= (property?.minimumLeaseDuration || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/lease/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: id,
          startDate,
          durationMonths: parseInt(durationMonths),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit request");
      router.push("/dashboard/tenant?requested=true");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  // Guards
  if (!isAuthenticated) {
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
        <div style={{ fontSize: 48 }}>🔒</div>
        <p style={{ fontSize: 16, fontWeight: 700, color: "#1A1A2E" }}>
          Connect your wallet first
        </p>
        <Link
          href="/login"
          style={{
            background: "#1A1A2E",
            color: "#fff",
            padding: "12px 28px",
            borderRadius: 14,
            fontSize: 13,
            fontWeight: 600,
            textDecoration: "none",
            marginTop: 8,
          }}
        >
          Go to Login →
        </Link>
      </div>
    );
  }

  if (role !== "TENANT") {
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
        <div style={{ fontSize: 48 }}>🔑</div>
        <p style={{ fontSize: 16, fontWeight: 700, color: "#1A1A2E" }}>
          Only tenants can request leases
        </p>
        <Link
          href="/properties"
          style={{ color: "#2D5BE3", fontSize: 13, textDecoration: "none" }}
        >
          ← Back to properties
        </Link>
      </div>
    );
  }

  if (isLoadingProperty) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#F8F8F6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9CA3AF",
          //: "'Sora', sans-serif",
          fontSize: 13,
        }}
      >
        Loading property...
      </div>
    );
  }

  if (!property) {
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
          Property not found
        </p>
        <Link
          href="/properties"
          style={{ color: "#2D5BE3", fontSize: 13, textDecoration: "none" }}
        >
          ← Back to listings
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8F8F6",
        padding: "40px 48px 80px",
        //: "'Sora', sans-serif",
      }}
    >
      <div style={{ maxWidth: 640, margin: "0 auto" }}>

        {/* Back */}
        <Link
          href={`/properties/${id}`}
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
          ← Back to property
        </Link>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              fontSize: 11,
              //: "'DM Mono', monospace",
              letterSpacing: "0.1em",
              color: "#9CA3AF",
              marginBottom: 8,
            }}
          >
            TENANT · LEASE REQUEST
          </div>
          <h1
            style={{
              fontSize: 30,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "#1A1A2E",
              lineHeight: 1.1,
              marginBottom: 6,
            }}
          >
            Request a Lease
          </h1>
          <p style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 300 }}>
            Submit your request — the landlord will accept or reject it
          </p>
        </div>

        {/* Property summary card */}
        <div
          style={{
            background: "#fff",
            borderRadius: 18,
            padding: "16px 18px",
            border: "1px solid #F0F0EE",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            display: "flex",
            gap: 14,
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 14,
              overflow: "hidden",
              flexShrink: 0,
              background: "#F3F4F6",
            }}
          >
            <img
              src={
                property.images?.[0] ||
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200&q=80"
              }
              alt={property.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 14,
                color: "#1A1A2E",
                marginBottom: 2,
              }}
            >
              {property.title}
            </div>
            <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 4 }}>
              📍 {property.location}
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#2D5BE3",
                //: "'DM Mono', monospace",
              }}
            >
              {property.monthlyRent} ETH
              <span
                style={{ fontWeight: 400, color: "#9CA3AF", fontSize: 11 }}
              >
                /month
              </span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "#9CA3AF", marginBottom: 2 }}>
              Min. Lease
            </div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 14,
                color: "#1A1A2E",
              }}
            >
              {property.minimumLeaseDuration} mo
            </div>
          </div>
        </div>

        {/* Form */}
        <div
          style={{
            background: "#fff",
            borderRadius: 24,
            padding: "36px",
            border: "1px solid #F0F0EE",
            boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
          }}
        >
          {error && (
            <div
              style={{
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                color: "#DC2626",
                borderRadius: 12,
                padding: "12px 16px",
                fontSize: 12,
                marginBottom: 24,
                lineHeight: 1.6,
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

              {/* Start date */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#4B5563",
                    marginBottom: 7,
                  }}
                >
                  Lease Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  min={today}
                  onChange={(e) => setStartDate(e.target.value)}
                  onFocus={() => setFocused("startDate")}
                  onBlur={() => setFocused(null)}
                  required
                  style={{
                    ...FIELD_STYLE,
                    borderColor:
                      focused === "startDate" ? "#1A1A2E" : "#E5E7EB",
                  }}
                />
              </div>

              {/* Duration */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#4B5563",
                    marginBottom: 7,
                  }}
                >
                  Duration
                  <span
                    style={{
                      //: "'DM Mono', monospace",
                      color: "#9CA3AF",
                      fontWeight: 400,
                      marginLeft: 8,
                      fontSize: 10,
                    }}
                  >
                    MIN {property.minimumLeaseDuration} MONTHS
                  </span>
                </label>
                <input
                  type="number"
                  value={durationMonths}
                  min={property.minimumLeaseDuration}
                  max={36}
                  onChange={(e) => setDurationMonths(e.target.value)}
                  onFocus={() => setFocused("duration")}
                  onBlur={() => setFocused(null)}
                  placeholder={`${property.minimumLeaseDuration}`}
                  required
                  style={{
                    ...FIELD_STYLE,
                    borderColor:
                      focused === "duration" ? "#1A1A2E" : "#E5E7EB",
                  }}
                />
              </div>

              {/* Live summary */}
              {showSummary && (
                <div
                  style={{
                    background: "#F0F7FF",
                    border: "1px solid #BFDBFE",
                    borderRadius: 16,
                    padding: "18px 20px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      //: "'DM Mono', monospace",
                      color: "#2D5BE3",
                      letterSpacing: "0.08em",
                      marginBottom: 14,
                    }}
                  >
                    LEASE SUMMARY
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {[
                      {
                        label: "Start Date",
                        value: new Date(startDate).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        ),
                      },
                      { label: "End Date", value: endDate },
                      {
                        label: "Monthly Rent",
                        value: `${property.monthlyRent} ETH`,
                      },
                      {
                        label: "Security Deposit",
                        value: `${property.securityDeposit} ETH`,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 12,
                        }}
                      >
                        <span style={{ color: "#6B7280" }}>{item.label}</span>
                        <span style={{ fontWeight: 600, color: "#1A1A2E" }}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                    {/* Total */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 13,
                        paddingTop: 10,
                        borderTop: "1px solid #BFDBFE",
                        marginTop: 2,
                      }}
                    >
                      <span style={{ color: "#4B5563", fontWeight: 600 }}>
                        Total Rent ({durationMonths} months)
                      </span>
                      <span
                        style={{
                          fontWeight: 800,
                          color: "#2D5BE3",
                          //: "'DM Mono', monospace",
                        }}
                      >
                        {totalRent.toFixed(4)} ETH
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Terms note */}
              <p
                style={{
                  fontSize: 11,
                  color: "#9CA3AF",
                  lineHeight: 1.7,
                  fontWeight: 300,
                }}
              >
                By submitting, you agree that if accepted, a smart contract
                will be deployed on Sepolia testnet to hold your security
                deposit of{" "}
                <span style={{ color: "#1A1A2E", fontWeight: 600 }}>
                  {property.securityDeposit} ETH
                </span>{" "}
                and enforce lease terms automatically.
              </p>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  background: isSubmitting ? "#F3F4F6" : "#1A1A2E",
                  color: isSubmitting ? "#9CA3AF" : "#fff",
                  border: "none",
                  padding: "16px",
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  //: "'Sora', sans-serif",
                  transition: "background 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 8px 24px rgba(26,26,46,0.2)";
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                {isSubmitting ? "Submitting..." : "Submit Lease Request →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}