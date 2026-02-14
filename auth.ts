// auth.ts

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { SiweMessage } from "siwe";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        message:   { label: "Message",   type: "text" },
        signature: { label: "Signature", type: "text" },
        role:      { label: "Role",      type: "text" }, // 👈 new
      },

      async authorize(credentials) {
        try {
          if (!credentials?.message || !credentials?.signature) {
            return null;
          }

          const siweMessage = new SiweMessage(
            JSON.parse(credentials.message as string)
          );

          const result = await siweMessage.verify({
            signature: credentials.signature as string,
          });

          if (!result.success) return null;

          const walletAddress = siweMessage.address.toLowerCase();

          // Validate incoming role, fallback to TENANT
          const incomingRole =
            credentials.role === "LANDLORD" ? "LANDLORD" : "TENANT";

          let user = await prisma.user.findUnique({
            where: { walletAddress },
          });

          if (!user) {
            // NEW user — assign role from login page
            user = await prisma.user.create({
              data: {
                walletAddress,
                role: incomingRole, // 👈 use passed role
              },
            });
          }
          // Existing user — keep their stored role, never overwrite

          return {
            id: user.id,
            walletAddress: user.walletAddress,
            role: user.role,
            name: user.displayName ?? walletAddress.slice(0, 6) + "...",
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],

  session: { strategy: "jwt" },

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