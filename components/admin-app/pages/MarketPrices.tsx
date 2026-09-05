"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { DemoBadge } from "@/components/demo-badge";
import { getMarketPrices } from "@/mock-data";
import type { MarketPrice } from "@/mock-data";
import type { NavContext } from "../nav";
import { inr, latestRows, MANDI_CROPS, storeQuintal } from "@/components/market-prices/shared";

function TrendMark({ trend }: { trend: MarketPrice["trend"] }) {
  if (trend === "up") return <TrendingUp size={14} className="text-[#22A357]" />;
  if (trend === "down") return <TrendingDown size={14} className="text-[#D94F4F]" />;
  return <Minus size={14} className="text-[#8FA898]" />;
}

export default function MarketPrices({ navCtx: _navCtx }: { navCtx: NavContext }) {
  const [crop, setCrop] = useState("Tomato");
  const [market, setMarket] = useState("K.R. Market");
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMarketPrices(crop).then((res) => {
      if (cancelled) return;
      setLoading(false);
      if (!res.ok) {
        setError(res.error);
        setPrices([]);
        return;
      }
      setError(null);
      setPrices(res.data);
    });
    return () => {
      cancelled = true;
    };
  }, [crop]);

  const today = useMemo(() => latestRows(prices), [prices]);
  const markets = useMemo(() => [...new Set(prices.map((p) => p.market))], [prices]);
  const storeQ = storeQuintal(crop);

  const chart = useMemo(() => {
    const name = markets.includes(market) ? market : markets[0] ?? "K.R. Market";
    return prices
      .filter((p) => p.market === name)
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((p) => ({
        date: p.date.slice(5),
        modal: p.modalPrice,
        min: p.minPrice,
        max: p.maxPrice,
      }));
  }, [prices, market, markets]);

  const avgModal = today.length
    ? Math.round(today.reduce((s, p) => s + p.modalPrice, 0) / today.length)
    : 0;
  const high = today[0]
    ? today.reduce((m, p) => (p.modalPrice > m.modalPrice ? p : m), today[0])
    : undefined;
  const low = today[0]
    ? today.reduce((m, p) => (p.modalPrice < m.modalPrice ? p : m), today[0])
    : undefined;
  const vsStore = storeQ && avgModal ? Math.round(((storeQ - avgModal) / avgModal) * 100) : null;

  return (
    <div className="max-w-[1440px] mx-auto px-8 py-8 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[22px] font-semibold text-[#1A2E1E]">Market prices</h1>
            <DemoBadge label="SIMULATED MANDI" />
          </div>
          <p className="text-[13px] text-[#5A7263] max-w-2xl">
            Demo APMC feed (₹ / quintal) for Karnataka markets. Same shape as Agmarknet / eNAM — swap the service later; the page stays.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {MANDI_CROPS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCrop(c)}
            className={`px-3.5 py-2 rounded-xl text-[13px] font-semibold ${
              crop === c ? "bg-[#1B7A3D] text-white" : "bg-white border border-[#EEF1EE] text-[#5A7263]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-[#D94F4F]">{error}</p>}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "APMC average", value: avgModal ? inr(avgModal) : "—", sub: "Modal across 8 markets" },
          { label: "Highest mandi", value: high ? inr(high.modalPrice) : "—", sub: high?.market ?? "" },
          { label: "Lowest mandi", value: low ? inr(low.modalPrice) : "—", sub: low?.market ?? "" },
          {
            label: "White Store Grade A",
            value: storeQ ? inr(storeQ) : "—",
            sub: vsStore == null ? "₹/quintal equivalent" : `${vsStore >= 0 ? "+" : ""}${vsStore}% vs APMC avg`,
          },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-2xl border border-[#EEF1EE] p-5">
            <p className="text-[11px] font-semibold text-[#8FA898] uppercase tracking-wide">{k.label}</p>
            <p className="text-[26px] font-semibold text-[#1A2E1E] mt-2">{loading ? "…" : k.value}</p>
            <p className="text-[12px] text-[#5A7263] mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <div className="xl:col-span-3 bg-white rounded-2xl border border-[#EEF1EE] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#EEF1EE] flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[14px] font-semibold">{crop} · today</h2>
              <p className="text-[12px] text-[#8FA898]">{today[0]?.date ?? "—"} · ₹ / quintal</p>
            </div>
          </div>
          <table className="w-full text-[13px]">
            <thead className="bg-[#F7F8F5] text-[#8FA898] text-[11px] uppercase">
              <tr>
                <th className="text-left px-5 py-3">Market</th>
                <th className="text-right px-4 py-3">Min</th>
                <th className="text-right px-4 py-3">Modal</th>
                <th className="text-right px-4 py-3">Max</th>
                <th className="text-right px-5 py-3">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F7F8F5]">
              {today.map((row) => (
                <tr
                  key={row.market}
                  className={`cursor-pointer ${row.market === market ? "bg-[#E8F5EE]" : "hover:bg-[#F7F8F5]"}`}
                  onClick={() => setMarket(row.market)}
                >
                  <td className="px-5 py-3">
                    <p className="font-semibold text-[#1A2E1E]">{row.market}</p>
                    <p className="text-[11px] text-[#8FA898]">{row.location}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">{inr(row.minPrice)}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold">{inr(row.modalPrice)}</td>
                  <td className="px-4 py-3 text-right font-mono">{inr(row.maxPrice)}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end">
                      <TrendMark trend={row.trend} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="xl:col-span-2 bg-white rounded-2xl border border-[#EEF1EE] p-5">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h2 className="text-[14px] font-semibold">21-day modal</h2>
            <select
              value={markets.includes(market) ? market : markets[0] ?? ""}
              onChange={(e) => setMarket(e.target.value)}
              className="text-[12px] bg-[#F7F8F5] rounded-lg px-2 py-1.5 outline-none max-w-[160px]"
            >
              {markets.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <p className="text-[12px] text-[#8FA898] mb-4">Hourly jitter on the seed trend · {crop}</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF1EE" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} width={48} />
                <Tooltip formatter={(v) => inr(Number(v ?? 0))} />
                <Area dataKey="modal" name="Modal" stroke="#1B7A3D" fill="#E8F5EE" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
