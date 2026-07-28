"use client";

import { useState } from "react";
import QRCodeDisplay from "./QRCodeDisplay";

interface Adult {
  name: string;
}

interface Kid {
  name: string;
  age: number;
}

interface Entry {
  id: string;
  adults: Adult[];
  kids: Kid[];
  number: string | null;
  checkedin: boolean;
  created_at: string;
}

const MAX_ADULTS = 2;
const MAX_KIDS = 3;

export default function EntryForm({ accent = "violet" }: { accent?: "violet" | "coral" }) {
  const [adults, setAdults] = useState([{ name: "" }]);
  const [kids, setKids] = useState([{ name: "", age: "" }]);
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
  const addButtonClass = isCoral
    ? "text-sm font-medium text-[#E8735A] hover:text-[#D8624A]"
    : "text-sm font-medium text-violet-600 hover:text-violet-700";
  const removeButtonClass = isCoral
    ? "text-[#B5A88F] hover:text-[#D8624A]"
    : "text-gray-400 hover:text-red-500";
  const sectionLabelClass = isCoral
    ? "text-sm font-semibold text-[#2B2420]"
    : "text-sm font-semibold text-gray-800 dark:text-gray-100";
  const hintClass = isCoral ? "text-xs text-[#5B4B3A]" : "text-xs text-gray-500 dark:text-gray-400";

  const updateAdult = (i: number, name: string) => {
    setAdults((prev) => prev.map((a, idx) => (idx === i ? { name } : a)));
  };
  const addAdult = () => {
    if (adults.length < MAX_ADULTS) setAdults((prev) => [...prev, { name: "" }]);
  };
  const removeAdult = (i: number) => {
    setAdults((prev) => prev.filter((_, idx) => idx !== i));
  };

  const updateKid = (i: number, field: "name" | "age", value: string) => {
    setKids((prev) => prev.map((k, idx) => (idx === i ? { ...k, [field]: value } : k)));
  };
  const addKid = () => {
    if (kids.length < MAX_KIDS) setKids((prev) => [...prev, { name: "", age: "" }]);
  };
  const removeKid = (i: number) => {
    setKids((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adults, kids, number }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create entry");
      setCreated(data);
      setAdults([{ name: "" }]);
      setKids([{ name: "", age: "" }]);
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
          <p className="text-green-600 dark:text-green-500 text-sm">Share or print this QR code for your family</p>
        </div>
        <QRCodeDisplay entry={created} />
        <button onClick={() => setCreated(null)} className={secondaryButtonClass}>
          Add Another Entry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className={sectionLabelClass}>Adults</span>
          {adults.length < MAX_ADULTS && (
            <button type="button" onClick={addAdult} className={addButtonClass}>
              + Add adult
            </button>
          )}
        </div>
        {adults.map((adult, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              type="text"
              value={adult.name}
              onChange={(e) => updateAdult(i, e.target.value)}
              required
              placeholder={i === 0 ? "e.g. John Smith" : "e.g. Jane Smith"}
              className={inputClass}
            />
            {adults.length > 1 && (
              <button type="button" onClick={() => removeAdult(i)} className={removeButtonClass} aria-label="Remove adult">
                ✕
              </button>
            )}
          </div>
        ))}
        <p className={hintClass}>Up to {MAX_ADULTS} adults per registration.</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className={sectionLabelClass}>Kids</span>
          {kids.length < MAX_KIDS && (
            <button type="button" onClick={addKid} className={addButtonClass}>
              + Add kid
            </button>
          )}
        </div>
        {kids.map((kid, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              type="text"
              value={kid.name}
              onChange={(e) => updateKid(i, "name", e.target.value)}
              required
              placeholder="Child's name"
              className={inputClass}
            />
            <input
              type="number"
              value={kid.age}
              onChange={(e) => updateKid(i, "age", e.target.value)}
              required
              min={0}
              placeholder="Age"
              className={`${inputClass} w-24`}
            />
            {kids.length > 1 && (
              <button type="button" onClick={() => removeKid(i)} className={removeButtonClass} aria-label="Remove kid">
                ✕
              </button>
            )}
          </div>
        ))}
        {kids.length >= MAX_KIDS ? (
          <p className={hintClass}>
            Registering more than {MAX_KIDS} kids? Please contact the admin to get them added.
          </p>
        ) : (
          <p className={hintClass}>Up to {MAX_KIDS} kids per registration.</p>
        )}
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
