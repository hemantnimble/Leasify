// app/login/page.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWalletAuth } from "@/hooks/useWalletAuth";

export default function LoginPage() {
  const { connectWallet, isLoading, error, isAuthenticated, role } = useWalletAuth();
  const router = useRouter();

  // Redirect after login based on role
  useEffect(() => {
    if (isAuthenticated) {
      if (role === "LANDLORD") {
        router.push("/dashboard/landlord");
      } else {
        router.push("/dashboard/tenant");
      }
    }
  }, [isAuthenticated, role, router]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 w-full max-w-md text-center">
        
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Leasify</h1>
          <p className="text-gray-400 mt-2">Blockchain Rental Agreements</p>
        </div>

        {/* Description */}
        <p className="text-gray-400 text-sm mb-8">
          Connect your MetaMask wallet to sign in. No password needed — your wallet is your identity.
        </p>

        {/* Error message */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-400 rounded-lg p-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Connect button */}
        <button
          onClick={connectWallet}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              🦊 Connect MetaMask
            </>
          )}
        </button>

        <p className="text-gray-600 text-xs mt-6">
          By connecting, you agree to sign a message to verify your identity. This is free and does not cost gas.
        </p>
      </div>
    </div>
  );
}