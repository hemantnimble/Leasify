// app/dashboard/lease/[id]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import PayDepositButton from "@/components/blockchain/PayDepositButton";
import NetworkWarning from "@/components/blockchain/NetworkWarning";
import { getClientLeaseContract } from "@/utils/blockchain/web3Client";
import PayRentButton from "@/components/blockchain/PayRentButton";
import LeaseActions from "@/components/blockchain/LeaseActions";
import { LeaseDetailSkeleton } from "@/components/ui/Skeleton";

interface Lease {
  id: string;
  status: string;
  monthlyRent: number;
  securityDeposit: number;
  startDate: string;
  endDate: string;
  gracePeriodDays: number;
  lateFeePercentage: number;
  contractAddress?: string | null;
  deployedAt?: string | null;
  property: {
    id: string;
    title: string;
    location: string;
    images: string[];
  };
  landlord: { walletAddress: string; displayName?: string | null };
  tenant: { walletAddress: string; displayName?: string | null };
  payments: {
    id: string;
    amount: number;
    dueDate: string;
    paidAt?: string | null;
    status: string;
    transactionHash?: string | null;
    lateFee?: number | null;
  }[];
}

interface OnChainData {
  status: string;
  balance: string;
  accumulatedPenalties: string;
  totalRentPaid: string;
  isOverdue: boolean;
  daysRemaining: string;
}

const STATUS_CONFIG: Record<string, { bg: string; color: string; border: string; label: string }> = {
  PENDING:          { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A", label: "Pending" },
  AWAITING_DEPOSIT: { bg: "#EFF6FF", color: "#2D5BE3", border: "#BFDBFE", label: "Awaiting Deposit" },
  ACTIVE:           { bg: "#F0FDF4", color: "#059669", border: "#BBF7D0", label: "Active" },
  REJECTED:         { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA", label: "Rejected" },
  COMPLETED:        { bg: "#F5F5F3", color: "#6B7280", border: "#E5E7EB", label: "Completed" },
  TERMINATED:       { bg: "#F5F5F3", color: "#6B7280", border: "#E5E7EB", label: "Terminated" },
};

const PAYMENT_STATUS: Record<string, { color: string; bg: string }> = {
  PAID:    { color: "#059669", bg: "#F0FDF4" },
  LATE:    { color: "#D97706", bg: "#FFFBEB" },
  MISSED:  { color: "#DC2626", bg: "#FEF2F2" },
  PENDING: { color: "#6B7280", bg: "#F5F5F3" },
};

export default function LeaseDetailPage() {
  const { id } = useParams();
  const { role, walletAddress } = useWalletAuth();

  const [lease, setLease] = useState<Lease | null>(null);
  const [onChain, setOnChain] = useState<OnChainData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingChain, setIsLoadingChain] = useState(false);

  const fetchLease = async () => {
    try {
      const res = await fetch(`/api/lease/${id}`);
      const data = await res.json();
      if (res.ok) setLease(data.lease);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOnChainData = async (contractAddress: string) => {
    setIsLoadingChain(true);
    try {
      const contract = getClientLeaseContract(contractAddress);
      const [details, balance, isOverdue, daysLeft] = await Promise.all([
        contract.methods.getLeaseDetails().call(),
        contract.methods.getContractBalance().call(),
        contract.methods.isRentOverdue().call(),
        contract.methods.daysRemaining().call(),
      ]);
      const statusMap: Record<string, string> = {
        "0": "AWAITING_DEPOSIT",
        "1": "ACTIVE",
        "2": "COMPLETED",
        "3": "TERMINATED",
      };
      setOnChain({
        status: statusMap[(details as any)[8]?.toString() ?? "0"],
        balance: (Number(balance) / 1e18).toFixed(6),
        accumulatedPenalties: (Number((details as any)[9]) / 1e18).toFixed(6),
        totalRentPaid: (Number((details as any)[10]) / 1e18).toFixed(6),
        isOverdue: Boolean(isOverdue),
        daysRemaining: daysLeft?.toString() ?? "0",
      });
    } catch (err) {
      console.error("Failed to fetch on-chain data:", err);
    } finally {
      setIsLoadingChain(false);
    }
  };

  useEffect(() => {
    if (id) fetchLease();
  }, [id]);

  useEffect(() => {
    if (lease?.contractAddress && lease.status !== "PENDING") {
      fetchOnChainData(lease.contractAddress);
    }
  }, [lease]);

  const pendingPayment = lease?.payments.find(
    (p) => p.status === "PENDING" || p.status === "MISSED"
  );

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#F8F8F6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9CA3AF",
          fontSize: 14,
        }}
      >
        Loading lease...
      </div>
    );
  }

  if (!lease) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#F8F8F6",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <p style={{ color: "#6B7280", fontSize: 14 }}>Lease not found</p>
        <Link
          href={role === "LANDLORD" ? "/dashboard/landlord" : "/dashboard/tenant"}
          style={{ color: "#2D5BE3", fontSize: 13, textDecoration: "none" }}
        >
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const isTenant =
    walletAddress?.toLowerCase() === lease.tenant.walletAddress.toLowerCase();
  const statusCfg = STATUS_CONFIG[lease.status] ?? STATUS_CONFIG.COMPLETED;
  const backPath =
    role === "LANDLORD" ? "/dashboard/landlord" : "/dashboard/tenant";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8F8F6",
        padding: "40px 48px 80px",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        <NetworkWarning />

        {/* Back */}
        <Link
          href={backPath}
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
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.1em",
                color: "#9CA3AF",
                marginBottom: 8,
              }}
            >
              {role} · LEASE DETAIL
            </div>
            <h1
              style={{
                fontSize: 32,
                fontWeight: 800,
                letterSpacing: "-0.04em",
                color: "#1A1A2E",
                lineHeight: 1.1,
                marginBottom: 4,
              }}
            >
              {lease.property.title}
            </h1>
            <p style={{ fontSize: 13, color: "#9CA3AF" }}>
              📍 {lease.property.location}
            </p>
          </div>
          <div
            style={{
              background: statusCfg.bg,
              color: statusCfg.color,
              border: `1px solid ${statusCfg.border}`,
              padding: "6px 18px",
              borderRadius: 100,
              fontSize: 12,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {statusCfg.label}
          </div>
        </div>

        {/* Property image strip */}
        {lease.property.images.length > 0 && (
          <div
            style={{
              height: 220,
              borderRadius: 20,
              overflow: "hidden",
              marginBottom: 24,
              position: "relative",
            }}
          >
            <img
              src={lease.property.images[0]}
              alt={lease.property.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 340px",
            gap: 20,
            alignItems: "start",
          }}
        >
          {/* ── Left Column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Lease Terms */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #F0F0EE",
                borderRadius: 20,
                padding: "28px 32px",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  color: "#9CA3AF",
                  marginBottom: 20,
                  textTransform: "uppercase",
                }}
              >
                Lease Terms
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 12,
                }}
              >
                {[
                  { label: "Monthly Rent", value: `${lease.monthlyRent} ETH` },
                  { label: "Security Deposit", value: `${lease.securityDeposit} ETH` },
                  { label: "Grace Period", value: `${lease.gracePeriodDays} days` },
                  {
                    label: "Start Date",
                    value: new Date(lease.startDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }),
                  },
                  {
                    label: "End Date",
                    value: new Date(lease.endDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }),
                  },
                  { label: "Late Fee", value: `${lease.lateFeePercentage}%` },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      background: "#F8F8F6",
                      borderRadius: 14,
                      padding: "16px 18px",
                    }}
                  >
                    <p style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 6 }}>
                      {item.label}
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#1A1A2E" }}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Parties */}
            <div
              style={{
                background: "#fff",
                border: "1px solid #F0F0EE",
                borderRadius: 20,
                padding: "28px 32px",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  color: "#9CA3AF",
                  marginBottom: 20,
                  textTransform: "uppercase",
                }}
              >
                Parties
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  {
                    role: "Landlord",
                    name: lease.landlord.displayName,
                    address: lease.landlord.walletAddress,
                  },
                  {
                    role: "Tenant",
                    name: lease.tenant.displayName,
                    address: lease.tenant.walletAddress,
                  },
                ].map((party) => (
                  <div
                    key={party.role}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "14px 18px",
                      background: "#F8F8F6",
                      borderRadius: 14,
                    }}
                  >
                    <div>
                      <p style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 4 }}>
                        {party.role}
                      </p>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#1A1A2E" }}>
                        {party.name || (
                          <span style={{ fontSize: 12 }}>
                            {party.address.slice(0, 6)}...{party.address.slice(-4)}
                          </span>
                        )}
                      </p>
                    </div>
                    <a
                      href={`https://sepolia.etherscan.io/address/${party.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 11,
                        color: "#2D5BE3",
                        textDecoration: "none",
                        //: "'DM Mono', monospace",
                      }}
                    >
                      {party.address.slice(0, 6)}...{party.address.slice(-4)} ↗
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* On-Chain Data */}
            {lease.contractAddress && (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #F0F0EE",
                  borderRadius: 20,
                  padding: "28px 32px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.1em",
                      color: "#9CA3AF",
                      textTransform: "uppercase",
                    }}
                  >
                    Live Blockchain Data
                  </div>
                  {isLoadingChain && (
                    <span
                      style={{
                        fontSize: 11,
                        color: "#9CA3AF",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          border: "1.5px solid #D1D5DB",
                          borderTopColor: "#1A1A2E",
                          borderRadius: "50%",
                          display: "inline-block",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                      Fetching...
                    </span>
                  )}
                </div>

                {onChain ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: 12,
                    }}
                  >
                    {[
                      { label: "Contract Balance", value: `${onChain.balance} ETH`, color: "#1A1A2E" },
                      { label: "Penalties", value: `${onChain.accumulatedPenalties} ETH`, color: onChain.accumulatedPenalties !== "0.000000" ? "#DC2626" : "#1A1A2E" },
                      { label: "Days Remaining", value: `${onChain.daysRemaining} days`, color: "#1A1A2E" },
                      { label: "Total Paid", value: `${onChain.totalRentPaid} ETH`, color: "#059669" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        style={{
                          background: "#F8F8F6",
                          borderRadius: 14,
                          padding: "16px 18px",
                        }}
                      >
                        <p style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 6 }}>
                          {item.label}
                        </p>
                        <p style={{ fontSize: 14, fontWeight: 700, color: item.color }}>
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: "#9CA3AF" }}>
                    Connect MetaMask to view live data
                  </p>
                )}

                {/* Overdue banner */}
                {onChain?.isOverdue && (
                  <div
                    style={{
                      marginTop: 16,
                      background: "#FEF2F2",
                      border: "1px solid #FECACA",
                      borderRadius: 12,
                      padding: "12px 16px",
                      fontSize: 12,
                      color: "#DC2626",
                      fontWeight: 500,
                    }}
                  >
                    ⚠️ Rent is currently overdue. Late fees are accumulating.
                  </div>
                )}

                {/* Contract link */}
                <a
                  href={`https://sepolia.etherscan.io/address/${lease.contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 16,
                    fontSize: 12,
                    color: "#2D5BE3",
                    textDecoration: "none",
                    //: "'DM Mono', monospace",
                  }}
                >
                  {lease.contractAddress.slice(0, 10)}...{lease.contractAddress.slice(-6)} ↗
                </a>
              </div>
            )}

            {/* Payment History */}
            {lease.payments.length > 0 && (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #F0F0EE",
                  borderRadius: 20,
                  padding: "28px 32px",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.1em",
                    color: "#9CA3AF",
                    marginBottom: 20,
                    textTransform: "uppercase",
                  }}
                >
                  Payment History
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {lease.payments.map((payment) => {
                    const cfg = PAYMENT_STATUS[payment.status] ?? PAYMENT_STATUS.PENDING;
                    return (
                      <div
                        key={payment.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "14px 18px",
                          background: "#F8F8F6",
                          borderRadius: 14,
                        }}
                      >
                        <div>
                          <p
                            style={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: "#1A1A2E",
                              marginBottom: 3,
                            }}
                          >
                            {payment.amount} ETH
                          </p>
                          <p style={{ fontSize: 11, color: "#9CA3AF" }}>
                            Due {new Date(payment.dueDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                          {payment.lateFee && payment.lateFee > 0 && (
                            <p style={{ fontSize: 11, color: "#DC2626", marginTop: 2 }}>
                              Late fee: {payment.lateFee} ETH
                            </p>
                          )}
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: "4px 12px",
                              borderRadius: 100,
                              background: cfg.bg,
                              color: cfg.color,
                            }}
                          >
                            {payment.status}
                          </span>
                          {payment.transactionHash && (
                            <div style={{ marginTop: 4 }}>
                              <a
                                href={`https://sepolia.etherscan.io/tx/${payment.transactionHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  fontSize: 11,
                                  color: "#2D5BE3",
                                  textDecoration: "none",
                                  //: "'DM Mono', monospace",
                                }}
                              >
                                tx ↗
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Right Column: Actions ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Pay Deposit */}
            {lease.status === "AWAITING_DEPOSIT" && isTenant && (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #F0F0EE",
                  borderRadius: 20,
                  padding: "24px 28px",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.1em",
                    color: "#9CA3AF",
                    marginBottom: 14,
                    textTransform: "uppercase",
                  }}
                >
                  Action Required
                </div>
                <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 16, lineHeight: 1.6 }}>
                  Pay the security deposit of <strong style={{ color: "#1A1A2E" }}>{lease.securityDeposit} ETH</strong> to activate your lease.
                </p>
                <PayDepositButton
                  leaseId={lease.id}
                  contractAddress={lease.contractAddress!}
                  depositAmount={lease.securityDeposit}
                  onSuccess={fetchLease}
                />
              </div>
            )}

            {/* Pay Rent */}
            {lease.status === "ACTIVE" && isTenant && pendingPayment && (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #F0F0EE",
                  borderRadius: 20,
                  padding: "24px 28px",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.1em",
                    color: "#9CA3AF",
                    marginBottom: 14,
                    textTransform: "uppercase",
                  }}
                >
                  Rent Due
                </div>
                <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 4, lineHeight: 1.6 }}>
                  <strong style={{ color: "#1A1A2E" }}>{pendingPayment.amount} ETH</strong> due by{" "}
                  {new Date(pendingPayment.dueDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
                <PayRentButton
                  leaseId={lease.id}
                  contractAddress={lease.contractAddress!}
                  monthlyRent={lease.monthlyRent}
                  currentPayment={pendingPayment}
                  onSuccess={fetchLease}
                />
              </div>
            )}

            {/* Lease Actions (terminate/complete) */}
            {lease.status === "ACTIVE" && lease.contractAddress && (
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #F0F0EE",
                  borderRadius: 20,
                  padding: "24px 28px",
                }}
              >
                <LeaseActions
                  leaseId={lease.id}
                  contractAddress={lease.contractAddress}
                  status={lease.status}
                  endDate={lease.endDate}
                  role={role ?? ""}
                  walletAddress={walletAddress ?? ""}
                  landlordWallet={lease.landlord.walletAddress}
                  tenantWallet={lease.tenant.walletAddress}
                  onSuccess={fetchLease}
                />
              </div>
            )}

            {/* Summary card always visible */}
            <div
              style={{
                background: "#1A1A2E",
                borderRadius: 20,
                padding: "24px 28px",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  color: "rgba(255,255,255,0.4)",
                  marginBottom: 16,
                  textTransform: "uppercase",
                }}
              >
                Quick Summary
              </div>
              {[
                { label: "Your Role", value: isTenant ? "Tenant" : "Landlord" },
                { label: "Monthly Rent", value: `${lease.monthlyRent} ETH` },
                { label: "Status", value: statusCfg.label },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                    {item.label}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}