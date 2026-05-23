import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VIP Entry System",
  description: "Club VIP entry management with QR codes",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
            <span className="font-bold text-gray-900 dark:text-white tracking-tight">VIP Entry</span>
            <nav className="flex gap-1">
              <Link
                href="/onboard"
                className="px-4 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-violet-700 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition"
              >
                Onboard
              </Link>
              <Link
                href="/verify"
                className="px-4 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-violet-700 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition"
              >
                Verify
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
