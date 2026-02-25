// auth.ts

import NextAuth                      from "next-auth";
import CredentialsProvider           from "next-auth/providers/credentials";
import { SiweMessage }               from "siwe";
import { prisma }                    from "@/lib/prisma";
import { verifyAndConsumeNonce }     from "@/lib/nonceStore";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        message:   { label: "Message",   type: "text" },
        signature: { label: "Signature", type: "text" },
        role:      { label: "Role",      type: "text" },
      },

      async authorize(credentials) {
        try {
          if (!credentials?.message || !credentials?.signature) {
            console.error("Missing credentials");
            return null;
          }

          let siweMessage: SiweMessage;
          try {
            siweMessage = new SiweMessage(
              typeof credentials.message === "string" &&
              credentials.message.startsWith("{")
                ? JSON.parse(credentials.message as string)
                : (credentials.message as string)
            );
          } catch (parseError) {
            console.error("Failed to parse SIWE message:", parseError);
            return null;
          }

          const isValidNonce = verifyAndConsumeNonce(siweMessage.nonce);
          if (!isValidNonce) {
            console.error("Invalid or expired nonce:", siweMessage.nonce);
            return null;
          }

          const result = await siweMessage.verify({
            signature: credentials.signature as string,
          });

          if (!result.success) {
            console.error("SIWE signature verification failed:", result.error);
            return null;
          }

          const walletAddress = siweMessage.address;
          const incomingRole  =
            credentials.role === "LANDLORD" ? "LANDLORD" : "TENANT";

          let user = await prisma.user.findUnique({
            where: { walletAddress },
          });

          if (!user) {
            user = await prisma.user.create({
              data: { walletAddress, role: incomingRole },
            });
          } else if (user.role !== incomingRole) {
            return {
              id:            "ROLE_MISMATCH",
              walletAddress: "",
              role:          user.role,
              name:          "ROLE_MISMATCH",
              error:         `ROLE_MISMATCH:${user.role}`,
            } as any;
          }

          return {
            id:            user.id,
            walletAddress: user.walletAddress,
            role:          user.role,
            name:          user.displayName ??
                           walletAddress.slice(0, 6) + "...",
          };

        } catch (error: any) {
          console.error("Auth authorize error:", error.message);
          return null;
        }
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        if ((user as any).error?.startsWith("ROLE_MISMATCH")) {
          token.error = (user as any).error;
          return token;
        }

        token.walletAddress = (user as any).walletAddress;
        token.role          = (user as any).role;
        token.userId        = user.id;
        delete token.error;
      }
      return token;
    },

    async session({ session, token }) {
      if (token.error) {
        session.user.error = token.error as string;
      }
      if (token.walletAddress) {
        session.user.walletAddress = token.walletAddress as string;
        session.user.role          = token.role          as string;
        session.user.userId        = token.userId        as string;
      }
      // ── Forward demo flag ──
      if (token.isDemo) {
        (session.user as any).isDemo = true;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
});