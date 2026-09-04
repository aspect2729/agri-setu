"use client";

import { useState } from 'react';
import { Search, X, ChevronRight, UserX, Edit2, Filter } from 'lucide-react';
import type { NavContext } from '../nav';
import { useAdminData } from '../data-context';
import type { Farmer, Employee, Buyer } from '../types';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Active: 'bg-green-50 text-green-700 border-green-100',
    Inactive: 'bg-[#F7F8F5] text-[#5A7263] border-[#DDE8E1]',
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${map[status] ?? 'bg-[#F7F8F5] text-[#5A7263] border-[#DDE8E1]'}`}>{status}</span>;
}

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}

function Avatar({ name, color = '#1B7A3D' }: { name: string; color?: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0" style={{ background: color }}>
      {initials}
    </div>
  );
}

function DeactivateModal({ name, onConfirm, onClose }: { name: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 w-[420px] border border-[#EEF1EE]" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
          <UserX size={18} className="text-red-500" />
        </div>
        <h3 className="text-[16px] font-semibold text-[#1A2E1E] mb-2">Deactivate {name}?</h3>
        <p className="text-[13px] text-[#5A7263] mb-6">This will prevent {name} from accessing the platform. This action can be reversed later.</p>
        <div className="flex gap-3">
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-600 text-white text-[13px] font-semibold rounded-xl hover:bg-red-700 transition-colors">
            Deactivate
          </button>
          <button onClick={onClose} className="flex-1 py-2.5 bg-white border border-[#EEF1EE] text-[13px] font-medium text-[#5A7263] rounded-xl hover:bg-[#F7F8F5] transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function FarmerDetail({ farmer, onClose }: { farmer: Farmer; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="fixed inset-0 bg-black/20" />
      <div className="relative w-[460px] h-full bg-white overflow-y-auto flex flex-col" onClick={e => e.stopPropagation()} style={{ boxShadow: '-16px 0 48px rgba(0,0,0,0.1)' }}>
        <div className="px-6 py-5 border-b border-[#F7F8F5] flex items-center justify-between">
          <div>
            <p className="text-[11px] text-[#8FA898] font-semibold uppercase tracking-wide">Farmer Profile</p>
            <p className="text-[16px] font-bold text-[#1A2E1E] mt-0.5">{farmer.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F7F8F5] rounded-xl"><X size={16} className="text-[#5A7263]" /></button>
        </div>
        <div className="px-6 py-5">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#1B7A3D] flex items-center justify-center text-[18px] font-bold text-white">
              {farmer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h3 className="text-[18px] font-semibold text-[#1A2E1E]">{farmer.name}</h3>
              <p className="text-[13px] text-[#5A7263]">{farmer.village}</p>
              <StatusBadge status={farmer.status} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { label: 'Total Produce', value: `${farmer.totalProduce.toLocaleString()} kg` },
              { label: 'Total Payments', value: fmt(farmer.totalPayments) },
              { label: 'Last Collection', value: farmer.lastCollection },
              { label: 'Joined', value: farmer.joinDate },
            ].map(r => (
              <div key={r.label} className="bg-[#F7F8F5] rounded-xl p-3">
                <p className="text-[11px] text-[#8FA898]">{r.label}</p>
                <p className="text-[14px] font-bold text-[#1A2E1E] font-mono mt-0.5" style={{ fontFamily: 'JetBrains Mono' }}>{r.value}</p>
              </div>
            ))}
          </div>

          <div className="divide-y divide-[#F7F8F5]">
            {[
              { label: 'Phone', value: farmer.phone },
              { label: 'Farmer ID', value: farmer.id.toUpperCase() },
              { label: 'Crops', value: farmer.crops.join(', ') },
            ].map(r => (
              <div key={r.label} className="flex justify-between py-3">
                <span className="text-[13px] text-[#5A7263]">{r.label}</span>
                <span className="text-[13px] font-medium text-[#1A2E1E]">{r.value}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-6">
            <button className="flex-1 py-2.5 bg-[#1B7A3D] text-white text-[13px] font-semibold rounded-xl hover:bg-[#145C2E] transition-colors flex items-center justify-center gap-2">
              <Edit2 size={13} /> Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage({ navCtx }: { navCtx: NavContext }) {
  const { farmers, employees, buyers } = useAdminData();
  const [tab, setTab] = useState<'Farmers' | 'Employees' | 'Buyers'>(
    navCtx.currentParams.tab === 'farmers' ? 'Farmers' :
    navCtx.currentParams.tab === 'employees' ? 'Employees' :
    navCtx.currentParams.tab === 'buyers' ? 'Buyers' : 'Farmers'
  );
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(
    navCtx.currentParams.userId ? (farmers.find(f => f.id === navCtx.currentParams.userId) ?? null) : null
  );
  const [deactivateTarget, setDeactivateTarget] = useState<string | null>(null);

  const filteredFarmers = farmers.filter(f => {
    const q = search.toLowerCase();
    return (statusFilter === 'All' || f.status === statusFilter) &&
      (q === '' || f.name.toLowerCase().includes(q) || f.village.toLowerCase().includes(q) || f.phone.includes(q));
  });

  const filteredEmployees = employees.filter(e => {
    const q = search.toLowerCase();
    return (statusFilter === 'All' || e.status === statusFilter) &&
      (q === '' || e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q) || e.storeName.toLowerCase().includes(q));
  });

  const filteredBuyers = buyers.filter(b => {
    const q = search.toLowerCase();
    return (statusFilter === 'All' || b.status === statusFilter) &&
      (q === '' || b.name.toLowerCase().includes(q) || b.company.toLowerCase().includes(q) || b.location.toLowerCase().includes(q));
  });

  return (
    <div className="max-w-[1440px] mx-auto px-8 py-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-semibold text-[#1A2E1E] mb-1" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>Users</h1>
          <p className="text-[14px] text-[#5A7263]">Manage farmers, store employees, and buyers across the platform</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Farmers', value: farmers.length, active: farmers.filter(f => f.status === 'Active').length, color: '#145C2E', tab: 'Farmers' as const },
          { label: 'Total Employees', value: employees.length, active: employees.filter(e => e.status === 'Active').length, color: '#E9A23B', tab: 'Employees' as const },
          { label: 'Total Buyers', value: buyers.length, active: buyers.filter(b => b.status === 'Active').length, color: '#E9A23B', tab: 'Buyers' as const },
        ].map(s => (
          <button
            key={s.label}
            onClick={() => setTab(s.tab)}
            className={`bg-white rounded-xl p-4 border text-left transition-all hover:shadow-sm ${tab === s.tab ? 'border-[#1B7A3D] ring-1 ring-[#1B7A3D]' : 'border-[#EEF1EE]'}`}
          >
            <div className="flex items-end gap-2 mb-1">
              <p className="text-[24px] font-bold font-mono" style={{ fontFamily: 'JetBrains Mono', color: s.color }}>{s.value}</p>
              <p className="text-[12px] text-green-600 font-medium pb-1">{s.active} active</p>
            </div>
            <p className="text-[12px] text-[#5A7263]">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Tab + filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex gap-1 bg-white rounded-xl p-1 border border-[#EEF1EE]">
          {(['Farmers', 'Employees', 'Buyers'] as const).map(t => (
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
            placeholder={`Search ${tab.toLowerCase()}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button onClick={() => setSearch('')}><X size={13} className="text-[#8FA898]" /></button>}
        </div>

        <div className="flex gap-1">
          {['All', 'Active', 'Inactive'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-[12px] font-medium rounded-lg transition-all ${statusFilter === s ? 'bg-[#1B7A3D] text-white' : 'bg-white border border-[#EEF1EE] text-[#5A7263] hover:bg-[#F7F8F5]'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Tables */}
      <div className="bg-white rounded-2xl border border-[#EEF1EE] overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        {tab === 'Farmers' && (
          <>
            <div className="px-6 py-4 border-b border-[#F7F8F5] flex items-center justify-between">
              <p className="text-[14px] font-semibold text-[#1A2E1E]">Farmer Directory</p>
              <p className="text-[12px] text-[#5A7263]">{filteredFarmers.length} farmers</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#F7F8F5] bg-[#F7F8F5]">
                    {['Farmer', 'Village', 'Phone', 'Crops', 'Total Produce', 'Last Collection', 'Total Payments', 'Status', ''].map(h => (
                      <th key={h} className={`px-4 py-3 text-[11px] font-semibold text-[#8FA898] uppercase tracking-wide ${['Total Produce', 'Total Payments'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredFarmers.map(f => (
                    <tr key={f.id} onClick={() => setSelectedFarmer(f)} className="border-b border-[#F7F8F5] hover:bg-[#F7F8F5] cursor-pointer transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={f.name} />
                          <span className="text-[13px] font-medium text-[#1A2E1E]">{f.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#5A7263]">{f.village}</td>
                      <td className="px-4 py-3 text-[13px] font-mono text-[#5A7263]" style={{ fontFamily: 'JetBrains Mono' }}>{f.phone}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {f.crops.map(c => <span key={c} className="text-[10px] bg-[#E8F5EE] text-[#145C2E] border border-[#DDE8E1] px-1.5 py-0.5 rounded-md font-medium">{c}</span>)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-[13px] font-mono text-[#1A2E1E]" style={{ fontFamily: 'JetBrains Mono' }}>{f.totalProduce.toLocaleString()} kg</td>
                      <td className="px-4 py-3 text-[13px] text-[#5A7263]">{f.lastCollection}</td>
                      <td className="px-4 py-3 text-right text-[13px] font-semibold font-mono text-[#1A2E1E]" style={{ fontFamily: 'JetBrains Mono' }}>{fmt(f.totalPayments)}</td>
                      <td className="px-4 py-3"><StatusBadge status={f.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); setDeactivateTarget(f.name); }} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Deactivate">
                            <UserX size={13} className="text-red-500" />
                          </button>
                          <ChevronRight size={14} className="text-[#DDE8E1]" />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredFarmers.length === 0 && (
                    <tr><td colSpan={9} className="px-4 py-12 text-center text-[14px] text-[#5A7263]">No farmers found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'Employees' && (
          <>
            <div className="px-6 py-4 border-b border-[#F7F8F5] flex items-center justify-between">
              <p className="text-[14px] font-semibold text-[#1A2E1E]">Store Employees</p>
              <p className="text-[12px] text-[#5A7263]">{filteredEmployees.length} employees</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#F7F8F5] bg-[#F7F8F5]">
                    {['Employee', 'Role', 'Store', 'Phone', 'Status', 'Join Date', 'Last Active', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-[11px] font-semibold text-[#8FA898] uppercase tracking-wide text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map(e => (
                    <tr key={e.id} className="border-b border-[#F7F8F5] hover:bg-[#F7F8F5] transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={e.name} color="#145C2E" />
                          <span className="text-[13px] font-medium text-[#1A2E1E]">{e.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#5A7263]">{e.role}</td>
                      <td className="px-4 py-3 text-[13px] text-[#5A7263]">{e.storeName}</td>
                      <td className="px-4 py-3 text-[13px] font-mono text-[#5A7263]" style={{ fontFamily: 'JetBrains Mono' }}>{e.phone}</td>
                      <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                      <td className="px-4 py-3 text-[13px] text-[#5A7263]">{e.joinDate}</td>
                      <td className="px-4 py-3 text-[13px] text-[#5A7263]">{e.lastActive}</td>
                      <td className="px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setDeactivateTarget(e.name)} className="p-1.5 hover:bg-red-50 rounded-lg">
                          <UserX size={13} className="text-red-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <tr><td colSpan={8} className="px-4 py-12 text-center text-[14px] text-[#5A7263]">No employees found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'Buyers' && (
          <>
            <div className="px-6 py-4 border-b border-[#F7F8F5] flex items-center justify-between">
              <p className="text-[14px] font-semibold text-[#1A2E1E]">Buyer Directory</p>
              <p className="text-[12px] text-[#5A7263]">{filteredBuyers.length} buyers</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#F7F8F5] bg-[#F7F8F5]">
                    {['Buyer', 'Company', 'Phone', 'Location', 'Total Orders', 'Total Purchases', 'Status', 'Last Order', ''].map(h => (
                      <th key={h} className={`px-4 py-3 text-[11px] font-semibold text-[#8FA898] uppercase tracking-wide ${['Total Orders', 'Total Purchases'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredBuyers.map(b => (
                    <tr key={b.id} className="border-b border-[#F7F8F5] hover:bg-[#F7F8F5] transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={b.name} color="#E9A23B" />
                          <span className="text-[13px] font-medium text-[#1A2E1E]">{b.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#5A7263]">{b.company}</td>
                      <td className="px-4 py-3 text-[13px] font-mono text-[#5A7263]" style={{ fontFamily: 'JetBrains Mono' }}>{b.phone}</td>
                      <td className="px-4 py-3 text-[13px] text-[#5A7263]">{b.location}</td>
                      <td className="px-4 py-3 text-right text-[13px] font-mono text-[#1A2E1E]" style={{ fontFamily: 'JetBrains Mono' }}>{b.totalOrders}</td>
                      <td className="px-4 py-3 text-right text-[13px] font-semibold font-mono text-[#1A2E1E]" style={{ fontFamily: 'JetBrains Mono' }}>{fmt(b.totalPurchases)}</td>
                      <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                      <td className="px-4 py-3 text-[13px] text-[#5A7263]">{b.lastOrder}</td>
                      <td className="px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setDeactivateTarget(b.name)} className="p-1.5 hover:bg-red-50 rounded-lg">
                          <UserX size={13} className="text-red-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredBuyers.length === 0 && (
                    <tr><td colSpan={9} className="px-4 py-12 text-center text-[14px] text-[#5A7263]">No buyers found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="px-6 py-4 border-t border-[#F7F8F5] bg-[#F7F8F5] flex items-center justify-between">
          <p className="text-[13px] text-[#5A7263]">
            Showing {tab === 'Farmers' ? filteredFarmers.length : tab === 'Employees' ? filteredEmployees.length : filteredBuyers.length} results
          </p>
          <div className="flex gap-1">
            <button className="w-8 h-8 rounded-lg bg-[#1B7A3D] text-[12px] font-semibold text-white">1</button>
          </div>
        </div>
      </div>

      {selectedFarmer && <FarmerDetail farmer={selectedFarmer} onClose={() => setSelectedFarmer(null)} />}

      {deactivateTarget && (
        <DeactivateModal
          name={deactivateTarget}
          onConfirm={() => setDeactivateTarget(null)}
          onClose={() => setDeactivateTarget(null)}
        />
      )}
    </div>
  );
}
