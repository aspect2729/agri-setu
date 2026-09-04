"use client";

import { useState } from "react";
import type { AppNav } from "../nav";
import { useBuyerData } from "../data-context";
import { lookupBatch, confirmReceipt } from "@/lib/actions";
import type { BatchLookup } from "@/lib/qr";
import { codesMatch } from "@/lib/qr";
import { QrScanner } from "@/components/qr/QrScanner";
import { BatchOriginCard } from "@/components/qr/BatchOriginCard";
import { cropImage } from "../map-data";

type ScanState = "idle" | "loading" | "verified" | "missing";

export default function QRVerify({ navigate }: AppNav) {
  const { orders } = useBuyerData();
  const [state, setState] = useState<ScanState>("idle");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [batch, setBatch] = useState<BatchLookup | null>(null);
  const [confirming, setConfirming] = useState(false);

  const matchedOrder = batch
    ? orders.find((o) => codesMatch(o.batchId, batch.batchCode))
    : undefined;

  async function verify(raw: string) {
    setState("loading");
    setError(null);
    setCode(raw);
    const result = await lookupBatch(raw);
    if (result.error || !result.batch) {
      setError(result.error ?? "Batch not found.");
      setBatch(null);
      setState("missing");
      return;
    }
    setBatch(result.batch);
    setState("verified");
  }

  function reset() {
    setState("idle");
    setBatch(null);
    setError(null);
    setCode("");
  }

  async function onConfirmReceipt() {
    if (!matchedOrder || matchedOrder.status !== "delivered") return;
    setConfirming(true);
    await confirmReceipt(matchedOrder.rawId);
    setConfirming(false);
    navigate("my-orders");
  }

  if (state === "verified" && batch) {
    return (
      <div className="max-w-screen-lg mx-auto px-4 md:px-8 py-5 md:py-8 fade-in">
        <div className="flex items-center gap-2 text-xs text-sage mb-4">
          <button onClick={reset} className="hover:text-forest">Scan Again</button>
          <span>›</span>
          <span className="text-forest">Verification Result</span>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden mb-4">
          <div className="bg-forest-mid px-5 py-4 md:px-6 md:py-5 flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 12l6 6L20 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h2 className="font-serif text-lg md:text-xl font-medium text-white">Produce Verified</h2>
              <p className="text-white/70 text-xs md:text-sm mt-0.5">
                Authenticity confirmed · Batch {batch.batchCode}
              </p>
            </div>
          </div>

          <div className="p-4 md:p-6">
            <div className="flex items-center gap-3 mb-5">
              <img
                src={cropImage(batch.crop)}
                alt={batch.crop}
                className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover bg-ivory-dark shrink-0"
              />
              <div>
                <h3 className="font-serif text-xl md:text-2xl font-medium text-forest">{batch.crop}</h3>
                <p className="text-xs text-sage mt-1">
                  {matchedOrder
                    ? `Matches your order ${matchedOrder.id}`
                    : "Verified Agri Setu batch — not tied to one of your current orders"}
                </p>
              </div>
            </div>
            <BatchOriginCard batch={batch} />
            {batch.qualityNotes && (
              <p className="mt-4 text-xs text-sage">Inspection notes: {batch.qualityNotes}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {matchedOrder?.status === "delivered" && (
            <button
              onClick={onConfirmReceipt}
              disabled={confirming}
              className="flex-1 py-3 bg-forest-mid text-white font-medium rounded-xl hover:bg-forest-light transition-colors text-sm disabled:opacity-60"
            >
              {confirming ? "Confirming…" : "Confirm receipt"}
            </button>
          )}
          <button
            onClick={() => navigate("my-orders")}
            className={`flex-1 py-3 font-medium rounded-xl transition-colors text-sm ${
              matchedOrder?.status === "delivered"
                ? "border border-border text-forest hover:bg-ivory-dark"
                : "bg-forest-mid text-white hover:bg-forest-light"
            }`}
          >
            Go to My Orders
          </button>
          <button
            onClick={reset}
            className="flex-1 py-3 border border-border text-forest font-medium rounded-xl hover:bg-ivory-dark transition-colors text-sm"
          >
            Scan Another
          </button>
        </div>
      </div>
    );
  }

  if (state === "missing") {
    return (
      <div className="max-w-screen-lg mx-auto px-4 md:px-8 py-5 md:py-8 fade-in">
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-pale flex items-center justify-center mx-auto mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#E9A23B" strokeWidth="1.8" />
              <path d="M12 8v5M12 16h.01" stroke="#E9A23B" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="font-serif text-xl font-medium text-forest mb-1">Batch not found</h2>
          <p className="text-sm text-sage mb-5">
            {error ?? (code ? `No batch matched “${code}”. Check the crate label.` : "Could not verify this package.")}
          </p>
          <button
            onClick={reset}
            className="w-full py-3 bg-forest-mid text-white font-medium rounded-xl hover:bg-forest-light transition-colors text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-lg mx-auto px-4 md:px-8 py-5 md:py-8">
      <div className="mb-5 md:mb-8 md:text-left text-center">
        <h1 className="font-serif text-2xl md:text-3xl font-medium text-forest">Verify Produce</h1>
        <p className="text-sage mt-1.5 text-sm">
          Scan the QR on your delivery to confirm authenticity and origin — results stay in this app.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="bg-white rounded-2xl border border-border shadow-sm p-5 md:p-8 mb-4 lg:mb-0">
          {state === "loading" ? (
            <div className="text-center py-8 fade-in">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <svg className="animate-spin w-20 h-20" viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="36" stroke="#EEF1EE" strokeWidth="4" />
                  <circle cx="40" cy="40" r="36" stroke="#1B7A3D" strokeWidth="4" strokeDasharray="113 113" strokeDashoffset="80" strokeLinecap="round" />
                </svg>
              </div>
              <p className="font-medium text-forest">Verifying produce...</p>
              <p className="text-xs text-sage mt-1">Checking batch records and origin data</p>
            </div>
          ) : (
            <QrScanner onDecoded={(scanned) => void verify(scanned)} />
          )}
        </div>

        {state === "idle" && (
          <div className="bg-sage-pale/50 border border-sage-light/30 rounded-xl p-5 md:p-8 flex gap-3 lg:min-h-full">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" className="shrink-0 mt-0.5 text-forest-mid">
              <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9 5v5M9 13h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div>
              <p className="text-sm font-medium text-forest-mid">How to use</p>
              <p className="text-sm text-sage mt-2 leading-relaxed">
                Point the camera at the crate QR, or type the batch ID. We look up the White Store lot and show grade, weight, and origin here.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-sage">
                <li>1. Align the crate QR inside the frame, or type the batch ID.</li>
                <li>2. We match it to the graded lot in Agri Setu — not a guess from the marketplace.</li>
                <li>3. Confirm origin, grade, and quantity before you accept delivery.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
