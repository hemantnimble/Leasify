// components/blockchain/NetworkWarning.tsx

"use client";

import { useNetworkCheck } from "@/hooks/useNetworkCheck";

export default function NetworkWarning() {
  const { isCorrectNetwork, isSwitching, switchToSepolia } = useNetworkCheck();

  // Don't show if correct network or still checking
  if (isCorrectNetwork === null || isCorrectNetwork === true) return null;

  return (
    <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4 mb-6 flex items-center justify-between">
      <div>
        <p className="text-yellow-400 font-medium text-sm">
          ⚠️ Wrong Network
        </p>
        <p className="text-gray-400 text-xs mt-1">
          Please switch to Sepolia testnet to use Leasify
        </p>
      </div>
      <button
        onClick={switchToSepolia}
        disabled={isSwitching}
        className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-900 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
      >
        {isSwitching ? "Switching..." : "Switch to Sepolia"}
      </button>
    </div>
  );
}