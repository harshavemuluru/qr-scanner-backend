"use client";

import { useState, useRef, DragEvent } from "react";
import * as XLSX from "xlsx";

interface ParsedRow {
  name: string;
  email: string;
  number: string;
}

interface UploadResult {
  success: number;
  errors: { row: number; name: string; error: string }[];
}

export default function ExcelUpload() {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const parseFile = (file: File) => {
    setParseError(null);
    setResult(null);
    setRows([]);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" });

        if (raw.length === 0) {
          setParseError("The spreadsheet appears to be empty.");
          return;
        }

        const parsed: ParsedRow[] = raw.map((r) => {
          const find = (key: string) =>
            Object.entries(r).find(([k]) => k.toLowerCase().trim() === key)?.[1]?.toString().trim() ?? "";
          return { name: find("name"), email: find("email"), number: find("number") };
        });

        const valid = parsed.filter((r) => r.name);
        if (valid.length === 0) {
          setParseError('No valid rows found. Ensure the sheet has a "name" column.');
          return;
        }

        setRows(valid);
      } catch {
        setParseError("Could not parse the file. Make sure it is a valid .xlsx, .xls, or .csv file.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  };

  const handleSubmit = async () => {
    setUploading(true);
    const errors: UploadResult["errors"] = [];
    let success = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const res = await fetch("/api/entries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(row),
        });
        if (res.ok) {
          success++;
        } else {
          const d = await res.json();
          errors.push({ row: i + 1, name: row.name, error: d.error || "Failed" });
        }
      } catch {
        errors.push({ row: i + 1, name: row.name, error: "Network error" });
      }
    }

    setResult({ success, errors });
    setRows([]);
    setFileName(null);
    setUploading(false);
  };

  const reset = () => {
    setRows([]);
    setFileName(null);
    setResult(null);
    setParseError(null);
  };

  if (result) {
    return (
      <div className="space-y-4">
        <div className={`rounded-2xl p-5 border ${result.errors.length === 0 ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"}`}>
          <p className={`font-semibold text-lg ${result.errors.length === 0 ? "text-green-700 dark:text-green-400" : "text-yellow-700 dark:text-yellow-400"}`}>
            {result.success} entr{result.success === 1 ? "y" : "ies"} imported successfully
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-2 space-y-1">
              {result.errors.map((e) => (
                <li key={e.row} className="text-sm text-yellow-700 dark:text-yellow-400">
                  Row {e.row} ({e.name}): {e.error}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          onClick={reset}
          className="w-full py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          Upload Another File
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`rounded-2xl border-2 border-dashed cursor-pointer p-10 text-center transition ${
          dragging ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20" : "border-gray-300 dark:border-gray-600 hover:border-violet-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) parseFile(f); }}
        />
        <div className="text-4xl mb-3">📂</div>
        <p className="text-gray-700 dark:text-gray-300 font-medium">
          {fileName ? fileName : "Drop your file here or click to browse"}
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Supports .xlsx, .xls, .csv</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">Required column: <code className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-1 rounded">name</code> — Optional: <code className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-1 rounded">email</code>, <code className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-1 rounded">number</code></p>
      </div>

      {parseError && (
        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-red-700 dark:text-red-400 text-sm">{parseError}</div>
      )}

      {rows.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{rows.length} rows ready to import</p>
            <button onClick={reset} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">Clear</button>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto max-h-60 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300">#</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Name</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Email</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Number</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <td className="px-4 py-2 text-gray-400 dark:text-gray-500">{i + 1}</td>
                      <td className="px-4 py-2 text-gray-900 dark:text-white">{r.name}</td>
                      <td className="px-4 py-2 text-gray-500 dark:text-gray-400">{r.email || "—"}</td>
                      <td className="px-4 py-2 text-gray-500 dark:text-gray-400">{r.number || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={uploading}
            className="w-full py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {uploading ? `Importing... (${rows.length} entries)` : `Import ${rows.length} Entries`}
          </button>
        </div>
      )}
    </div>
  );
}
