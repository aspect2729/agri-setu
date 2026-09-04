"use client";

import { useState } from "react";
import { lookupBatch } from "@/lib/actions";
import { codesMatch, type BatchLookup } from "@/lib/qr";
import { QrScanner } from "@/components/qr/QrScanner";
import { BatchOriginCard } from "@/components/qr/BatchOriginCard";

export function TripBatchScan({
  expectedCode,
  title,
  hint,
  onMatched,
}: {
  expectedCode: string;
  title: string;
  hint: string;
  onMatched: (batch: BatchLookup) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [batch, setBatch] = useState<BatchLookup | null>(null);

  async function onDecoded(code: string) {
    setLoading(true);
    setError(null);
    const result = await lookupBatch(code);
    setLoading(false);
    if (result.error || !result.batch) {
      setError(result.error ?? "Batch not found.");
      setBatch(null);
      return;
    }
    if (!codesMatch(code, expectedCode) && !codesMatch(result.batch.batchCode, expectedCode)) {
      setError(`This crate is ${result.batch.batchCode}, not this trip’s batch ${expectedCode}.`);
      setBatch(result.batch);
      return;
    }
    setBatch(result.batch);
    onMatched(result.batch);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
      <div>
        <h2 className="text-[13px] font-semibold text-slate-900">{title}</h2>
        <p className="text-[12px] text-slate-500 mt-1">{hint}</p>
        <p className="text-[11px] font-mono text-slate-400 mt-1">Expected {expectedCode}</p>
      </div>
      {loading ? (
        <p className="text-[13px] text-slate-500 text-center py-6">Checking batch records…</p>
      ) : batch && codesMatch(batch.batchCode, expectedCode) ? (
        <BatchOriginCard batch={batch} variant="logistics" />
      ) : (
        <QrScanner tone="logistics" onDecoded={(code) => void onDecoded(code)} />
      )}
      {error && <p className="text-[12px] text-red-600">{error}</p>}
    </div>
  );
}
