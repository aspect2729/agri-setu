"use client";

import { DemoBadge } from "@/components/demo-badge"
import { useState } from 'react'
import type { NavigateFn } from '../types'
import { useLogisticsData } from '../data-context'
import StatusBadge from '../chrome/StatusBadge'

interface Props {
  navigate: NavigateFn
}

export default function TripHistory(_props: Props) {
  const { tripHistory } = useLogisticsData()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCrop, setFilterCrop] = useState('')

  const filtered = tripHistory.filter((t) => {
    const q = search.toLowerCase()
    const matchSearch = !q || t.id.toLowerCase().includes(q) || t.route.toLowerCase().includes(q) || t.crop.toLowerCase().includes(q)
    const matchStatus = !filterStatus || t.status === filterStatus
    const matchCrop = !filterCrop || t.crop === filterCrop
    return matchSearch && matchStatus && matchCrop
  })

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Trip History</h1>
        <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
          All your past trips and their details.
          <DemoBadge />
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search trip ID, route…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-colors"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 text-slate-600 cursor-pointer"
          >
            <option value="">All statuses</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={filterCrop}
            onChange={(e) => setFilterCrop(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 text-slate-600 cursor-pointer"
          >
            <option value="">All crops</option>
            <option>Onion</option>
            <option>Tomatoes</option>
            <option>Potatoes</option>
            <option>Cabbage</option>
          </select>
          <select className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 text-slate-600 cursor-pointer">
            <option value="">All pickup locations</option>
            <option>White Store — Anekal</option>
            <option>White Store — Jigani</option>
            <option>White Store — Attibele</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Trip ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Crop</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Quantity</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Route</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Earnings</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((trip) => (
                <tr key={trip.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs font-medium text-slate-700">{trip.id}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-slate-600">{trip.date}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm font-medium text-slate-700">{trip.crop}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-slate-700">{trip.quantity}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 text-sm max-w-[200px]">
                      <span className="text-slate-600 truncate">{trip.pickup.replace('White Store — ', '')}</span>
                      <svg className="w-3 h-3 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      <span className="text-slate-600 truncate">{trip.destination}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={trip.status} />
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`text-sm font-semibold ${
                        trip.status === 'cancelled' ? 'text-slate-400' : 'text-green-700'
                      }`}
                    >
                      {trip.status === 'cancelled' ? '—' : `₹${trip.earnings.toLocaleString('en-IN')}`}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button className="invisible group-hover:visible px-3 py-1.5 text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-slate-400">
                    No trips match your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filtered.length} of {tripHistory.length} trips</span>
          <span>Total earned: <strong className="text-slate-700">₹{filtered.filter(t => t.status !== 'cancelled').reduce((s, t) => s + t.earnings, 0).toLocaleString('en-IN')}</strong></span>
        </div>
      </div>
    </div>
  )
}
