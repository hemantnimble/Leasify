// components/auth/WalletConnectButton.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWalletAuth } from "@/hooks/useWalletAuth";

interface WalletConnectButtonProps {
  role: "LANDLORD" | "TENANT";
}

export default function WalletConnectButton({ role }: WalletConnectButtonProps) {
  const { connectWallet, isLoading, error, isAuthenticated, role: userRole } =
    useWalletAuth();
  const router = useRouter();

  // Redirect once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (userRole === "LANDLORD") {
        router.push("/dashboard/landlord");
      } else {
        router.push("/dashboard/tenant");
      }
    }
  }, [isAuthenticated, userRole, router]);

  const isLandlord = role === "LANDLORD";

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-400 rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={() => connectWallet(role)}
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
            Connecting...
          </>
        ) : (
          <>
            🦊 Connect MetaMask as {role === "LANDLORD" ? "Landlord" : "Tenant"}
          </>
        )}
      </button>

      <p className="text-gray-600 text-xs text-center">
        Signing is free — no gas required
      </p>
    </div>
  );
}