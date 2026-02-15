// hooks/useWalletAuth.ts

"use client";

import { useState, useEffect }         from "react";
import { useAccount, useDisconnect,
         useSignMessage }              from "wagmi";
import { useConnectModal }             from "@rainbow-me/rainbowkit";
import { signIn, signOut, useSession } from "next-auth/react";
import { SiweMessage }                 from "siwe";

export function useWalletAuth() {
  const { address, isConnected, chain } = useAccount();
  const { disconnect }                  = useDisconnect();
  const { openConnectModal }            = useConnectModal();
  const { signMessageAsync }            = useSignMessage();
  const { data: session, status }       = useSession();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  // ── Core sign-in logic (reused by both flows) ──
  const signInWithWallet = async (
    role:          "LANDLORD" | "TENANT",
    walletAddress: string
  ): Promise<{ success?: boolean; error?: boolean; role?: string }> => {
    try {
      // Step 1: Get nonce
      const nonceRes = await fetch("/api/auth/nonce");
      if (!nonceRes.ok) throw new Error("Failed to fetch nonce");
      const { nonce } = await nonceRes.json();
      console.log("Got nonce:", nonce);

      // Step 2: Build SIWE message
      const message = new SiweMessage({
        domain:    window.location.host,
        address:   walletAddress,
        statement: `Sign in to Leasify as ${role}`,
        uri:       window.location.origin,
        version:   "1",
        chainId:   chain?.id ?? 11155111,
        nonce,
      });

      const messageStr = message.prepareMessage();
      console.log("Requesting signature...");

      // Step 3: Sign via wagmi (works with ANY connected wallet)
      const signature = await signMessageAsync({ message: messageStr });
      console.log("Signature obtained");

      // Step 4: Verify via NextAuth
      const result = await signIn("credentials", {
        message:   messageStr,
        signature,
        role,
        redirect:  false,
      });

      console.log("SignIn result:", result);

      if (result?.error) {
        // Role mismatch handling
        if (result.error.includes("ROLE_MISMATCH")) {
          const existingRole = result.error.includes("LANDLORD")
            ? "LANDLORD"
            : "TENANT";
          setError(
            `This wallet is registered as a ${existingRole}. ` +
            `Please use the ${existingRole} login page.`
          );
          await signOut({ redirect: false });
          return { error: true };
        }
        setError("Sign in failed. Please try again.");
        return { error: true };
      }

      return { success: true, role };

    } catch (err: any) {
      console.error("signInWithWallet error:", err);
      if (
        err.message?.includes("User rejected") ||
        err.message?.includes("rejected")      ||
        err.code === 4001
      ) {
        setError("Signature rejected. Please try again.");
      } else {
        setError(err.message || "Failed to sign in");
      }
      return { error: true };
    }
  };

  // ── Auto sign-in after wallet connects (if pending role stored) ──
  useEffect(() => {
    const pendingRole = sessionStorage.getItem("pendingLoginRole") as
      | "LANDLORD"
      | "TENANT"
      | null;

    if (
      isConnected    &&
      address        &&
      pendingRole    &&
      !session?.user &&
      !isLoading
    ) {
      sessionStorage.removeItem("pendingLoginRole");
      setIsLoading(true);
      signInWithWallet(pendingRole, address).finally(() =>
        setIsLoading(false)
      );
    }
  }, [isConnected, address]);

  // ── Main one-click connect + sign ──
  const connectAndSign = async (
    role: "LANDLORD" | "TENANT"
  ): Promise<{ success?: boolean; error?: boolean; needsConnection?: boolean; role?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      // Not connected → open modal, auto-sign after connection
      if (!isConnected || !address) {
        sessionStorage.setItem("pendingLoginRole", role);
        openConnectModal?.();
        setIsLoading(false);
        return { needsConnection: true };
      }

      // Already connected → sign immediately
      return await signInWithWallet(role, address);

    } catch (err: any) {
      console.error("connectAndSign error:", err);
      setError(err.message || "Failed to connect");
      return { error: true };
    } finally {
      // Only clear loading if we didn't open the modal
      if (isConnected && address) {
        setIsLoading(false);
      }
    }
  };

  // ── Disconnect ──
  const disconnectWallet = async () => {
    disconnect();
    await signOut({ redirect: false });
    window.location.href = "/login";
  };

  return {
    // Wallet state
    walletAddress:   address ?? null,
    isConnected,
    isAuthenticated: !!session?.user?.walletAddress,

    // Session
    role:   session?.user?.role   ?? null,
    userId: session?.user?.userId ?? null,

    // Loading / error
    isLoading: isLoading || status === "loading",
    error,
    setError,

    // Actions
    connectAndSign,
    disconnectWallet,
    openConnectModal,
  };
}