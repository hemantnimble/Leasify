# Leasify

A decentralized rental platform built on Ethereum. Smart contracts handle
deposit escrow, rent enforcement, and lease lifecycle — removing the need
for intermediaries.

## Tech Stack

- **Frontend**: Next.js 15, Tailwind CSS
- **Auth**: NextAuth v5, SIWE (Sign-In With Ethereum)
- **Database**: MongoDB Atlas, Prisma ORM
- **Blockchain**: Solidity 0.8.20, Hardhat, Web3.js
- **Wallet**: RainbowKit, WalletConnect v2, wagmi
- **Network**: Sepolia Testnet
- **Hosting**: Vercel

## Getting Started

### Prerequisites
- Node.js 18+
- MetaMask or any WalletConnect wallet
- MongoDB Atlas account
- Alchemy account (Sepolia RPC)
- WalletConnect Cloud account

### Installation

git clone https://github.com/yourusername/leasify
cd leasify
npm install

### Environment Variables

Copy .env.example to .env.local and fill in:

DATABASE_URL=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
ALCHEMY_SEPOLIA_URL=
DEPLOYER_PRIVATE_KEY=
LEASE_FACTORY_ADDRESS=
NEXT_PUBLIC_LEASE_FACTORY_ADDRESS=
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
ETHERSCAN_API_KEY=

### Run Development Server

npm run dev

### Smart Contracts

cd contracts-hardhat
npm install
npx hardhat test          # run all 23 tests
npx hardhat run scripts/deploy.ts --network sepolia

## Contract Addresses (Sepolia)

LeaseFactory: 0x6379AE29a1d6113f5ff55d7d5307B5fa3D97ED12

## Architecture

Browser → Next.js Frontend + API Routes → MongoDB Atlas
                                        → Sepolia (via Alchemy)
