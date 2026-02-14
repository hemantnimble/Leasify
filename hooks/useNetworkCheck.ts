// hooks/useNetworkCheck.ts

"use client";

import { useState, useEffect } from "react";

const SEPOLIA_CHAIN_ID = "0xaa36a7";

export function useNetworkCheck() {
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    checkNetwork();

    // Listen for network changes
    if (window.ethereum) {
      window.ethereum.on("chainChanged", checkNetwork);
      return () => {
        window.ethereum?.removeListener("chainChanged", checkNetwork);
      };
    }
  }, []);

  const checkNetwork = async () => {
    if (!window.ethereum) return;
    const chainId = await window.ethereum.request({
      method: "eth_chainId",
    });
    setIsCorrectNetwork(chainId === SEPOLIA_CHAIN_ID);
  };

  const switchToSepolia = async () => {
    if (!window.ethereum) return;
    setIsSwitching(true);
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (error) {
      console.error("Failed to switch network:", error);
    } finally {
      setIsSwitching(false);
    }
  };

  return { isCorrectNetwork, isSwitching, switchToSepolia };
}