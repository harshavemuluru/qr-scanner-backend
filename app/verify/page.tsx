"use client";

import dynamic from "next/dynamic";

const QRScanner = dynamic(() => import("@/components/QRScanner"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export default function VerifyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-[#2B2420]">Verify Entry</h1>
        <p className="text-[#5B4B3A] text-sm mt-1">Scan a VIP QR code to check in</p>
      </div>
      <div className="bg-white rounded-2xl border border-[#F0DFC4] p-6">
        <QRScanner />
      </div>
    </div>
  );
}
