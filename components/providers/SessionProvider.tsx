// components/providers/Providers.tsx

"use client";

import { WagmiProvider }          from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";  // ✅ import darkTheme
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider }        from "next-auth/react";
import { wagmiConfig }            from "@/lib/wagmi";

const queryClient = new QueryClient();

export default function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session:  any;
}) {
  return (
    <SessionProvider session={session}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            theme={darkTheme({
              accentColor:          "#2563eb",  // blue-600 — matches your buttons
              accentColorForeground: "white",
              borderRadius:         "large",
              overlayBlur:          "small",
              fontStack:            "system",
            })}
          >
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </SessionProvider>
  );
}