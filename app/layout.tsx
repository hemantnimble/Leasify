// app/layout.tsx
import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";
import { auth } from "@/auth";
import Providers from "@/components/providers/SessionProvider";
import Navbar from "@/components/layout/Navbar";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import {
    Nunito
} from 'next/font/google';

const urbanist
    = Nunito({
          subsets: ['latin'],
        //   display: 'swap',
        weight: ['400'], // required for non-variable fonts
    });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@200;300;400;500;600;700;800&family=DM+Mono:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={urbanist.className}>
        <Providers session={session}>
          <Navbar />
          {/* No padding here — homepage goes full width, other pages wrap themselves */}
          <main>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </Providers>
      </body>
    </html>
  );
}