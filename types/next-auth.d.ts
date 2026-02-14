// types/next-auth.d.ts

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      walletAddress: string;
      role: string;
      userId: string;
    } & DefaultSession["user"];
  }
}