// app/login/landlord/page.tsx

"use client";

import { useEffect }          from "react";
import { useRouter }          from "next/navigation";
import Link                   from "next/link";
import { useWalletAuth }      from "@/hooks/useWalletAuth";
import WalletConnectButton    from "@/components/auth/WalletConnectButton";

export default function LandlordLoginPage() {
  const router                              = useRouter();
  const { isAuthenticated, role }           = useWalletAuth();

  useEffect(() => {
    if (isAuthenticated && role === "LANDLORD") {
      router.push("/dashboard/landlord");
    }
  }, [isAuthenticated, role]);

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
          <div className="text-5xl mb-4">🏢</div>
          <h1 className="text-3xl font-bold text-white">Landlord Sign In</h1>
          <p className="text-gray-400 mt-2 text-sm">
            List properties and manage lease agreements
          </p>
        </div>

        {/* ✅ Single component handles everything */}
        <WalletConnectButton role="LANDLORD" />

        <div className="mt-6 bg-purple-900/20 border border-purple-800/40 rounded-xl p-4">
          <p className="text-purple-400 text-xs font-medium mb-1">
            First time?
          </p>
          <p className="text-gray-400 text-xs leading-relaxed">
            A new landlord account will be created automatically using your
            wallet address. Each wallet can only be registered as one role.
          </p>
        </div>
      </div>
    </div>
  );
}