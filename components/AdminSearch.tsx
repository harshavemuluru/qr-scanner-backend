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

type EditKid = { name: string; age: string };

export default function AdminSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Entry[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Entry | null>(null);
  const [adults, setAdults] = useState<Adult[]>([]);
  const [kids, setKids] = useState<EditKid[]>([]);
  const [number, setNumber] = useState("");
  const [checkedin, setCheckedin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const runSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSearching(true);
    setSearchError(null);
    setSelected(null);
    try {
      const res = await fetch(`/api/entries?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      setResults(data);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Unknown error");
      setResults(null);
    } finally {
      setSearching(false);
    }
  };

  const select = (entry: Entry) => {
    setSelected(entry);
    setAdults(entry.adults?.length ? entry.adults : [{ name: "" }]);
    setKids(
      entry.kids?.length
        ? entry.kids.map((k) => ({ name: k.name, age: String(k.age) }))
        : [{ name: "", age: "" }]
    );
    setNumber(entry.number ?? "");
    setCheckedin(entry.checkedin);
    setSaveError(null);
    setSaveOk(false);
    setConfirmingDelete(false);
  };

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

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    setSaveError(null);
    setSaveOk(false);
    try {
      const res = await fetch(`/api/entries/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adults, kids, number, checkedin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setSelected(data);
      setResults((prev) => prev?.map((e) => (e.id === data.id ? data : e)) ?? prev);
      setSaveOk(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/entries/${selected.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }
      setResults((prev) => prev?.filter((e) => e.id !== selected.id) ?? prev);
      setSelected(null);
      setConfirmingDelete(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={runSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or phone number"
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
        />
        <button
          type="submit"
          disabled={searching}
          className="px-5 py-2.5 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 disabled:opacity-50 transition"
        >
          {searching ? "Searching..." : "Search"}
        </button>
      </form>

      {searchError && (
        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-red-700 dark:text-red-400 text-sm">
          {searchError}
        </div>
      )}

      {results && (
        <div className="space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {results.length} match{results.length === 1 ? "" : "es"}
          </p>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700 overflow-hidden">
            {results.map((entry) => (
              <button
                key={entry.id}
                onClick={() => select(entry)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition ${
                  selected?.id === entry.id ? "bg-violet-50 dark:bg-violet-900/20" : ""
                }`}
              >
                <p className="font-medium text-gray-900 dark:text-white">
                  {entry.adults?.map((a) => a.name).join(" & ") || "—"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {entry.number} · {entry.kids?.length ?? 0} kid{(entry.kids?.length ?? 0) === 1 ? "" : "s"} ·{" "}
                  {entry.checkedin ? "Checked in" : "Not checked in"}
                </p>
              </button>
            ))}
            {results.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-500">No matches</p>
            )}
          </div>
        </div>
      )}

      {selected && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-5 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">Edit entry</h2>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">{selected.id}</span>
          </div>

          {saveError && (
            <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-red-700 dark:text-red-400 text-sm">
              {saveError}
            </div>
          )}
          {saveOk && (
            <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 text-green-700 dark:text-green-400 text-sm">
              Saved.
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">Adults</span>
              {adults.length < MAX_ADULTS && (
                <button type="button" onClick={addAdult} className="text-sm font-medium text-violet-600 hover:text-violet-700">
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
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900 dark:text-white"
                />
                {adults.length > 1 && (
                  <button type="button" onClick={() => removeAdult(i)} className="text-gray-400 hover:text-red-500" aria-label="Remove adult">
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">Kids</span>
              {kids.length < MAX_KIDS && (
                <button type="button" onClick={addKid} className="text-sm font-medium text-violet-600 hover:text-violet-700">
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
                  placeholder="Name"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900 dark:text-white"
                />
                <input
                  type="number"
                  value={kid.age}
                  onChange={(e) => updateKid(i, "age", e.target.value)}
                  min={0}
                  placeholder="Age"
                  className="w-24 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900 dark:text-white"
                />
                {kids.length > 1 && (
                  <button type="button" onClick={() => removeKid(i)} className="text-gray-400 hover:text-red-500" aria-label="Remove kid">
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
            <input
              type="tel"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={checkedin}
              onChange={(e) => setCheckedin(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600 text-violet-600 focus:ring-violet-500"
            />
            Checked in
          </label>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 disabled:opacity-50 transition"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
            {!confirmingDelete ? (
              <button
                onClick={() => setConfirmingDelete(true)}
                className="px-4 py-2.5 rounded-xl border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              >
                Delete
              </button>
            ) : (
              <>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 transition"
                >
                  {deleting ? "Deleting..." : "Confirm delete"}
                </button>
                <button
                  onClick={() => setConfirmingDelete(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
              </>
            )}
          </div>

          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">QR pass</p>
            <QRCodeDisplay entry={selected} />
          </div>
        </div>
      )}
    </div>
  );
}
