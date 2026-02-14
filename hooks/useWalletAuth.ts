// hooks/useWalletAuth.ts

"use client";

import { useState, useEffect } from "react";
import { useAccount, useDisconnect, useSignMessage } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { signIn, signOut, useSession } from "next-auth/react";
import { SiweMessage } from "siwe";

export function useWalletAuth() {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const { signMessageAsync } = useSignMessage();
  const { data: session, status } = useSession();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Auto sign-in after wallet connects ──
  useEffect(() => {
    if (isConnected && address && !session?.user && !isLoading) {
      // Wallet just connected but no session yet
      // Role will be determined by which login page they're on
    }
  }, [isConnected, address, session]);



  const connectAndSign = async (role: "LANDLORD" | "TENANT") => {
    setIsLoading(true);
    setError(null);

    try {
      if (!isConnected || !address) {
        openConnectModal?.();
        setIsLoading(false);
        return { needsConnection: true };
      }

      // ── Step 2: Get nonce ──
      console.log("Fetching nonce...");
      const nonceRes = await fetch("/api/auth/nonce");
      const { nonce } = await nonceRes.json();
      console.log("Got nonce:", nonce);

      // ── Step 3: Create SIWE message ──
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: `Sign in to Leasify as ${role}`,
        uri: window.location.origin,
        version: "1",
        chainId: chain?.id ?? 11155111,
        nonce,
      });

      const messageStr = message.prepareMessage();
      console.log("SIWE message:", messageStr);

      // ── Step 4: Sign ──
      console.log("Requesting signature...");
      const signature = await signMessageAsync({ message: messageStr });
      console.log("Got signature:", signature.slice(0, 20) + "...");

      // ── Step 5: Sign in ──
      console.log("Calling signIn with role:", role);
      const result = await signIn("credentials", {
        message: messageStr,
        signature,
        role,
        redirect: false,
      });

      console.log("SignIn result:", result);

      if (result?.error) {
        setError(result.error);
        return { error: true };
      }

      return { success: true, role };

    } catch (err: any) {
      console.error("connectAndSign error:", err);
      setError(err.message || "Failed to sign in");
      return { error: true };
    } finally {
      setIsLoading(false);
    }
  };


  const disconnectWallet = async () => {
    disconnect();
    await signOut({ redirect: false });
    window.location.href = "/login";
  };

  return {
    // Wallet state
    walletAddress: address ?? null,
    isConnected,
    isAuthenticated: !!session?.user,

    // Session state
    role: session?.user?.role ?? null,
    userId: session?.user?.id ?? null,

    // Auth state
    isLoading: isLoading || status === "loading",
    error,

    // Actions
    connectAndSign,
    disconnectWallet,
    openConnectModal,
    setError,
  };
}