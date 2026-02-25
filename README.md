# 🏠 Leasify - Web3 Real Estate Leasing Platform

Leasify is a decentralized real estate application that bridges the gap between landlords and tenants using blockchain technology. By integrating smart contracts, Web3 wallet authentication, and cryptocurrency payments, Leasify provides a secure, transparent, and automated way to handle property listings, lease agreements, deposit handling, and rent payments.

## ✨ Key Features

* **🛡️ Web3 Authentication:** Secure user login and identity verification using Wallet Connection (via Wagmi and NextAuth).
* **📝 Smart Contract Lease Agreements:** Lease agreements are deployed as individual, immutable smart contracts via a `LeaseFactory`, ensuring trustless execution of terms.
* **💸 Crypto Payments:** Tenants can securely pay security deposits and monthly rent directly via their Web3 wallets.
* **👑 Role-Based Dashboards:** * **Landlords:** Add and manage property listings, review lease requests, and track active leases.
  * **Tenants:** Browse available properties, request leases, sign agreements, and manage monthly rent payments.
* **⚡ Automated Enforcement:** Smart contracts transparently handle lease termination, deposit returns, and rent payment tracking.
* **✨ Animated UI:** Smooth, engaging user interface built with Tailwind CSS, GSAP, and custom scroll-based velocity animations.

## 🛠️ Tech Stack

**Frontend & Backend (Next.js App Router):**
* **Framework:** Next.js (v14/v15) & React
* **Styling:** Tailwind CSS
* **Animations:** GSAP & Custom Hooks (`useGsap`, `useTilt`, `useMagnetic`)
* **Database:** PostgreSQL with Prisma ORM (`prisma/schema.prisma`)
* **Authentication:** NextAuth.js configured for Ethereum/Wallet login

**Blockchain & Web3:**
* **Smart Contracts:** Solidity (`LeaseAgreement.sol`, `LeaseFactory.sol`)
* **Development Environment:** Hardhat (`/_leasify-blockchain`)
* **Client Integration:** Wagmi, Viem, and Ethers.js
* **Network:** Compatible with Localhost (Hardhat), Ethereum testnets (Sepolia), and Mainnet.

## 📂 Project Structure

```text
leasify/
├── _leasify-blockchain/     # Hardhat project: Solidity contracts, tests, deployment scripts
├── app/                     # Next.js App Router: Pages, API routes, Layouts
│   ├── api/                 # REST APIs for Auth, Properties, Leases, Users
│   ├── dashboard/           # Role-based dashboards (Landlord/Tenant/Profile)
│   ├── login/               # Wallet authentication pages
│   └── properties/          # Public property listings and lease request flows
├── components/              # Reusable UI, Auth, Blockchain, and Home components
├── hooks/                   # Custom React hooks (Web3 payments, GSAP animations)
├── lib/                     # Utility configurations (Prisma client, Wagmi, NextAuth)
├── prisma/                  # Database schema and migrations
└── utils/blockchain/        # Web3 Client/Server utilities and Contract ABIs