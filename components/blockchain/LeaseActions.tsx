// components/blockchain/LeaseActions.tsx

"use client";

import { useState } from "react";
import { useLeaseCompletion } from "@/hooks/useLeaseCompletion";

interface LeaseActionsProps {
  leaseId:         string;
  contractAddress: string;
  status:          string;
  startDate:       string;
  endDate:         string;
  role:            string;
  onSuccess:       () => void;
}

export default function LeaseActions({
  leaseId,
  contractAddress,
  status,
  endDate,
  role,
  onSuccess,
}: LeaseActionsProps) {
  const [showTerminateConfirm, setShowTerminateConfirm] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm]   = useState(false);
  const [successMsg, setSuccessMsg]                     = useState<string | null>(null);

  const { completeLease, agreeToTerminate, isLoading, error, step } =
    useLeaseCompletion({ contractAddress, leaseId });

  const leaseEnded  = new Date() >= new Date(endDate);

  const handleComplete = async () => {
    setShowCompleteConfirm(false);
    const result = await completeLease();
    if (result.success) {
      setSuccessMsg("Lease completed! Deposit has been released.");
      onSuccess();
    }
  };

  const handleTerminate = async () => {
    setShowTerminateConfirm(false);
    const result = await agreeToTerminate();
    if (result.success) {
      if (result.bothAgreed) {
        setSuccessMsg("Both parties agreed. Lease terminated and deposit released!");
      } else {
        setSuccessMsg("Your agreement recorded. Waiting for the other party to agree.");
      }
      onSuccess();
    }
  };

  if (status !== "ACTIVE") return null;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
      <p className="text-gray-400 text-xs uppercase tracking-wider">
        Lease Actions
      </p>

      {/* Success message */}
      {successMsg && (
        <div className="bg-green-900/20 border border-green-700 rounded-xl p-3">
          <p className="text-green-400 text-sm">{successMsg}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-400 rounded-lg p-3 text-xs">
          {error}
        </div>
      )}

      {/* Loading step */}
      {isLoading && step && (
        <div className="flex items-center gap-2 text-yellow-400 text-xs">
          <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
          {step}
        </div>
      )}

      {/* Complete Lease — only after endDate */}
      {leaseEnded && (
        <>
          <button
            onClick={() => setShowCompleteConfirm(true)}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-900 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            ✓ Complete Lease & Release Deposit
          </button>

          {showCompleteConfirm && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-sm w-full">
                <h3 className="text-white font-bold text-xl mb-3">
                  Complete Lease
                </h3>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  This will finalize the lease and release the security deposit
                  back to the tenant (minus any accumulated penalties).
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCompleteConfirm(false)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleComplete}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Early Termination — available any time */}
      {!leaseEnded && (
        <>
          <button
            onClick={() => setShowTerminateConfirm(true)}
            disabled={isLoading}
            className="w-full bg-gray-800 hover:bg-red-900/50 disabled:cursor-not-allowed text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-800 font-medium py-3 rounded-xl transition-colors text-sm"
          >
            Request Early Termination
          </button>

          {showTerminateConfirm && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-sm w-full">
                <h3 className="text-white font-bold text-xl mb-3">
                  Early Termination
                </h3>
                <div className="bg-yellow-900/20 border border-yellow-800/40 rounded-xl p-3 mb-4">
                  <p className="text-yellow-400 text-xs font-medium">
                    ⚠️ Both parties must agree
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    The lease only terminates when both landlord AND tenant
                    have called this function on-chain.
                  </p>
                </div>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  You are agreeing to end this lease early. The deposit will
                  be released (minus penalties) once both parties agree.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowTerminateConfirm(false)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTerminate}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-colors"
                  >
                    I Agree to Terminate
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Info note */}
      <p className="text-gray-600 text-xs leading-relaxed">
        {leaseEnded
          ? "Lease duration has ended. Complete it to release the deposit."
          : `Lease ends ${new Date(endDate).toLocaleDateString()}. Early termination requires both parties.`}
      </p>
    </div>
  );
}