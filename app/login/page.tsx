"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/onboard";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Invalid passcode");
      } else {
        router.push(next);
        router.refresh();
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#5B4B3A] mb-1">Admin Passcode</label>
        <input
          type="password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          required
          autoFocus
          placeholder="Enter passcode"
          className="w-full px-4 py-2.5 rounded-xl border border-[#E8D9C3] bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-[#2B2420] placeholder-[#B5A88F]"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading ? "Verifying…" : "Enter"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-[#F0DFC4] p-8 w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="font-serif text-xl font-bold text-[#2B2420]">Admin Access</h1>
          <p className="text-sm text-[#5B4B3A] mt-1">Enter the passcode to continue</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
