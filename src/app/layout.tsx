import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/util";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QuillBot",
  description: "QuillBot is a state-of-the-art paraphrasing tool. It is the best article rewriter available, and can completely paraphrase an entire article for free. Simply input a sentence, and hit the 'Quill It' button. QuillBot will then rephrase the content while maintaining the original meaning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body
        // merge the classes using the cn function with the inter font
        className={cn(
          "min-h-screen font-sans antialiased grainy",
          inter.className
        )}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
