// types/next-auth.d.ts

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      walletAddress: string;
      role: string;
      userId: string;
      error?: string;
      isDemo?: boolean;       // ← demo session flag
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    walletAddress?: string;
    role?: string;
    userId?: string;
    isDemo?: boolean;
  }
}