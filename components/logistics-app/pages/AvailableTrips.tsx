"use client";

import { DemoBadge } from "@/components/demo-badge"
import { useState } from 'react'
import type { NavigateFn } from '../types'
import { useLogisticsData } from '../data-context'
import StatusBadge from '../chrome/StatusBadge'

interface Props { navigate: NavigateFn }

export default function AvailableTrips({ navigate }: Props) {
  const { trips } = useLogisticsData()
  const availableTrips = trips.filter((t) => t.status === 'available')
  const [search, setSearch] = useState('')
  const [filterPickup, setFilterPickup] = useState('')
  const [filterCrop, setFilterCrop] = useState('')

  const pickups = [...new Set(availableTrips.map((t) => t.pickup.name))]
  const crops = [...new Set(availableTrips.map((t) => t.cargo.crop))]

  const filtered = availableTrips.filter((t) => {
    const q = search.toLowerCase()
    return (
      (!q || t.id.toLowerCase().includes(q) || t.pickup.name.toLowerCase().includes(q) || t.destination.name.toLowerCase().includes(q) || t.cargo.crop.toLowerCase().includes(q)) &&
      (!filterPickup || t.pickup.name.includes(filterPickup)) &&
      (!filterCrop || t.cargo.crop === filterCrop)
    )
  })

  return (
    <div className="p-6 lg:p-8 max-w-[1440px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-900 tracking-tight">Available Trips</h1>
          <p className="text-[13.5px] text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
            Pickup and delivery requests matching your vehicle capacity.
            <DemoBadge />
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
            </svg>
            Sort
          </button>
          <button className="flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
            </svg>
            Filter
          </button>
          <button className="w-9 h-9 flex items-center justify-center border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-52">
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search trip ID, location, crop…"
              className="w-full pl-9 pr-3 py-2 text-[13px] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/25 focus:border-green-400 transition-colors"
            />
          </div>
          <select value={filterPickup} onChange={(e) => setFilterPickup(e.target.value)} className="px-3 py-2 text-[13px] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/25 text-slate-600 cursor-pointer">
            <option value="">All pickup locations</option>
            {pickups.map((p) => <option key={p}>{p}</option>)}
          </select>
          <select value={filterCrop} onChange={(e) => setFilterCrop(e.target.value)} className="px-3 py-2 text-[13px] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/25 text-slate-600 cursor-pointer">
            <option value="">All crops</option>
            {crops.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select className="px-3 py-2 text-[13px] border border-slate-200 rounded-xl focus:outline-none text-slate-600 cursor-pointer">
            <option value="">Any date</option>
            <option>Today</option>
            <option>Tomorrow</option>
          </select>
          <select className="px-3 py-2 text-[13px] border border-slate-200 rounded-xl focus:outline-none text-slate-600 cursor-pointer">
            <option value="">Any vehicle type</option>
            <option>Covered Goods Vehicle</option>
            <option>Light Commercial Vehicle</option>
          </select>
          {(search || filterPickup || filterCrop) && (
            <button onClick={() => { setSearch(''); setFilterPickup(''); setFilterCrop('') }} className="text-[12.5px] text-slate-400 hover:text-slate-600 cursor-pointer underline">
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Trip ID', 'Pickup · White Store', 'Destination · Buyer', 'Cargo', 'Weight', 'Pickup Time', 'Distance', 'Earnings', ''].map((col) => (
                  <th key={col} className="text-left px-4 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wide first:pl-5 last:pr-5">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((trip) => (
                <tr key={trip.id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="pl-5 pr-4 py-4">
                    <div className="font-mono text-[11.5px] font-semibold text-slate-700">{trip.id}</div>
                    <div className="mt-1"><StatusBadge status={trip.status} /></div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-[13px] font-semibold text-green-700 leading-snug max-w-[140px]">{trip.pickup.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{trip.pickup.address.split(',')[0]}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-[13px] font-semibold text-slate-800 leading-snug max-w-[140px]">{trip.destination.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{trip.destination.address.split(',')[0]}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-[13px] font-semibold text-slate-700">{trip.cargo.crop}</div>
                    <div className="text-[11px] text-slate-400">{trip.cargo.grade}</div>
                  </td>
                  <td className="px-4 py-4 text-[13px] font-medium text-slate-700 whitespace-nowrap">{trip.cargo.quantity.toLocaleString('en-IN')} kg</td>
                  <td className="px-4 py-4 text-[13px] text-slate-600 whitespace-nowrap">{trip.pickupTime}</td>
                  <td className="px-4 py-4 text-[13px] text-slate-600">{trip.distance} km</td>
                  <td className="px-4 py-4">
                    <div className="text-[15px] font-semibold text-green-700">₹{trip.earnings.toLocaleString('en-IN')}</div>
                    <div className="text-[10px] text-slate-400">₹{trip.rate}/km</div>
                  </td>
                  <td className="pl-4 pr-5 py-4">
                    <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => navigate('trip-details', { tripId: trip.id })}
                        className="px-3 py-1.5 text-[12px] font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                      >
                        View
                      </button>
                      <button
                        onClick={() => navigate('trip-details', { tripId: trip.id })}
                        className="px-3 py-1.5 text-[12px] font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Accept
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <div className="text-3xl mb-3">🔍</div>
                    <p className="text-[14px] font-semibold text-slate-600">No trips found</p>
                    <p className="text-[12.5px] text-slate-400 mt-1">Try adjusting your search or filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-[12px] text-slate-500">
          <span>Showing {filtered.length} of {availableTrips.length} available trips</span>
          <div className="flex items-center gap-1">
            <button className="px-2 py-1 rounded hover:bg-slate-100 disabled:opacity-40 cursor-pointer" disabled>← Prev</button>
            <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-lg font-semibold text-[12px]">1</span>
            <button className="px-2 py-1 rounded hover:bg-slate-100 cursor-pointer">Next →</button>
          </div>
        </div>
      </div>
    </div>
  )
}
