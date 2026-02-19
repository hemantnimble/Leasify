// hooks/useRentPayment.ts

"use client";

import { useState } from "react";
import { getClientWeb3, ensureSepoliaNetwork } from "@/utils/blockchain/web3Client";
import { LEASE_AGREEMENT_ABI } from "@/utils/blockchain/abis";

interface UseRentPaymentProps {
    contractAddress: string;
    monthlyRent: number;    // in ETH
    leaseId: string;
    paymentId: string;
}

export function useRentPayment({
    contractAddress,
    monthlyRent,
    leaseId,
    paymentId,
}: UseRentPaymentProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [step, setStep] = useState<string>("");

    const payRent = async () => {
        setIsLoading(true);
        setError(null);
        setTxHash(null);

        try {
            // ── Step 1: Network check ──
            setStep("Checking network...");
            await ensureSepoliaNetwork();

            // ── Step 2: Get wallet — works for MetaMask + WalletConnect ──
            setStep("Connecting wallet...");
            const provider = (window as any).ethereum;
            if (!provider) {
                throw new Error("No wallet connected. Please connect your wallet first.");
            }
            const web3 = getClientWeb3();

            let accounts: string[];
            try {
                accounts = await provider.request({ method: "eth_requestAccounts" });
            } catch {
                accounts = await web3.eth.getAccounts();
            }

            if (!accounts || accounts.length === 0) {
                throw new Error("No account found. Please connect your wallet.");
            }

            const tenantAddress = web3.utils.toChecksumAddress(accounts[0]);

            // ── Step 3: Get contract ──
            const leaseContract = new web3.eth.Contract(
                LEASE_AGREEMENT_ABI as any,
                contractAddress
            );

            // ── Step 4: Verify lease is ACTIVE ──
            setStep("Verifying contract state...");
            const contractStatus = await leaseContract.methods.status().call() as string;
            if (contractStatus.toString() !== "1") {
                throw new Error("Lease is not active. Cannot pay rent.");
            }

            // ── Step 5: Check if late ──
            const isLate = await leaseContract.methods.isRentOverdue().call();
            const penalty = await leaseContract.methods.getCurrentPenalty().call();
            const penaltyEth = Number(penalty) / 1e18;

            if (isLate) {
                setStep(`Late payment — ${penaltyEth.toFixed(6)} ETH penalty will be recorded`);
                await new Promise((r) => setTimeout(r, 2000));
            }

            // ── Step 6: Convert ETH to Wei ──
            const rentWei = web3.utils.toWei(monthlyRent.toString(), "ether");

            // ── Step 7: Estimate gas ──
            setStep("Estimating gas...");
            const gasEstimate = await leaseContract.methods
                .payRent()
                .estimateGas({
                    from: tenantAddress,
                    value: rentWei,
                });

            // ── Step 8: Send transaction ──
            setStep("Waiting for wallet confirmation...");
            const tx = await leaseContract.methods.payRent().send({
                from: tenantAddress,
                value: rentWei,
                gas: Math.round(Number(gasEstimate) * 1.2).toString(),
            });

            const hash = tx.transactionHash as string;
            setTxHash(hash);

            // ── Step 9: Notify backend ──
            setStep("Recording payment...");
            const res = await fetch("/api/lease/pay-rent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    leaseId,
                    paymentId,
                    transactionHash: hash,
                    contractAddress,
                    penaltyAmount: isLate ? penaltyEth : 0,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to record payment");

            setStep("Payment confirmed!");
            return { success: true, txHash: hash };

        } catch (err: any) {
            if (
                err.code === 4001 ||
                err.message?.includes("User denied") ||
                err.message?.includes("rejected")
            ) {
                setError("Transaction rejected.");
            } else {
                setError(err.message || "Failed to pay rent");
            }
            return { success: false };
        } finally {
            setIsLoading(false);
        }
    };

    return { payRent, isLoading, error, txHash, step };
}