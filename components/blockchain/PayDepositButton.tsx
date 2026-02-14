// components/blockchain/PayDepositButton.tsx

"use client";

import { useState } from "react";
import { useDepositPayment } from "@/hooks/useDepositPayment";

interface PayDepositButtonProps {
  leaseId: string;
  contractAddress: string;
  depositAmount: number;
  onSuccess: () => void;   // callback to refresh parent
}

export default function PayDepositButton({
  leaseId,
  contractAddress,
  depositAmount,
  onSuccess,
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

  // Success state
  if (txHash) {
    return (
      <div className="bg-green-900/20 border border-green-700 rounded-xl p-4">
        <p className="text-green-400 font-medium text-sm mb-1">
          ✅ Deposit Paid Successfully!
        </p>
        <p className="text-gray-400 text-xs">
          Your lease is now active.
        </p>
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

  return (
    <div className="space-y-3">
      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-400 rounded-lg p-3 text-xs">
          {error}
        </div>
      )}

      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-sm w-full">
            <h3 className="text-white font-bold text-xl mb-2">
              Confirm Deposit Payment
            </h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              You are about to send{" "}
              <span className="text-white font-semibold">
                {depositAmount} ETH
              </span>{" "}
              as a security deposit. This ETH will be locked in the smart
              contract until your lease ends.
            </p>

            <div className="bg-gray-800 rounded-xl p-4 mb-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Amount</span>
                <span className="text-white font-medium">
                  {depositAmount} ETH
                </span>
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
      )}

      {/* Main button */}
      <div className="bg-blue-900/20 border border-blue-800/40 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-400 text-sm font-medium">
              Deposit Required
            </p>
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