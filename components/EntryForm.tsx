"use client";

import { useState } from "react";
import QRCodeDisplay from "./QRCodeDisplay";

interface Entry {
  id: string;
  name: string;
  child_name: string | null;
  age: number | null;
  number: string | null;
  checkedin: boolean;
  created_at: string;
}

export default function EntryForm({ accent = "violet" }: { accent?: "violet" | "coral" }) {
  const [name, setName] = useState("");
  const [childName, setChildName] = useState("");
  const [age, setAge] = useState("");
  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Entry | null>(null);

  const isCoral = accent === "coral";
  const labelClass = isCoral
    ? "block text-sm font-medium text-[#5B4B3A] mb-1"
    : "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
  const inputClass = isCoral
    ? "w-full px-4 py-2.5 rounded-xl border border-[#E8D9C3] bg-white focus:outline-none focus:ring-2 focus:ring-[#E8735A] focus:border-transparent text-[#2B2420] placeholder-[#B5A88F]"
    : "w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500";
  const buttonClass = isCoral
    ? "w-full py-3 rounded-xl bg-[#E8735A] text-white font-semibold hover:bg-[#D8624A] disabled:opacity-50 disabled:cursor-not-allowed transition"
    : "w-full py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition";
  const secondaryButtonClass = isCoral
    ? "w-full py-2.5 rounded-xl border border-[#E8D9C3] text-[#5B4B3A] hover:bg-[#FBF1E3] transition"
    : "w-full py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, childName, age, number }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create entry");
      setCreated(data);
      setName("");
      setChildName("");
      setAge("");
      setNumber("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  if (created) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6 text-center">
          <p className="text-green-700 dark:text-green-400 font-semibold text-lg mb-1">Entry created!</p>
          <p className="text-green-600 dark:text-green-500 text-sm">Share or print this QR code for {created.name}</p>
        </div>
        <QRCodeDisplay entry={created} />
        <button onClick={() => setCreated(null)} className={secondaryButtonClass}>
          Add Another Entry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}
      <div>
        <label className={labelClass}>
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. John Smith"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>
          Child&apos;s Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
          required
          placeholder="e.g. Jamie Smith"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>
          Age <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          required
          min={0}
          placeholder="e.g. 7"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>
          Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          required
          placeholder="e.g. +1 555 000 0000"
          className={inputClass}
        />
      </div>
      <button type="submit" disabled={loading} className={buttonClass}>
        {loading ? "Creating..." : "Create Entry & Generate QR"}
      </button>
    </form>
  );
}
