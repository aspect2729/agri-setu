"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { placeDirectOrder } from "@/lib/actions";
import { GRADE_WEIGHT } from "@/lib/utils";
import type { QualityGrade } from "@/lib/types";
import { ActionForm, Field, inputClass } from "@/components/action-form";
import { EmptyState, StatusBadge } from "@/components/ui";

export type BrowseBatch = {
  id: string;
  batchCode: string;
  crop: string;
  grade: QualityGrade | null;
  qualityNotes: string | null;
  availableKg: number;
  pricePerKg: number;
  storeName: string;
  storeVillage: string;
  distanceKm: number | null;
  receivedAt: string;
  farmerVillage: string | null;
};

/**
 * Composite 0–100 score: cheaper, better graded, bigger and closer batches
 * rank higher. Price/quantity/distance are normalized across the visible set.
 */
function scoreBatches(batches: BrowseBatch[]): Map<string, number> {
  const prices = batches.map((b) => b.pricePerKg);
  const qtys = batches.map((b) => b.availableKg);
  const dists = batches.filter((b) => b.distanceKm != null).map((b) => b.distanceKm!);

  const [minP, maxP] = [Math.min(...prices), Math.max(...prices)];
  const maxQ = Math.max(...qtys);
  const maxD = dists.length > 0 ? Math.max(...dists) : 0;

  const scores = new Map<string, number>();
  for (const b of batches) {
    const priceScore = maxP === minP ? 1 : 1 - (b.pricePerKg - minP) / (maxP - minP);
    const qualityScore = b.grade ? GRADE_WEIGHT[b.grade] : 0.5;
    const qtyScore = maxQ === 0 ? 0 : b.availableKg / maxQ;
    const distScore =
      b.distanceKm == null || maxD === 0 ? null : 1 - b.distanceKm / maxD;

    let total = 0.35 * priceScore + 0.3 * qualityScore + 0.15 * qtyScore;
    let weight = 0.8;
    if (distScore != null) {
      total += 0.2 * distScore;
      weight = 1;
    }
    scores.set(b.id, Math.round((total / weight) * 100));
  }
  return scores;
}

export function BuyerBrowse({ batches }: { batches: BrowseBatch[] }) {
  const [crop, setCrop] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minQty, setMinQty] = useState("");
  const [minGrade, setMinGrade] = useState("");
  const [maxDistance, setMaxDistance] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const gradeRank = { A: 3, B: 2, C: 1 } as const;
    return batches.filter((b) => {
      if (crop && !b.crop.toLowerCase().includes(crop.toLowerCase())) return false;
      if (maxPrice && b.pricePerKg > Number(maxPrice)) return false;
      if (minQty && b.availableKg < Number(minQty)) return false;
      if (minGrade) {
        const rank = b.grade ? gradeRank[b.grade] : 0;
        if (rank < gradeRank[minGrade as QualityGrade]) return false;
      }
      if (maxDistance && (b.distanceKm == null || b.distanceKm > Number(maxDistance)))
        return false;
      return true;
    });
  }, [batches, crop, maxPrice, minQty, minGrade, maxDistance]);

  const scores = useMemo(
    () => (filtered.length > 0 ? scoreBatches(filtered) : new Map<string, number>()),
    [filtered]
  );

  const ranked = useMemo(
    () => [...filtered].sort((a, b) => (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0)),
    [filtered, scores]
  );

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
        <input
          placeholder="Crop…"
          value={crop}
          onChange={(e) => setCrop(e.target.value)}
          className={inputClass}
        />
        <input
          placeholder="Max ₹/kg"
          type="number"
          min="0"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className={inputClass}
        />
        <input
          placeholder="Min kg"
          type="number"
          min="0"
          value={minQty}
          onChange={(e) => setMinQty(e.target.value)}
          className={inputClass}
        />
        <select value={minGrade} onChange={(e) => setMinGrade(e.target.value)} className={inputClass}>
          <option value="">Any grade</option>
          <option value="A">Grade A only</option>
          <option value="B">Grade B or better</option>
          <option value="C">Grade C or better</option>
        </select>
        <input
          placeholder="Max km"
          type="number"
          min="0"
          value={maxDistance}
          onChange={(e) => setMaxDistance(e.target.value)}
          className={inputClass}
        />
      </div>

      {ranked.length === 0 ? (
        <EmptyState message="No batches match these filters." />
      ) : (
        <ul className="space-y-3">
          {ranked.map((b) => {
            const score = scores.get(b.id) ?? 0;
            const open = openId === b.id;
            return (
              <li key={b.id} className="rounded-xl border border-green-100 bg-white">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : b.id)}
                  className="flex w-full items-center gap-4 px-4 py-3 text-left"
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl text-white ${
                      score >= 75 ? "bg-green-700" : score >= 50 ? "bg-green-600/80" : "bg-gray-400"
                    }`}
                  >
                    <span className="text-sm font-bold leading-none">{score}</span>
                    <span className="text-[9px] uppercase">score</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-gray-900">{b.crop}</span>
                      {b.grade && <StatusBadge status={`grade ${b.grade}`} />}
                      <span className="font-mono text-xs text-gray-400">{b.batchCode}</span>
                    </span>
                    <span className="mt-0.5 block text-xs text-gray-500">
                      {b.storeName} — {b.storeVillage}
                      {b.distanceKm != null && ` · ${b.distanceKm.toFixed(1)} km away`}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block font-bold text-green-800">₹{b.pricePerKg}/kg</span>
                    <span className="block text-xs text-gray-500">{b.availableKg} kg available</span>
                  </span>
                </button>

                {open && (
                  <div className="grid gap-4 border-t border-green-50 px-4 py-4 sm:grid-cols-2">
                    <div className="space-y-1.5 text-sm text-gray-600">
                      <p className="font-semibold text-gray-900">Batch details</p>
                      <p>
                        Quality: grade {b.grade ?? "—"}
                        {b.qualityNotes && <span className="text-gray-400"> — {b.qualityNotes}</span>}
                      </p>
                      <p>Origin: {b.farmerVillage ?? b.storeVillage} (via {b.storeName})</p>
                      <p>Received: {new Date(b.receivedAt).toLocaleDateString("en-IN")}</p>
                      <p>
                        Traceability:{" "}
                        <Link
                          href={`/trace/${b.batchCode}`}
                          className="font-mono font-semibold text-green-700 hover:underline"
                        >
                          {b.batchCode}
                        </Link>
                      </p>
                    </div>
                    <ActionForm action={placeDirectOrder} submitLabel={`Order ${b.crop.toLowerCase()}`}>
                      <input type="hidden" name="submission_id" value={b.id} />
                      <div className="grid grid-cols-2 gap-2">
                        <Field label={`Quantity (max ${b.availableKg} kg)`}>
                          <input
                            name="quantity_kg"
                            type="number"
                            min="1"
                            max={b.availableKg}
                            step="0.5"
                            required
                            className={inputClass}
                          />
                        </Field>
                        <Field label="Deliver to">
                          <input
                            name="delivery_location"
                            placeholder="e.g. City warehouse"
                            className={inputClass}
                          />
                        </Field>
                      </div>
                    </ActionForm>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Type or scan a batch code to verify a package's origin and quality. */
export function BatchVerifier() {
  const router = useRouter();
  const [code, setCode] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (code.trim()) router.push(`/trace/${code.trim().toUpperCase()}`);
      }}
      className="flex gap-2"
    >
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="e.g. AGS-K7M2QX"
        className={inputClass}
      />
      <button
        type="submit"
        className="shrink-0 rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-800"
      >
        Verify
      </button>
    </form>
  );
}
