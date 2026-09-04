"use client";

import { DemoBadge } from "@/components/demo-badge"
import { useState } from 'react'
import type { NavigateFn } from '../types'
import { isActiveStatus } from '../demo-data'
import { useLogisticsData } from '../data-context'
import StatusBadge from '../chrome/StatusBadge'

interface Props {
  navigate: NavigateFn
}

type Tab = 'all' | 'active' | 'completed' | 'cancelled'

export default function MyTrips({ navigate }: Props) {
  const { trips } = useLogisticsData()
  const [activeTab, setActiveTab] = useState<Tab>('all')

  const allTripsData = trips.filter((t) => t.status !== 'available')

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'all', label: 'All Trips', count: allTripsData.length },
    { id: 'active', label: 'Active', count: allTripsData.filter((t) => isActiveStatus(t.status)).length },
    { id: 'completed', label: 'Completed', count: allTripsData.filter((t) => t.status === 'delivered').length },
    { id: 'cancelled', label: 'Cancelled', count: allTripsData.filter((t) => t.status === 'cancelled').length },
  ]

  const filtered = allTripsData.filter((t) => {
    if (activeTab === 'all') return true
    if (activeTab === 'active') return isActiveStatus(t.status)
    if (activeTab === 'completed') return t.status === 'delivered'
    if (activeTab === 'cancelled') return t.status === 'cancelled'
    return true
  })

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">My Trips</h1>
        <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
          All trips assigned to you.
          <DemoBadge />
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                  activeTab === tab.id ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Trip ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Route</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cargo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Weight</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Earnings</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((trip) => (
                <tr key={trip.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs font-medium text-slate-700">{trip.id}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-slate-600">
                      {trip.date
                        ? new Date(trip.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-slate-700 font-medium max-w-[120px] truncate">{trip.pickup.name.replace('White Store — ', '')}</span>
                      <svg className="w-3 h-3 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      <span className="text-slate-700 font-medium max-w-[120px] truncate">{trip.destination.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-slate-700">{trip.cargo.crop}</div>
                    <div className="text-xs text-slate-400">{trip.cargo.grade}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-slate-700">{trip.cargo.quantity.toLocaleString('en-IN')} kg</span>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={trip.status} />
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`text-sm font-semibold ${
                        trip.status === 'cancelled' ? 'text-slate-400' : trip.status === 'delivered' ? 'text-green-700' : 'text-amber-700'
                      }`}
                    >
                      {trip.status === 'cancelled' ? '—' : `₹${trip.earnings.toLocaleString('en-IN')}`}
                    </span>
                    {trip.status === 'in-transit' && (
                      <div className="text-xs text-amber-600 mt-0.5">Pending</div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {isActiveStatus(trip.status) && (
                      <button
                        onClick={() => navigate('active-delivery', { tripId: trip.id })}
                        className="px-3 py-1.5 text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                      >
                        View Active
                      </button>
                    )}
                    {trip.status === 'delivered' && (
                      <button
                        onClick={() => navigate('trip-details', { tripId: trip.id })}
                        className="px-3 py-1.5 text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                      >
                        View
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-slate-400">
                    No trips in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
