"use client";

import { useState, useRef, DragEvent } from "react";
import * as XLSX from "xlsx";

interface ParsedRow {
  adults: { name: string }[];
  kids: { name: string; age: string }[];
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

          const adults = [find("adult1_name"), find("adult2_name")]
            .filter((name) => name)
            .map((name) => ({ name }));

          const kids = [1, 2, 3]
            .map((n) => ({ name: find(`kid${n}_name`), age: find(`kid${n}_age`) }))
            .filter((k) => k.name);

          return { adults, kids, number: find("number") };
        });

        const valid = parsed.filter((r) => r.adults.length > 0 && r.kids.length > 0 && r.number);
        if (valid.length === 0) {
          setParseError(
            'No valid rows found. Ensure the sheet has "adult1_name", "kid1_name", "kid1_age", and "number" columns with values.'
          );
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
      const label = row.adults.map((a) => a.name).join(" & ");
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
          errors.push({ row: i + 1, name: label, error: d.error || "Failed" });
        }
      } catch {
        errors.push({ row: i + 1, name: label, error: "Network error" });
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
        <div className={`rounded-2xl p-5 border ${result.errors.length === 0 ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}>
          <p className={`font-semibold text-lg ${result.errors.length === 0 ? "text-green-700" : "text-yellow-700"}`}>
            {result.success} entr{result.success === 1 ? "y" : "ies"} imported successfully
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-2 space-y-1">
              {result.errors.map((e) => (
                <li key={e.row} className="text-sm text-yellow-700">
                  Row {e.row} ({e.name}): {e.error}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          onClick={reset}
          className="w-full py-2.5 rounded-xl border border-[#E8D9C3] text-[#5B4B3A] hover:bg-[#FBF1E3] transition"
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
          dragging ? "border-violet-500 bg-violet-50" : "border-[#E8D9C3] hover:border-violet-400 hover:bg-[#FBF1E3]"
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
        <p className="text-[#5B4B3A] font-medium">
          {fileName ? fileName : "Drop your file here or click to browse"}
        </p>
        <p className="text-sm text-[#B5A88F] mt-1">Supports .xlsx, .xls, .csv</p>
        <p className="text-xs text-[#B5A88F] mt-3">
          Required columns: <code className="bg-[#F0DFC4]/50 px-1 rounded">adult1_name</code>,{" "}
          <code className="bg-[#F0DFC4]/50 px-1 rounded">kid1_name</code>,{" "}
          <code className="bg-[#F0DFC4]/50 px-1 rounded">kid1_age</code>,{" "}
          <code className="bg-[#F0DFC4]/50 px-1 rounded">number</code>
          <br />
          Optional: <code className="bg-[#F0DFC4]/50 px-1 rounded">adult2_name</code>,{" "}
          <code className="bg-[#F0DFC4]/50 px-1 rounded">kid2_name</code> / <code className="bg-[#F0DFC4]/50 px-1 rounded">kid2_age</code>,{" "}
          <code className="bg-[#F0DFC4]/50 px-1 rounded">kid3_name</code> / <code className="bg-[#F0DFC4]/50 px-1 rounded">kid3_age</code>
        </p>
      </div>

      {parseError && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-red-700 text-sm">{parseError}</div>
      )}

      {rows.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#5B4B3A]">{rows.length} rows ready to import</p>
            <button onClick={reset} className="text-sm text-[#5B4B3A] hover:text-[#2B2420]">Clear</button>
          </div>
          <div className="rounded-xl border border-[#F0DFC4] overflow-hidden">
            <div className="overflow-x-auto max-h-60 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#FBF1E3] border-b border-[#F0DFC4] sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-[#5B4B3A]">#</th>
                    <th className="px-4 py-2 text-left font-medium text-[#5B4B3A]">Adults</th>
                    <th className="px-4 py-2 text-left font-medium text-[#5B4B3A]">Kids</th>
                    <th className="px-4 py-2 text-left font-medium text-[#5B4B3A]">Number</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-b border-[#F0DFC4] last:border-0">
                      <td className="px-4 py-2 text-[#B5A88F]">{i + 1}</td>
                      <td className="px-4 py-2 text-[#2B2420]">{r.adults.map((a) => a.name).join(" & ") || "—"}</td>
                      <td className="px-4 py-2 text-[#5B4B3A]">
                        {r.kids.map((k) => `${k.name} (${k.age})`).join(", ") || "—"}
                      </td>
                      <td className="px-4 py-2 text-[#5B4B3A]">{r.number || "—"}</td>
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
