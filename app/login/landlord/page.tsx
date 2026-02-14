// app/login/landlord/page.tsx

import Link from "next/link";
import WalletConnectButton from "@/components/auth/WalletConnectButton";

export default function LandlordLoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-gray-900 border border-purple-900/50 rounded-2xl p-10 w-full max-w-md">

        <Link
          href="/login"
          className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
        >
          ← Back
        </Link>

        <div className="text-center my-8">
          <div className="text-5xl mb-4">🔑</div>
          <h1 className="text-3xl font-bold text-white">Landlord Sign In</h1>
          <p className="text-gray-400 mt-2 text-sm">
            List properties and manage lease agreements
          </p>
        </div>

        <WalletConnectButton role="LANDLORD" />

        {/* Info box */}
        <div className="mt-6 bg-purple-900/20 border border-purple-800/40 rounded-xl p-4 space-y-2">
          <p className="text-purple-400 text-xs font-medium">First time?</p>
          <p className="text-gray-400 text-xs leading-relaxed">
            A new landlord account will be created automatically using your wallet address.
          </p>
          <p className="text-gray-500 text-xs leading-relaxed border-t border-purple-800/30 pt-2">
            ⚠️ Each wallet can only be registered under one role. Use a
            separate MetaMask wallet for your tenant account.
          </p>
        </div>

      </div>
    </div>
  );
}
