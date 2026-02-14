// components/blockchain/PayRentButton.tsx

"use client";

import { useState } from "react";
import { useRentPayment } from "@/hooks/useRentPayment";

interface Payment {
    id: string;
    amount: number;
    dueDate: string;
    status: string;
}

interface PayRentButtonProps {
    leaseId: string;
    contractAddress: string;
    monthlyRent: number;
    currentPayment: Payment;
    onSuccess: () => void;
}

export default function PayRentButton({
    leaseId,
    contractAddress,
    monthlyRent,
    currentPayment,
    onSuccess,
}: PayRentButtonProps) {
    const [showConfirm, setShowConfirm] = useState(false);

    const { payRent, isLoading, error, txHash, step } = useRentPayment({
        contractAddress,
        monthlyRent,
        leaseId,
        paymentId: currentPayment.id,
    });

    const handleConfirm = async () => {
        setShowConfirm(false);
        const result = await payRent();
        if (result.success) onSuccess();
    };

    const dueDate = new Date(currentPayment.dueDate);
    const isOverdue = new Date() > dueDate;
    const daysUntil = Math.ceil(
        (dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    // Already paid
    if (currentPayment.status === "PAID" || currentPayment.status === "LATE") {
        return (
            <div className="bg-green-900/20 border border-green-800/40 rounded-xl p-4">
                <p className="text-green-400 text-sm font-medium">
                    ✅ Rent Paid
                </p>
                <p className="text-gray-400 text-xs mt-1">
                    {new Date(currentPayment.dueDate).toLocaleDateString()}
                </p>
            </div>
        );
    }

    // Success state
    if (txHash) {
        return (
            <div className="bg-green-900/20 border border-green-700 rounded-xl p-4">
                <p className="text-green-400 font-medium text-sm mb-1">
                    ✅ Rent Paid Successfully!
                </p>
                <a
                    href={`https://sepolia.etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 text-xs hover:underline"
                >
                    View transaction ↗
                </a>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Error */}
            {error && (
                <div className="bg-red-900/30 border border-red-700 text-red-400 rounded-lg p-3 text-xs">
                    {error}
                </div>
            )}

            {/* Confirm Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-sm w-full">
                        <h3 className="text-white font-bold text-xl mb-2">
                            Confirm Rent Payment
                        </h3>

                        {isOverdue && (
                            <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 mb-4">
                                <p className="text-red-400 text-sm font-medium">
                                    ⚠️ Late Payment
                                </p>
                                <p className="text-gray-400 text-xs mt-1">
                                    A late fee penalty will be recorded against your deposit.
                                </p>
                            </div>
                        )}

                        <div className="bg-gray-800 rounded-xl p-4 mb-6 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Rent Amount</span>
                                <span className="text-white font-medium">
                                    {monthlyRent} ETH
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Due Date</span>
                                <span className={isOverdue ? "text-red-400" : "text-white"}>
                                    {dueDate.toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Recipient</span>
                                <span className="text-white">Landlord (direct)</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Network</span>
                                <span className="text-white">Sepolia Testnet</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
                            >
                                Confirm & Pay
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rent Due Card */}
            <div className={`border rounded-xl p-4 ${isOverdue
                    ? "bg-red-900/20 border-red-800/40"
                    : "bg-blue-900/20 border-blue-800/40"
                }`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className={`text-sm font-medium ${isOverdue ? "text-red-400" : "text-blue-400"
                            }`}>
                            {isOverdue ? "⚠️ Rent Overdue" : "💳 Rent Due"}
                        </p>
                        <p className="text-white font-semibold text-lg mt-0.5">
                            {monthlyRent} ETH
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                            {isOverdue
                                ? `Was due ${dueDate.toLocaleDateString()}`
                                : daysUntil <= 3
                                    ? `Due in ${daysUntil} day${daysUntil === 1 ? "" : "s"}`
                                    : `Due ${dueDate.toLocaleDateString()}`}
                        </p>
                        {isLoading && step && (
                            <p className="text-yellow-400 text-xs mt-1 flex items-center gap-1">
                                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                                {step}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={() => setShowConfirm(true)}
                        disabled={isLoading}
                        className={`text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 disabled:cursor-not-allowed ${isOverdue
                                ? "bg-red-600 hover:bg-red-700 disabled:bg-red-900"
                                : "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900"
                            }`}
                    >
                        {isLoading ? (
                            <>
                                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing...
                            </>
                        ) : (
                            "Pay Rent →"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}