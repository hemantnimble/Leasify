// app/login/tenant/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useWalletAuth } from "@/hooks/useWalletAuth";

export default function TenantLoginPage() {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { connectAndSign, isLoading,
    error, isAuthenticated, role,
    setError } = useWalletAuth();
  const [step, setStep] = useState<"connect" | "sign" | "done">("connect");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && role === "TENANT") {
      router.push("/dashboard/tenant");
    }
  }, [isAuthenticated, role]);

  // Move to sign step once wallet is connected
  useEffect(() => {
    if (isConnected && address && step === "connect") {
      setStep("sign");
    }
  }, [isConnected, address]);

  const handleConnect = () => {
    setError(null);
    openConnectModal?.();
  };

  const handleSign = async () => {
    const result = await connectAndSign("TENANT");
    if (result?.success) {
      router.push("/dashboard/tenant");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-950">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8">

        <Link
          href="/login"
          className="text-gray-400 hover:text-white text-sm transition-colors"
        >
          ← Back
        </Link>

        <div className="text-center mt-6 mb-8">
          <div className="text-5xl mb-4">🏠</div>
          <h1 className="text-3xl font-bold text-white">Tenant Sign In</h1>
          <p className="text-gray-400 mt-2 text-sm">
            Browse properties and manage your leases
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-400 rounded-xl p-4 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Connect Wallet */}
        {!isConnected && (
          <div className="space-y-4">
            <button
              onClick={handleConnect}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-3"
            >
              🔗 Connect Wallet as Tenant
            </button>
            <p className="text-gray-600 text-xs text-center">
              Works with MetaMask, WalletConnect, Coinbase Wallet and more
            </p>
          </div>
        )}

        {/* Step 2: Sign Message */}
        {isConnected && address && (
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-1">Connected wallet</p>
              <p className="text-white text-sm font-mono">
                {address.slice(0, 10)}...{address.slice(-8)}
              </p>
            </div>

            <button
              onClick={handleSign}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                "✍️ Sign Message to Continue"
              )}
            </button>

            <p className="text-gray-600 text-xs text-center">
              Signing is free — no gas required
            </p>
          </div>
        )}

        {/* Info box */}
        <div className="mt-6 bg-blue-900/20 border border-blue-800/40 rounded-xl p-4">
          <p className="text-blue-400 text-xs font-medium mb-1">
            First time?
          </p>
          <p className="text-gray-400 text-xs leading-relaxed">
            A new tenant account will be created automatically using your
            wallet address. Each wallet can only be registered as one role.
          </p>
        </div>
      </div>
    </div>
  );
}