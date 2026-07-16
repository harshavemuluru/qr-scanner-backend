import EntryForm from "@/components/EntryForm";

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FBF1E3]">
      {/* Decorative background blobs, echoing the LittlePreneurs flyer */}
      <div className="pointer-events-none absolute -top-28 -left-28 w-80 h-80 rounded-full bg-[#F4DEC0]" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 w-96 h-96 rounded-full bg-[#CFDBC9]" />
      <div className="pointer-events-none absolute top-24 right-8 text-3xl opacity-70 rotate-12">✨</div>
      <div className="pointer-events-none absolute bottom-16 left-6 text-3xl opacity-70 -rotate-12">🚀</div>

      <div className="relative max-w-lg mx-auto px-4 py-12 sm:py-16">
        <div className="flex items-center justify-center gap-2 mb-5">
          <span className="font-serif text-sm border border-[#2B2420]/60 rounded-full px-4 py-1 text-[#2B2420]">
            Late Checkout
          </span>
          <span className="text-[#E8A33D]">×</span>
          <span className="font-serif text-sm border border-[#2B2420]/60 rounded-full px-4 py-1 text-[#2B2420]">
            T-Works
          </span>
        </div>

        <h1 className="font-serif text-5xl sm:text-6xl font-bold text-center tracking-tight">
          <span className="text-[#2B2420]">Little</span>
          <span className="text-[#E8735A]">Preneurs</span>
        </h1>
        <p className="text-center italic text-[#5B4B3A] mt-3">
          Little humans. Big ideas. Their very first stall.
        </p>

        <div className="flex justify-center mt-5">
          <span className="inline-block rounded-full border border-[#E8A33D] bg-white/60 px-4 py-1.5 text-sm font-medium text-[#5B4B3A]">
            Sun, Aug 2 · 12 PM – 4 PM · T-Works, Hyd
          </span>
        </div>

        <div className="mt-10 rounded-2xl bg-white/70 border border-[#F0DFC4] p-5 text-center">
          <p className="font-serif text-xl font-semibold text-[#1F6F5C]">Welcome, future founder! 🎉</p>
          <p className="text-[#5B4B3A] text-sm mt-2 leading-relaxed">
            You&apos;re one step away from your VIP pass. Pop in a few details below and
            we&apos;ll have your QR code ready to scan at the door — can&apos;t wait to see
            what you build!
          </p>
        </div>

        <div className="mt-6 bg-white rounded-2xl border border-[#F0DFC4] shadow-sm p-6">
          <EntryForm accent="coral" />
        </div>
      </div>
    </div>
  );
}
