// app/login/page.tsx

import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white">Welcome to Leasify</h1>
          <p className="text-gray-400 mt-3">
            Choose how you want to sign in
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-2 gap-4">

          {/* Tenant Card */}
          <Link
            href="/login/tenant"
            className="group bg-gray-900 border border-gray-800 hover:border-blue-600 rounded-2xl p-8 text-center transition-all duration-200 hover:bg-gray-900/80"
          >
            <div className="text-5xl mb-4">🏠</div>
            <h2 className="text-white font-bold text-xl mb-2">Tenant</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Browse properties and sign lease agreements
            </p>
            <div className="mt-6 bg-blue-600 group-hover:bg-blue-500 text-white text-sm font-medium py-2 px-4 rounded-xl transition-colors">
              Sign in as Tenant
            </div>
          </Link>

          {/* Landlord Card */}
          <Link
            href="/login/landlord"
            className="group bg-gray-900 border border-gray-800 hover:border-purple-600 rounded-2xl p-8 text-center transition-all duration-200 hover:bg-gray-900/80"
          >
            <div className="text-5xl mb-4">🔑</div>
            <h2 className="text-white font-bold text-xl mb-2">Landlord</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              List properties and manage lease agreements
            </p>
            <div className="mt-6 bg-purple-600 group-hover:bg-purple-500 text-white text-sm font-medium py-2 px-4 rounded-xl transition-colors">
              Sign in as Landlord
            </div>
          </Link>

        </div>

        <p className="text-center text-gray-600 text-xs mt-8">
          Signing in requires MetaMask. Your wallet address is your identity — no password needed.
        </p>
      </div>
    </div>
  );
}