"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

const navLinkClass =
  "px-2 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-[#5B4B3A] hover:text-[#E8735A] hover:bg-white/70 transition shrink-0 whitespace-nowrap";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/register") {
    return <>{children}</>;
  }

  return (
    <>
      <header className="bg-[#FBF1E3]/95 backdrop-blur border-b border-[#F0DFC4] sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between gap-2">
          <Link href="/register" className="font-serif text-base sm:text-lg font-bold text-[#2B2420] tracking-tight shrink-0">
            Little<span className="text-[#E8735A]">Preneurs</span>
          </Link>
          <nav className="flex items-center gap-0.5">
            <Link href="/onboard" className={navLinkClass}>
              Onboard
            </Link>
            <Link href="/verify" className={navLinkClass}>
              Verify
            </Link>
            <Link href="/admin" className={navLinkClass}>
              Admin
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8">
        {children}
      </main>
    </>
  );
}
