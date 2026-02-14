// app/dashboard/landlord/add/page.tsx

import AddPropertyForm from "@/components/property/AddPropertyForm";
import Link from "next/link";

export default function AddPropertyPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href="/dashboard/landlord"
          className="text-gray-400 hover:text-white text-sm transition-colors"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-white mt-4">List a Property</h1>
        <p className="text-gray-400 mt-1">
          Fill in the details. Blockchain contract is created when a tenant's lease request is accepted.
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
        <AddPropertyForm />
      </div>
    </div>
  );
}