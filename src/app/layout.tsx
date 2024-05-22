import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/util";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";

//for react skeleton to work need add this css here
import "react-loading-skeleton/dist/skeleton.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QuillBot",
  description:
    "QuillBot is a state-of-the-art paraphrasing tool. It is the best article rewriter available, and can completely paraphrase an entire article for free. Simply input a sentence, and hit the 'Quill It' button. QuillBot will then rephrase the content while maintaining the original meaning.",
};

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
