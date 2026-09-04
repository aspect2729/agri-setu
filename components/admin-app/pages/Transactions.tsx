"use client";

import { useState } from 'react';
import { Search, X, ChevronRight, Download, Filter, ArrowRight } from 'lucide-react';
import type { NavContext } from '../nav';
import { useAdminData } from '../data-context';
import type { Transaction } from '../types';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Paid: 'bg-green-50 text-green-700 border-green-100',
    Pending: 'bg-amber-50 text-amber-700 border-amber-100',
    Partial: 'bg-blue-50 text-blue-700 border-blue-100',
    Purchase: 'bg-[#E8F5EE] text-[#145C2E] border-[#DDE8E1]',
    Sale: 'bg-blue-50 text-blue-700 border-blue-100',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${map[status] ?? 'bg-[#F7F8F5] text-[#5A7263] border-[#DDE8E1]'}`}>
      {status}
    </span>
  );
}

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

function TransactionDrawer({ txn, onClose, onViewOrder }: { txn: Transaction; onClose: () => void; onViewOrder: (id: string) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="fixed inset-0 bg-black/20" />
      <div
        className="relative w-[440px] h-full bg-white overflow-y-auto flex flex-col"
        onClick={e => e.stopPropagation()}
        style={{ boxShadow: '-16px 0 48px rgba(0,0,0,0.1)' }}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#F7F8F5] flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <p className="text-[11px] text-[#8FA898] font-semibold uppercase tracking-wide">Transaction Detail</p>
            <p className="text-[16px] font-bold text-[#1A2E1E] font-mono mt-0.5" style={{ fontFamily: 'JetBrains Mono' }}>{txn.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F7F8F5] rounded-xl transition-colors">
            <X size={16} className="text-[#5A7263]" />
          </button>
        </div>

        <div className="px-6 py-5 flex-1">
          {/* Type + payment status */}
          <div className="flex items-center gap-2 mb-6">
            <StatusBadge status={txn.type} />
            <StatusBadge status={txn.paymentStatus} />
          </div>

          {/* Amount hero */}
          <div className={`rounded-2xl p-5 mb-6 ${txn.type === 'Sale' ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
            <p className="text-[12px] font-semibold text-[#5A7263] uppercase tracking-wide mb-1">
              {txn.type === 'Sale' ? 'Revenue' : 'Payment Made'}
            </p>
            <p className="text-[32px] font-bold font-mono leading-none" style={{
              fontFamily: 'JetBrains Mono',
              color: txn.type === 'Sale' ? '#22A357' : '#D94F4F'
            }}>
              {txn.type === 'Sale' ? '+' : '−'}{fmt(txn.amount)}
            </p>
            <p className="text-[13px] text-[#5A7263] mt-1">
              {txn.quantity.toLocaleString()} kg × ₹{txn.pricePerKg}/kg
            </p>
          </div>

          {/* Details list */}
          <div className="space-y-0 divide-y divide-[#F7F8F5]">
            {[
              { label: 'Date & Time', value: `${txn.date} at ${txn.time}` },
              { label: 'Store', value: txn.storeName },
              { label: txn.type === 'Purchase' ? 'Farmer' : 'Buyer', value: (txn.farmerName || txn.buyerName) ?? '—' },
              { label: 'Crop', value: txn.crop },
              { label: 'Quantity', value: `${txn.quantity.toLocaleString()} kg` },
              { label: 'Quality Grade', value: txn.quality },
              { label: 'Price per kg', value: `₹${txn.pricePerKg}` },
              { label: 'QR Tracking ID', value: txn.qrId },
            ].map(r => (
              <div key={r.label} className="flex items-start justify-between py-3.5">
                <span className="text-[13px] text-[#5A7263]">{r.label}</span>
                <span className="text-[13px] font-medium text-[#1A2E1E] text-right max-w-[220px]">{r.value}</span>
              </div>
            ))}
          </div>

          {/* Linked order */}
          {txn.orderId && (
            <button
              onClick={() => onViewOrder(txn.orderId!)}
              className="w-full mt-6 flex items-center justify-between px-4 py-3.5 bg-[#E8F5EE] border border-[#DDE8E1] rounded-xl text-[13px] font-semibold text-[#1B7A3D] hover:bg-[#DDE8E1] transition-colors"
            >
              <span>View linked order: {txn.orderId}</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Transactions({ navCtx }: { navCtx: NavContext }) {
  const { transactions, stores } = useAdminData();
  const [tab, setTab] = useState<'All' | 'Purchases' | 'Sales'>('All');
  const [search, setSearch] = useState('');
  const [storeFilter, setStoreFilter] = useState('All');
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(
    navCtx.currentParams.txId ? (transactions.find(t => t.id === navCtx.currentParams.txId) ?? null) : null
  );

  const filtered = transactions.filter(t => {
    const q = search.toLowerCase();
    return (
      (tab === 'All' || t.type === tab.slice(0, -1) as any) &&
      (storeFilter === 'All' || t.storeId === storeFilter) &&
      (q === '' || t.id.toLowerCase().includes(q) || (t.farmerName || '').toLowerCase().includes(q) || (t.buyerName || '').toLowerCase().includes(q) || t.crop.toLowerCase().includes(q))
    );
  });

  const totals = {
    purchases: filtered.filter(t => t.type === 'Purchase').reduce((s, t) => s + t.amount, 0),
    sales: filtered.filter(t => t.type === 'Sale').reduce((s, t) => s + t.amount, 0),
    volume: filtered.reduce((s, t) => s + t.quantity, 0),
  };

  return (
    <div className="max-w-[1440px] mx-auto px-8 py-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-semibold text-[#1A2E1E] mb-1" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Transactions</h1>
          <p className="text-[14px] text-[#5A7263]">Audit produce purchases and sales across all White Stores</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#EEF1EE] text-[13px] font-medium text-[#5A7263] hover:bg-[#F7F8F5] transition-colors">
          <Download size={14} /> Export
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-[#EEF1EE]">
          <p className="text-[11px] font-semibold text-[#8FA898] uppercase tracking-wide mb-1">Total Purchases</p>
          <p className="text-[22px] font-bold text-red-600 font-mono" style={{ fontFamily: 'JetBrains Mono' }}>−{fmt(totals.purchases)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#EEF1EE]">
          <p className="text-[11px] font-semibold text-[#8FA898] uppercase tracking-wide mb-1">Total Sales</p>
          <p className="text-[22px] font-bold text-green-600 font-mono" style={{ fontFamily: 'JetBrains Mono' }}>+{fmt(totals.sales)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#EEF1EE]">
          <p className="text-[11px] font-semibold text-[#8FA898] uppercase tracking-wide mb-1">Total Volume</p>
          <p className="text-[22px] font-bold text-[#1B7A3D] font-mono" style={{ fontFamily: 'JetBrains Mono' }}>{totals.volume.toLocaleString()} kg</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex gap-1 bg-white rounded-xl p-1 border border-[#EEF1EE]">
          {(['All', 'Purchases', 'Sales'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-[13px] font-medium rounded-lg transition-all ${tab === t ? 'bg-[#1B7A3D] text-white' : 'text-[#5A7263] hover:text-[#1A2E1E]'}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#EEF1EE] rounded-xl">
          <Search size={14} className="text-[#8FA898]" />
          <input
            className="text-[13px] bg-transparent outline-none placeholder-[#8FA898] w-52"
            placeholder="Search by ID, farmer, buyer, crop…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch('')}><X size={13} className="text-[#8FA898]" /></button>}
        </div>

        <select
          value={storeFilter}
          onChange={e => setStoreFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-[#EEF1EE] rounded-xl text-[13px] text-[#5A7263] outline-none"
        >
          <option value="All">All Stores</option>
          {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        <div className="flex items-center gap-2 ml-auto text-[12px] text-[#5A7263]">
          <Filter size={13} />
          {filtered.length} transactions
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#EEF1EE] overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-[#F7F8F5] bg-[#F7F8F5]">
                {['Txn ID', 'Date', 'Time', 'Type', 'Party', 'Store', 'Crop', 'Qty', 'Quality', 'Amount', 'Payment', ''].map(h => (
                  <th key={h} className={`px-4 py-3 text-[11px] font-semibold text-[#8FA898] uppercase tracking-wide whitespace-nowrap ${['Qty', 'Amount'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr
                  key={t.id}
                  onClick={() => setSelectedTxn(t)}
                  className="border-b border-[#F7F8F5] hover:bg-[#F9F8F5] cursor-pointer transition-colors group"
                >
                  <td className="px-4 py-3 text-[12px] font-mono font-semibold text-[#145C2E]" style={{ fontFamily: 'JetBrains Mono' }}>{t.id}</td>
                  <td className="px-4 py-3 text-[13px] text-[#5A7263]">{t.date}</td>
                  <td className="px-4 py-3 text-[13px] text-[#8FA898]">{t.time}</td>
                  <td className="px-4 py-3"><StatusBadge status={t.type} /></td>
                  <td className="px-4 py-3 text-[13px] font-medium text-[#1A2E1E]">{t.farmerName || t.buyerName}</td>
                  <td className="px-4 py-3 text-[13px] text-[#5A7263]">{t.storeName}</td>
                  <td className="px-4 py-3 text-[13px] text-[#5A7263]">{t.crop}</td>
                  <td className="px-4 py-3 text-right text-[13px] font-mono text-[#1A2E1E]" style={{ fontFamily: 'JetBrains Mono' }}>{t.quantity.toLocaleString()} kg</td>
                  <td className="px-4 py-3 text-[13px] text-[#5A7263]">{t.quality}</td>
                  <td className={`px-4 py-3 text-right text-[13px] font-semibold font-mono`} style={{ fontFamily: 'JetBrains Mono', color: t.type === 'Sale' ? '#22A357' : '#D94F4F' }}>
                    {t.type === 'Sale' ? '+' : '−'}{fmt(t.amount)}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={t.paymentStatus} /></td>
                  <td className="px-4 py-3"><ChevronRight size={14} className="text-[#DDE8E1] group-hover:text-[#1B7A3D] transition-colors" /></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-4 py-16 text-center">
                    <p className="text-[15px] font-medium text-[#5A7263]">No transactions found</p>
                    <p className="text-[13px] text-[#8FA898] mt-1">Try adjusting your filters or date range.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-[#F7F8F5] flex items-center justify-between bg-[#F7F8F5]">
          <p className="text-[13px] text-[#5A7263]">Showing {filtered.length} of {transactions.length} transactions</p>
          <div className="flex gap-1">
            <button className="w-8 h-8 rounded-lg bg-[#1B7A3D] text-[12px] font-semibold text-white">1</button>
            <button className="w-8 h-8 rounded-lg border border-[#EEF1EE] text-[12px] text-[#5A7263] hover:bg-[#F7F8F5]">2</button>
          </div>
        </div>
      </div>

      {selectedTxn && (
        <TransactionDrawer
          txn={selectedTxn}
          onClose={() => setSelectedTxn(null)}
          onViewOrder={(id) => { navCtx.navigateTo('orders', { orderId: id }); setSelectedTxn(null); }}
        />
      )}
    </div>
  );
}
