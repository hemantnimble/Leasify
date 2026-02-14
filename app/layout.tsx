// app/layout.tsx
import "@rainbow-me/rainbowkit/styles.css";  // ✅ add here
import "./globals.css";   
import { auth }      from "@/auth";
import Providers     from "@/components/providers/SessionProvider";
import Navbar        from "@/components/layout/Navbar";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en">
      <body>
        <Providers session={session}>
          <Navbar />
          <main className="max-w-7xl mx-auto px-6 py-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}