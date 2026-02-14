// utils/blockchain/web3Client.ts

"use client";

import Web3 from "web3";
import {
  LEASE_FACTORY_ABI,
  LEASE_AGREEMENT_ABI,
  LEASE_FACTORY_ADDRESS,
} from "./abis";

// ── Get Web3 from ANY connected wallet (not just MetaMask) ──
export function getClientWeb3(): Web3 {
  if (typeof window === "undefined") {
    throw new Error("Not in browser environment");
  }

  // wagmi/RainbowKit injects the provider into window.ethereum
  // for the currently connected wallet — works for ALL wallets
  const provider = (window as any).ethereum;

  if (!provider) {
    throw new Error(
      "No wallet connected. Please connect your wallet first."
    );
  }

  return new Web3(provider);
}

// ── Get connected address ──
export async function getConnectedAddress(): Promise<string> {
  const web3     = getClientWeb3();
  const accounts = await web3.eth.getAccounts();

  if (!accounts || accounts.length === 0) {
    throw new Error("No wallet connected");
  }

  return web3.utils.toChecksumAddress(accounts[0]);
}

// ── Get LeaseFactory contract ──
export function getClientFactoryContract() {
  const web3 = getClientWeb3();
  return new web3.eth.Contract(
    LEASE_FACTORY_ABI as any,
    LEASE_FACTORY_ADDRESS
  );
}

// ── Get LeaseAgreement contract ──
export function getClientLeaseContract(contractAddress: string) {
  const web3 = getClientWeb3();
  return new web3.eth.Contract(
    LEASE_AGREEMENT_ABI as any,
    contractAddress
  );
}

// ── Switch to Sepolia ──
export async function ensureSepoliaNetwork(): Promise<void> {
  const provider = (window as any).ethereum;
  if (!provider) throw new Error("No wallet connected");

  const chainId = await provider.request({ method: "eth_chainId" });

  if (chainId !== "0xaa36a7") {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0xaa36a7" }],
    });
  }
}

// ── Read termination flags ──
export async function getTerminationStatus(
  contractAddress: string
): Promise<{ landlordAgreed: boolean; tenantAgreed: boolean }> {
  try {
    const web3     = getClientWeb3();
    const contract = new web3.eth.Contract(
      LEASE_AGREEMENT_ABI as any,
      contractAddress
    );

    const [landlordAgreed, tenantAgreed] = await Promise.all([
      contract.methods.landlordAgreesToTerminate().call() as Promise<boolean>,
      contract.methods.tenantAgreesToTerminate().call()   as Promise<boolean>,
    ]);

    return {
      landlordAgreed: Boolean(landlordAgreed),
      tenantAgreed:   Boolean(tenantAgreed),
    };
  } catch {
    return { landlordAgreed: false, tenantAgreed: false };
  }
}