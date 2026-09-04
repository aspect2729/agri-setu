"use client";

import { DemoBadge } from "@/components/demo-badge"
import { useState } from 'react'
import type { NavigateFn } from '../types'
import { useLogisticsData } from '../data-context'

interface Props {
  navigate: NavigateFn
}

export default function Vehicles({ navigate }: Props) {
  const { vehicles } = useLogisticsData()
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">My Vehicles</h1>
          <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
            Manage your registered vehicles and their status.
            <DemoBadge />
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Vehicle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${vehicle.status === 'on-trip' ? 'bg-amber-50' : 'bg-green-50'}`}>
                  <svg className={`w-5 h-5 ${vehicle.status === 'on-trip' ? 'text-amber-600' : 'text-green-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                </div>
                <div>
                  <div className="font-mono text-sm font-semibold text-slate-900">{vehicle.id}</div>
                  <div className="text-xs text-slate-500">{vehicle.make} · {vehicle.year}</div>
                </div>
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  vehicle.status === 'available'
                    ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
                    : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                }`}
              >
                {vehicle.status === 'available' ? 'Available' : 'On Trip'}
              </span>
            </div>

            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Vehicle Type', value: vehicle.type },
                  { label: 'Capacity', value: `${vehicle.capacity.toLocaleString('en-IN')} kg` },
                  { label: 'Insurance', value: vehicle.insurance },
                  { label: 'Registration', value: vehicle.registration },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-50 rounded-lg px-3 py-2.5">
                    <div className="text-xs text-slate-500">{item.label}</div>
                    <div className="text-sm font-medium text-slate-800 mt-0.5">{item.value}</div>
                  </div>
                ))}
              </div>

              {vehicle.currentTrip ? (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5">
                  <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs text-amber-700">
                    Currently on trip <span className="font-mono font-semibold">{vehicle.currentTrip}</span>
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-3 py-2.5">
                  <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-xs text-green-700">Available for trips</span>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                {vehicle.currentTrip ? (
                  <button
                    onClick={() => navigate('active-delivery')}
                    className="flex-1 px-3 py-2 text-sm font-semibold bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 rounded-xl transition-colors cursor-pointer"
                  >
                    View Trip
                  </button>
                ) : (
                  <>
                    <button className="flex-1 px-3 py-2 text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                      Edit
                    </button>
                    <button className="flex-1 px-3 py-2 text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                      View Details
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add vehicle prompt */}
        <div
          onClick={() => setShowAddModal(true)}
          className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center hover:border-green-300 hover:bg-green-50/30 transition-colors cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-600">Add New Vehicle</p>
          <p className="text-xs text-slate-400 mt-1">Register another vehicle to your fleet</p>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">Add New Vehicle</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Vehicle Registration Number</label>
                <input placeholder="e.g. KA-03-EF-9012" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-colors font-mono" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Vehicle Type</label>
                <select className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 text-slate-700 cursor-pointer">
                  <option>Covered Goods Vehicle</option>
                  <option>Light Commercial Vehicle</option>
                  <option>Mini Truck</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Load Capacity (kg)</label>
                <input type="number" placeholder="e.g. 3000" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-colors" />
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
                <p className="text-xs text-blue-700">
                  <strong>Demo mode:</strong> Vehicle registration does not require government API verification in this prototype.
                </p>
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-3 rounded-xl transition-colors cursor-pointer">
                Add Vehicle
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold py-3 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
