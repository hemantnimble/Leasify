"use client";

// hooks/useWalletAuth.ts

import { useState, useEffect, useRef } from "react";
import { signIn, signOut, useSession, getSession } from "next-auth/react";
import { SiweMessage } from "siwe";
import Web3 from "web3";
import { useAccount, useConnectorClient } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export function useWalletAuth() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // wagmi — gives us the connected address & connector
  const { address, isConnected, connector } = useAccount();
  const { openConnectModal } = useConnectModal();

  // We store the pending role so we can complete SIWE after the modal connects
  const pendingRoleRef = useRef<"LANDLORD" | "TENANT" | null>(null);
  const signingRef = useRef(false); // prevent double-fire

  // Treat sessions with a role mismatch error as NOT authenticated
  const hasRoleMismatch = !!(session?.user as any)?.error?.startsWith("ROLE_MISMATCH");
  const isAuthenticated = status === "authenticated" && !hasRoleMismatch;

  // ── Core SIWE signing — works with ANY wagmi-connected wallet ──
  const performSiweSign = async (role: "LANDLORD" | "TENANT") => {
    if (signingRef.current) return;
    signingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      // Get provider from the active wagmi connector
      // This works for MetaMask on desktop AND WalletConnect on mobile
      let provider: any;

      if (connector) {
        try {
          // wagmi v2 — getProvider via connector
          provider = await connector.getProvider();
        } catch {
          // fallback to window.ethereum (desktop MetaMask)
          provider = (window as any).ethereum;
        }
      } else {
        provider = (window as any).ethereum;
      }

      if (!provider) {
        throw new Error("No wallet provider found. Please connect your wallet first.");
      }

      const web3 = new Web3(provider as any);

      // Request accounts — on mobile this is a no-op since already connected via RainbowKit
      let accounts: string[];
      try {
        accounts = await provider.request({ method: "eth_requestAccounts" });
      } catch {
        accounts = await web3.eth.getAccounts();
      }

      if (!accounts || accounts.length === 0) {
        throw new Error("No account found. Please connect your wallet first.");
      }

      const walletAddress = web3.utils.toChecksumAddress(accounts[0]);

      // Fetch nonce
      const nonceRes = await fetch("/api/auth/nonce");
      const { nonce } = await nonceRes.json();

      // Build SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address: walletAddress,
        statement: `Sign in to Leasify as ${role}.`,
        uri: window.location.origin,
        version: "1",
        chainId: 11155111,
        nonce,
      });

      const preparedMessage = message.prepareMessage();

      // Sign — web3.eth.personal.sign works for both MetaMask and WalletConnect
      const signature = await web3.eth.personal.sign(preparedMessage, walletAddress, "");

      // Submit to NextAuth
      const result = await signIn("credentials", {
        message: JSON.stringify(message),
        signature,
        role,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Authentication failed. Please try again.");
      }

      // Check for role mismatch
      const freshSession = await getSession();
      const sessionError = (freshSession?.user as any)?.error;

      if (sessionError?.startsWith("ROLE_MISMATCH")) {
        const actualRole = sessionError.split(":")[1];
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
      signingRef.current = false;
      pendingRoleRef.current = null;
    }
  };

  // ── Watch for wallet connection after modal opens ──
  // When user connects via RainbowKit modal (mobile WalletConnect), isConnected flips to true.
  // We then auto-trigger SIWE signing.
  useEffect(() => {
    if (isConnected && pendingRoleRef.current && !signingRef.current && !isAuthenticated) {
      const role = pendingRoleRef.current;
      // Small delay to let wagmi settle the connector state
      setTimeout(() => performSiweSign(role), 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  // ── Public connectWallet — called by the button ──
  const connectWallet = async (role: "LANDLORD" | "TENANT" = "TENANT") => {
    setError(null);
    pendingRoleRef.current = role;

    if (isConnected) {
      // Already connected (e.g. desktop MetaMask or returning user) — sign immediately
      await performSiweSign(role);
    } else {
      // Not connected yet — open RainbowKit modal (works on mobile via WalletConnect)
      // The useEffect above will trigger signing once the modal completes
      setIsLoading(true); // show loading while modal is open
      if (openConnectModal) {
        openConnectModal();
      } else {
        setError("Could not open wallet modal. Please refresh and try again.");
        setIsLoading(false);
      }
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