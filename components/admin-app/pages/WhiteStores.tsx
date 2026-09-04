"use client";

import { useState } from 'react';
import {
  Search, Plus, Download, ChevronUp, ChevronDown,
  ArrowRight, X, Store as StoreIcon, Users, Package,
  DollarSign, Leaf, BarChart3, AlertTriangle, CheckCircle,
  Clock, MapPin, User, CreditCard, Truck, ClipboardList,
  TrendingUp, ChevronRight, Filter
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import type { NavContext } from '../nav';
import { useAdminData } from '../data-context';
import type { Store, Farmer, Transaction, CashEntry, InventoryItem, Order } from '../types';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Active: 'bg-green-50 text-green-700 border-green-100',
    Inactive: 'bg-[#F7F8F5] text-[#5A7263] border-[#DDE8E1]',
    'Needs Attention': 'bg-amber-50 text-amber-700 border-amber-100',
    Paid: 'bg-green-50 text-green-700 border-green-100',
    Pending: 'bg-amber-50 text-amber-700 border-amber-100',
    Partial: 'bg-blue-50 text-blue-700 border-blue-100',
    Purchase: 'bg-[#E8F5EE] text-[#145C2E] border-[#DDE8E1]',
    Sale: 'bg-blue-50 text-blue-700 border-blue-100',
    Fresh: 'bg-green-50 text-green-700 border-green-100',
    Aging: 'bg-amber-50 text-amber-700 border-amber-100',
    Critical: 'bg-red-50 text-red-700 border-red-100',
    Placed: 'bg-blue-50 text-blue-700 border-blue-100',
    Matched: 'bg-[#E8F5EE] text-[#145C2E] border-[#DDE8E1]',
    Preparing: 'bg-green-light text-green-dark border-border',
    Fulfilled: 'bg-[#E8F5EE] text-[#1B7A3D] border-[#DDE8E1]',
    Delivered: 'bg-blue-50 text-blue-800 border-blue-200',
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#DDE8E1] rounded-xl px-3 py-2.5 shadow-lg">
      <p className="text-[11px] font-semibold text-[#5A7263] mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-1.5 text-[12px]">
          <span className="w-2 h-2 rounded-sm" style={{ background: p.color }} />
          <span className="text-[#5A7263]">{p.name}:</span>
          <span className="font-semibold text-[#1A2E1E]">
            {typeof p.value === 'number' && p.value > 10000 ? fmt(p.value) : `${p.value.toLocaleString()}${p.name?.includes('kg') ? ' kg' : ''}`}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Store Detail ─────────────────────────────────────────────────────────────

type StoreTab = 'overview' | 'farmers' | 'transactions' | 'cash' | 'inventory' | 'orders' | 'employees';

function StoreDetail({ store, onBack, navCtx }: { store: Store; onBack: () => void; navCtx: NavContext }) {
  const { farmers, transactions, cashEntries, inventory, orders, employees, storeKpiHistory } = useAdminData();
  const [activeTab, setActiveTab] = useState<StoreTab>('overview');
  const storeFarmers = farmers.filter(f => f.storeId === store.id);
  const storeTxns = transactions.filter(t => t.storeId === store.id);
  const storeCash = cashEntries.filter(c => c.storeId === store.id);
  const storeInv = inventory.filter(i => i.storeId === store.id);
  const storeOrders = orders.filter(o => o.storeId === store.id);
  const storeEmps = employees.filter(e => e.storeId === store.id);
  const [selTxn, setSelTxn] = useState<Transaction | null>(null);

  const tabs: { id: StoreTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'farmers', label: `Farmers (${storeFarmers.length})` },
    { id: 'transactions', label: `Transactions (${storeTxns.length})` },
    { id: 'cash', label: 'Cash In/Out' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'orders', label: `Orders (${storeOrders.length})` },
    { id: 'employees', label: `Employees (${storeEmps.length})` },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] text-[#5A7263] mb-6">
        <button onClick={onBack} className="hover:text-[#1A2E1E] transition-colors font-medium">White Stores</button>
        <ChevronRight size={14} />
        <span className="text-[#1A2E1E] font-medium">{store.name}</span>
      </div>

      {/* Store header */}
      <div className="bg-white rounded-2xl p-6 border border-[#EEF1EE] mb-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1B7A3D] flex items-center justify-center">
              <StoreIcon size={22} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-[22px] font-semibold text-[#1A2E1E]" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
                  {store.name}
                </h1>
                <StatusBadge status={store.status} />
              </div>
              <div className="flex items-center gap-4 text-[13px] text-[#5A7263]">
                <span className="flex items-center gap-1"><MapPin size={13} /> {store.location}</span>
                <span className="flex items-center gap-1"><User size={13} /> {store.manager}</span>
                <span className="flex items-center gap-1"><Users size={13} /> {store.employees} employees</span>
                <span className="flex items-center gap-1"><Leaf size={13} /> {store.farmersServed} farmers served today</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-xl bg-[#F7F8F5] text-[13px] font-medium text-[#5A7263] hover:bg-[#EEF1EE] transition-colors">
              Export
            </button>
          </div>
        </div>

        {/* KPI mini row */}
        <div className="grid grid-cols-6 gap-3 mt-5 pt-5 border-t border-[#F7F8F5]">
          {[
            { label: "Today's Sales", value: fmt(store.todaySales), color: '#22A357' },
            { label: "Purchases", value: fmt(store.todayPurchases), color: '#145C2E' },
            { label: "Inventory", value: `${(store.inventory / 1000).toFixed(1)}K kg`, color: '#22A357' },
            { label: "Orders", value: String(store.orders), color: '#E9A23B' },
            { label: "Cash Balance", value: fmt(store.cashBalance), color: '#E9A23B' },
            { label: "Farmers", value: String(store.farmersServed), color: '#7C3AED' },
          ].map(k => (
            <div key={k.label} className="text-center">
              <p className="text-[18px] font-bold" style={{ fontFamily: 'JetBrains Mono', color: k.color }}>{k.value}</p>
              <p className="text-[11px] text-[#8FA898] mt-0.5">{k.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 border border-[#EEF1EE] mb-6 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
              activeTab === t.id ? 'bg-[#1B7A3D] text-white' : 'text-[#5A7263] hover:bg-[#F7F8F5] hover:text-[#1A2E1E]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-[#EEF1EE]">
            <h3 className="text-[15px] font-semibold text-[#1A2E1E] mb-4">Sales & Purchases — 7 Days</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={storeKpiHistory}>
                <defs>
                  <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#145C2E" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#145C2E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22A357" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#22A357" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF1EE" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8FA898' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#8FA898' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="sales" name="Sales" stroke="#145C2E" strokeWidth={2} fill="url(#sg)" dot={false} />
                <Area type="monotone" dataKey="purchases" name="Purchases" stroke="#22A357" strokeWidth={2} fill="url(#pg)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-[#EEF1EE]">
            <h3 className="text-[15px] font-semibold text-[#1A2E1E] mb-4">Inventory by Crop</h3>
            {storeInv.length > 0 ? (
              <div className="space-y-3">
                {storeInv.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[13px] font-medium text-[#1A2E1E]">{item.crop}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-mono text-[#5A7263]" style={{ fontFamily: 'JetBrains Mono' }}>{item.totalQty.toLocaleString()} kg</span>
                          <StatusBadge status={item.status} />
                        </div>
                      </div>
                      <div className="h-1.5 bg-[#F7F8F5] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{
                          width: `${item.freshness}%`,
                          background: item.freshness > 80 ? '#22A357' : item.freshness > 65 ? '#E9A23B' : '#D94F4F'
                        }} />
                      </div>
                      <p className="text-[11px] text-[#8FA898] mt-0.5">Freshness: {item.freshness}% · Age: {item.avgAge} days</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Package size={32} className="text-[#DDE8E1] mb-3" />
                <p className="text-[14px] text-[#5A7263]">No inventory data for this store</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'farmers' && (
        <div className="bg-white rounded-2xl border border-[#EEF1EE] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#F7F8F5] flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-[#1A2E1E]">Farmer Records — {store.name}</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F7F8F5] rounded-lg">
                <Search size={13} className="text-[#8FA898]" />
                <input className="text-[13px] bg-transparent outline-none placeholder-[#8FA898] w-44" placeholder="Search farmers..." />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F7F8F5] bg-[#F7F8F5]">
                  {['Farmer', 'Village', 'Phone', 'Crops', 'Total Produce', 'Last Collection', 'Total Payments', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-[11px] font-semibold text-[#8FA898] uppercase tracking-wide text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {storeFarmers.map(f => (
                  <tr key={f.id} className="border-b border-[#F7F8F5] hover:bg-[#F7F8F5] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#1B7A3D] flex items-center justify-center text-[10px] font-bold text-white">
                          {f.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="text-[13px] font-medium text-[#1A2E1E]">{f.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#5A7263]">{f.village}</td>
                    <td className="px-4 py-3 text-[13px] text-[#5A7263] font-mono" style={{ fontFamily: 'JetBrains Mono' }}>{f.phone}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {f.crops.map(c => <span key={c} className="text-[11px] bg-[#F7F8F5] text-[#5A7263] px-1.5 py-0.5 rounded-md">{c}</span>)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-[13px] font-mono text-[#1A2E1E]" style={{ fontFamily: 'JetBrains Mono' }}>{f.totalProduce.toLocaleString()} kg</td>
                    <td className="px-4 py-3 text-[13px] text-[#5A7263]">{f.lastCollection}</td>
                    <td className="px-4 py-3 text-right text-[13px] font-semibold font-mono text-[#1A2E1E]" style={{ fontFamily: 'JetBrains Mono' }}>{fmt(f.totalPayments)}</td>
                    <td className="px-4 py-3"><StatusBadge status={f.status} /></td>
                  </tr>
                ))}
                {storeFarmers.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-[14px] text-[#5A7263]">No farmers registered at this store.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-white rounded-2xl border border-[#EEF1EE] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#F7F8F5]">
            <h3 className="text-[15px] font-semibold text-[#1A2E1E]">Transaction Records</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F7F8F5] bg-[#F7F8F5]">
                  {['Txn ID', 'Date / Time', 'Type', 'Party', 'Crop', 'Qty', 'Quality', 'Amount', 'Payment', ''].map(h => (
                    <th key={h} className={`px-4 py-3 text-[11px] font-semibold text-[#8FA898] uppercase tracking-wide ${h === 'Qty' || h === 'Amount' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {storeTxns.map(t => (
                  <tr key={t.id} onClick={() => setSelTxn(t)} className="border-b border-[#F7F8F5] hover:bg-[#F7F8F5] cursor-pointer transition-colors">
                    <td className="px-4 py-3 text-[12px] font-mono font-semibold text-[#145C2E]" style={{ fontFamily: 'JetBrains Mono' }}>{t.id}</td>
                    <td className="px-4 py-3 text-[13px] text-[#5A7263]">{t.date} <span className="text-[#8FA898]">{t.time}</span></td>
                    <td className="px-4 py-3"><StatusBadge status={t.type} /></td>
                    <td className="px-4 py-3 text-[13px] font-medium text-[#1A2E1E]">{t.farmerName || t.buyerName}</td>
                    <td className="px-4 py-3 text-[13px] text-[#5A7263]">{t.crop}</td>
                    <td className="px-4 py-3 text-right text-[13px] font-mono text-[#1A2E1E]" style={{ fontFamily: 'JetBrains Mono' }}>{t.quantity.toLocaleString()} kg</td>
                    <td className="px-4 py-3 text-[13px] text-[#5A7263]">{t.quality}</td>
                    <td className="px-4 py-3 text-right text-[13px] font-semibold font-mono" style={{ fontFamily: 'JetBrains Mono', color: t.type === 'Sale' ? '#22A357' : '#D94F4F' }}>
                      {t.type === 'Sale' ? '+' : '−'}{fmt(t.amount)}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={t.paymentStatus} /></td>
                    <td className="px-4 py-3"><ChevronRight size={14} className="text-[#DDE8E1]" /></td>
                  </tr>
                ))}
                {storeTxns.length === 0 && (
                  <tr><td colSpan={10} className="px-4 py-12 text-center text-[14px] text-[#5A7263]">No transactions for this period.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'cash' && (
        <div className="space-y-6">
          <div className="grid grid-cols-5 gap-4">
            {[
              { label: 'Opening Balance', value: fmt(300000), color: '#5A7263' },
              { label: 'Cash In', value: fmt(storeCash.filter(c => c.type === 'In').reduce((s, c) => s + c.amount, 0)), color: '#22A357' },
              { label: 'Cash Out', value: fmt(storeCash.filter(c => c.type === 'Out').reduce((s, c) => s + c.amount, 0)), color: '#D94F4F' },
              { label: 'Net Movement', value: fmt(store.cashBalance - 300000), color: store.cashBalance >= 300000 ? '#22A357' : '#D94F4F' },
              { label: 'Closing Balance', value: fmt(store.cashBalance), color: '#1B7A3D' },
            ].map(k => (
              <div key={k.label} className="bg-white rounded-xl p-4 border border-[#EEF1EE] text-center">
                <p className="text-[11px] font-semibold text-[#8FA898] uppercase tracking-wide mb-2">{k.label}</p>
                <p className="text-[20px] font-bold" style={{ fontFamily: 'JetBrains Mono', color: k.color }}>{k.value}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-[#EEF1EE] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F7F8F5]">
              <h3 className="text-[15px] font-semibold text-[#1A2E1E]">Cash Ledger</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F7F8F5] bg-[#F7F8F5]">
                  {['Date', 'Time', 'Description', 'Type', 'Party', 'Amount', 'Balance', 'Ref'].map(h => (
                    <th key={h} className={`px-4 py-3 text-[11px] font-semibold text-[#8FA898] uppercase tracking-wide ${['Amount', 'Balance'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {storeCash.map(c => (
                  <tr key={c.id} className={`border-b border-[#F7F8F5] transition-colors ${c.isAnomaly ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-[#F7F8F5]'}`}>
                    <td className="px-4 py-3 text-[13px] text-[#5A7263]">{c.date}</td>
                    <td className="px-4 py-3 text-[13px] text-[#8FA898]">{c.time}</td>
                    <td className="px-4 py-3 text-[13px] text-[#1A2E1E]">
                      {c.description}
                      {c.isAnomaly && <span className="ml-2 text-[11px] text-red-600 font-semibold bg-red-50 px-1.5 py-0.5 rounded-full border border-red-100">Anomaly</span>}
                    </td>
                    <td className="px-4 py-3"><span className={`text-[12px] font-semibold ${c.type === 'In' ? 'text-green-700' : 'text-red-600'}`}>{c.type}</span></td>
                    <td className="px-4 py-3 text-[13px] text-[#5A7263]">{c.partyName}</td>
                    <td className={`px-4 py-3 text-right text-[13px] font-semibold font-mono`} style={{ fontFamily: 'JetBrains Mono', color: c.type === 'In' ? '#22A357' : '#D94F4F' }}>
                      {c.type === 'In' ? '+' : '−'}{fmt(c.amount)}
                    </td>
                    <td className="px-4 py-3 text-right text-[13px] font-mono text-[#1A2E1E]" style={{ fontFamily: 'JetBrains Mono' }}>{fmt(c.balance)}</td>
                    <td className="px-4 py-3 text-[12px] text-[#8FA898] font-mono" style={{ fontFamily: 'JetBrains Mono' }}>{c.reference}</td>
                  </tr>
                ))}
                {storeCash.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-[14px] text-[#5A7263]">No cash entries for this period.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="bg-white rounded-2xl border border-[#EEF1EE] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#F7F8F5]">
            <h3 className="text-[15px] font-semibold text-[#1A2E1E]">Current Inventory</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F7F8F5] bg-[#F7F8F5]">
                {['Crop', 'Total Qty', 'Available', 'Reserved', 'Quality', 'Avg Age', 'Freshness', 'Status', ''].map(h => (
                  <th key={h} className={`px-4 py-3 text-[11px] font-semibold text-[#8FA898] uppercase tracking-wide ${['Total Qty', 'Available', 'Reserved'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {storeInv.map(item => (
                <tr key={item.id} className="border-b border-[#F7F8F5] hover:bg-[#F7F8F5] transition-colors">
                  <td className="px-4 py-3 text-[13px] font-semibold text-[#1A2E1E]">{item.crop}</td>
                  <td className="px-4 py-3 text-right text-[13px] font-mono text-[#1A2E1E]" style={{ fontFamily: 'JetBrains Mono' }}>{item.totalQty.toLocaleString()} kg</td>
                  <td className="px-4 py-3 text-right text-[13px] font-mono text-green-700" style={{ fontFamily: 'JetBrains Mono' }}>{item.available.toLocaleString()} kg</td>
                  <td className="px-4 py-3 text-right text-[13px] font-mono text-blue-700" style={{ fontFamily: 'JetBrains Mono' }}>{item.reserved.toLocaleString()} kg</td>
                  <td className="px-4 py-3 text-[13px] text-[#5A7263]">{item.quality}</td>
                  <td className="px-4 py-3 text-[13px] text-[#5A7263]">{item.avgAge} days</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-[#F7F8F5] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${item.freshness}%`, background: item.freshness > 80 ? '#22A357' : item.freshness > 65 ? '#E9A23B' : '#D94F4F' }} />
                      </div>
                      <span className="text-[12px] text-[#5A7263]">{item.freshness}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                  <td className="px-4 py-3">
                    {item.status !== 'Fresh' && (
                      <button onClick={() => navCtx.navigateTo('inventory', { storeId: store.id })} className="text-[12px] font-semibold text-[#E9A23B] hover:text-[#B45309] transition-colors flex items-center gap-1">
                        Review <ArrowRight size={11} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {storeInv.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-[14px] text-[#5A7263]">No inventory at this store.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-[#EEF1EE] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#F7F8F5]">
            <h3 className="text-[15px] font-semibold text-[#1A2E1E]">Store Orders</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F7F8F5] bg-[#F7F8F5]">
                {['Order ID', 'Date', 'Buyer', 'Crop', 'Qty', 'Value', 'Status', 'Payment'].map(h => (
                  <th key={h} className={`px-4 py-3 text-[11px] font-semibold text-[#8FA898] uppercase tracking-wide ${['Qty', 'Value'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {storeOrders.map(o => (
                <tr key={o.id} onClick={() => navCtx.navigateTo('orders', { orderId: o.id })} className="border-b border-[#F7F8F5] hover:bg-[#F7F8F5] cursor-pointer transition-colors">
                  <td className="px-4 py-3 text-[12px] font-mono font-semibold text-[#145C2E]" style={{ fontFamily: 'JetBrains Mono' }}>{o.id}</td>
                  <td className="px-4 py-3 text-[13px] text-[#5A7263]">{o.date}</td>
                  <td className="px-4 py-3 text-[13px] font-medium text-[#1A2E1E]">{o.buyerName}</td>
                  <td className="px-4 py-3 text-[13px] text-[#5A7263]">{o.crop}</td>
                  <td className="px-4 py-3 text-right text-[13px] font-mono text-[#1A2E1E]" style={{ fontFamily: 'JetBrains Mono' }}>{o.quantity.toLocaleString()} kg</td>
                  <td className="px-4 py-3 text-right text-[13px] font-semibold font-mono text-[#1A2E1E]" style={{ fontFamily: 'JetBrains Mono' }}>{fmt(o.value)}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3"><StatusBadge status={o.paymentStatus} /></td>
                </tr>
              ))}
              {storeOrders.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-[14px] text-[#5A7263]">No orders for this store.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'employees' && (
        <div className="bg-white rounded-2xl border border-[#EEF1EE] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#F7F8F5]">
            <h3 className="text-[15px] font-semibold text-[#1A2E1E]">Employees</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F7F8F5] bg-[#F7F8F5]">
                {['Employee', 'Role', 'Phone', 'Status', 'Join Date', 'Last Active'].map(h => (
                  <th key={h} className="px-4 py-3 text-[11px] font-semibold text-[#8FA898] uppercase tracking-wide text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {storeEmps.map(e => (
                <tr key={e.id} className="border-b border-[#F7F8F5] hover:bg-[#F7F8F5] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#145C2E] flex items-center justify-center text-[10px] font-bold text-white">
                        {e.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="text-[13px] font-medium text-[#1A2E1E]">{e.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#5A7263]">{e.role}</td>
                  <td className="px-4 py-3 text-[13px] font-mono text-[#5A7263]" style={{ fontFamily: 'JetBrains Mono' }}>{e.phone}</td>
                  <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                  <td className="px-4 py-3 text-[13px] text-[#5A7263]">{e.joinDate}</td>
                  <td className="px-4 py-3 text-[13px] text-[#5A7263]">{e.lastActive}</td>
                </tr>
              ))}
              {storeEmps.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-[14px] text-[#5A7263]">No employees at this store.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Transaction Drawer */}
      {selTxn && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelTxn(null)}>
          <div className="fixed inset-0 bg-black/20" />
          <div
            className="relative w-[420px] h-full bg-white shadow-2xl overflow-y-auto"
            onClick={e => e.stopPropagation()}
            style={{ boxShadow: '-16px 0 48px rgba(0,0,0,0.1)' }}
          >
            <div className="px-6 py-5 border-b border-[#F7F8F5] flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <p className="text-[11px] text-[#8FA898] font-semibold uppercase tracking-wide">Transaction</p>
                <p className="text-[15px] font-semibold text-[#1A2E1E] font-mono" style={{ fontFamily: 'JetBrains Mono' }}>{selTxn.id}</p>
              </div>
              <button onClick={() => setSelTxn(null)} className="p-2 hover:bg-[#F7F8F5] rounded-xl transition-colors">
                <X size={16} className="text-[#5A7263]" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              <div className="flex items-center justify-between">
                <StatusBadge status={selTxn.type} />
                <StatusBadge status={selTxn.paymentStatus} />
              </div>

              {[
                { label: 'Date & Time', value: `${selTxn.date} at ${selTxn.time}` },
                { label: 'Store', value: selTxn.storeName },
                { label: selTxn.type === 'Purchase' ? 'Farmer' : 'Buyer', value: selTxn.farmerName || selTxn.buyerName || '—' },
                { label: 'Crop', value: selTxn.crop },
                { label: 'Quantity', value: `${selTxn.quantity.toLocaleString()} kg` },
                { label: 'Quality', value: selTxn.quality },
                { label: 'Price / kg', value: `₹${selTxn.pricePerKg}` },
                { label: 'QR ID', value: selTxn.qrId },
              ].map(r => (
                <div key={r.label} className="flex items-start justify-between border-b border-[#F7F8F5] pb-4 last:border-0">
                  <span className="text-[13px] text-[#5A7263]">{r.label}</span>
                  <span className="text-[13px] font-medium text-[#1A2E1E] text-right">{r.value}</span>
                </div>
              ))}

              <div className="bg-[#F7F8F5] rounded-xl p-4 flex items-center justify-between">
                <span className="text-[13px] font-semibold text-[#5A7263]">Total Amount</span>
                <span className="text-[22px] font-bold font-mono" style={{ fontFamily: 'JetBrains Mono', color: selTxn.type === 'Sale' ? '#22A357' : '#D94F4F' }}>
                  {selTxn.type === 'Sale' ? '+' : '−'}{fmt(selTxn.amount)}
                </span>
              </div>

              {selTxn.orderId && (
                <button onClick={() => { navCtx.navigateTo('orders', { orderId: selTxn.orderId ?? '' }); setSelTxn(null); }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#E8F5EE] border border-[#DDE8E1] rounded-xl text-[13px] font-semibold text-[#1B7A3D] hover:bg-[#DDE8E1] transition-colors">
                  View linked order: {selTxn.orderId}
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Store List ───────────────────────────────────────────────────────────────

export default function WhiteStores({ navCtx }: { navCtx: NavContext }) {
  const { stores } = useAdminData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortKey, setSortKey] = useState<keyof Store>('todayVolume');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedStore, setSelectedStore] = useState<Store | null>(
    navCtx.currentParams.storeId ? (stores.find(s => s.id === navCtx.currentParams.storeId) ?? null) : null
  );

  if (selectedStore) {
    return <StoreDetail store={selectedStore} onBack={() => setSelectedStore(null)} navCtx={navCtx} />;
  }

  const filtered = stores
    .filter(s => {
      const q = search.toLowerCase();
      return (
        (q === '' || s.name.toLowerCase().includes(q) || s.location.toLowerCase().includes(q)) &&
        (statusFilter === 'All' || s.status === statusFilter)
      );
    })
    .sort((a, b) => {
      const av = a[sortKey] as number;
      const bv = b[sortKey] as number;
      return sortDir === 'desc' ? (bv > av ? 1 : -1) : (av > bv ? 1 : -1);
    });

  function toggleSort(k: keyof Store) {
    if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir('desc'); }
  }

  function SortIcon({ k }: { k: keyof Store }) {
    if (sortKey !== k) return <ChevronDown size={12} className="text-[#DDE8E1]" />;
    return sortDir === 'desc' ? <ChevronDown size={12} className="text-[#1B7A3D]" /> : <ChevronUp size={12} className="text-[#1B7A3D]" />;
  }

  const fmt = (n: number) => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
    return `₹${n}`;
  };

  return (
    <div className="max-w-[1440px] mx-auto px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-semibold text-[#1A2E1E] mb-1" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>White Stores</h1>
          <p className="text-[14px] text-[#5A7263]">Monitor performance across all {stores.length} collection centers</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#EEF1EE] text-[13px] font-medium text-[#5A7263] hover:bg-[#F7F8F5] transition-colors">
            <Download size={14} /> Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1B7A3D] text-[13px] font-medium text-white hover:bg-[#145C2E] transition-colors">
            <Plus size={14} /> Add White Store
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Volume Today', value: `${(stores.reduce((s, st) => s + st.todayVolume, 0) / 1000).toFixed(1)}K kg`, color: '#145C2E' },
          { label: 'Total Sales', value: fmt(stores.reduce((s, st) => s + st.todaySales, 0)), color: '#22A357' },
          { label: 'Total Cash Position', value: fmt(stores.reduce((s, st) => s + st.cashBalance, 0)), color: '#E9A23B' },
          { label: 'Active Stores', value: `${stores.filter(s => s.status === 'Active').length}/${stores.length}`, color: '#E9A23B' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl p-4 border border-[#EEF1EE] flex items-center gap-3">
            <div>
              <p className="text-[20px] font-bold font-mono" style={{ fontFamily: 'JetBrains Mono', color: k.color }}>{k.value}</p>
              <p className="text-[12px] text-[#8FA898] mt-0.5">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 flex-1 max-w-sm px-3.5 py-2 bg-white border border-[#EEF1EE] rounded-xl">
          <Search size={14} className="text-[#8FA898]" />
          <input
            className="flex-1 text-[13px] bg-transparent outline-none placeholder-[#8FA898]"
            placeholder="Search stores..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch('')}><X size={13} className="text-[#8FA898]" /></button>}
        </div>

        <div className="flex gap-1">
          {['All', 'Active', 'Needs Attention', 'Inactive'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-[12px] font-medium rounded-lg transition-all ${statusFilter === s ? 'bg-[#1B7A3D] text-white' : 'bg-white border border-[#EEF1EE] text-[#5A7263] hover:bg-[#F7F8F5]'}`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto text-[12px] text-[#5A7263]">
          <Filter size={13} />
          {filtered.length} stores
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#EEF1EE] overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-[#F7F8F5] bg-[#F7F8F5]">
                {[
                  { label: 'Store', key: 'name' as keyof Store },
                  { label: 'Location', key: 'location' as keyof Store },
                  { label: 'Cluster', key: 'cluster' as keyof Store },
                  { label: 'Employees', key: 'employees' as keyof Store },
                  { label: 'Farmers', key: 'farmersServed' as keyof Store },
                  { label: "Today's Purchases", key: 'todayPurchases' as keyof Store },
                  { label: "Today's Sales", key: 'todaySales' as keyof Store },
                  { label: 'Volume', key: 'todayVolume' as keyof Store },
                  { label: 'Inventory', key: 'inventory' as keyof Store },
                  { label: 'Orders', key: 'orders' as keyof Store },
                  { label: 'Cash Balance', key: 'cashBalance' as keyof Store },
                  { label: 'Status', key: 'status' as keyof Store },
                  { label: '', key: null },
                ].map(col => (
                  <th
                    key={col.label}
                    onClick={col.key ? () => toggleSort(col.key!) : undefined}
                    className={`px-4 py-3 text-[11px] font-semibold text-[#8FA898] uppercase tracking-wide whitespace-nowrap ${
                      col.key ? 'cursor-pointer hover:text-[#1A2E1E] transition-colors' : ''
                    } ${['Employees', 'Farmers', "Today's Purchases", "Today's Sales", 'Volume', 'Inventory', 'Orders', 'Cash Balance'].includes(col.label) ? 'text-right' : 'text-left'}`}
                  >
                    <span className="flex items-center gap-1 justify-inherit">
                      {col.label}
                      {col.key && <SortIcon k={col.key} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(store => (
                <tr
                  key={store.id}
                  onClick={() => setSelectedStore(store)}
                  className="border-b border-[#F7F8F5] hover:bg-[#F9F8F5] cursor-pointer transition-colors group"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#1B7A3D] flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
                        {store.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-[#1A2E1E]">{store.name}</p>
                        <p className="text-[11px] text-[#8FA898]">{store.manager}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#5A7263]">{store.location}</td>
                  <td className="px-4 py-3 text-[13px] text-[#5A7263]">{store.village}</td>
                  <td className="px-4 py-3 text-right text-[13px] font-mono text-[#1A2E1E]" style={{ fontFamily: 'JetBrains Mono' }}>{store.employees}</td>
                  <td className="px-4 py-3 text-right text-[13px] font-mono text-[#1A2E1E]" style={{ fontFamily: 'JetBrains Mono' }}>{store.farmersServed}</td>
                  <td className="px-4 py-3 text-right text-[13px] font-semibold font-mono text-[#1A2E1E]" style={{ fontFamily: 'JetBrains Mono' }}>{fmt(store.todayPurchases)}</td>
                  <td className="px-4 py-3 text-right text-[13px] font-semibold font-mono text-[#22A357]" style={{ fontFamily: 'JetBrains Mono' }}>{fmt(store.todaySales)}</td>
                  <td className="px-4 py-3 text-right text-[13px] font-mono text-[#1A2E1E]" style={{ fontFamily: 'JetBrains Mono' }}>{store.todayVolume.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-[13px] font-mono text-[#1A2E1E]" style={{ fontFamily: 'JetBrains Mono' }}>{store.inventory.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-[13px] font-mono text-[#E9A23B]" style={{ fontFamily: 'JetBrains Mono' }}>{store.orders}</td>
                  <td className="px-4 py-3 text-right text-[13px] font-semibold font-mono" style={{ fontFamily: 'JetBrains Mono', color: store.cashBalance > 200000 ? '#22A357' : '#E9A23B' }}>{fmt(store.cashBalance)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={store.status} />
                  </td>
                  <td className="px-4 py-3">
                    <ChevronRight size={16} className="text-[#DDE8E1] group-hover:text-[#1B7A3D] transition-colors" />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={13} className="px-4 py-16 text-center">
                    <StoreIcon size={36} className="text-[#DDE8E1] mx-auto mb-3" />
                    <p className="text-[15px] font-medium text-[#5A7263]">No White Stores found</p>
                    <p className="text-[13px] text-[#8FA898] mt-1">Try changing your filters or search term.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-[#F7F8F5] flex items-center justify-between">
          <p className="text-[13px] text-[#5A7263]">Showing {filtered.length} of {stores.length} stores</p>
          <div className="flex gap-1">
            {[1].map(p => (
              <button key={p} className="w-8 h-8 rounded-lg bg-[#1B7A3D] text-[12px] font-semibold text-white">1</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
