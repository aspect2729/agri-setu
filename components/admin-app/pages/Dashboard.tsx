"use client";

import { useState } from 'react';
import {
  TrendingUp, TrendingDown, AlertTriangle, ArrowRight,
  Package, Leaf, DollarSign, Store, Users, Activity,
  ChevronUp, ChevronDown, Minus, Info
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import type { NavContext, Page } from '../nav';
import { useAdminData } from '../data-context';

const FOREST = '#1B7A3D';
const LIME = '#22A357';
const AMBER = '#E9A23B';
const RED = '#D94F4F';

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

function fmtKg(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K kg`;
  return `${n} kg`;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#DDE8E1] rounded-xl px-4 py-3 shadow-lg">
      <p className="text-[12px] font-semibold text-[#5A7263] mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-[13px]">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: p.color }} />
          <span className="text-[#5A7263] font-medium">{p.name}:</span>
          <span className="text-[#1A2E1E] font-semibold">
            {p.name?.includes('Cash') || p.name?.includes('flow') || p.name?.includes('In') || p.name?.includes('Out')
              ? fmt(p.value) : fmtKg(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

interface KPICardProps {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  trendNeutral?: boolean;
  sub?: string;
  icon: React.ElementType;
  accent: string;
  onClick?: () => void;
}

function KPICard({ label, value, trend, trendUp, trendNeutral, sub, icon: Icon, accent, onClick }: KPICardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl p-5 text-left hover:shadow-md transition-all duration-200 border border-[#EEF1EE] group w-full"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${accent}18` }}>
          <Icon size={18} style={{ color: accent }} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-[12px] font-semibold px-2 py-1 rounded-full ${
            trendNeutral ? 'bg-[#F7F8F5] text-[#5A7263]' :
            trendUp ? 'bg-[#E8F5EE] text-green-700' : 'bg-red-50 text-red-600'
          }`}>
            {trendNeutral ? <Minus size={11} /> : trendUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {trend}
          </div>
        )}
      </div>
      <p className="text-[26px] font-bold text-[#1A2E1E] leading-none mb-1.5 font-mono" style={{ fontFamily: 'var(--font-jetbrains), ui-monospace, monospace' }}>{value}</p>
      <p className="text-[13px] font-medium text-[#5A7263]">{label}</p>
      {sub && <p className="text-[12px] text-[#8FA898] mt-0.5">{sub}</p>}
    </button>
  );
}

function AlertCard({ type, title, body, action, onClick }: { type: 'critical' | 'attention' | 'info'; title: string; body: string; action: string; onClick?: () => void }) {
  const config = {
    critical: { bg: 'bg-red-50 border-red-100', icon: <AlertTriangle size={15} className="text-red-500" />, title: 'text-red-800', btn: 'text-red-700 hover:text-red-900' },
    attention: { bg: 'bg-amber-50 border-amber-100', icon: <AlertTriangle size={15} className="text-amber-500" />, title: 'text-amber-800', btn: 'text-amber-700 hover:text-amber-900' },
    info: { bg: 'bg-blue-50 border-blue-50', icon: <Info size={15} className="text-blue-400" />, title: 'text-blue-800', btn: 'text-blue-700 hover:text-blue-900' },
  }[type];

  return (
    <div className={`${config.bg} rounded-xl p-4 border`}>
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5">{config.icon}</div>
        <div className="flex-1 min-w-0">
          <p className={`text-[13px] font-semibold ${config.title} leading-snug`}>{title}</p>
          <p className="text-[12px] text-[#5A7263] mt-1 leading-relaxed">{body}</p>
          {onClick && (
            <button onClick={onClick} className={`flex items-center gap-1 text-[12px] font-semibold mt-2 ${config.btn} transition-colors`}>
              {action} <ArrowRight size={11} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard({ navCtx }: { navCtx: NavContext }) {
  const {
    adminName, stores, notifications, supplyDemandChart, cashFlowChart,
    storeVolumeChart, topCrops, farmers, orders, supplyItems,
  } = useAdminData();
  const [sdPeriod, setSdPeriod] = useState<'7d' | '30d' | '90d'>('7d');

  const totalInventory = stores.reduce((s, st) => s + st.inventory, 0);
  const totalCash = stores.reduce((s, st) => s + st.cashBalance, 0);
  const activeStores = stores.filter(s => s.status === 'Active').length;
  const attentionStores = stores.filter(s => s.status === 'Needs Attention').length;
  const firstName = adminName.split(' ')[0] || 'Admin';
  const todayLabel = new Date().toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' });
  const collectedKg = stores.reduce((s, st) => s + st.todayVolume, 0) || totalInventory;
  const activeListings = supplyItems.filter(s => s.matchStatus !== 'Matched').length;
  const fulfilled = orders.filter(o => o.status === 'Delivered' || o.status === 'Paid' || o.status === 'Fulfilled').length;
  const todayFarmers = farmers.filter(f => f.lastCollection !== '—').length;
  const inflow7 = cashFlowChart.reduce((s, d) => s + d.inflow, 0);
  const outflow7 = cashFlowChart.reduce((s, d) => s + d.outflow, 0);
  const alerts = notifications.slice(0, 4);

  return (
    <div className="max-w-[1440px] mx-auto px-8 py-8">
      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1
            className="text-[28px] font-semibold text-[#1A2E1E] leading-tight mb-1"
            style={{ fontFamily: 'var(--font-fraunces), Georgia, serif' }}
          >
            {greeting()}, {firstName}
          </h1>
          <p className="text-[14px] text-[#5A7263]">Here's what's happening across Agri Setu today — {todayLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded-xl bg-white border border-[#EEF1EE] text-[13px] font-medium text-[#5A7263] hover:bg-[#F7F8F5] transition-colors">
            Export
          </button>
          <button className="px-4 py-2 rounded-xl bg-[#1B7A3D] text-[13px] font-medium text-white hover:bg-[#145C2E] transition-colors flex items-center gap-2">
            <Activity size={14} />
            Live view
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-6 gap-4 mb-8">
        <KPICard
          label="Produce Collected"
          value={fmtKg(collectedKg)}
          trend="Live"
          trendNeutral
          sub={`${fmtKg(totalInventory)} in stores`}
          icon={Leaf}
          accent="#145C2E"
          onClick={() => navCtx.navigateTo('inventory')}
        />
        <KPICard
          label="Active Listings"
          value={String(activeListings)}
          trend={`${stores.length} stores`}
          trendNeutral
          sub="unmatched / surplus lots"
          icon={Package}
          accent="#22A357"
          onClick={() => navCtx.navigateTo('matching')}
        />
        <KPICard
          label="Orders Fulfilled"
          value={String(fulfilled)}
          trend={`${orders.length} total`}
          trendNeutral
          sub="matched through delivery"
          icon={Activity}
          accent="#E9A23B"
          onClick={() => navCtx.navigateTo('orders')}
        />
        <KPICard
          label="Cash Position"
          value={fmt(totalCash)}
          trend="Network"
          trendNeutral
          sub="across all stores"
          icon={DollarSign}
          accent="#22A357"
          onClick={() => navCtx.navigateTo('cashflow')}
        />
        <KPICard
          label="Farmers Registered"
          value={String(farmers.length)}
          trend={`${todayFarmers} active`}
          trendUp
          sub="on the platform"
          icon={Users}
          accent="#E9A23B"
          onClick={() => navCtx.navigateTo('users')}
        />
        <KPICard
          label="White Stores"
          value={`${activeStores}/${stores.length}`}
          trend={attentionStores > 0 ? `${attentionStores} alerts` : 'All clear'}
          trendNeutral={attentionStores > 0}
          trendUp={attentionStores === 0}
          sub={`${activeStores} active, ${attentionStores} attention`}
          icon={Store}
          accent="#7C3AED"
          onClick={() => navCtx.navigateTo('stores')}
        />
      </div>

      {/* Main grid: charts + alerts */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Supply vs Demand — 2 cols */}
        <div className="col-span-2 bg-white rounded-2xl p-6 border border-[#EEF1EE]" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[16px] font-semibold text-[#1A2E1E]">Supply vs Demand</h2>
              <p className="text-[12px] text-[#8FA898] mt-0.5">Available supply vs buyer demand across all stores</p>
            </div>
            <div className="flex gap-1">
              {(['7d', '30d', '90d'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setSdPeriod(p)}
                  className={`px-3 py-1.5 text-[12px] font-medium rounded-lg transition-all ${
                    sdPeriod === p ? 'bg-[#1B7A3D] text-white' : 'bg-[#F7F8F5] text-[#5A7263] hover:bg-[#EEF1EE]'
                  }`}
                >
                  {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={supplyDemandChart} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="supplyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#145C2E" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#145C2E" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22A357" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#22A357" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF1EE" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8FA898' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8FA898' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(v)} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                formatter={(v) => <span style={{ color: '#5A7263', fontWeight: 500 }}>{v}</span>}
              />
              <Area type="monotone" dataKey="supply" name="Supply (kg)" stroke="#145C2E" strokeWidth={2} fill="url(#supplyGrad)" dot={false} activeDot={{ r: 4, fill: '#145C2E' }} />
              <Area type="monotone" dataKey="demand" name="Demand (kg)" stroke="#22A357" strokeWidth={2} fill="url(#demandGrad)" dot={false} activeDot={{ r: 4, fill: '#22A357' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Needs Attention — 1 col */}
        <div className="col-span-1 bg-white rounded-2xl p-6 border border-[#EEF1EE]" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[16px] font-semibold text-[#1A2E1E]">Needs Attention</h2>
            <span className="text-[11px] font-semibold text-white bg-[#D94F4F] rounded-full px-2 py-0.5">{alerts.length}</span>
          </div>
          <div className="space-y-3">
            {alerts.length === 0 && (
              <p className="text-[13px] text-[#5A7263]">No alerts right now. The network is clear.</p>
            )}
            {alerts.map(n => (
              <AlertCard
                key={n.id}
                type={n.type === 'Critical' ? 'critical' : n.type === 'Attention' ? 'attention' : 'info'}
                title={n.title}
                body={n.body}
                action="Review"
                onClick={() => navCtx.navigateTo(n.link as Page, n.storeId ? { storeId: n.storeId } : undefined)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row: Top crops + Store performance + Cash */}
      <div className="grid grid-cols-3 gap-6">
        {/* Top Crops */}
        <div className="bg-white rounded-2xl p-6 border border-[#EEF1EE]" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[16px] font-semibold text-[#1A2E1E]">Top Crops</h2>
              <p className="text-[12px] text-[#8FA898] mt-0.5">Supply vs demand by crop</p>
            </div>
            <button onClick={() => navCtx.navigateTo('matching')} className="text-[12px] font-semibold text-[#145C2E] hover:text-[#1B7A3D] transition-colors flex items-center gap-1">
              View all <ArrowRight size={11} />
            </button>
          </div>

          <div className="space-y-1">
            <div className="grid grid-cols-4 text-[11px] font-semibold text-[#8FA898] uppercase tracking-wide pb-2 border-b border-[#F7F8F5]">
              <span>Crop</span>
              <span className="text-right">Supply</span>
              <span className="text-right">Demand</span>
              <span className="text-right">Gap</span>
            </div>
            {topCrops.map(c => (
              <div key={c.crop} className="grid grid-cols-4 py-2.5 text-[13px] border-b border-[#F7F8F5] last:border-0 hover:bg-[#F7F8F5] rounded-lg px-1 transition-colors">
                <span className="font-medium text-[#1A2E1E]">{c.crop}</span>
                <span className="text-right text-[#5A7263] font-mono text-[12px]" style={{ fontFamily: 'var(--font-jetbrains), ui-monospace, monospace' }}>{fmtKg(c.supply)}</span>
                <span className="text-right text-[#5A7263] font-mono text-[12px]" style={{ fontFamily: 'var(--font-jetbrains), ui-monospace, monospace' }}>{fmtKg(c.demand)}</span>
                <span className={`text-right font-semibold font-mono text-[12px] flex items-center justify-end gap-1`} style={{ fontFamily: 'var(--font-jetbrains), ui-monospace, monospace', color: c.gap < 0 ? RED : c.gap > 0 ? '#22A357' : '#5A7263' }}>
                  {c.gap < 0 ? <ChevronDown size={11} /> : c.gap > 0 ? <ChevronUp size={11} /> : <Minus size={11} />}
                  {fmtKg(Math.abs(c.gap))}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Store Performance */}
        <div className="bg-white rounded-2xl p-6 border border-[#EEF1EE]" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[16px] font-semibold text-[#1A2E1E]">Store Volume</h2>
              <p className="text-[12px] text-[#8FA898] mt-0.5">Today's produce collected by store</p>
            </div>
            <button onClick={() => navCtx.navigateTo('stores')} className="text-[12px] font-semibold text-[#145C2E] hover:text-[#1B7A3D] transition-colors flex items-center gap-1">
              All stores <ArrowRight size={11} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={storeVolumeChart} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF1EE" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#8FA898' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(v)} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#5A7263' }} axisLine={false} tickLine={false} width={60} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="volume" name="Volume (kg)" fill="#145C2E" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cash Flow Summary */}
        <div className="bg-white rounded-2xl p-6 border border-[#EEF1EE]" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[16px] font-semibold text-[#1A2E1E]">Cash Flow</h2>
              <p className="text-[12px] text-[#8FA898] mt-0.5">7-day platform-wide movement</p>
            </div>
            <button onClick={() => navCtx.navigateTo('cashflow')} className="text-[12px] font-semibold text-[#145C2E] hover:text-[#1B7A3D] transition-colors flex items-center gap-1">
              Full view <ArrowRight size={11} />
            </button>
          </div>

          {/* Mini KPIs */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-[#E8F5EE] rounded-xl p-3">
              <p className="text-[11px] font-semibold text-green-700 uppercase tracking-wide mb-1">Total Inflow</p>
              <p className="text-[18px] font-bold text-green-800" style={{ fontFamily: 'var(--font-jetbrains), ui-monospace, monospace' }}>{fmt(inflow7)}</p>
              <p className="text-[11px] text-green-600 mt-0.5">7-day total</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3">
              <p className="text-[11px] font-semibold text-red-700 uppercase tracking-wide mb-1">Total Outflow</p>
              <p className="text-[18px] font-bold text-red-800" style={{ fontFamily: 'var(--font-jetbrains), ui-monospace, monospace' }}>{fmt(outflow7)}</p>
              <p className="text-[11px] text-red-600 mt-0.5">7-day total</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={cashFlowChart} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF1EE" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8FA898' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="inflow" name="Cash In" fill="#22A357" radius={[3, 3, 0, 0]} />
              <Bar dataKey="outflow" name="Cash Out" fill="#D94F4F" radius={[3, 3, 0, 0]} opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
