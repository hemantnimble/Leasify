// app/properties/[id]/request/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useWalletAuth } from "@/hooks/useWalletAuth";

interface Property {
  id: string;
  title: string;
  location: string;
  monthlyRent: number;
  securityDeposit: number;
  minimumLeaseDuration: number;
  images: string[];
}

export default function LeaseRequestPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated, role } = useWalletAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoadingProperty, setIsLoadingProperty] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [startDate, setStartDate] = useState("");
  const [durationMonths, setDurationMonths] = useState("");

  // Fetch property details
  useEffect(() => {
    if (!id) return;
    fetch(`/api/properties/${id}`)
      .then((res) => res.json())
      .then((data) => setProperty(data.property))
      .finally(() => setIsLoadingProperty(false));
  }, [id]);

  // Calculated values
  const totalRent = property
    ? property.monthlyRent * parseInt(durationMonths || "0")
    : 0;

  const endDate =
    startDate && durationMonths
      ? (() => {
          const d = new Date(startDate);
          d.setMonth(d.getMonth() + parseInt(durationMonths));
          return d.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
        })()
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/lease/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: id,
          startDate,
          durationMonths: parseInt(durationMonths),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit lease request");
      }

      // Success — go to tenant dashboard
      router.push("/dashboard/tenant?requested=true");

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Guards
  if (!isAuthenticated) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Please connect your wallet first</p>
        <Link href="/login" className="text-blue-400 mt-4 inline-block">
          Go to Login →
        </Link>
      </div>
    );
  }

  if (role !== "TENANT") {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Only tenants can request leases</p>
      </div>
    );
  }

  if (isLoadingProperty) {
    return (
      <div className="text-center py-20 text-gray-500">
        Loading property...
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Property not found</p>
        <Link href="/properties" className="text-blue-400 mt-4 inline-block">
          ← Back to listings
        </Link>
      </div>
    );
  }

  // Minimum start date is today
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href={`/properties/${id}`}
        className="text-gray-400 hover:text-white text-sm transition-colors"
      >
        ← Back to property
      </Link>

      <div className="mt-6">
        <h1 className="text-3xl font-bold text-white">Request a Lease</h1>
        <p className="text-gray-400 mt-1">
          Submit your request — the landlord will accept or reject it
        </p>
      </div>

      {/* Property Summary */}
      <div className="mt-6 bg-gray-900 border border-gray-800 rounded-2xl p-5 flex gap-4 items-center">
        <div className="w-16 h-16 bg-gray-800 rounded-xl overflow-hidden flex-shrink-0">
          {property.images.length > 0 ? (
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">
              🏠
            </div>
          )}
        </div>
        <div>
          <p className="text-white font-semibold">{property.title}</p>
          <p className="text-gray-400 text-sm">📍 {property.location}</p>
          <p className="text-blue-400 text-sm font-medium mt-1">
            {property.monthlyRent} ETH/month
          </p>
        </div>
      </div>

      {/* Lease Request Form */}
      <form
        onSubmit={handleSubmit}
        className="mt-6 bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-6"
      >
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-400 rounded-lg p-4 text-sm">
            {error}
          </div>
        )}

        {/* Start Date */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Lease Start Date
          </label>
          <input
            type="date"
            value={startDate}
            min={today}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Duration (months)
            <span className="text-gray-500 ml-2 font-normal">
              Minimum: {property.minimumLeaseDuration} months
            </span>
          </label>
          <input
            type="number"
            value={durationMonths}
            min={property.minimumLeaseDuration}
            max={36}
            onChange={(e) => setDurationMonths(e.target.value)}
            placeholder={`${property.minimumLeaseDuration}`}
            required
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Lease Summary — shows once both fields filled */}
        {startDate && durationMonths && parseInt(durationMonths) >= property.minimumLeaseDuration && (
          <div className="bg-blue-900/20 border border-blue-800/40 rounded-xl p-5 space-y-3">
            <p className="text-blue-400 text-sm font-semibold">Lease Summary</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Start Date</span>
                <span className="text-white">
                  {new Date(startDate).toLocaleDateString("en-IN", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">End Date</span>
                <span className="text-white">{endDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Monthly Rent</span>
                <span className="text-white">{property.monthlyRent} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Security Deposit</span>
                <span className="text-white">{property.securityDeposit} ETH</span>
              </div>
              <div className="border-t border-blue-800/40 pt-2 flex justify-between font-medium">
                <span className="text-gray-300">Total Rent ({durationMonths} months)</span>
                <span className="text-blue-400">{totalRent.toFixed(4)} ETH</span>
              </div>
            </div>
          </div>
        )}

        {/* Terms note */}
        <p className="text-gray-500 text-xs leading-relaxed">
          By submitting, you agree that if accepted, a smart contract will be
          deployed on Sepolia testnet to hold your security deposit and enforce
          lease terms. The deposit of{" "}
          <span className="text-gray-300">{property.securityDeposit} ETH</span>{" "}
          will be required to activate the lease.
        </p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors"
        >
          {isSubmitting ? "Submitting Request..." : "Submit Lease Request"}
        </button>
      </form>
    </div>
  );
}