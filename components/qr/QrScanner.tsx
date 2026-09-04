"use client";

import { useEffect, useId, useRef, useState } from "react";
import { parseBatchCode } from "@/lib/qr";

type Html5QrcodeInstance = {
  start: (
    cameraIdOrConfig: string | MediaTrackConstraints,
    configuration: { fps: number; qrbox: { width: number; height: number } },
    onSuccess: (decodedText: string) => void,
    onError: () => void
  ) => Promise<null>;
  stop: () => Promise<void>;
  clear: () => void;
  isScanning: boolean;
};

export function QrScanner({
  onDecoded,
  placeholder = "e.g. AGS-K7M2QX",
  tone = "buyer",
}: {
  onDecoded: (code: string) => void;
  placeholder?: string;
  tone?: "buyer" | "logistics";
}) {
  const reactId = useId().replace(/:/g, "");
  const elementId = `qr-reader-${reactId}`;
  const scannerRef = useRef<Html5QrcodeInstance | null>(null);
  const handledRef = useRef(false);
  const onDecodedRef = useRef(onDecoded);
  onDecodedRef.current = onDecoded;
  const [live, setLive] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [typed, setTyped] = useState("");

  const primary =
    tone === "logistics"
      ? "bg-green-600 hover:bg-green-700 text-white"
      : "bg-forest-mid hover:bg-forest-light text-white";
  const outline =
    tone === "logistics"
      ? "border-green-600 text-green-700 hover:bg-green-50"
      : "border-forest-mid text-forest-mid hover:bg-sage-pale";
  const inputClass =
    tone === "logistics"
      ? "w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-mono outline-none focus:border-green-500 text-center"
      : "w-full px-3 py-2.5 bg-ivory border border-border rounded-xl text-sm text-forest font-mono outline-none focus:border-forest-mid text-center";

  useEffect(() => {
    if (!live) return;
    let cancelled = false;
    handledRef.current = false;

    async function run() {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (cancelled) return;
      const html5 = new Html5Qrcode(elementId, { verbose: false }) as unknown as Html5QrcodeInstance;
      scannerRef.current = html5;

      const onSuccess = (decodedText: string) => {
        if (handledRef.current) return;
        const code = parseBatchCode(decodedText);
        if (!code) {
          setParseError("That QR is not an Agri Setu batch. Use the crate label or type AGS-XXXXXX.");
          return;
        }
        handledRef.current = true;
        onDecodedRef.current(code);
        setLive(false);
      };

      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cancelled) return;
        const cameraId = cameras[0]?.id;
        if (!cameraId) throw new Error("No camera found");
        await html5.start(
          cameraId,
          { fps: 8, qrbox: { width: 220, height: 220 } },
          onSuccess,
          () => {}
        );
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Camera unavailable";
        setCamError(`${message}. Type the batch ID instead.`);
        setLive(false);
      }
    }

    void run();

    return () => {
      cancelled = true;
      const instance = scannerRef.current;
      scannerRef.current = null;
      if (!instance) return;
      const halt = instance.isScanning ? instance.stop() : Promise.resolve();
      void halt
        .catch(() => undefined)
        .then(() => {
          try {
            instance.clear();
          } catch {
            // already torn down
          }
        });
    };
  }, [live, elementId]);

  function resolveTyped(raw: string): string | null {
    const direct = parseBatchCode(raw);
    if (direct) return direct;
    const trimmed = raw.trim().toUpperCase();
    if (!trimmed) return null;
    return parseBatchCode(trimmed.startsWith("AGS-") ? trimmed : `AGS-${trimmed}`);
  }

  function submitTyped(e: React.FormEvent) {
    e.preventDefault();
    const code = resolveTyped(typed);
    if (!code) {
      setParseError("Use a batch code like AGS-K7M2QX.");
      return;
    }
    setParseError(null);
    setLive(false);
    onDecoded(code);
  }

  return (
    <div className="text-center">
      <div className="relative mx-auto mb-5 h-56 w-56 overflow-hidden rounded-2xl bg-black md:h-64 md:w-64">
        <div id={elementId} className="absolute inset-0 [&_video]:h-full [&_video]:w-full [&_video]:object-cover" />
        {!live && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#1A2E1E]">
            {[
              "top-3 left-3 border-l-2 border-t-2",
              "top-3 right-3 border-r-2 border-t-2",
              "bottom-3 left-3 border-l-2 border-b-2",
              "bottom-3 right-3 border-r-2 border-b-2",
            ].map((cls) => (
              <div key={cls} className={`absolute h-7 w-7 rounded-sm border-white/70 ${cls}`} />
            ))}
            <span className="text-[11px] text-white/60">Align QR inside frame</span>
          </div>
        )}
      </div>

      {!live ? (
        <button
          type="button"
          onClick={() => {
            setCamError(null);
            setParseError(null);
            setLive(true);
          }}
          className={`mb-3 w-full rounded-xl py-3.5 font-semibold transition-colors ${primary}`}
        >
          Tap to Scan QR Code
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setLive(false)}
          className={`mb-3 w-full rounded-xl border py-3.5 font-semibold transition-colors ${outline}`}
        >
          Stop camera
        </button>
      )}

      {(camError || parseError) && (
        <p className="mb-3 text-xs text-amber-700">{parseError ?? camError}</p>
      )}

      <p className={`mb-2 text-xs ${tone === "logistics" ? "text-slate-500" : "text-sage"}`}>
        Or enter batch ID manually
      </p>
      <form onSubmit={submitTyped} className="flex flex-col gap-2">
        <input
          type="text"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={placeholder}
          autoCapitalize="characters"
          className={inputClass}
        />
        {typed.trim() ? (
          <button type="submit" className={`w-full rounded-xl border py-2.5 text-sm font-medium transition-colors ${outline}`}>
            Verify batch ID
          </button>
        ) : null}
      </form>
    </div>
  );
}
