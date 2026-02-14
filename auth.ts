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
        message: { label: "Message", type: "text" },
        signature: { label: "Signature", type: "text" },
        role: { label: "Role", type: "text" }, // 👈 new
      },

      // auth.ts

      // auth.ts

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

          const walletAddress = siweMessage.address;
          const incomingRole =
            credentials.role === "LANDLORD" ? "LANDLORD" : "TENANT";

          let user = await prisma.user.findUnique({
            where: { walletAddress },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                walletAddress,
                role: incomingRole,
              },
            });
          } else {
            // ✅ Return mismatch as a special user object instead of throwing
            if (user.role !== incomingRole) {
              return {
                id: "ROLE_MISMATCH",
                walletAddress: "",
                role: user.role,           // actual role stored in DB
                name: "ROLE_MISMATCH",
                error: `ROLE_MISMATCH:${user.role}`,  // encode the error
              } as any;
            }
          }

          return {
            id: user.id,
            walletAddress: user.walletAddress,
            role: user.role,
            name: user.displayName ?? walletAddress.slice(0, 6) + "...",
          };

        } catch (error: any) {
          console.error("Auth error:", error.message);
          return null;
        }
      },
    }),
  ],

  session: { strategy: "jwt" },

  // auth.ts — callbacks section

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // ✅ Check if this is a role mismatch signal
        if ((user as any).error?.startsWith("ROLE_MISMATCH")) {
          token.error = (user as any).error;
          return token;
        }

        token.walletAddress = (user as any).walletAddress;
        token.role = (user as any).role;
        token.userId = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      // ✅ Pass error to session so frontend can read it
      if (token.error) {
        session.user.error = token.error as string;
      }
      if (token.walletAddress) {
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