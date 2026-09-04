"use client";

import { useState } from 'react';
import { ChevronRight, X, AlertTriangle, CheckCircle, Package, ArrowRight, Filter } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import type { NavContext } from '../nav';
import { useAdminData } from '../data-context';
import type { InventoryItem } from '../types';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Fresh: 'bg-green-50 text-green-700 border-green-100',
    Aging: 'bg-amber-50 text-amber-700 border-amber-100',
    Critical: 'bg-red-50 text-red-700 border-red-100',
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${map[status] ?? 'bg-[#F7F8F5] text-[#5A7263] border-[#DDE8E1]'}`}>{status}</span>;
}

function FreshnessBar({ value }: { value: number }) {
  const color = value > 80 ? '#22A357' : value > 65 ? '#E9A23B' : '#D94F4F';
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-1.5 bg-[#F7F8F5] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-[12px] font-semibold" style={{ color }}>{value}%</span>
    </div>
  );
}

interface ClearanceModalProps {
  item: InventoryItem;
  onConfirm: () => void;
  onClose: () => void;
}

function ClearanceModal({ item, onConfirm, onClose }: ClearanceModalProps) {
  const [confirmed, setConfirmed] = useState(false);

  if (confirmed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
        <div className="bg-white rounded-2xl p-8 w-[440px] text-center border border-[#EEF1EE]" onClick={e => e.stopPropagation()}>
          <div className="w-12 h-12 rounded-2xl bg-[#E8F5EE] border border-[#DDE8E1] flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={22} className="text-[#1B7A3D]" />
          </div>
          <p className="text-[12px] font-semibold text-[#22A357] uppercase tracking-widest mb-2">Clearance Created</p>
          <h3 className="text-[18px] font-semibold text-[#1A2E1E] mb-2">{item.crop} — {item.totalQty.toLocaleString()} kg</h3>
          <p className="text-[13px] text-[#5A7263] mb-6">Clearance order created. The store has been notified to prioritise sales of this batch.</p>
          <button onClick={onClose} className="px-6 py-2.5 bg-[#1B7A3D] text-white text-[13px] font-semibold rounded-xl hover:bg-[#145C2E]">Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 w-[480px] border border-[#EEF1EE]" onClick={e => e.stopPropagation()} style={{ boxShadow: '0 16px 48px rgba(0,0,0,0.12)' }}>
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} className="text-amber-500" />
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-[#1A2E1E]">Create Clearance Order</h3>
            <p className="text-[13px] text-[#5A7263] mt-1">This will flag {item.crop} at {item.storeName} for priority clearance and notify the store team.</p>
          </div>
        </div>

        <div className="bg-[#F7F8F5] rounded-xl p-4 mb-6">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-[18px] font-bold text-[#1B7A3D] font-mono" style={{ fontFamily: 'JetBrains Mono' }}>{item.totalQty.toLocaleString()} kg</p>
              <p className="text-[11px] text-[#5A7263]">Total stock</p>
            </div>
            <div>
              <p className="text-[18px] font-bold font-mono" style={{ fontFamily: 'JetBrains Mono', color: item.freshness > 65 ? '#E9A23B' : '#D94F4F' }}>{item.freshness}%</p>
              <p className="text-[11px] text-[#5A7263]">Freshness</p>
            </div>
            <div>
              <p className="text-[18px] font-bold text-[#5A7263] font-mono" style={{ fontFamily: 'JetBrains Mono' }}>{item.avgAge}d</p>
              <p className="text-[11px] text-[#5A7263]">Avg age</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => setConfirmed(true)} className="flex-1 py-2.5 bg-[#1B7A3D] text-white text-[13px] font-semibold rounded-xl hover:bg-[#145C2E] transition-colors">
            Confirm Clearance
          </button>
          <button onClick={onClose} className="flex-1 py-2.5 bg-white border border-[#EEF1EE] text-[13px] font-medium text-[#5A7263] rounded-xl hover:bg-[#F7F8F5] transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Inventory({ navCtx }: { navCtx: NavContext }) {
  const { inventory } = useAdminData();
  const [freshnessFilter, setFreshnessFilter] = useState<string>('All');
  const [clearanceTarget, setClearanceTarget] = useState<InventoryItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const filtered = inventory.filter(i =>
    freshnessFilter === 'All' || i.status === freshnessFilter
  );

  const totalQty = inventory.reduce((s, i) => s + i.totalQty, 0);
  const available = inventory.reduce((s, i) => s + i.available, 0);
  const reserved = inventory.reduce((s, i) => s + i.reserved, 0);
  const aging = inventory.filter(i => i.status === 'Aging').reduce((s, i) => s + i.totalQty, 0);
  const critical = inventory.filter(i => i.status === 'Critical').reduce((s, i) => s + i.totalQty, 0);

  // Freshness distribution data
  const freshnessData = [
    { name: 'Fresh (>80%)', count: inventory.filter(i => i.freshness > 80).length, qty: inventory.filter(i => i.freshness > 80).reduce((s, i) => s + i.totalQty, 0) },
    { name: 'Aging (65-80%)', count: inventory.filter(i => i.freshness > 65 && i.freshness <= 80).length, qty: inventory.filter(i => i.freshness > 65 && i.freshness <= 80).reduce((s, i) => s + i.totalQty, 0) },
    { name: 'Critical (<65%)', count: inventory.filter(i => i.freshness <= 65).length, qty: inventory.filter(i => i.freshness <= 65).reduce((s, i) => s + i.totalQty, 0) },
  ];

  // Crop totals for detail view
  const cropTotals = inventory.reduce((acc, item) => {
    if (!acc[item.crop]) acc[item.crop] = { qty: 0, stores: [] };
    acc[item.crop].qty += item.totalQty;
    acc[item.crop].stores.push({ name: item.storeName, qty: item.totalQty, freshness: item.freshness, status: item.status });
    return acc;
  }, {} as Record<string, { qty: number; stores: Array<{ name: string; qty: number; freshness: number; status: string }> }>);

  return (
    <div className="max-w-[1440px] mx-auto px-8 py-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-semibold text-[#1A2E1E] mb-1" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Inventory</h1>
          <p className="text-[14px] text-[#5A7263]">Platform-wide stock levels, freshness, and clearance workflow</p>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total Inventory', value: `${(totalQty / 1000).toFixed(1)}K kg`, color: '#1B7A3D', bg: 'bg-[#E8F5EE] border-[#DDE8E1]' },
          { label: 'Available', value: `${(available / 1000).toFixed(1)}K kg`, color: '#22A357', bg: 'bg-green-50 border-green-100' },
          { label: 'Reserved', value: `${(reserved / 1000).toFixed(1)}K kg`, color: '#E9A23B', bg: 'bg-blue-50 border-blue-100' },
          { label: 'Aging', value: `${(aging / 1000).toFixed(1)}K kg`, color: '#E9A23B', bg: 'bg-amber-50 border-amber-100' },
          { label: 'Critical', value: `${(critical / 1000).toFixed(1)}K kg`, color: '#D94F4F', bg: 'bg-red-50 border-red-100' },
        ].map(k => (
          <div key={k.label} className={`${k.bg} rounded-xl p-4 border`}>
            <p className="text-[11px] font-semibold text-[#8FA898] uppercase tracking-wide mb-1.5">{k.label}</p>
            <p className="text-[22px] font-bold font-mono" style={{ fontFamily: 'JetBrains Mono', color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Freshness section + chart */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="col-span-2 bg-white rounded-2xl p-6 border border-[#EEF1EE]" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[15px] font-semibold text-[#1A2E1E]">Inventory Freshness Distribution</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-5">
            {[
              { label: 'Fresh', count: inventory.filter(i => i.status === 'Fresh').length, qty: inventory.filter(i => i.status === 'Fresh').reduce((s, i) => s + i.totalQty, 0), color: '#22A357', bg: 'bg-green-50 border-green-100', status: 'Fresh' },
              { label: 'Aging', count: inventory.filter(i => i.status === 'Aging').length, qty: inventory.filter(i => i.status === 'Aging').reduce((s, i) => s + i.totalQty, 0), color: '#E9A23B', bg: 'bg-amber-50 border-amber-100', status: 'Aging' },
              { label: 'Critical', count: inventory.filter(i => i.status === 'Critical').length, qty: inventory.filter(i => i.status === 'Critical').reduce((s, i) => s + i.totalQty, 0), color: '#D94F4F', bg: 'bg-red-50 border-red-100', status: 'Critical' },
            ].map(c => (
              <button
                key={c.label}
                onClick={() => setFreshnessFilter(freshnessFilter === c.status ? 'All' : c.status)}
                className={`${c.bg} rounded-xl p-4 border text-left transition-all ${freshnessFilter === c.status ? 'ring-2 ring-offset-1 ring-[#1B7A3D]' : ''}`}
              >
                <p className="text-[20px] font-bold font-mono" style={{ fontFamily: 'JetBrains Mono', color: c.color }}>{c.count}</p>
                <p className="text-[12px] font-semibold text-[#5A7263] mt-0.5">{c.label} batches</p>
                <p className="text-[11px] text-[#8FA898] mt-0.5">{(c.qty / 1000).toFixed(1)}K kg</p>
              </button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={freshnessData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF1EE" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#8FA898', fontFamily: 'Outfit' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#8FA898', fontFamily: 'Outfit' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: any) => [`${Number(v).toLocaleString()} kg`, 'Quantity']} />
              <Bar dataKey="qty" fill="#145C2E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Critical alerts */}
        <div className="bg-white rounded-2xl p-6 border border-[#EEF1EE]" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h2 className="text-[15px] font-semibold text-[#1A2E1E] mb-4">Requires Action</h2>
          <div className="space-y-3">
            {inventory.filter(i => i.status !== 'Fresh').map(item => (
              <div key={item.id} className={`rounded-xl p-4 border ${item.status === 'Critical' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className={`text-[13px] font-semibold ${item.status === 'Critical' ? 'text-red-800' : 'text-amber-800'}`}>{item.crop}</p>
                    <p className={`text-[11px] mt-0.5 ${item.status === 'Critical' ? 'text-red-600' : 'text-amber-600'}`}>{item.storeName}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <p className={`text-[12px] mb-3 ${item.status === 'Critical' ? 'text-red-700' : 'text-amber-700'}`}>
                  {item.totalQty.toLocaleString()} kg · Freshness {item.freshness}%
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedItem(item)} className="flex-1 text-[11px] font-semibold text-[#1B7A3D] hover:text-[#145C2E] transition-colors flex items-center justify-center gap-1">
                    View <ChevronRight size={10} />
                  </button>
                  <button onClick={() => setClearanceTarget(item)} className={`flex-1 text-[11px] font-semibold py-1.5 rounded-lg transition-colors ${item.status === 'Critical' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}>
                    Clearance
                  </button>
                </div>
              </div>
            ))}
            {inventory.filter(i => i.status !== 'Fresh').length === 0 && (
              <div className="flex flex-col items-center py-6 text-center">
                <CheckCircle size={28} className="text-green-400 mb-2" />
                <p className="text-[13px] font-medium text-[#5A7263]">Inventory is healthy</p>
                <p className="text-[12px] text-[#8FA898]">Nothing requires clearance.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main inventory table */}
      <div className="bg-white rounded-2xl border border-[#EEF1EE] overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="px-6 py-4 border-b border-[#F7F8F5] flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-[#1A2E1E]">All Inventory</h2>
          {freshnessFilter !== 'All' && (
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium bg-[#E8F5EE] text-[#145C2E] border border-[#DDE8E1] px-2.5 py-1 rounded-full">
                Status: {freshnessFilter} ×
              </span>
              <button onClick={() => setFreshnessFilter('All')} className="text-[12px] text-[#5A7263] hover:text-[#1A2E1E]">Clear</button>
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F7F8F5] bg-[#F7F8F5]">
                {['Crop', 'Store', 'Total Qty', 'Available', 'Reserved', 'Quality', 'Avg Age', 'Freshness', 'Status', ''].map(h => (
                  <th key={h} className={`px-4 py-3 text-[11px] font-semibold text-[#8FA898] uppercase tracking-wide whitespace-nowrap ${['Total Qty', 'Available', 'Reserved'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr
                  key={item.id}
                  className="border-b border-[#F7F8F5] hover:bg-[#F9F8F5] transition-colors group"
                >
                  <td className="px-4 py-3 text-[13px] font-semibold text-[#1A2E1E]">{item.crop}</td>
                  <td className="px-4 py-3 text-[13px] text-[#5A7263]">{item.storeName}</td>
                  <td className="px-4 py-3 text-right text-[13px] font-mono font-semibold text-[#1A2E1E]" style={{ fontFamily: 'JetBrains Mono' }}>{item.totalQty.toLocaleString()} kg</td>
                  <td className="px-4 py-3 text-right text-[13px] font-mono text-green-700" style={{ fontFamily: 'JetBrains Mono' }}>{item.available.toLocaleString()} kg</td>
                  <td className="px-4 py-3 text-right text-[13px] font-mono text-blue-700" style={{ fontFamily: 'JetBrains Mono' }}>{item.reserved.toLocaleString()} kg</td>
                  <td className="px-4 py-3 text-[13px] text-[#5A7263]">{item.quality}</td>
                  <td className="px-4 py-3 text-[13px] text-[#5A7263]">{item.avgAge} days</td>
                  <td className="px-4 py-3"><FreshnessBar value={item.freshness} /></td>
                  <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                  <td className="px-4 py-3">
                    {item.status !== 'Fresh' && (
                      <button onClick={() => setClearanceTarget(item)} className="text-[11px] font-semibold text-amber-600 hover:text-amber-800 flex items-center gap-1 transition-colors opacity-0 group-hover:opacity-100">
                        Clearance <ArrowRight size={10} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center">
                    <Package size={32} className="text-[#DDE8E1] mx-auto mb-3" />
                    <p className="text-[15px] font-medium text-[#5A7263]">No inventory matches this filter</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item detail drawer */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedItem(null)}>
          <div className="fixed inset-0 bg-black/20" />
          <div className="relative w-[440px] h-full bg-white overflow-y-auto" onClick={e => e.stopPropagation()} style={{ boxShadow: '-16px 0 48px rgba(0,0,0,0.1)' }}>
            <div className="px-6 py-5 border-b border-[#F7F8F5] flex items-center justify-between">
              <div>
                <p className="text-[11px] text-[#8FA898] font-semibold uppercase tracking-wide">Inventory Detail</p>
                <p className="text-[16px] font-bold text-[#1A2E1E] mt-0.5">{selectedItem.crop}</p>
              </div>
              <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-[#F7F8F5] rounded-xl">
                <X size={16} className="text-[#5A7263]" />
              </button>
            </div>
            <div className="px-6 py-5">
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { label: 'Total Stock', value: `${selectedItem.totalQty.toLocaleString()} kg` },
                  { label: 'Available', value: `${selectedItem.available.toLocaleString()} kg` },
                  { label: 'Reserved', value: `${selectedItem.reserved.toLocaleString()} kg` },
                  { label: 'Freshness', value: `${selectedItem.freshness}%` },
                  { label: 'Quality', value: selectedItem.quality },
                  { label: 'Avg Age', value: `${selectedItem.avgAge} days` },
                ].map(r => (
                  <div key={r.label} className="bg-[#F7F8F5] rounded-xl p-3">
                    <p className="text-[11px] text-[#8FA898]">{r.label}</p>
                    <p className="text-[15px] font-bold text-[#1A2E1E] mt-0.5 font-mono" style={{ fontFamily: 'JetBrains Mono' }}>{r.value}</p>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <p className="text-[12px] font-semibold text-[#5A7263] uppercase tracking-wide mb-2">Freshness</p>
                <FreshnessBar value={selectedItem.freshness} />
              </div>

              <div className="mb-6">
                <p className="text-[12px] font-semibold text-[#5A7263] uppercase tracking-wide mb-3">Store</p>
                <div className="bg-[#F7F8F5] rounded-xl p-4">
                  <p className="text-[13px] font-semibold text-[#1A2E1E]">{selectedItem.storeName}</p>
                  <p className="text-[12px] text-[#5A7263] mt-0.5">{selectedItem.totalQty.toLocaleString()} kg stored</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => { setClearanceTarget(selectedItem); setSelectedItem(null); }} className="flex-1 py-2.5 bg-amber-500 text-white text-[13px] font-semibold rounded-xl hover:bg-amber-600 transition-colors">
                  Create Clearance
                </button>
                <button onClick={() => navCtx.navigateTo('stores', { storeId: selectedItem.storeId })} className="flex-1 py-2.5 bg-white border border-[#EEF1EE] text-[13px] font-medium text-[#5A7263] rounded-xl hover:bg-[#F7F8F5] transition-colors">
                  View Store
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clearance confirmation modal */}
      {clearanceTarget && (
        <ClearanceModal
          item={clearanceTarget}
          onConfirm={() => setClearanceTarget(null)}
          onClose={() => setClearanceTarget(null)}
        />
      )}
    </div>
  );
}
