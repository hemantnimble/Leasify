"use client";

// components/blockchain/PayDepositButton.tsx

import { useState } from "react";
import { useDepositPayment } from "@/hooks/useDepositPayment";

interface PayDepositButtonProps {
  leaseId: string;
  contractAddress: string;
  depositAmount: number;
  onSuccess: () => void;
  variant?: "dark" | "light"; // dark = lease detail page, light = dashboard card
}

export default function PayDepositButton({
  leaseId,
  contractAddress,
  depositAmount,
  onSuccess,
  variant = "dark",
}: PayDepositButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const { payDeposit, isLoading, error, txHash, step } = useDepositPayment({
    contractAddress,
    depositAmount,
    leaseId,
  });

  const handleConfirm = async () => {
    setShowConfirm(false);
    const result = await payDeposit();
    if (result.success) {
      onSuccess();
    }
  };

  const isLight = variant === "light";

  // ── Success state ──
  if (txHash) {
    if (isLight) {
      return (
        <div
          style={{
            background: "#F0FDF4",
            border: "1px solid #BBF7D0",
            borderRadius: 12,
            padding: "12px 16px",
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 13, color: "#059669", marginBottom: 2 }}>
            ✅ Deposit Paid Successfully!
          </div>
          <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 6 }}>
            Your lease is now active.
          </div>
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 11, color: "#2D5BE3" }}
          >
            View on Etherscan ↗
          </a>
        </div>
      );
    }

    return (
      <div className="bg-green-900/20 border border-green-700 rounded-xl p-4">
        <p className="text-green-400 font-medium text-sm mb-1">
          ✅ Deposit Paid Successfully!
        </p>
        <p className="text-gray-400 text-xs">Your lease is now active.</p>
        <a
          href={`https://sepolia.etherscan.io/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 text-xs hover:underline mt-2 block"
        >
          View transaction on Etherscan ↗
        </a>
      </div>
    );
  }

  // ── Shared confirm modal (always dark overlay) ──
  const confirmModal = showConfirm && (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-sm w-full">
        <h3 className="text-white font-bold text-xl mb-2">
          Confirm Deposit Payment
        </h3>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          You are about to send{" "}
          <span className="text-white font-semibold">{depositAmount} ETH</span>{" "}
          as a security deposit. This ETH will be locked in the smart contract
          until your lease ends.
        </p>

        <div className="bg-gray-800 rounded-xl p-4 mb-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Amount</span>
            <span className="text-white font-medium">{depositAmount} ETH</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Contract</span>
            <span className="text-gray-300 font-mono text-xs">
              {contractAddress.slice(0, 8)}...{contractAddress.slice(-6)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Network</span>
            <span className="text-white">Sepolia Testnet</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowConfirm(false)}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Confirm & Pay
          </button>
        </div>
      </div>
    </div>
  );

  // ── LIGHT variant (dashboard card inline style) ──
  if (isLight) {
    return (
      <>
        {confirmModal}

        {/* Error */}
        {error && (
          <div
            style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              color: "#DC2626",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 12,
              marginBottom: 8,
            }}
          >
            {error}
          </div>
        )}

        {/* Inline card — matches the dashboard card's light blue style exactly */}
        <div
          style={{
            background: "#EFF6FF",
            border: "1px solid #BFDBFE",
            borderRadius: 14,
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 600,
                fontSize: 13,
                color: "#2D5BE3",
                marginBottom: 2,
              }}
            >
              Deposit Required
            </div>
            <div style={{ fontSize: 11, color: "#6B7280" }}>
              {isLoading && step
                ? step
                : `Pay ${depositAmount} ETH to activate your lease`}
            </div>
          </div>

          <button
            onClick={() => setShowConfirm(true)}
            disabled={isLoading}
            style={{
              background: isLoading ? "#BFDBFE" : "#2D5BE3",
              color: isLoading ? "#93C5FD" : "#fff",
              border: "none",
              padding: "10px 20px",
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "background 0.2s",
            }}
          >
            {isLoading ? (
              <>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    border: "2px solid #93C5FD",
                    borderTopColor: "#2D5BE3",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                Processing...
              </>
            ) : (
              "Pay Deposit"
            )}
          </button>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </>
    );
  }

  // ── DARK variant (lease detail page — original) ──
  return (
    <div className="space-y-3">
      {confirmModal}

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-400 rounded-lg p-3 text-xs">
          {error}
        </div>
      )}

      <div className="bg-blue-900/20 border border-blue-800/40 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-400 text-sm font-medium">Deposit Required</p>
            <p className="text-gray-400 text-xs mt-1">
              Pay {depositAmount} ETH to activate your lease
            </p>
            {isLoading && step && (
              <p className="text-yellow-400 text-xs mt-1 flex items-center gap-1">
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                {step}
              </p>
            )}
          </div>

          <button
            onClick={() => setShowConfirm(true)}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              "Pay Deposit →"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}