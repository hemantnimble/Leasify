// components/blockchain/LeaseActions.tsx

"use client";

import { useState, useEffect } from "react";
import { useLeaseCompletion } from "@/hooks/useLeaseCompletion";
import { getTerminationStatus } from "@/utils/blockchain/web3Client";

interface LeaseActionsProps {
  leaseId:         string;
  contractAddress: string;
  status:          string;
  endDate:         string;
  role:            string;
  walletAddress:   string;   // ✅ current user's wallet
  landlordWallet:  string;   // ✅ landlord's wallet
  tenantWallet:    string;   // ✅ tenant's wallet
  onSuccess:       () => void;
}

interface TerminationFlags {
  landlordAgreed: boolean;
  tenantAgreed:   boolean;
}

export default function LeaseActions({
  leaseId,
  contractAddress,
  status,
  endDate,
  role,
  walletAddress,
  landlordWallet,
  tenantWallet,
  onSuccess,
}: LeaseActionsProps) {
  const [showTerminateConfirm, setShowTerminateConfirm] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm]   = useState(false);
  const [successMsg, setSuccessMsg]                     = useState<string | null>(null);
  const [termFlags, setTermFlags]                       = useState<TerminationFlags | null>(null);
  const [loadingFlags, setLoadingFlags]                 = useState(false);

  const { completeLease, agreeToTerminate, isLoading, error, step } =
    useLeaseCompletion({ contractAddress, leaseId });

  const leaseEnded = new Date() >= new Date(endDate);

  // ── Determine current user's role in this lease ──
  const isLandlord = walletAddress?.toLowerCase() === landlordWallet?.toLowerCase();
  const isTenant   = walletAddress?.toLowerCase() === tenantWallet?.toLowerCase();

  // ── Fetch termination flags from chain ──
  useEffect(() => {
    if (status !== "ACTIVE" || leaseEnded || !contractAddress) return;

    const fetchFlags = async () => {
      setLoadingFlags(true);
      const flags = await getTerminationStatus(contractAddress);
      setTermFlags(flags);
      setLoadingFlags(false);
    };

    fetchFlags();
  }, [status, contractAddress, leaseEnded]);

  // ── Determine what the current user has already done ──
  const iHaveAgreed = isLandlord
    ? termFlags?.landlordAgreed
    : termFlags?.tenantAgreed;

  const otherPartyAgreed = isLandlord
    ? termFlags?.tenantAgreed
    : termFlags?.landlordAgreed;

  const otherPartyLabel = isLandlord ? "Tenant" : "Landlord";

  const handleComplete = async () => {
    setShowCompleteConfirm(false);
    const result = await completeLease();
    if (result.success) {
      setSuccessMsg("Lease completed! Deposit has been released to tenant.");
      onSuccess();
    }
  };

  const handleTerminate = async () => {
    setShowTerminateConfirm(false);
    const result = await agreeToTerminate();
    if (result.success) {
      if (result.bothAgreed) {
        setSuccessMsg(
          "Both parties agreed. Lease terminated and deposit released!"
        );
      } else {
        setSuccessMsg(
          `Your agreement recorded. Waiting for ${otherPartyLabel} to agree.`
        );
      }
      // Refresh termination flags
      const flags = await getTerminationStatus(contractAddress);
      setTermFlags(flags);
      onSuccess();
    }
  };

  if (status !== "ACTIVE") return null;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
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

      {/* ── NATURAL COMPLETION (after endDate) ── */}
      {leaseEnded && (
        <>
          <div className="bg-green-900/20 border border-green-800/40 rounded-xl p-3">
            <p className="text-green-400 text-sm font-medium">
              🏁 Lease Duration Ended
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Either party can now complete the lease to release the deposit.
            </p>
          </div>

          <button
            onClick={() => setShowCompleteConfirm(true)}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-900 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            ✓ Complete Lease & Release Deposit
          </button>

          {/* Complete confirm modal */}
          {showCompleteConfirm && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-sm w-full">
                <h3 className="text-white font-bold text-xl mb-3">
                  Complete Lease
                </h3>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  This will finalize the lease and release the security deposit
                  back to the tenant (minus any accumulated penalties). This
                  action is irreversible.
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

      {/* ── EARLY TERMINATION (before endDate) ── */}
      {!leaseEnded && (
        <div className="space-y-3">

          {/* Loading flags */}
          {loadingFlags && (
            <p className="text-gray-500 text-xs flex items-center gap-1">
              <span className="w-2 h-2 border border-gray-500 border-t-white rounded-full animate-spin" />
              Checking termination status...
            </p>
          )}

          {/* ── Status banner: Other party already agreed ── */}
          {!loadingFlags && otherPartyAgreed && !iHaveAgreed && (
            <div className="bg-yellow-900/20 border border-yellow-700 rounded-xl p-4">
              <p className="text-yellow-400 text-sm font-semibold">
                ⚠️ {otherPartyLabel} Wants to Terminate
              </p>
              <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                The {otherPartyLabel.toLowerCase()} has already agreed to end
                this lease early. Click below to finalize the termination and
                release the deposit.
              </p>
            </div>
          )}

          {/* ── Status banner: I already agreed, waiting ── */}
          {!loadingFlags && iHaveAgreed && !otherPartyAgreed && (
            <div className="bg-blue-900/20 border border-blue-800/40 rounded-xl p-4">
              <p className="text-blue-400 text-sm font-semibold">
                ⏳ Waiting for {otherPartyLabel}
              </p>
              <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                You have agreed to terminate. The lease will end once the{" "}
                {otherPartyLabel.toLowerCase()} also agrees on-chain.
              </p>
            </div>
          )}

          {/* ── Terminate button — show if I haven't agreed yet ── */}
          {!loadingFlags && !iHaveAgreed && (
            <>
              <button
                onClick={() => setShowTerminateConfirm(true)}
                disabled={isLoading}
                className={`w-full font-medium py-3 rounded-xl transition-colors text-sm border ${
                  otherPartyAgreed
                    ? "bg-red-600 hover:bg-red-700 text-white border-red-600"
                    : "bg-gray-800 hover:bg-red-900/50 text-gray-400 hover:text-red-400 border-gray-700 hover:border-red-800"
                } disabled:cursor-not-allowed`}
              >
                {otherPartyAgreed
                  ? "✓ Agree & Finalize Termination"
                  : "Request Early Termination"}
              </button>

              {/* Terminate confirm modal */}
              {showTerminateConfirm && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                  <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-sm w-full">
                    <h3 className="text-white font-bold text-xl mb-3">
                      {otherPartyAgreed
                        ? "Finalize Early Termination"
                        : "Request Early Termination"}
                    </h3>

                    {!otherPartyAgreed && (
                      <div className="bg-yellow-900/20 border border-yellow-800/40 rounded-xl p-3 mb-4">
                        <p className="text-yellow-400 text-xs font-medium">
                          ⚠️ Both parties must agree
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          The lease only terminates when both landlord AND
                          tenant agree on-chain.
                        </p>
                      </div>
                    )}

                    <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                      {otherPartyAgreed
                        ? `The ${otherPartyLabel.toLowerCase()} has already agreed. Confirming will immediately terminate the lease and release the deposit.`
                        : "You are signaling your agreement to end this lease early. The deposit will be released once both parties agree."}
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
                        {otherPartyAgreed ? "Finalize" : "I Agree"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Info note */}
          <p className="text-gray-600 text-xs leading-relaxed">
            Lease ends {new Date(endDate).toLocaleDateString()}.
            Early termination requires both parties to agree on-chain.
          </p>
        </div>
      )}
    </div>
  );
}