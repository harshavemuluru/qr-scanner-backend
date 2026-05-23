"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface Entry {
  id: string;
  name: string;
  email: string | null;
  number: string | null;
  checkedin: boolean;
  created_at: string;
}

type ScanState =
  | { status: "idle" }
  | { status: "scanning" }
  | { status: "loading" }
  | { status: "not_found"; scannedId: string }
  | { status: "found"; entry: Entry }
  | { status: "just_checked_in"; entry: Entry }
  | { status: "checked_in"; entry: Entry };

export default function QRScanner() {
  const scannerRef = useRef<InstanceType<typeof import("html5-qrcode").Html5Qrcode> | null>(null);
  const [state, setState] = useState<ScanState>({ status: "idle" });
  const [checkingIn, setCheckingIn] = useState(false);
  const isProcessing = useRef(false);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const scannerState = scannerRef.current.getState();
        if (scannerState === 2) {
          await scannerRef.current.stop();
        }
      } catch {
        // ignore stop errors
      }
      scannerRef.current = null;
    }
  }, []);

  const startScanner = useCallback(async () => {
    setState({ status: "scanning" });
    isProcessing.current = false;

    const { Html5Qrcode } = await import("html5-qrcode");
    scannerRef.current = new Html5Qrcode("qr-reader");

    await scannerRef.current.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      async (decodedText) => {
        if (isProcessing.current) return;
        isProcessing.current = true;

        await stopScanner();
        setState({ status: "loading" });

        const uuid = decodedText.trim();
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        if (!uuidRegex.test(uuid)) {
          setState({ status: "not_found", scannedId: uuid });
          return;
        }

        try {
          const res = await fetch(`/api/entries/${uuid}`);
          if (!res.ok) {
            setState({ status: "not_found", scannedId: uuid });
            return;
          }
          const entry: Entry = await res.json();
          setState(entry.checkedin ? { status: "checked_in", entry } : { status: "found", entry });
        } catch {
          setState({ status: "not_found", scannedId: uuid });
        }
      },
      undefined
    );
  }, [stopScanner]);

  useEffect(() => {
    return () => { stopScanner(); };
  }, [stopScanner]);

  const handleCheckIn = async () => {
    if (state.status !== "found") return;
    setCheckingIn(true);
    try {
      const res = await fetch(`/api/entries/${state.entry.id}`, { method: "PATCH" });
      const updated: Entry = await res.json();
      setState({ status: "just_checked_in", entry: updated });
    } catch {
      // keep state, let user retry
    } finally {
      setCheckingIn(false);
    }
  };

  const reset = () => {
    setState({ status: "idle" });
    isProcessing.current = false;
  };

  return (
    <div className="space-y-6">
      {(state.status === "idle") && (
        <div className="text-center space-y-4">
          <div className="text-6xl">📷</div>
          <p className="text-gray-500 dark:text-gray-400">Ready to scan a VIP QR code</p>
          <button
            onClick={startScanner}
            className="px-8 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition"
          >
            Start Scanner
          </button>
        </div>
      )}

      {state.status === "scanning" && (
        <div className="space-y-4">
          <div id="qr-reader" className="rounded-2xl overflow-hidden w-full max-w-sm mx-auto" />
          <button
            onClick={async () => { await stopScanner(); setState({ status: "idle" }); }}
            className="w-full py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Cancel
          </button>
        </div>
      )}

      {state.status === "loading" && (
        <div className="text-center py-12 space-y-3">
          <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 dark:text-gray-400">Looking up entry...</p>
        </div>
      )}

      {state.status === "not_found" && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 text-center">
            <div className="text-4xl mb-3">❌</div>
            <p className="text-red-700 dark:text-red-400 font-semibold text-lg">Invalid QR Code</p>
            <p className="text-red-500 dark:text-red-400 text-sm mt-1 font-mono break-all">{state.scannedId}</p>
            <p className="text-red-400 dark:text-red-500 text-sm mt-1">No entry found with this ID</p>
          </div>
          <button onClick={reset} className="w-full py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            Scan Again
          </button>
        </div>
      )}

      {state.status === "found" && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center text-lg">✓</div>
              <div>
                <p className="text-green-700 dark:text-green-400 font-semibold">Valid VIP Entry</p>
                <p className="text-green-500 dark:text-green-500 text-xs">Not yet checked in</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-gray-900 dark:text-white font-semibold text-lg">{state.entry.name}</p>
              {state.entry.email && <p className="text-gray-500 dark:text-gray-400 text-sm">{state.entry.email}</p>}
              {state.entry.number && <p className="text-gray-500 dark:text-gray-400 text-sm">{state.entry.number}</p>}
            </div>
          </div>
          <button
            onClick={handleCheckIn}
            disabled={checkingIn}
            className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 transition"
          >
            {checkingIn ? "Checking in..." : "Check In"}
          </button>
          <button onClick={reset} className="w-full py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            Scan Another
          </button>
        </div>
      )}

      {state.status === "just_checked_in" && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6 text-center">
            <div className="text-5xl mb-3">🎉</div>
            <p className="text-green-700 dark:text-green-400 font-bold text-2xl">Welcome, {state.entry.name}!</p>
            <p className="text-green-600 dark:text-green-500 text-sm mt-1">Checked in successfully</p>
            <div className="mt-4 space-y-1">
              {state.entry.email && <p className="text-gray-500 dark:text-gray-400 text-sm">{state.entry.email}</p>}
              {state.entry.number && <p className="text-gray-500 dark:text-gray-400 text-sm">{state.entry.number}</p>}
            </div>
          </div>
          <button onClick={reset} className="w-full py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            Scan Another
          </button>
        </div>
      )}

      {state.status === "checked_in" && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center text-lg">⚠️</div>
              <div>
                <p className="text-amber-700 dark:text-amber-400 font-semibold">Already Checked In</p>
                <p className="text-amber-500 dark:text-amber-500 text-xs">This VIP has already entered</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-gray-900 dark:text-white font-semibold text-lg">{state.entry.name}</p>
              {state.entry.email && <p className="text-gray-500 dark:text-gray-400 text-sm">{state.entry.email}</p>}
              {state.entry.number && <p className="text-gray-500 dark:text-gray-400 text-sm">{state.entry.number}</p>}
            </div>
          </div>
          <button onClick={reset} className="w-full py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            Scan Another
          </button>
        </div>
      )}
    </div>
  );
}
