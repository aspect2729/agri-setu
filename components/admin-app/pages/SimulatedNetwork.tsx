"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Radio } from "lucide-react";
import { DemoBadge } from "@/components/demo-badge";
import {
  computeAnalytics,
  getMarketPrices,
  getVehicleLocation,
  processPayment,
  readNotifications,
  readOrders,
  readPayments,
  readShipments,
  readVerifications,
} from "@/mock-data";
import type { MarketPrice, VehicleLocation } from "@/mock-data";
import type { NavContext } from "../nav";

type Tab = "analytics" | "prices" | "verification" | "payments" | "gps";

function inr(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function SimulatedNetwork({ navCtx: _navCtx }: { navCtx: NavContext }) {
  const [tab, setTab] = useState<Tab>("analytics");
  const analytics = useMemo(() => computeAnalytics(), []);
  const [crop, setCrop] = useState("Tomato");
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [payBusy, setPayBusy] = useState<string | null>(null);
  const [payHint, setPayHint] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const payments = useMemo(() => readPayments(), [tick]);
  const pendingPay = payments.find((p) => p.status === "pending");
  const activeShip = readShipments().find((s) => s.status === "in_transit");
  const [gps, setGps] = useState<VehicleLocation | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMarketPrices(crop).then((res) => {
      if (cancelled) return;
      if (!res.ok) setPriceError(res.error);
      else {
        setPriceError(null);
        setPrices(res.data);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [crop]);

  useEffect(() => {
    if (!activeShip) return;
    let cancelled = false;
    async function refresh() {
      const res = await getVehicleLocation(activeShip!.shipmentId);
      if (!cancelled && res.ok) setGps(res.data);
    }
    refresh();
    const id = setInterval(refresh, 4000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [activeShip]);

  const chart = prices
    .filter((p) => p.market === "K.R. Market")
    .slice()
    .reverse()
    .map((p) => ({ date: p.date.slice(5), modal: p.modalPrice, min: p.minPrice, max: p.maxPrice }));

  async function pay() {
    if (!pendingPay) return;
    setPayBusy(pendingPay.orderId);
    const res = await processPayment(pendingPay.orderId);
    setPayBusy(null);
    setPayHint(res.ok ? `Paid ₹${res.data.amount.toLocaleString("en-IN")} (simulated)` : res.error);
    setTick((n) => n + 1);
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "analytics", label: "Analytics" },
    { id: "prices", label: "Market prices" },
    { id: "verification", label: "Farmer verification" },
    { id: "payments", label: "Payments" },
    { id: "gps", label: "GPS / logistics API" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[22px] font-semibold text-[#1A2E1E]">Simulated network</h1>
            <DemoBadge />
          </div>
          <p className="text-[13px] text-[#5A7263]">
            Marketplace demo data from <span className="font-mono">/mock-data</span>. Live White Store activity still comes from Supabase.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3.5 py-2 rounded-xl text-[13px] font-semibold ${
              tab === t.id ? "bg-[#1B7A3D] text-white" : "bg-white border border-[#EEF1EE] text-[#5A7263]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "analytics" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { label: "Total revenue", value: inr(analytics.totalRevenue), sub: `${analytics.completedOrders} delivered orders` },
              { label: "Avg order value", value: inr(analytics.averageOrderValue), sub: `${analytics.totalOrders} orders total` },
              { label: "Active farmers", value: String(analytics.activeFarmers), sub: `${analytics.totalFarmers} registered` },
              { label: "On-time deliveries", value: `${analytics.logisticsPerformance.onTimePercent}%`, sub: `${analytics.logisticsPerformance.onTime} of ${analytics.logisticsPerformance.delivered}` },
            ].map((k) => (
              <div key={k.label} className="bg-white rounded-2xl border border-[#EEF1EE] p-5">
                <p className="text-[11px] font-semibold text-[#8FA898] uppercase tracking-wide">{k.label}</p>
                <p className="text-[26px] font-semibold text-[#1A2E1E] mt-2">{k.value}</p>
                <p className="text-[12px] text-[#5A7263] mt-1">{k.sub}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-[#EEF1EE] p-5">
              <h2 className="text-[14px] font-semibold mb-4">Monthly revenue (delivered orders)</h2>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EEF1EE" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                    <Tooltip formatter={(v) => inr(Number(v ?? 0))} />
                    <Bar dataKey="revenue" fill="#1B7A3D" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-[#EEF1EE] p-5">
              <h2 className="text-[14px] font-semibold mb-4">Top crops by delivered GMV</h2>
              <div className="space-y-3">
                {analytics.topSellingCrops.map((c) => (
                  <div key={c.crop} className="flex items-center justify-between text-[13px]">
                    <span className="font-medium text-[#1A2E1E]">{c.crop}</span>
                    <span className="font-mono text-[#5A7263]">
                      {c.quantity.toLocaleString("en-IN")} kg · {inr(c.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "prices" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <DemoBadge label="SIMULATED MANDI" />
            <button
              type="button"
              onClick={() => _navCtx.navigateTo("prices")}
              className="px-3.5 py-1.5 rounded-lg text-[12px] font-semibold bg-[#1B7A3D] text-white"
            >
              Open full page →
            </button>
            {["Tomato", "Onion", "Potato", "Cabbage", "Ragi", "Banana", "Chilli", "Beans"].map((c) => (
              <button
                key={c}
                onClick={() => setCrop(c)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold ${crop === c ? "bg-[#1B7A3D] text-white" : "bg-white border border-[#EEF1EE]"}`}
              >
                {c}
              </button>
            ))}
          </div>
          {priceError && <p className="text-sm text-red-600">{priceError}</p>}
          <div className="bg-white rounded-2xl border border-[#EEF1EE] p-5">
            <h2 className="text-[14px] font-semibold mb-1">{crop} · K.R. Market</h2>
            <p className="text-[12px] text-[#8FA898] mb-4">₹ / quintal · jittered hourly from the seed trend line</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF1EE" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Area dataKey="modal" stroke="#1B7A3D" fill="#E8F5EE" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {tab === "verification" && (
        <div className="bg-white rounded-2xl border border-[#EEF1EE] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#EEF1EE] flex items-center justify-between">
            <h2 className="text-[14px] font-semibold">Document review (labels only)</h2>
            <DemoBadge />
          </div>
          <table className="w-full text-[13px]">
            <thead className="bg-[#F7F8F5] text-[#8FA898] text-[11px] uppercase">
              <tr>
                <th className="text-left px-5 py-3">Farmer</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Documents</th>
                <th className="text-left px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F7F8F5]">
              {readVerifications().map((v) => (
                <tr key={v.verificationId}>
                  <td className="px-5 py-3 font-mono text-[12px]">{v.farmerId}</td>
                  <td className="px-4 py-3 font-semibold capitalize">{v.status}</td>
                  <td className="px-4 py-3 text-[#5A7263]">{v.submittedDocuments.map((d) => d.name).join(" · ")}</td>
                  <td className="px-4 py-3 text-[#5A7263]">{v.rejectionReason ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "payments" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <DemoBadge label="NO LIVE GATEWAY" />
            <button
              onClick={pay}
              disabled={!pendingPay || Boolean(payBusy)}
              className="px-4 py-2 rounded-xl bg-[#1B7A3D] text-white text-[13px] font-semibold disabled:opacity-40"
            >
              {payBusy ? "Processing…" : pendingPay ? `Simulate pay ${pendingPay.orderId}` : "No pending payment"}
            </button>
            {payHint && <p className="text-[13px] text-[#5A7263]">{payHint}</p>}
          </div>
          <div className="bg-white rounded-2xl border border-[#EEF1EE] overflow-hidden">
            <table className="w-full text-[13px]">
              <thead className="bg-[#F7F8F5] text-[11px] uppercase text-[#8FA898]">
                <tr>
                  <th className="text-left px-5 py-3">Payment</th>
                  <th className="text-left px-4 py-3">Order</th>
                  <th className="text-left px-4 py-3">Amount</th>
                  <th className="text-left px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7F8F5]">
                {payments.slice(0, 12).map((p) => (
                  <tr key={p.paymentId}>
                    <td className="px-5 py-3 font-mono text-[12px]">{p.paymentId}</td>
                    <td className="px-4 py-3">{p.orderId}</td>
                    <td className="px-4 py-3 font-semibold">{inr(p.amount)}</td>
                    <td className="px-4 py-3 capitalize">{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "gps" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Radio size={16} className="text-amber-600" />
            <DemoBadge label="SIMULATED GPS + LOGISTICS API" />
          </div>
          <p className="text-[13px] text-[#5A7263]">
            {readOrders().length} mock orders · {readShipments().length} shipments · {readNotifications().length} notifications.
            Vehicle location interpolates between pickup and drop, not a maps SDK.
          </p>
          {gps && (
            <div className="bg-white rounded-2xl border border-[#EEF1EE] p-5 font-mono text-[13px]">
              <p>shipment {gps.shipmentId}</p>
              <p>{gps.lat.toFixed(5)}, {gps.lng.toFixed(5)}</p>
              <p>{gps.speedKmh} km/h · heading {Math.round(gps.heading)}° · {Math.round(gps.progress * 100)}%</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
