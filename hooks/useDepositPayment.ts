// hooks/useDepositPayment.ts

"use client";

import { useState } from "react";
import { getClientWeb3, ensureSepoliaNetwork } from "@/utils/blockchain/web3Client";
import { LEASE_AGREEMENT_ABI } from "@/utils/blockchain/abis";

interface UseDepositPaymentProps {
    contractAddress: string;
    depositAmount: number;   // in ETH
    leaseId: string;
}

export function useDepositPayment({
    contractAddress,
    depositAmount,
    leaseId,
}: UseDepositPaymentProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [step, setStep] = useState<string>("");

    const payDeposit = async () => {
        setIsLoading(true);
        setError(null);
        setTxHash(null);

        try {
            // ── Step 1: Check network ──
            setStep("Checking network...");
            await ensureSepoliaNetwork();

            // ── Step 2: Get web3 + wallet ──
            setStep("Connecting wallet...");
            const web3 = getClientWeb3();
            const accounts = await window.ethereum!.request({
                method: "eth_requestAccounts",
            });
            const tenantAddress = web3.utils.toChecksumAddress(accounts[0]);

            // ── Step 3: Get contract instance ──
            const leaseContract = new web3.eth.Contract(
                LEASE_AGREEMENT_ABI as any,
                contractAddress
            );

            // ── Step 4: Verify contract status is AWAITING_DEPOSIT ──
            setStep("Verifying contract state...");
            const contractStatus = await leaseContract.methods.status().call() as string;
            if (contractStatus.toString() !== "0") {
                throw new Error(
                    "Contract is not awaiting deposit. It may already be active."
                );
            }

            // ── Step 5: Convert ETH to Wei ──
            const depositWei = web3.utils.toWei(
                depositAmount.toString(),
                "ether"
            );

            // ── Step 6: Estimate gas ──
            setStep("Estimating gas...");
            const gasEstimate = await leaseContract.methods
                .payDeposit()
                .estimateGas({
                    from: tenantAddress,
                    value: depositWei,
                });

            // ── Step 7: Send transaction via MetaMask ──
            setStep("Waiting for MetaMask confirmation...");

            const tx = await leaseContract.methods.payDeposit().send({
                from: tenantAddress,
                value: depositWei,
                gas: Math.round(Number(gasEstimate) * 1.2).toString(),
            });

            const hash = tx.transactionHash as string;
            setTxHash(hash);

            // ── Step 8: Notify backend to update MongoDB ──
            setStep("Confirming on-chain...");

            const res = await fetch("/api/lease/confirm-deposit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    leaseId,
                    transactionHash: hash,
                    contractAddress,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to confirm deposit");
            }

            setStep("Deposit confirmed!");
            return { success: true, txHash: hash };

        } catch (err: any) {
            // MetaMask rejection
            if (
                err.code === 4001 ||
                err.message?.includes("User denied") ||
                err.message?.includes("rejected")
            ) {
                setError("Transaction rejected in MetaMask.");
            } else {
                setError(err.message || "Failed to pay deposit");
            }
            return { success: false };
        } finally {
            setIsLoading(false);
        }
    };

    return { payDeposit, isLoading, error, txHash, step };
}