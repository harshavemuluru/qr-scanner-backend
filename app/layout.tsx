import type { Metadata } from "next";
import { Geist, Fraunces } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LateCheckout x LittlePreneurs",
  description: "VIP entry management with QR codes for LateCheckout x LittlePreneurs",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-screen bg-[#FBF1E3] flex flex-col">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
