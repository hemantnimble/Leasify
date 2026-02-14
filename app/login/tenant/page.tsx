// app/login/tenant/page.tsx

import Link from "next/link";
import WalletConnectButton from "@/components/auth/WalletConnectButton";

export default function TenantLoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 w-full max-w-md">

        <Link
          href="/login"
          className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
        >
          ← Back
        </Link>

        <div className="text-center my-8">
          <div className="text-5xl mb-4">🏠</div>
          <h1 className="text-3xl font-bold text-white">Tenant Sign In</h1>
          <p className="text-gray-400 mt-2 text-sm">
            Browse properties and manage your leases
          </p>
        </div>

        <WalletConnectButton role="TENANT" />

        {/* Info box */}
        <div className="mt-6 bg-blue-900/20 border border-blue-800/40 rounded-xl p-4">
          <p className="text-blue-400 text-xs font-medium mb-1">First time?</p>
          <p className="text-gray-400 text-xs leading-relaxed">
            A new tenant account will be created automatically using your wallet address.
          </p>
        </div>

      </div>
    </div>
  );
}