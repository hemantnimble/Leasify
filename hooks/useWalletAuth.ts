"use client";

// hooks/useWalletAuth.ts

import { useState } from "react";
import { signIn, signOut, useSession, getSession } from "next-auth/react";
import { SiweMessage } from "siwe";
import Web3 from "web3";

export function useWalletAuth() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Treat sessions with a role mismatch error as NOT authenticated
  const hasRoleMismatch = !!(session?.user as any)?.error?.startsWith("ROLE_MISMATCH");
  const isAuthenticated = status === "authenticated" && !hasRoleMismatch;

  const connectWallet = async (role: "LANDLORD" | "TENANT" = "TENANT") => {
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

      const address = web3.utils.toChecksumAddress(accounts[0]);

      const nonceRes = await fetch("/api/auth/nonce");
      const { nonce } = await nonceRes.json();

      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: `Sign in to Leasify as ${role}.`,
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
        role,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Authentication failed. Please try again.");
      }

      // Check session immediately for role mismatch BEFORE redirect can happen
      const freshSession = await getSession();
      const sessionError = (freshSession?.user as any)?.error;

      if (sessionError?.startsWith("ROLE_MISMATCH")) {
        const actualRole = sessionError.split(":")[1];

        // Sign out immediately so session is cleared
        await signOut({ redirect: false });

        if (actualRole === "TENANT") {
          throw new Error(
            "This wallet is registered as a Tenant. Use the Tenant login page or a different wallet."
          );
        }
        if (actualRole === "LANDLORD") {
          throw new Error(
            "This wallet is registered as a Landlord. Use the Landlord login page or a different wallet."
          );
        }
        throw new Error("Role mismatch. Please use the correct login page.");
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
    isAuthenticated,
    walletAddress: session?.user?.walletAddress,
    role: session?.user?.role,
  };
}