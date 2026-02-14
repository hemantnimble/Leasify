// auth.ts  ← root of project, same level as package.json

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { SiweMessage } from "siwe";
import { prisma } from "@/lib/prisma";
import Web3 from "web3";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        message: { label: "Message", type: "text" },
        signature: { label: "Signature", type: "text" },
      },

      async authorize(credentials) {
        try {
          if (!credentials?.message || !credentials?.signature) {
            return null;
          }

          // Parse and verify the SIWE message
          const siweMessage = new SiweMessage(
            JSON.parse(credentials.message as string)
          );

          const result = await siweMessage.verify({
            signature: credentials.signature as string,
          });

          if (!result.success) {
            return null;
          }

          // ✅ FIX: convert to EIP-55 checksum address instead of lowercase
          const web3 = new Web3();
          const walletAddress = web3.utils.toChecksumAddress(siweMessage.address);

          // Find or create user in MongoDB
          let user = await prisma.user.findUnique({
            where: { walletAddress },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                walletAddress,
                role: "TENANT",
              },
            });
          }

          return {
            id: user.id,
            walletAddress: user.walletAddress,
            role: user.role,
            name: user.displayName ?? user.walletAddress.slice(0, 6) + "...",
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.walletAddress = (user as any).walletAddress;
        token.role = (user as any).role;
        token.userId = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.walletAddress = token.walletAddress as string;
        session.user.role = token.role as string;
        session.user.userId = token.userId as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
});