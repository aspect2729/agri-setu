"use client";

import { useState } from 'react';
import { Search, X, ChevronRight, Download, Filter, CheckCircle, Circle, Clock } from 'lucide-react';
import type { NavContext } from '../nav';
import { useAdminData } from '../data-context';
import type { Order } from '../types';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Placed: 'bg-blue-50 text-blue-700 border-blue-100',
    Matched: 'bg-[#E8F5EE] text-[#145C2E] border-[#DDE8E1]',
    Preparing: 'bg-green-light text-green-dark border-border',
    Fulfilled: 'bg-[#E8F5EE] text-[#1B7A3D] border-[#DDE8E1]',
    Delivered: 'bg-blue-50 text-blue-800 border-blue-200',
    Paid: 'bg-[#E8F5EE] text-[#1B7A3D] border-[#DDE8E1]',
    Pending: 'bg-amber-50 text-amber-700 border-amber-100',
    Partial: 'bg-blue-50 text-blue-700 border-blue-100',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${map[status] ?? 'bg-[#F7F8F5] text-[#5A7263] border-[#DDE8E1]'}`}>
      {status}
    </span>
  );
}

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

const timelineSteps: Array<{ key: keyof Order; label: string }> = [
  { key: 'date', label: 'Order Placed' },
  { key: 'matchedAt', label: 'Supply Matched' },
  { key: 'fulfilledAt', label: 'Produce Prepared' },
  { key: 'deliveredAt', label: 'Delivered' },
  { key: 'paidAt', label: 'Paid' },
];

function OrderDrawer({ order, onClose, navCtx }: { order: Order; onClose: () => void; navCtx: NavContext }) {
  const steps = timelineSteps;
  const completedStep = steps.findIndex(s => !order[s.key]);
  const lastCompleted = completedStep === -1 ? steps.length - 1 : completedStep - 1;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="fixed inset-0 bg-black/20" />
      <div
        className="relative w-[480px] h-full bg-white overflow-y-auto flex flex-col"
        onClick={e => e.stopPropagation()}
        style={{ boxShadow: '-16px 0 48px rgba(0,0,0,0.1)' }}
      >
        <div className="px-6 py-5 border-b border-[#F7F8F5] flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <p className="text-[11px] text-[#8FA898] font-semibold uppercase tracking-wide">Order Detail</p>
            <p className="text-[16px] font-bold text-[#1A2E1E] font-mono mt-0.5" style={{ fontFamily: 'JetBrains Mono' }}>{order.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F7F8F5] rounded-xl transition-colors">
            <X size={16} className="text-[#5A7263]" />
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="flex gap-2 mb-6">
            <StatusBadge status={order.status} />
            <StatusBadge status={order.paymentStatus} />
          </div>

          {/* Order summary */}
          <div className="bg-[#F7F8F5] rounded-xl p-4 mb-6">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-[18px] font-bold text-[#1B7A3D] font-mono" style={{ fontFamily: 'JetBrains Mono' }}>{order.quantity.toLocaleString()} kg</p>
                <p className="text-[11px] text-[#5A7263]">{order.crop}</p>
              </div>
              <div>
                <p className="text-[18px] font-bold text-[#1A2E1E] font-mono" style={{ fontFamily: 'JetBrains Mono' }}>{fmt(order.value)}</p>
                <p className="text-[11px] text-[#5A7263]">Order Value</p>
              </div>
              <div>
                <p className="text-[18px] font-bold text-[#5A7263] font-mono" style={{ fontFamily: 'JetBrains Mono' }}>{order.quality}</p>
                <p className="text-[11px] text-[#5A7263]">Quality</p>
              </div>
            </div>
          </div>

          {/* Fulfillment Timeline */}
          <div className="mb-6">
            <p className="text-[12px] font-semibold text-[#8FA898] uppercase tracking-wide mb-4">Fulfillment Timeline</p>
            <div className="relative">
              <div className="absolute left-4 top-4 bottom-4 w-px bg-[#EEF1EE]" />
              <div className="space-y-1">
                {steps.map((step, i) => {
                  const done = i <= lastCompleted;
                  const current = i === lastCompleted + 1;
                  const dateVal = order[step.key] as string | undefined;
                  return (
                    <div key={step.key} className="relative flex items-start gap-4 py-2.5">
                      <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        done ? 'bg-[#1B7A3D]' : current ? 'bg-[#22A357] border-2 border-white shadow-sm' : 'bg-white border-2 border-[#EEF1EE]'
                      }`}>
                        {done ? <CheckCircle size={14} className="text-white" /> : current ? <Clock size={13} className="text-[#1B7A3D]" /> : <Circle size={13} className="text-[#DDE8E1]" />}
                      </div>
                      <div className="flex-1 pt-1">
                        <p className={`text-[13px] font-semibold ${done || current ? 'text-[#1A2E1E]' : 'text-[#8FA898]'}`}>{step.label}</p>
                        {dateVal ? (
                          <p className="text-[11px] text-[#8FA898] mt-0.5">{dateVal}</p>
                        ) : current ? (
                          <p className="text-[11px] text-[#22A357] font-medium mt-0.5">In progress</p>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="divide-y divide-[#F7F8F5]">
            {[
              { label: 'Buyer', value: order.buyerName },
              { label: 'Store', value: order.storeName },
              { label: 'Order Date', value: order.date },
            ].map(r => (
              <div key={r.label} className="flex justify-between py-3">
                <span className="text-[13px] text-[#5A7263]">{r.label}</span>
                <span className="text-[13px] font-medium text-[#1A2E1E]">{r.value}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-6">
            <button onClick={() => navCtx.navigateTo('stores', { storeId: order.storeId })} className="flex-1 py-2.5 bg-[#1B7A3D] text-white text-[13px] font-semibold rounded-xl hover:bg-[#145C2E] transition-colors">
              View Store
            </button>
            <button onClick={() => navCtx.navigateTo('matching')} className="flex-1 py-2.5 bg-white border border-[#EEF1EE] text-[13px] font-medium text-[#5A7263] rounded-xl hover:bg-[#F7F8F5] transition-colors">
              View Matching
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Orders({ navCtx }: { navCtx: NavContext }) {
  const { orders } = useAdminData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(
    navCtx.currentParams.orderId ? (orders.find(o => o.id === navCtx.currentParams.orderId) ?? null) : null
  );

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    return (
      (statusFilter === 'All' || o.status === statusFilter) &&
      (q === '' || o.id.toLowerCase().includes(q) || o.buyerName.toLowerCase().includes(q) || o.crop.toLowerCase().includes(q))
    );
  });

  const statusCounts = ['Placed', 'Matched', 'Preparing', 'Fulfilled', 'Delivered', 'Paid'].reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-[1440px] mx-auto px-8 py-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-semibold text-[#1A2E1E] mb-1" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Orders</h1>
          <p className="text-[14px] text-[#5A7263]">Track fulfillment across all buyer orders</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#EEF1EE] text-[13px] font-medium text-[#5A7263] hover:bg-[#F7F8F5] transition-colors">
          <Download size={14} /> Export
        </button>
      </div>

      {/* Status strip */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setStatusFilter('All')}
          className={`px-4 py-2 rounded-xl text-[13px] font-medium transition-all border ${statusFilter === 'All' ? 'bg-[#1B7A3D] text-white border-[#1B7A3D]' : 'bg-white text-[#5A7263] border-[#EEF1EE] hover:bg-[#F7F8F5]'}`}
        >
          All ({orders.length})
        </button>
        {Object.entries(statusCounts).map(([s, count]) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-[13px] font-medium transition-all border ${statusFilter === s ? 'bg-[#1B7A3D] text-white border-[#1B7A3D]' : 'bg-white text-[#5A7263] border-[#EEF1EE] hover:bg-[#F7F8F5]'}`}
          >
            {s} ({count})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#EEF1EE] rounded-xl">
          <Search size={14} className="text-[#8FA898]" />
          <input
            className="text-[13px] bg-transparent outline-none placeholder-[#8FA898] w-56"
            placeholder="Search order ID, buyer, crop…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch('')}><X size={13} className="text-[#8FA898]" /></button>}
        </div>
        <div className="ml-auto flex items-center gap-2 text-[12px] text-[#5A7263]">
          <Filter size={13} />
          {filtered.length} orders
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#EEF1EE] overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-[#F7F8F5] bg-[#F7F8F5]">
                {['Order ID', 'Date', 'Buyer', 'Crop', 'Qty', 'Value', 'Store', 'Status', 'Payment', ''].map(h => (
                  <th key={h} className={`px-4 py-3 text-[11px] font-semibold text-[#8FA898] uppercase tracking-wide whitespace-nowrap ${['Qty', 'Value'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr
                  key={o.id}
                  onClick={() => setSelectedOrder(o)}
                  className="border-b border-[#F7F8F5] hover:bg-[#F9F8F5] cursor-pointer transition-colors group"
                >
                  <td className="px-4 py-3 text-[12px] font-mono font-semibold text-[#145C2E]" style={{ fontFamily: 'JetBrains Mono' }}>{o.id}</td>
                  <td className="px-4 py-3 text-[13px] text-[#5A7263]">{o.date}</td>
                  <td className="px-4 py-3 text-[13px] font-medium text-[#1A2E1E]">{o.buyerName}</td>
                  <td className="px-4 py-3 text-[13px] text-[#5A7263]">{o.crop}</td>
                  <td className="px-4 py-3 text-right text-[13px] font-mono text-[#1A2E1E]" style={{ fontFamily: 'JetBrains Mono' }}>{o.quantity.toLocaleString()} kg</td>
                  <td className="px-4 py-3 text-right text-[13px] font-semibold font-mono text-[#1A2E1E]" style={{ fontFamily: 'JetBrains Mono' }}>{fmt(o.value)}</td>
                  <td className="px-4 py-3 text-[13px] text-[#5A7263]">{o.storeName}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3"><StatusBadge status={o.paymentStatus} /></td>
                  <td className="px-4 py-3"><ChevronRight size={14} className="text-[#DDE8E1] group-hover:text-[#1B7A3D] transition-colors" /></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center">
                    <p className="text-[15px] font-medium text-[#5A7263]">No orders found</p>
                    <p className="text-[13px] text-[#8FA898] mt-1">Try adjusting your filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-[#F7F8F5] flex items-center justify-between bg-[#F7F8F5]">
          <p className="text-[13px] text-[#5A7263]">Showing {filtered.length} of {orders.length} orders</p>
          <div className="flex gap-1">
            <button className="w-8 h-8 rounded-lg bg-[#1B7A3D] text-[12px] font-semibold text-white">1</button>
          </div>
        </div>
      </div>

      {selectedOrder && (
        <OrderDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} navCtx={navCtx} />
      )}
    </div>
  );
}
