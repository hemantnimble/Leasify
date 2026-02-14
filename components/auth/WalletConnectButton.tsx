// components/auth/WalletConnectButton.tsx

"use client";

import { useEffect }     from "react";
import { useRouter }     from "next/navigation";
import { useAccount }    from "wagmi";
import { useWalletAuth } from "@/hooks/useWalletAuth";

interface WalletConnectButtonProps {
  role: "LANDLORD" | "TENANT";
}

export default function WalletConnectButton({
  role,
}: WalletConnectButtonProps) {
  const {
    connectAndSign,      // ✅ renamed from connectWallet
    openConnectModal,    // ✅ new
    isLoading,
    error,
    isAuthenticated,
    role: userRole,
  } = useWalletAuth();

  const { isConnected, address } = useAccount();
  const router                   = useRouter();
  const isLandlord               = role === "LANDLORD";

  // Redirect after successful auth
  useEffect(() => {
    if (isAuthenticated && userRole) {
      if (userRole === "LANDLORD") {
        router.push("/dashboard/landlord");
      } else {
        router.push("/dashboard/tenant");
      }
    }
  }, [isAuthenticated, userRole, router]);

  return (
    <div className="space-y-4">

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-400 rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      {/* Step 1 — Not connected yet → show Connect button */}
      {!isConnected && (
        <button
          onClick={() => openConnectModal?.()}
          disabled={isLoading}
          className={`w-full font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-3
            ${isLandlord
              ? "bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900"
              : "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900"
            } disabled:cursor-not-allowed text-white`}
        >
          🔗 Connect Wallet as {isLandlord ? "Landlord" : "Tenant"}
        </button>
      )}

      {/* Step 2 — Connected → show Sign button */}
      {isConnected && address && (
        <>
          <div className="bg-gray-800 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs">Connected wallet</p>
              <p className="text-white text-sm font-mono mt-0.5">
                {address.slice(0, 10)}...{address.slice(-8)}
              </p>
            </div>
            <span className="text-green-400 text-xs">● Connected</span>
          </div>

          <button
            onClick={() => connectAndSign(role)}
            disabled={isLoading}
            className={`w-full font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-3
              ${isLandlord
                ? "bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900"
                : "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900"
              } disabled:cursor-not-allowed text-white`}
          >
            {isLoading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                ✍️ Sign Message as {isLandlord ? "Landlord" : "Tenant"}
              </>
            )}
          </button>
        </>
      )}

      <p className="text-gray-600 text-xs text-center">
        Signing is free — no gas required
      </p>
    </div>
  );
}
