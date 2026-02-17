"use client";

// app/dashboard/landlord/add/page.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const FIELD_STYLE = {
  width: "100%",
  background: "#F8F8F6",
  border: "1.5px solid #E5E7EB",
  color: "#1A1A2E",
  borderRadius: 12,
  padding: "13px 16px",
  fontSize: 13,
  //: "'Sora', sans-serif",
  fontWeight: 400,
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box" as const,
};

const LABEL_STYLE = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "#4B5563",
  marginBottom: 7,
  //: "'Sora', sans-serif",
  letterSpacing: "0.01em",
};

export default function AddPropertyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    monthlyRent: "",
    securityDeposit: "",
    minimumLeaseDuration: "",
    images: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        monthlyRent: parseFloat(formData.monthlyRent),
        securityDeposit: parseFloat(formData.securityDeposit),
        minimumLeaseDuration: parseInt(formData.minimumLeaseDuration),
        images: formData.images
          ? formData.images.split(",").map((url) => url.trim())
          : [],
      };

      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create property");

      router.push("/dashboard/landlord");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const focusStyle = (name: string) =>
    focused === name ? { ...FIELD_STYLE, borderColor: "#1A1A2E" } : FIELD_STYLE;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8F8F6",
        padding: "40px 48px 80px",
        //: "'Sora', sans-serif",
      }}
    >
      <div style={{ maxWidth: 680, margin: "0 auto" }}>

        {/* Back */}
        <Link
          href="/dashboard/landlord"
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
          ← Back to Dashboard
        </Link>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div
            style={{
              fontSize: 11,
              //: "'DM Mono', monospace",
              letterSpacing: "0.1em",
              color: "#9CA3AF",
              marginBottom: 8,
            }}
          >
            LANDLORD · NEW LISTING
          </div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "#1A1A2E",
              marginBottom: 6,
              lineHeight: 1.1,
            }}
          >
            List a Property
          </h1>
          <p style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 300 }}>
            Smart contract is deployed when a tenant's request is accepted.
          </p>
        </div>

        {/* Form card */}
        <div
          style={{
            background: "#fff",
            borderRadius: 24,
            padding: "40px",
            border: "1px solid #F0F0EE",
            boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
          }}
        >
          {/* Error */}
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

              {/* Title */}
              <div>
                <label style={LABEL_STYLE}>Property Title</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  onFocus={() => setFocused("title")}
                  onBlur={() => setFocused(null)}
                  placeholder="e.g. Modern 2BHK in Bandra West"
                  required
                  style={focusStyle("title")}
                />
              </div>

              {/* Description */}
              <div>
                <label style={LABEL_STYLE}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  onFocus={() => setFocused("description")}
                  onBlur={() => setFocused(null)}
                  placeholder="Describe the property, amenities, nearby landmarks..."
                  required
                  rows={4}
                  style={{
                    ...focusStyle("description"),
                    resize: "none",
                    lineHeight: 1.6,
                  }}
                />
              </div>

              {/* Location */}
              <div>
                <label style={LABEL_STYLE}>Location</label>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  onFocus={() => setFocused("location")}
                  onBlur={() => setFocused(null)}
                  placeholder="e.g. Bandra West, Mumbai"
                  required
                  style={focusStyle("location")}
                />
              </div>

              {/* Rent + Deposit */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={LABEL_STYLE}>
                    Monthly Rent
                    <span
                      style={{
                        //: "'DM Mono', monospace",
                        color: "#9CA3AF",
                        fontWeight: 400,
                        marginLeft: 6,
                        fontSize: 10,
                      }}
                    >
                      ETH
                    </span>
                  </label>
                  <input
                    name="monthlyRent"
                    type="number"
                    step="0.001"
                    min="0"
                    value={formData.monthlyRent}
                    onChange={handleChange}
                    onFocus={() => setFocused("monthlyRent")}
                    onBlur={() => setFocused(null)}
                    placeholder="0.008"
                    required
                    style={focusStyle("monthlyRent")}
                  />
                </div>
                <div>
                  <label style={LABEL_STYLE}>
                    Security Deposit
                    <span
                      style={{
                        //: "'DM Mono', monospace",
                        color: "#9CA3AF",
                        fontWeight: 400,
                        marginLeft: 6,
                        fontSize: 10,
                      }}
                    >
                      ETH
                    </span>
                  </label>
                  <input
                    name="securityDeposit"
                    type="number"
                    step="0.001"
                    min="0"
                    value={formData.securityDeposit}
                    onChange={handleChange}
                    onFocus={() => setFocused("securityDeposit")}
                    onBlur={() => setFocused(null)}
                    placeholder="0.016"
                    required
                    style={focusStyle("securityDeposit")}
                  />
                </div>
              </div>

              {/* Min Duration */}
              <div>
                <label style={LABEL_STYLE}>
                  Minimum Lease Duration
                  <span
                    style={{
                      //: "'DM Mono', monospace",
                      color: "#9CA3AF",
                      fontWeight: 400,
                      marginLeft: 6,
                      fontSize: 10,
                    }}
                  >
                    MONTHS
                  </span>
                </label>
                <input
                  name="minimumLeaseDuration"
                  type="number"
                  min="1"
                  value={formData.minimumLeaseDuration}
                  onChange={handleChange}
                  onFocus={() => setFocused("minimumLeaseDuration")}
                  onBlur={() => setFocused(null)}
                  placeholder="6"
                  required
                  style={focusStyle("minimumLeaseDuration")}
                />
              </div>

              {/* Images */}
              <div>
                <label style={LABEL_STYLE}>
                  Image URLs
                  <span
                    style={{
                      color: "#9CA3AF",
                      fontWeight: 400,
                      marginLeft: 6,
                      fontSize: 11,
                    }}
                  >
                    (comma-separated, optional)
                  </span>
                </label>
                <input
                  name="images"
                  value={formData.images}
                  onChange={handleChange}
                  onFocus={() => setFocused("images")}
                  onBlur={() => setFocused(null)}
                  placeholder="https://..., https://..."
                  style={focusStyle("images")}
                />
              </div>

              {/* Live preview if rent filled */}
              {formData.monthlyRent && formData.securityDeposit && (
                <div
                  style={{
                    background: "#F0F7FF",
                    border: "1px solid #BFDBFE",
                    borderRadius: 14,
                    padding: "16px 18px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      //: "'DM Mono', monospace",
                      color: "#2D5BE3",
                      letterSpacing: "0.08em",
                      marginBottom: 10,
                    }}
                  >
                    CONTRACT PREVIEW
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    {[
                      ["Monthly Rent", `${formData.monthlyRent} ETH`],
                      ["Security Deposit", `${formData.securityDeposit} ETH`],
                      [
                        "Min. Duration",
                        formData.minimumLeaseDuration
                          ? `${formData.minimumLeaseDuration} months`
                          : "—",
                      ],
                    ].map(([k, v]) => (
                      <div
                        key={k}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 12,
                        }}
                      >
                        <span style={{ color: "#6B7280" }}>{k}</span>
                        <span
                          style={{
                            color: "#1A1A2E",
                            fontWeight: 600,
                            //: "'DM Mono', monospace",
                          }}
                        >
                          {v}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: "100%",
                  background: isLoading ? "#F3F4F6" : "#1A1A2E",
                  color: isLoading ? "#9CA3AF" : "#fff",
                  border: "none",
                  padding: "16px",
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: isLoading ? "not-allowed" : "pointer",
                  //: "'Sora', sans-serif",
                  transition: "background 0.2s, box-shadow 0.2s",
                  marginTop: 4,
                }}
                onMouseEnter={(e) => {
                  if (!isLoading)
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 8px 24px rgba(26,26,46,0.2)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                {isLoading ? "Listing Property..." : "List Property →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}