import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn, constructMetadata } from "@/lib/util";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";

//for simple bar to fix height n prevent from scaling very big
import "simplebar-react/dist/simplebar.min.css"

//for react skeleton to work need add this css here
import "react-loading-skeleton/dist/skeleton.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata=constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <Providers>
        <body
          // merge the classes using the cn function with the inter font
          className={cn(
            "min-h-screen font-sans antialiased grainy",
            inter.className
          )}
        >
          <Navbar />
          {children}
          <Toaster />
        </body>
      </Providers>
    </html>
  );
}
