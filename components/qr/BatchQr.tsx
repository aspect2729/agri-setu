"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { batchTraceUrl } from "@/lib/qr";

export function BatchQr({
  code,
  size = 224,
}: {
  code: string;
  size?: number;
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      setSrc(null);
      return;
    }
    let cancelled = false;
    QRCode.toDataURL(batchTraceUrl(code), {
      width: size,
      margin: 1,
      color: { dark: "#1B7A3D", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) setSrc(url);
      })
      .catch(() => {
        if (!cancelled) setSrc(null);
      });
    return () => {
      cancelled = true;
    };
  }, [code, size]);

  if (!code) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl bg-white"
        style={{ width: size, height: size, boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}
      >
        <p className="text-xs text-slate-400">No batch code yet</p>
      </div>
    );
  }

  if (!src) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl bg-white"
        style={{ width: size, height: size, boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}
      >
        <p className="text-xs text-slate-400">Preparing QR…</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl bg-white p-3"
      style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={`QR code for batch ${code}`} width={size} height={size} />
    </div>
  );
}
