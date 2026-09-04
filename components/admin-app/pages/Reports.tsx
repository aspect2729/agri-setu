"use client";

import { useMemo, useState } from 'react';
import { BarChart3, Download, ChevronRight, CheckCircle, Filter } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import type { NavContext } from '../nav';
import { useAdminData } from '../data-context';

type ReportType = 'collection-volume' | 'store-performance' | 'cash-flow' | 'supply-demand' | 'inventory-aging' | 'farmer-participation';
type ReportStep = 'builder' | 'preview';

const reportTypes: Array<{ id: ReportType; label: string; category: string; description: string }> = [
  { id: 'collection-volume', label: 'Collection Volume', category: 'Operations', description: 'Total produce collected by store, crop, and date range.' },
  { id: 'store-performance', label: 'Store Performance', category: 'Operations', description: 'Sales, purchases, and fulfillment per White Store.' },
  { id: 'farmer-participation', label: 'Farmer Participation', category: 'Operations', description: 'Farmer activity, produce volume, and payment summary.' },
  { id: 'cash-flow', label: 'Cash Flow', category: 'Financial', description: 'Cash inflow, outflow, and balance across stores.' },
  { id: 'supply-demand', label: 'Supply vs Demand Gap', category: 'Supply', description: 'Available supply compared to buyer demand by crop.' },
  { id: 'inventory-aging', label: 'Inventory Aging', category: 'Supply', description: 'Freshness and aging status of inventory across stores.' },
];

const CHART_COLORS = ['#1B7A3D', '#22A357', '#E9A23B', '#5A7263', '#D94F4F'];

export default function Reports({ navCtx: _navCtx }: { navCtx: NavContext }) {
  const { storeVolumeChart, cashFlowChart, topCrops, stores, inventory } = useAdminData();
  const previewData = useMemo(() => ({
    'collection-volume': {
      title: 'Produce Collection by Store',
      data: storeVolumeChart,
      keys: ['volume'],
    },
    'store-performance': {
      title: 'Store Sales & Revenue',
      data: storeVolumeChart.map(s => ({ ...s, target: Math.round(s.volume * 1.1) })),
      keys: ['volume', 'target'],
    },
    'farmer-participation': {
      title: 'Farmer Activity',
      data: stores.map(s => ({ name: s.name.split(' ')[0], farmers: s.farmersServed, volume: s.todayVolume || s.inventory })),
      keys: ['farmers', 'volume'],
    },
    'cash-flow': {
      title: 'Cash Inflow vs Outflow (7 Days)',
      data: cashFlowChart.map(d => ({ name: d.date, inflow: d.inflow, outflow: d.outflow })),
      keys: ['inflow', 'outflow'],
    },
    'supply-demand': {
      title: 'Supply vs Demand by Crop',
      data: topCrops.map(c => ({ name: c.crop, supply: c.supply, demand: c.demand })),
      keys: ['supply', 'demand'],
    },
    'inventory-aging': {
      title: 'Inventory Freshness Distribution',
      data: [
        { name: 'Fresh (>80%)', qty: inventory.filter(i => i.freshness > 80).reduce((s, i) => s + i.totalQty, 0) },
        { name: 'Aging (65-80%)', qty: inventory.filter(i => i.freshness > 65 && i.freshness <= 80).reduce((s, i) => s + i.totalQty, 0) },
        { name: 'Critical (<65%)', qty: inventory.filter(i => i.freshness <= 65).reduce((s, i) => s + i.totalQty, 0) },
      ],
      keys: ['qty'],
    },
  }), [storeVolumeChart, cashFlowChart, topCrops, stores, inventory]);

  const [selectedType, setSelectedType] = useState<ReportType | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [step, setStep] = useState<ReportStep>('builder');
  const [generated, setGenerated] = useState(false);

  function toggleStore(id: string) {
    setSelectedStores(p => p.includes(id) ? p.filter(s => s !== id) : [...p, id]);
  }

  function toggleCrop(c: string) {
    setSelectedCrops(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);
  }

  function handleGenerate() {
    if (!selectedType) return;
    setGenerated(true);
    setStep('preview');
  }

  const categories = [...new Set(reportTypes.map(r => r.category))];
  const preview = selectedType ? previewData[selectedType] : null;

  if (step === 'preview' && generated && selectedType && preview) {
    return (
      <div className="max-w-[1440px] mx-auto px-8 py-8">
        <div className="flex items-center gap-2 text-[13px] text-[#5A7263] mb-6">
          <button onClick={() => setStep('builder')} className="hover:text-[#1A2E1E] font-medium">Reports</button>
          <ChevronRight size={14} />
          <span className="text-[#1A2E1E] font-medium">Report Preview</span>
        </div>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[24px] font-semibold text-[#1A2E1E]" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
              {preview.title}
            </h1>
            <p className="text-[13px] text-[#5A7263] mt-1">
              Period: {dateRange === '7d' ? 'Last 7 days' : dateRange === '30d' ? 'Last 30 days' : 'Last 90 days'} ·
              Stores: {selectedStores.length > 0 ? `${selectedStores.length} selected` : 'All'} ·
              Generated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#EEF1EE] text-[13px] font-medium text-[#5A7263] hover:bg-[#F7F8F5] transition-colors">
              <Download size={14} /> Export CSV
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1B7A3D] text-[13px] font-medium text-white hover:bg-[#145C2E] transition-colors">
              <Download size={14} /> Export PDF
            </button>
          </div>
        </div>

        {/* Preview chart */}
        <div className="bg-white rounded-2xl p-6 border border-[#EEF1EE] mb-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h2 className="text-[15px] font-semibold text-[#1A2E1E] mb-5">{preview.title}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={preview.data as Record<string, string | number>[]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF1EE" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8FA898', fontFamily: 'Outfit' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8FA898', fontFamily: 'Outfit' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'Outfit' }} />
              {preview.keys.map((k, i) => (
                <Bar key={k} dataKey={k} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Data table preview */}
        <div className="bg-white rounded-2xl border border-[#EEF1EE] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#F7F8F5]">
            <h2 className="text-[15px] font-semibold text-[#1A2E1E]">Data Table</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F7F8F5] bg-[#F7F8F5]">
                {Object.keys(preview.data[0] ?? {}).map(k => (
                  <th key={k} className="px-4 py-3 text-[11px] font-semibold text-[#8FA898] uppercase tracking-wide text-left">{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.data.map((row, i) => (
                <tr key={i} className="border-b border-[#F7F8F5] hover:bg-[#F7F8F5]">
                  {Object.values(row).map((v, j) => (
                    <td key={j} className="px-4 py-3 text-[13px] text-[#5A7263] font-mono" style={{ fontFamily: typeof v === 'number' ? 'JetBrains Mono' : 'inherit' }}>
                      {String(v)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-8 py-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-semibold text-[#1A2E1E] mb-1" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Reports & Analytics</h1>
          <p className="text-[14px] text-[#5A7263]">Build and export platform intelligence reports</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Builder */}
        <div className="col-span-2 space-y-6">
          {/* Report type */}
          <div className="bg-white rounded-2xl p-6 border border-[#EEF1EE]" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-6 h-6 rounded-full bg-[#1B7A3D] text-white text-[12px] font-bold flex items-center justify-center">1</div>
              <h2 className="text-[15px] font-semibold text-[#1A2E1E]">Select Report Type</h2>
            </div>
            {categories.map(cat => (
              <div key={cat} className="mb-4">
                <p className="text-[11px] font-semibold text-[#8FA898] uppercase tracking-wide mb-2">{cat}</p>
                <div className="space-y-2">
                  {reportTypes.filter(r => r.category === cat).map(r => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedType(r.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                        selectedType === r.id
                          ? 'border-[#1B7A3D] bg-[#E8F5EE]'
                          : 'border-[#EEF1EE] bg-white hover:bg-[#F7F8F5]'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedType === r.id ? 'border-[#1B7A3D] bg-[#1B7A3D]' : 'border-[#DDE8E1]'}`}>
                        {selectedType === r.id && <CheckCircle size={12} className="text-white" />}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-[#1A2E1E]">{r.label}</p>
                        <p className="text-[12px] text-[#5A7263]">{r.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Date range */}
          <div className="bg-white rounded-2xl p-6 border border-[#EEF1EE]">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-6 h-6 rounded-full bg-[#1B7A3D] text-white text-[12px] font-bold flex items-center justify-center">2</div>
              <h2 className="text-[15px] font-semibold text-[#1A2E1E]">Date Range</h2>
            </div>
            <div className="flex gap-2">
              {(['7d', '30d', '90d', 'custom'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDateRange(d)}
                  className={`px-4 py-2 rounded-xl text-[13px] font-medium transition-all border ${dateRange === d ? 'bg-[#1B7A3D] text-white border-[#1B7A3D]' : 'bg-white text-[#5A7263] border-[#EEF1EE] hover:bg-[#F7F8F5]'}`}
                >
                  {d === '7d' ? 'Last 7 Days' : d === '30d' ? 'Last 30 Days' : d === '90d' ? 'Last 90 Days' : 'Custom'}
                </button>
              ))}
            </div>
          </div>

          {/* Stores */}
          <div className="bg-white rounded-2xl p-6 border border-[#EEF1EE]">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-6 h-6 rounded-full bg-[#1B7A3D] text-white text-[12px] font-bold flex items-center justify-center">3</div>
              <h2 className="text-[15px] font-semibold text-[#1A2E1E]">White Stores</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedStores([])}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all ${selectedStores.length === 0 ? 'bg-[#1B7A3D] text-white border-[#1B7A3D]' : 'bg-white text-[#5A7263] border-[#EEF1EE] hover:bg-[#F7F8F5]'}`}
              >
                All Stores
              </button>
              {stores.map(s => (
                <button
                  key={s.id}
                  onClick={() => toggleStore(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all ${selectedStores.includes(s.id) ? 'bg-[#E8F5EE] text-[#1B7A3D] border-[#DDE8E1]' : 'bg-white text-[#5A7263] border-[#EEF1EE] hover:bg-[#F7F8F5]'}`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Crops */}
          <div className="bg-white rounded-2xl p-6 border border-[#EEF1EE]">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-6 h-6 rounded-full bg-[#1B7A3D] text-white text-[12px] font-bold flex items-center justify-center">4</div>
              <h2 className="text-[15px] font-semibold text-[#1A2E1E]">Crops</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {['All Crops', 'Tomato', 'Potato', 'Onion', 'Corn', 'Brinjal', 'Carrot', 'Chili', 'Cabbage'].map(c => (
                <button
                  key={c}
                  onClick={() => c === 'All Crops' ? setSelectedCrops([]) : toggleCrop(c)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all ${
                    (c === 'All Crops' && selectedCrops.length === 0) || selectedCrops.includes(c)
                      ? 'bg-[#E8F5EE] text-[#1B7A3D] border-[#DDE8E1]'
                      : 'bg-white text-[#5A7263] border-[#EEF1EE] hover:bg-[#F7F8F5]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary + generate */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-[#EEF1EE] sticky top-8" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <h2 className="text-[15px] font-semibold text-[#1A2E1E] mb-4">Report Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between py-2 border-b border-[#F7F8F5]">
                <span className="text-[13px] text-[#5A7263]">Report Type</span>
                <span className="text-[13px] font-medium text-[#1A2E1E] text-right max-w-[160px]">
                  {selectedType ? reportTypes.find(r => r.id === selectedType)?.label : <span className="text-[#8FA898]">Not selected</span>}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#F7F8F5]">
                <span className="text-[13px] text-[#5A7263]">Period</span>
                <span className="text-[13px] font-medium text-[#1A2E1E]">
                  {dateRange === '7d' ? 'Last 7 days' : dateRange === '30d' ? 'Last 30 days' : dateRange === '90d' ? 'Last 90 days' : 'Custom'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#F7F8F5]">
                <span className="text-[13px] text-[#5A7263]">Stores</span>
                <span className="text-[13px] font-medium text-[#1A2E1E]">
                  {selectedStores.length === 0 ? 'All stores' : `${selectedStores.length} selected`}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[13px] text-[#5A7263]">Crops</span>
                <span className="text-[13px] font-medium text-[#1A2E1E]">
                  {selectedCrops.length === 0 ? 'All crops' : selectedCrops.join(', ')}
                </span>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!selectedType}
              className={`w-full py-3 rounded-xl text-[14px] font-semibold transition-all ${
                selectedType
                  ? 'bg-[#1B7A3D] text-white hover:bg-[#145C2E]'
                  : 'bg-[#F7F8F5] text-[#8FA898] cursor-not-allowed'
              }`}
            >
              Generate Report
            </button>

            {!selectedType && (
              <p className="text-[12px] text-[#8FA898] text-center mt-3">Select a report type to continue</p>
            )}
          </div>

          {/* Recent reports */}
          <div className="bg-white rounded-2xl p-5 border border-[#EEF1EE]">
            <h3 className="text-[13px] font-semibold text-[#5A7263] uppercase tracking-wide mb-3">Recent Reports</h3>
            {[
              { label: 'Collection Volume — Aug 2026', date: 'Aug 31' },
              { label: 'Cash Flow — Last 30 Days', date: 'Aug 28' },
              { label: 'Supply vs Demand — Q3', date: 'Aug 25' },
            ].map(r => (
              <button key={r.label} className="w-full flex items-center justify-between py-2.5 border-b border-[#F7F8F5] last:border-0 hover:text-[#1B7A3D] transition-colors">
                <div className="text-left">
                  <p className="text-[13px] font-medium text-[#1A2E1E]">{r.label}</p>
                  <p className="text-[11px] text-[#8FA898]">{r.date}</p>
                </div>
                <Download size={13} className="text-[#DDE8E1]" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
