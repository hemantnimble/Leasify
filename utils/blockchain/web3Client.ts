// utils/blockchain/web3Client.ts

"use client";

import Web3 from "web3";
import { LEASE_FACTORY_ABI, LEASE_AGREEMENT_ABI, LEASE_FACTORY_ADDRESS } from "./abis";

// ─── Client-side Web3 (uses MetaMask) ───

export function getClientWeb3(): Web3 {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask not found");
  }
  return new Web3(window.ethereum as any);
}

// ─── Get connected wallet address ───

export async function getConnectedAddress(): Promise<string> {
  const web3 = getClientWeb3();
  const accounts = await web3.eth.getAccounts();
  if (!accounts || accounts.length === 0) {
    throw new Error("No wallet connected");
  }
  return web3.utils.toChecksumAddress(accounts[0]);
}

// ─── Get LeaseFactory contract (client side) ───

export function getClientFactoryContract() {
  const web3 = getClientWeb3();
  return new web3.eth.Contract(
    LEASE_FACTORY_ABI as any,
    LEASE_FACTORY_ADDRESS
  );
}

// ─── Get LeaseAgreement contract (client side) ───

export function getClientLeaseContract(contractAddress: string) {
  const web3 = getClientWeb3();
  return new web3.eth.Contract(
    LEASE_AGREEMENT_ABI as any,
    contractAddress
  );
}

// ─── Switch network to Sepolia if needed ───

export async function ensureSepoliaNetwork(): Promise<void> {
  if (!window.ethereum) throw new Error("MetaMask not found");

  const chainId = await window.ethereum.request({ method: "eth_chainId" });

  if (chainId !== "0xaa36a7") {
    // 0xaa36a7 = 11155111 = Sepolia
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }],
      });
    } catch (error: any) {
      throw new Error(
        "Please switch to Sepolia network in MetaMask"
      );
    }
  }
}


// utils/blockchain/web3Client.ts
// Add this new function at the bottom:

export async function getTerminationStatus(contractAddress: string): Promise<{
  landlordAgreed: boolean;
  tenantAgreed: boolean;
}> {
  try {
    const web3 = getClientWeb3();
    const contract = new web3.eth.Contract(
      LEASE_AGREEMENT_ABI as any,
      contractAddress
    );

    const [landlordAgreed, tenantAgreed] = await Promise.all([
      contract.methods.landlordAgreesToTerminate().call() as Promise<boolean>,
      contract.methods.tenantAgreesToTerminate().call() as Promise<boolean>,
    ]);

    return {
      landlordAgreed: Boolean(landlordAgreed),
      tenantAgreed: Boolean(tenantAgreed),
    };
  } catch {
    return { landlordAgreed: false, tenantAgreed: false };
  }
}