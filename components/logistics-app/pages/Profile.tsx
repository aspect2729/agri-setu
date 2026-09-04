"use client";

import { DemoBadge } from "@/components/demo-badge"
import type { NavigateFn } from '../types'
import { useLogisticsData } from '../data-context'

interface Props {
  navigate: NavigateFn
}

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'ST'
}

export default function Profile(_props: Props) {
  const { operatorName, operatorVillage, operatorPhone, partnerId, vehicles, earningsSummary, tripHistory } = useLogisticsData()
  const mark = initials(operatorName)
  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
        <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
          Your logistics partner profile and account information.
          <DemoBadge />
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">{mark}</span>
          </div>
          <h2 className="text-lg font-semibold text-slate-900">{operatorName}</h2>
          <p className="text-sm text-slate-500 mt-0.5">Logistics Partner</p>

          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4].map((i) => (
                <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
              <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-800">4.8</span>
            <span className="text-xs text-slate-400">/ 5.0</span>
          </div>

          <div className="mt-5 space-y-2 text-sm text-left">
            {[
              { label: 'Partner ID', value: partnerId, mono: true },
              { label: 'Phone', value: operatorPhone ?? '—', mono: false },
              { label: 'Operating Area', value: operatorVillage ?? 'Agri Setu network', mono: false },
              { label: 'Partner since', value: '2025', mono: false },
            ].map((item) => (
              <div key={item.label} className="flex justify-between py-1.5 border-b border-slate-50 last:border-0">
                <span className="text-slate-500">{item.label}</span>
                <span className={`font-medium text-slate-800 ${item.mono ? 'font-mono' : ''}`}>{item.value}</span>
              </div>
            ))}
          </div>

          <button className="w-full mt-5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold py-2.5 rounded-xl transition-colors cursor-pointer">
            Edit Profile
          </button>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Business information */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Business Information</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Company Name', value: operatorName },
                { label: 'Vehicle Count', value: `${vehicles.length} vehicles` },
                { label: 'Completed Trips', value: String(earningsSummary.completedCount) },
                { label: 'Partner Rating', value: '4.8 / 5.0' },
                { label: 'Operating Area', value: operatorVillage ?? 'Agri Setu network' },
                { label: 'Active Since', value: 'March 2025' },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 rounded-lg px-4 py-3">
                  <div className="text-xs text-slate-500">{item.label}</div>
                  <div className="text-sm font-semibold text-slate-800 mt-0.5">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900">Documents</h2>
              <span className="text-xs text-green-600 font-medium bg-green-50 border border-green-100 px-2 py-1 rounded-lg">All Verified</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Driving License', sub: 'Licence scan — uploaded (masked)', icon: '🪪' },
                { label: 'Vehicle Registration', sub: 'KA-01-AB-1234 & KA-02-CD-5678', icon: '📄' },
                { label: 'Vehicle Insurance', sub: 'Valid until Mar 2027', icon: '🛡️' },
              ].map((doc) => (
                <div key={doc.label} className="border border-slate-100 rounded-xl p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="text-2xl mb-2">{doc.icon}</div>
                  <div className="text-sm font-semibold text-slate-800">{doc.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{doc.sub}</div>
                  <div className="flex items-center gap-1 mt-3">
                    <div className="w-4 h-4 rounded-full bg-green-600 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-green-600">Verified</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance stats */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Performance Overview</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'On-time Delivery', value: `${earningsSummary.onTimePercent}%`, positive: true },
                { label: 'Board history', value: String(tripHistory.length), positive: true },
                { label: 'Cancelled trips', value: String(tripHistory.filter((t) => t.status === 'cancelled').length), positive: false },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className={`text-2xl font-semibold ${stat.positive ? 'text-green-700' : 'text-slate-700'}`}>{stat.value}</div>
                  <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
