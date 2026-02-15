// app/page.tsx

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="text-center py-20">
      <h1 className="text-5xl font-bold text-white mb-4">
        Rental Agreements on the Blockchain
      </h1>
      <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-10">
        Leasify makes rental agreements transparent, tamper-proof, and automatic.
        Deposits held in smart contracts. No middlemen.
      </p>
      <div className="flex gap-4 justify-center">
        <Link
          href="/properties"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
        >
          Browse Properties
        </Link>
        <Link
          href="/login"
          className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
        >
          Connect Wallet
        </Link>
      </div>
    </div>
  );
}
