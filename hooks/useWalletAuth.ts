// hooks/useWalletAuth.ts

"use client";

import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { SiweMessage } from "siwe";
import Web3 from "web3";

export function useWalletAuth() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (typeof window.ethereum === "undefined") {
        throw new Error("MetaMask not installed. Please install it to continue.");
      }

      const web3 = new Web3(window.ethereum);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      // ✅ THE FIX: convert to EIP-55 checksum address
      const address = web3.utils.toChecksumAddress(accounts[0]);

      const nonceRes = await fetch("/api/auth/nonce");
      const { nonce } = await nonceRes.json();

      const message = new SiweMessage({
        domain: window.location.host,
        address, // ✅ now checksummed
        statement: "Sign in to Leasify with your Ethereum wallet.",
        uri: window.location.origin,
        version: "1",
        chainId: 11155111,
        nonce,
      });

      const preparedMessage = message.prepareMessage();

      const signature = await web3.eth.personal.sign(
        preparedMessage,
        address,
        ""
      );

      const result = await signIn("credentials", {
        message: JSON.stringify(message),
        signature,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

    } catch (err: any) {
      setError(err.message || "Failed to connect wallet");
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = async () => {
    await signOut({ redirect: false });
  };

  return {
    session,
    status,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    isAuthenticated: status === "authenticated",
    walletAddress: session?.user?.walletAddress,
    role: session?.user?.role,
  };
}