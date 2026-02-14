// components/property/AddPropertyForm.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddPropertyForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    monthlyRent: "",
    securityDeposit: "",
    minimumLeaseDuration: "",
    images: "",       // comma-separated URLs for now
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        monthlyRent: parseFloat(formData.monthlyRent),
        securityDeposit: parseFloat(formData.securityDeposit),
        minimumLeaseDuration: parseInt(formData.minimumLeaseDuration),
        images: formData.images
          ? formData.images.split(",").map((url) => url.trim())
          : [],
      };

      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create property");
      }

      router.push("/dashboard/landlord");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-400 rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Property Title
        </label>
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Modern Studio in Bandra"
          required
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the property..."
          required
          rows={4}
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 resize-none"
        />
      </div>

      {/* Location */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Location
        </label>
        <input
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="e.g. Bandra West, Mumbai"
          required
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Rent + Deposit */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Monthly Rent (ETH)
          </label>
          <input
            name="monthlyRent"
            type="number"
            step="0.001"
            min="0"
            value={formData.monthlyRent}
            onChange={handleChange}
            placeholder="0.05"
            required
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Security Deposit (ETH)
          </label>
          <input
            name="securityDeposit"
            type="number"
            step="0.001"
            min="0"
            value={formData.securityDeposit}
            onChange={handleChange}
            placeholder="0.1"
            required
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Minimum Duration */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Minimum Lease Duration (months)
        </label>
        <input
          name="minimumLeaseDuration"
          type="number"
          min="1"
          value={formData.minimumLeaseDuration}
          onChange={handleChange}
          placeholder="6"
          required
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Images */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Image URLs{" "}
          <span className="text-gray-500">(comma-separated, optional)</span>
        </label>
        <input
          name="images"
          value={formData.images}
          onChange={handleChange}
          placeholder="https://..., https://..."
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors"
      >
        {isLoading ? "Listing Property..." : "List Property"}
      </button>
    </form>
  );
}