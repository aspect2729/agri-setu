"use client";

import { useEffect, useState } from "react";
import { DemoBadge } from "@/components/demo-badge";
import { getVehicleLocation } from "@/mock-data";
import type { VehicleLocation } from "@/mock-data";

export function SimulatedTracking({ shipmentId, from, to }: { shipmentId: string; from: string; to: string }) {
  const [loc, setLoc] = useState<VehicleLocation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      const result = await getVehicleLocation(shipmentId);
      if (cancelled) return;
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setError(null);
      setLoc(result.data);
    }
    refresh();
    const id = setInterval(refresh, 4000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [shipmentId]);

  const progress = Math.round((loc?.progress ?? 0) * 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Live vehicle position</p>
          <p className="text-[13px] font-semibold text-slate-800 mt-0.5">
            {from} → {to}
          </p>
        </div>
        <DemoBadge label="SIMULATED GPS" />
      </div>
      <div className="p-5 space-y-4">
        <div className="relative h-36 rounded-xl bg-slate-100 overflow-hidden">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_80%,#86efac,transparent_40%),radial-gradient(circle_at_80%_20%,#93c5fd,transparent_35%)]" />
          <div className="absolute left-4 bottom-4 w-3 h-3 rounded-full bg-green-600 ring-4 ring-green-200" />
          <div className="absolute right-4 top-4 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-blue-200" />
          <div className="absolute left-6 right-6 top-1/2 h-0.5 bg-slate-300" />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-amber-400 border-2 border-white shadow-md flex items-center justify-center text-sm transition-all duration-700"
            style={{ left: `calc(8% + ${progress * 0.8}%)` }}
          >
            🚛
          </div>
        </div>
        {error && <p className="text-[12px] text-red-600">{error}</p>}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[12px]">
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <p className="text-slate-400">Latitude</p>
            <p className="font-mono font-semibold text-slate-800">{loc ? loc.lat.toFixed(5) : "—"}</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <p className="text-slate-400">Longitude</p>
            <p className="font-mono font-semibold text-slate-800">{loc ? loc.lng.toFixed(5) : "—"}</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <p className="text-slate-400">Speed</p>
            <p className="font-semibold text-slate-800">{loc ? `${loc.speedKmh} km/h` : "—"}</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <p className="text-slate-400">Progress</p>
            <p className="font-semibold text-slate-800">{progress}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
