"use client";

import { useState } from 'react';
import { AlertTriangle, ArrowRight, ChevronRight, Download, X } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import type { NavContext } from '../nav';
import { useAdminData } from '../data-context';

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#DDE8E1] rounded-xl px-4 py-3 shadow-lg">
      <p className="text-[12px] font-semibold text-[#5A7263] mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-[13px]">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: p.color }} />
          <span className="text-[#5A7263]">{p.name}:</span>
          <span className="font-semibold text-[#1A2E1E]">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function CashFlow({ navCtx }: { navCtx: NavContext }) {
  const { cashFlowChart, cashEntries, stores } = useAdminData();
  const storeCashData = stores.map(s => ({
    name: s.name.split(' ')[0],
    inflow: s.todaySales,
    outflow: s.todayPurchases,
    balance: s.cashBalance,
  }));
  const [period, setPeriod] = useState<'today' | '7d' | '30d'>('7d');
  const [selEntry, setSelEntry] = useState<typeof cashEntries[number] | null>(null);

  const anomalies = cashEntries.filter(c => c.isAnomaly);
  const totalInflow = cashEntries.filter(c => c.type === 'In').reduce((s, c) => s + c.amount, 0);
  const totalOutflow = cashEntries.filter(c => c.type === 'Out').reduce((s, c) => s + c.amount, 0);
  const totalCash = stores.reduce((s, st) => s + st.cashBalance, 0);

  return (
    <div className="max-w-[1440px] mx-auto px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-semibold text-[#1A2E1E] mb-1" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Cash Flow</h1>
          <p className="text-[14px] text-[#5A7263]">Consolidated financial activity across all White Stores</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#EEF1EE] text-[13px] font-medium text-[#5A7263] hover:bg-[#F7F8F5] transition-colors">
          <Download size={14} /> Export
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total Inflow', value: fmt(totalInflow), color: '#22A357', bg: 'bg-green-50 border-green-100' },
          { label: 'Total Outflow', value: fmt(totalOutflow), color: '#D94F4F', bg: 'bg-red-50 border-red-100' },
          { label: 'Net Cash Flow', value: fmt(totalInflow - totalOutflow), color: '#E9A23B', bg: 'bg-blue-50 border-blue-100' },
          { label: 'Current Cash Position', value: fmt(totalCash), color: '#1B7A3D', bg: 'bg-[#E8F5EE] border-[#DDE8E1]' },
          { label: 'Stores With Anomalies', value: String(anomalies.length), color: '#D94F4F', bg: 'bg-red-50 border-red-100' },
        ].map(k => (
          <div key={k.label} className={`${k.bg} rounded-xl p-4 border`}>
            <p className="text-[11px] font-semibold text-[#8FA898] uppercase tracking-wide mb-2">{k.label}</p>
            <p className="text-[24px] font-bold font-mono" style={{ fontFamily: 'JetBrains Mono', color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Anomaly banner */}
      {anomalies.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-red-800 mb-1">Financial anomalies detected</p>
              <p className="text-[13px] text-red-700 mb-3">{anomalies.length} transaction{anomalies.length > 1 ? 's' : ''} flagged for unusual activity across your stores. Review immediately.</p>
              <div className="space-y-2">
                {anomalies.map(a => (
                  <button
                    key={a.id}
                    onClick={() => setSelEntry(a)}
                    className="flex items-center gap-3 px-4 py-3 bg-white border border-red-100 rounded-xl w-full text-left hover:bg-red-50/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-red-800">{a.storeName} — {fmt(a.amount)} outflow</p>
                      <p className="text-[12px] text-red-600">{a.anomalyNote}</p>
                    </div>
                    <span className="text-[12px] font-semibold text-red-600 flex items-center gap-1">
                      Investigate <ArrowRight size={11} />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts grid */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Cash Inflow vs Outflow */}
        <div className="bg-white rounded-2xl p-6 border border-[#EEF1EE]" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[15px] font-semibold text-[#1A2E1E]">Cash Inflow vs Outflow</h2>
              <p className="text-[12px] text-[#8FA898]">Platform-wide daily totals</p>
            </div>
            <div className="flex gap-1">
              {(['today', '7d', '30d'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all ${period === p ? 'bg-[#1B7A3D] text-white' : 'bg-[#F7F8F5] text-[#5A7263]'}`}
                >
                  {p === 'today' ? 'Today' : p === '7d' ? '7 Days' : '30 Days'}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={cashFlowChart}>
              <defs>
                <linearGradient id="ing" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22A357" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#22A357" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="outg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D94F4F" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#D94F4F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF1EE" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8FA898', fontFamily: 'Outfit' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#8FA898', fontFamily: 'Outfit' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'Outfit' }} />
              <Area type="monotone" dataKey="inflow" name="Cash In" stroke="#22A357" strokeWidth={2} fill="url(#ing)" dot={false} />
              <Area type="monotone" dataKey="outflow" name="Cash Out" stroke="#D94F4F" strokeWidth={2} fill="url(#outg)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Cash by Store */}
        <div className="bg-white rounded-2xl p-6 border border-[#EEF1EE]" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="mb-5">
            <h2 className="text-[15px] font-semibold text-[#1A2E1E]">Cash by Store</h2>
            <p className="text-[12px] text-[#8FA898]">Today's inflow and outflow per store</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={storeCashData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF1EE" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#8FA898', fontFamily: 'Outfit' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}K`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#5A7263', fontFamily: 'Outfit' }} axisLine={false} tickLine={false} width={55} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'Outfit' }} />
              <Bar dataKey="inflow" name="Cash In" fill="#22A357" radius={[0, 3, 3, 0]} />
              <Bar dataKey="outflow" name="Cash Out" fill="#D94F4F" radius={[0, 3, 3, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Store cash summary table */}
      <div className="bg-white rounded-2xl border border-[#EEF1EE] mb-8" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="px-6 py-4 border-b border-[#F7F8F5]">
          <h2 className="text-[15px] font-semibold text-[#1A2E1E]">Store Cash Breakdown</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#F7F8F5] bg-[#F7F8F5]">
              {['Store', 'Location', "Today's Inflow", "Today's Outflow", 'Net', 'Cash Balance', 'Status', ''].map(h => (
                <th key={h} className={`px-4 py-3 text-[11px] font-semibold text-[#8FA898] uppercase tracking-wide ${["Today's Inflow", "Today's Outflow", 'Net', 'Cash Balance'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stores.map(s => {
              const net = s.todaySales - s.todayPurchases;
              return (
                <tr key={s.id} onClick={() => navCtx.navigateTo('stores', { storeId: s.id })} className="border-b border-[#F7F8F5] hover:bg-[#F7F8F5] cursor-pointer transition-colors">
                  <td className="px-4 py-3 text-[13px] font-semibold text-[#1A2E1E]">{s.name}</td>
                  <td className="px-4 py-3 text-[13px] text-[#5A7263]">{s.location}</td>
                  <td className="px-4 py-3 text-right text-[13px] font-mono text-green-700 font-semibold" style={{ fontFamily: 'JetBrains Mono' }}>+{fmt(s.todaySales)}</td>
                  <td className="px-4 py-3 text-right text-[13px] font-mono text-red-600 font-semibold" style={{ fontFamily: 'JetBrains Mono' }}>−{fmt(s.todayPurchases)}</td>
                  <td className="px-4 py-3 text-right text-[13px] font-semibold font-mono" style={{ fontFamily: 'JetBrains Mono', color: net >= 0 ? '#22A357' : '#D94F4F' }}>
                    {net >= 0 ? '+' : ''}{fmt(net)}
                  </td>
                  <td className="px-4 py-3 text-right text-[13px] font-bold font-mono text-[#1B7A3D]" style={{ fontFamily: 'JetBrains Mono' }}>{fmt(s.cashBalance)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                      s.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' :
                      s.status === 'Needs Attention' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      'bg-[#F7F8F5] text-[#5A7263] border-[#DDE8E1]'
                    }`}>{s.status}</span>
                  </td>
                  <td className="px-4 py-3"><ChevronRight size={14} className="text-[#DDE8E1]" /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cash Ledger */}
      <div className="bg-white rounded-2xl border border-[#EEF1EE]" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="px-6 py-4 border-b border-[#F7F8F5]">
          <h2 className="text-[15px] font-semibold text-[#1A2E1E]">Platform Cash Ledger</h2>
          <p className="text-[12px] text-[#8FA898] mt-0.5">All cash movements — most recent first</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F7F8F5] bg-[#F7F8F5]">
                {['Date', 'Time', 'Store', 'Description', 'Type', 'Party', 'Amount', 'Balance', 'Ref'].map(h => (
                  <th key={h} className={`px-4 py-3 text-[11px] font-semibold text-[#8FA898] uppercase tracking-wide whitespace-nowrap ${['Amount', 'Balance'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cashEntries.map(c => (
                <tr
                  key={c.id}
                  onClick={() => setSelEntry(c)}
                  className={`border-b border-[#F7F8F5] cursor-pointer transition-colors ${c.isAnomaly ? 'bg-red-50/40 hover:bg-red-50' : 'hover:bg-[#F7F8F5]'}`}
                >
                  <td className="px-4 py-3 text-[13px] text-[#5A7263]">{c.date}</td>
                  <td className="px-4 py-3 text-[13px] text-[#8FA898]">{c.time}</td>
                  <td className="px-4 py-3 text-[13px] text-[#5A7263]">{c.storeName}</td>
                  <td className="px-4 py-3 text-[13px] text-[#1A2E1E]">
                    {c.description}
                    {c.isAnomaly && <span className="ml-2 text-[10px] text-red-600 font-bold bg-red-100 px-1.5 py-0.5 rounded uppercase tracking-wide">Anomaly</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[12px] font-semibold px-2 py-0.5 rounded-full ${c.type === 'In' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{c.type}</span>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#5A7263]">{c.partyName}</td>
                  <td className={`px-4 py-3 text-right text-[13px] font-bold font-mono`} style={{ fontFamily: 'JetBrains Mono', color: c.type === 'In' ? '#22A357' : '#D94F4F' }}>
                    {c.type === 'In' ? '+' : '−'}{fmt(c.amount)}
                  </td>
                  <td className="px-4 py-3 text-right text-[13px] font-mono text-[#1A2E1E]" style={{ fontFamily: 'JetBrains Mono' }}>{fmt(c.balance)}</td>
                  <td className="px-4 py-3 text-[11px] text-[#8FA898] font-mono" style={{ fontFamily: 'JetBrains Mono' }}>{c.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cash entry drawer */}
      {selEntry && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelEntry(null)}>
          <div className="fixed inset-0 bg-black/20" />
          <div
            className="relative w-[400px] h-full bg-white shadow-2xl overflow-y-auto"
            onClick={e => e.stopPropagation()}
            style={{ boxShadow: '-16px 0 48px rgba(0,0,0,0.1)' }}
          >
            <div className="px-6 py-5 border-b border-[#F7F8F5] flex items-center justify-between">
              <div>
                <p className="text-[11px] text-[#8FA898] font-semibold uppercase tracking-wide">Cash Entry</p>
                <p className="text-[15px] font-semibold text-[#1A2E1E] font-mono mt-0.5" style={{ fontFamily: 'JetBrains Mono' }}>{selEntry.id}</p>
              </div>
              <button onClick={() => setSelEntry(null)} className="p-2 hover:bg-[#F7F8F5] rounded-xl">
                <X size={16} className="text-[#5A7263]" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {selEntry.isAnomaly && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={15} className="text-red-500 mt-0.5" />
                    <div>
                      <p className="text-[13px] font-semibold text-red-800">Anomaly Flagged</p>
                      <p className="text-[12px] text-red-600 mt-0.5">{selEntry.anomalyNote}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className={`rounded-2xl p-5 ${selEntry.type === 'In' ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
                <p className="text-[11px] font-semibold text-[#5A7263] uppercase tracking-wide mb-1">{selEntry.type === 'In' ? 'Cash Inflow' : 'Cash Outflow'}</p>
                <p className="text-[32px] font-bold font-mono" style={{ fontFamily: 'JetBrains Mono', color: selEntry.type === 'In' ? '#22A357' : '#D94F4F' }}>
                  {selEntry.type === 'In' ? '+' : '−'}{fmt(selEntry.amount)}
                </p>
              </div>

              <div className="divide-y divide-[#F7F8F5]">
                {[
                  { label: 'Date & Time', value: `${selEntry.date} at ${selEntry.time}` },
                  { label: 'Store', value: selEntry.storeName },
                  { label: 'Description', value: selEntry.description },
                  { label: 'Party', value: selEntry.partyName },
                  { label: 'Balance After', value: fmt(selEntry.balance) },
                  { label: 'Reference', value: selEntry.reference },
                ].map(r => (
                  <div key={r.label} className="flex justify-between py-3">
                    <span className="text-[13px] text-[#5A7263]">{r.label}</span>
                    <span className="text-[13px] font-medium text-[#1A2E1E]">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
