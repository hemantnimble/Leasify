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

// ─── Get LeaseFactory contract instance ───

export function getFactoryContract() {
  const web3 = getServerWeb3();
  const address = process.env.LEASE_FACTORY_ADDRESS;

  if (!address) {
    throw new Error("LEASE_FACTORY_ADDRESS not set in .env");
  }

  return new web3.eth.Contract(LEASE_FACTORY_ABI as any, address);
}

// ─── Get a specific LeaseAgreement contract instance ───

export function getLeaseContract(contractAddress: string) {
  const web3 = getServerWeb3();
  return new web3.eth.Contract(
    LEASE_AGREEMENT_ABI as any,
    contractAddress
  );
}

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