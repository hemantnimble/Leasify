// hooks/useLeaseCompletion.ts

"use client";

import { useState } from "react";
import { getClientWeb3, ensureSepoliaNetwork } from "@/utils/blockchain/web3Client";
import { LEASE_AGREEMENT_ABI } from "@/utils/blockchain/abis";

interface UseLeaseCompletionProps {
  contractAddress: string;
  leaseId: string;
}

export function useLeaseCompletion({
  contractAddress,
  leaseId,
}: UseLeaseCompletionProps) {
  const [isLoading, setIsLoading]             = useState(false);
  const [error, setError]                     = useState<string | null>(null);
  const [txHash, setTxHash]                   = useState<string | null>(null);
  const [step, setStep]                       = useState<string>("");

  // ── Complete lease after endDate ──
  const completeLease = async () => {
    setIsLoading(true);
    setError(null);
    setTxHash(null);

    try {
      setStep("Checking network...");
      await ensureSepoliaNetwork();

      setStep("Connecting wallet...");
      const web3     = getClientWeb3();
      const accounts = await window.ethereum!.request({
        method: "eth_requestAccounts",
      });
      const callerAddress = web3.utils.toChecksumAddress(accounts[0]);

      const leaseContract = new web3.eth.Contract(
        LEASE_AGREEMENT_ABI as any,
        contractAddress
      );

      // Verify contract is ACTIVE
      setStep("Verifying contract state...");
      const contractStatus = await leaseContract.methods
        .status()
        .call() as string;

      if (contractStatus.toString() !== "1") {
        throw new Error("Lease is not active.");
      }

      // Estimate gas
      setStep("Estimating gas...");
      const gasEstimate = await leaseContract.methods
        .completeLease()
        .estimateGas({ from: callerAddress });

      // Send tx
      setStep("Waiting for MetaMask confirmation...");
      const tx = await leaseContract.methods.completeLease().send({
        from: callerAddress,
        gas: Math.round(Number(gasEstimate) * 1.2).toString(),
      });

      const hash = tx.transactionHash as string;
      setTxHash(hash);

      // Notify backend
      setStep("Finalizing lease...");
      const res = await fetch("/api/lease/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaseId, transactionHash: hash }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to complete lease");

      setStep("Lease completed!");
      return { success: true, txHash: hash };

    } catch (err: any) {
      if (
        err.code === 4001 ||
        err.message?.includes("User denied") ||
        err.message?.includes("rejected")
      ) {
        setError("Transaction rejected in MetaMask.");
      } else {
        setError(err.message || "Failed to complete lease");
      }
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  // ── Early termination ──
  const agreeToTerminate = async () => {
    setIsLoading(true);
    setError(null);
    setTxHash(null);

    try {
      setStep("Checking network...");
      await ensureSepoliaNetwork();

      setStep("Connecting wallet...");
      const web3     = getClientWeb3();
      const accounts = await window.ethereum!.request({
        method: "eth_requestAccounts",
      });
      const callerAddress = web3.utils.toChecksumAddress(accounts[0]);

      const leaseContract = new web3.eth.Contract(
        LEASE_AGREEMENT_ABI as any,
        contractAddress
      );

      setStep("Estimating gas...");
      const gasEstimate = await leaseContract.methods
        .agreeToEarlyTermination()
        .estimateGas({ from: callerAddress });

      setStep("Waiting for MetaMask confirmation...");
      const tx = await leaseContract.methods
        .agreeToEarlyTermination()
        .send({
          from: callerAddress,
          gas: Math.round(Number(gasEstimate) * 1.2).toString(),
        });

      const hash = tx.transactionHash as string;
      setTxHash(hash);

      // Notify backend
      setStep("Recording termination agreement...");
      const res = await fetch("/api/lease/terminate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaseId, transactionHash: hash }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to record termination");

      setStep(data.bothAgreed ? "Lease terminated!" : "Agreement recorded. Waiting for other party.");
      return { success: true, txHash: hash, bothAgreed: data.bothAgreed };

    } catch (err: any) {
      if (
        err.code === 4001 ||
        err.message?.includes("User denied") ||
        err.message?.includes("rejected")
      ) {
        setError("Transaction rejected in MetaMask.");
      } else {
        setError(err.message || "Failed to agree to termination");
      }
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    completeLease,
    agreeToTerminate,
    isLoading,
    error,
    txHash,
    step,
  };
}