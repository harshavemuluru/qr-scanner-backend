"use client";

import { QRCodeSVG } from "qrcode.react";
import { useRef } from "react";

interface Entry {
  id: string;
  name: string;
  email: string | null;
  number: string | null;
  checkedin: boolean;
}

export default function QRCodeDisplay({ entry }: { entry: Entry }) {
  const qrRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>QR – ${entry.name}</title></head>
      <body style="text-align:center;font-family:sans-serif;padding:40px">
        <h2 style="margin-bottom:8px">${entry.name}</h2>
        ${entry.email ? `<p style="color:#666;margin:4px 0">${entry.email}</p>` : ""}
        ${entry.number ? `<p style="color:#666;margin:4px 0">${entry.number}</p>` : ""}
        <div style="margin:24px auto;display:inline-block">${svgData}</div>
        <p style="color:#999;font-size:12px;margin-top:8px">${entry.id}</p>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 flex flex-col items-center gap-4">
      <div ref={qrRef}>
        <QRCodeSVG value={entry.id} size={200} level="H" />
      </div>
      <div className="text-center">
        <p className="font-semibold text-gray-900 dark:text-white">{entry.name}</p>
        {entry.email && <p className="text-sm text-gray-500 dark:text-gray-400">{entry.email}</p>}
        {entry.number && <p className="text-sm text-gray-500 dark:text-gray-400">{entry.number}</p>}
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 font-mono break-all">{entry.id}</p>
      </div>
      <button
        onClick={handlePrint}
        className="px-5 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition"
      >
        Print / Save QR
      </button>
    </div>
  );
}
