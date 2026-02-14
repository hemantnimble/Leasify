// components/blockchain/NetworkWarning.tsx

"use client";

import { useAccount, useSwitchChain } from "wagmi";
import { sepolia }                    from "wagmi/chains";

export default function NetworkWarning() {
  const { chain, isConnected }      = useAccount();
  const { switchChain, isPending }  = useSwitchChain();

  // Not connected or already on Sepolia
  if (!isConnected || chain?.id === sepolia.id) return null;

  return (
    <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4 mb-6 flex items-center justify-between">
      <div>
        <p className="text-yellow-400 font-medium text-sm">
          ⚠️ Wrong Network
        </p>
        <p className="text-gray-400 text-xs mt-1">
          You are on <span className="text-white">{chain?.name}</span>.
          Please switch to Sepolia testnet.
        </p>
      </div>
      <button
        onClick={() => switchChain({ chainId: sepolia.id })}
        disabled={isPending}
        className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-900 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
      >
        {isPending ? "Switching..." : "Switch to Sepolia"}
      </button>
    </div>
  );
}