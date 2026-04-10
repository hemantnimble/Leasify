// utils/blockchain/web3Server.ts

import Web3 from "web3";
import { LEASE_FACTORY_ABI, LEASE_AGREEMENT_ABI } from "./abis";

// ─── Server-side Web3 (uses Alchemy, not MetaMask) ───

let web3Instance: Web3 | null = null;

export function getServerWeb3(): Web3 {
  if (!web3Instance) {
    const rpcUrl = process.env.ALCHEMY_SEPOLIA_URL;
    if (!rpcUrl) {
      throw new Error("ALCHEMY_SEPOLIA_URL not set in .env");
    }
    web3Instance = new Web3(new Web3.providers.HttpProvider(rpcUrl));
  }
  return web3Instance;
}

// ─── Get deployer account (Wallet C) ───

export function getDeployerAccount() {
  const web3 = getServerWeb3();
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("DEPLOYER_PRIVATE_KEY not set in .env");
  }

  const key = privateKey.startsWith("0x")
    ? privateKey
    : `0x${privateKey}`;

  const account = web3.eth.accounts.privateKeyToAccount(key);
  web3.eth.accounts.wallet.add(account);

  return account;
}
function sanitizeAddress(address: string): string {
  // Strip whitespace, zero-width chars, BOM, etc.
  const cleaned = address.replace(/[^\x20-\x7E]/g, "").trim();
  // Web3 toChecksumAddress requires a valid 0x-prefixed 40-hex-char address
  if (!/^0x[0-9a-fA-F]{40}$/.test(cleaned)) {
    throw new Error(`Malformed Ethereum address in environment: "${cleaned}"`);
  }
  return cleaned;
}

export function getFactoryContract() {
  const web3 = getServerWeb3();
  const raw = process.env.LEASE_FACTORY_ADDRESS;
  if (!raw) throw new Error("LEASE_FACTORY_ADDRESS not set in .env");

  const address = sanitizeAddress(raw);
  return new web3.eth.Contract(LEASE_FACTORY_ABI as any, address);
}

export function getLeaseContract(contractAddress: string) {
  const web3 = getServerWeb3();
  const address = sanitizeAddress(contractAddress);
  return new web3.eth.Contract(LEASE_AGREEMENT_ABI as any, address);
}
// ─── Get LeaseFactory contract instance ───

// export function getFactoryContract() {
//   const web3 = getServerWeb3();
//   const address = process.env.LEASE_FACTORY_ADDRESS;
//   if (!address) throw new Error("LEASE_FACTORY_ADDRESS not set in .env");

//   const checksummed = web3.utils.toChecksumAddress(address); // ← add this
//   return new web3.eth.Contract(LEASE_FACTORY_ABI as any, checksummed);
// }

// // ─── Get a specific LeaseAgreement contract instance ───

// export function getLeaseContract(contractAddress: string) {
//   const web3 = getServerWeb3();
//   const checksummed = web3.utils.toChecksumAddress(contractAddress); // ← add this
//   return new web3.eth.Contract(LEASE_AGREEMENT_ABI as any, checksummed);
// }

// ─── Convert ETH to Wei ───

export function ethToWei(eth: number): string {
  const web3 = getServerWeb3();
  return web3.utils.toWei(eth.toString(), "ether");
}

// ─── Convert Wei to ETH ───

export function weiToEth(wei: string): string {
  const web3 = getServerWeb3();
  return web3.utils.fromWei(wei, "ether");
}