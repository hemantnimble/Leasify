// utils/blockchain/abis.ts

import LeaseFactoryJson from "./LeaseFactory.json";
import LeaseAgreementJson from "./LeaseAgreement.json";

export const LEASE_FACTORY_ABI = LeaseFactoryJson.abi;
export const LEASE_AGREEMENT_ABI = LeaseAgreementJson.abi;

export const LEASE_FACTORY_ADDRESS =
  process.env.NEXT_PUBLIC_LEASE_FACTORY_ADDRESS || "";