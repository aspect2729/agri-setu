"use client";

import { useState } from 'react'
import type { NavigateFn, TripStatus } from '../types'
import { isActiveStatus } from '../demo-data'
import { useLogisticsData } from '../data-context'
import { useTripActions } from '../trip-action'
import StatusBadge from '../chrome/StatusBadge'
import { DemoBadge } from '@/components/demo-badge'
import { SimulatedTracking } from '../simulated-tracking'
import { TripBatchScan } from '../trip-batch-scan'
import type { BatchLookup } from '@/lib/qr'

interface Props { navigate: NavigateFn; tripId?: string }

const progressSteps: { key: TripStatus; label: string; icon: string }[] = [
  { key: 'assigned', label: 'Assigned', icon: '📋' },
  { key: 'pickup-completed', label: 'Pickup Confirmed', icon: '✅' },
  { key: 'in-transit', label: 'In Transit', icon: '🚛' },
  { key: 'delivered', label: 'Delivered', icon: '🏭' },
]

const statusOptions: { key: TripStatus; label: string; description: string }[] = [
  { key: 'pickup-started', label: 'Pickup Started', description: 'Arrived at White Store for loading' },
  { key: 'pickup-completed', label: 'Pickup Completed', description: 'Cargo loaded and ready to depart' },
  { key: 'in-transit', label: 'In Transit', description: 'En route to buyer destination' },
  { key: 'arrived', label: 'Arrived at Destination', description: 'Reached delivery location' },
  { key: 'delivered', label: 'Mark as Delivered', description: 'Confirm delivery and trigger payment' },
]

function getStepIndex(status: TripStatus): number {
  const map: Record<string, number> = {
    assigned: 0,
    'pickup-started': 1,
    'pickup-completed': 1,
    'in-transit': 2,
    arrived: 2,
    delivered: 3,
  }
  return map[status] ?? 0
}

export default function ActiveDelivery({ navigate, tripId }: Props) {
  const { trips } = useLogisticsData()
  const { pending, error, hint, update } = useTripActions()
  const selected =
    trips.find((t) => t.id === tripId || t.rawId === tripId) ??
    trips.find((t) => isActiveStatus(t.status)) ??
    trips.find((t) => t.status === 'in-transit')
  const [localStatus, setLocalStatus] = useState<TripStatus | null>(null)
  const [showStatusPanel, setShowStatusPanel] = useState(false)
  const [pickupScan, setPickupScan] = useState<BatchLookup | null>(null)

  if (!selected) {
    return (
      <div className="p-10 text-center text-sm text-slate-500">
        No active delivery.{' '}
        <button className="text-green-700 font-semibold" onClick={() => navigate('available-trips')}>Browse trips</button>
      </div>
    )
  }

  const activeTrip = selected
  const status = localStatus ?? activeTrip.status
  const currentStep = getStepIndex(status)

  const handleStatusUpdate = async (newStatus: TripStatus) => {
    const needsPickupScan =
      newStatus === 'pickup-completed' &&
      Boolean(activeTrip.live && activeTrip.cargo.batchCode && !pickupScan)

    if (needsPickupScan) {
      setShowStatusPanel(false)
      return
    }

    if (newStatus === 'delivered' && activeTrip.live && activeTrip.cargo.batchCode) {
      setShowStatusPanel(false)
      navigate('delivery-completion', { tripId: activeTrip.id })
      return
    }

    const result = await update(activeTrip, newStatus)
    if (!result.ok) return
    setLocalStatus(newStatus)
    setShowStatusPanel(false)
    if (newStatus === 'delivered') {
      setTimeout(() => navigate('delivery-completion', { tripId: activeTrip.id }), 300)
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-[22px] font-semibold text-slate-900 tracking-tight">Active Delivery</h1>
            <StatusBadge status={status} size="lg" />
            <DemoBadge label="SIMULATED TRACKING" />
          </div>
          <p className="text-[13px] text-slate-500 font-mono">Trip ID: <strong className="text-slate-700">{activeTrip.id}</strong> · {activeTrip.pickup.name.replace('White Store — ', '')} → {activeTrip.destination.name}</p>
        </div>
        <button
          onClick={() => setShowStatusPanel(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-[13.5px] font-semibold rounded-xl transition-colors cursor-pointer shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Update Delivery Status
        </button>
      </div>

      {/* HERO: Progress Tracker */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 pt-5 pb-1 border-b border-slate-100">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Delivery Progress</p>
        </div>
        <div className="px-6 py-8">
          {/* Step circles with large connecting lines */}
          <div className="flex items-start">
            {progressSteps.map((step, i) => {
              const done = i < currentStep
              const active = i === currentStep
              const remaining = i > currentStep
              return (
                <div key={step.key} className="flex items-start flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    {/* Circle */}
                    <div
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold transition-all shadow-sm ${
                        done
                          ? 'bg-green-600 border-green-600 text-white shadow-green-200'
                          : active
                          ? 'bg-amber-400 border-amber-400 text-white shadow-amber-200'
                          : 'bg-white border-slate-200 text-slate-300'
                      }`}
                      style={done || active ? { boxShadow: `0 4px 12px ${done ? 'rgba(22,163,74,0.25)' : 'rgba(251,191,36,0.3)'}` } : {}}
                    >
                      {done ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-lg">{step.icon}</span>
                      )}
                    </div>
                    {/* Label */}
                    <div className="text-center mt-3">
                      <p className={`text-[12.5px] font-semibold leading-tight ${active ? 'text-amber-700' : done ? 'text-green-700' : 'text-slate-400'}`}>
                        {step.label}
                      </p>
                      {active && (
                        <div className="mt-1 flex items-center justify-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span className="text-[10px] text-amber-600 font-medium">Current</span>
                        </div>
                      )}
                      {done && (
                        <p className="text-[10px] text-green-500 mt-0.5 font-medium">✓ Done</p>
                      )}
                    </div>
                  </div>
                  {/* Connector */}
                  {i < progressSteps.length - 1 && (
                    <div className={`flex-1 h-0.5 mt-6 mx-3 rounded-full relative overflow-hidden ${done ? 'bg-green-400' : 'bg-slate-200'}`}>
                      {active && (
                        <div className="absolute inset-y-0 left-0 w-1/2 bg-amber-300 rounded-full" />
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <SimulatedTracking
        shipmentId={activeTrip.rawId}
        from={activeTrip.pickup.name}
        to={activeTrip.destination.name}
      />

      {activeTrip.live && activeTrip.cargo.batchCode && (status === 'assigned' || status === 'pickup-started') && !pickupScan && (
        <TripBatchScan
          expectedCode={activeTrip.cargo.batchCode}
          title="Scan crate QR to confirm pickup"
          hint="The crate label must match this trip’s batch before you mark pickup complete."
          onMatched={async (batch) => {
            setPickupScan(batch)
            const result = await update(activeTrip, 'pickup-completed')
            if (!result.ok) return
            setLocalStatus('pickup-completed')
          }}
        />
      )}

      {pickupScan && (
        <p className="text-[12px] text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5">
          Crate QR matched {pickupScan.batchCode}. Pickup confirmed.
        </p>
      )}

      {/* Info cards row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Route */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
              </svg>
            </div>
            <h3 className="text-[13px] font-semibold text-slate-900">Route</h3>
          </div>
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-5 h-5 rounded-full bg-green-500 shrink-0" />
              <div className="w-px flex-1 bg-slate-200 my-1" />
              <div className="w-5 h-5 rounded-full bg-blue-500 shrink-0" />
            </div>
            <div className="space-y-3 flex-1">
              <div>
                <p className="text-[10px] text-green-600 font-semibold uppercase tracking-widest">Pickup</p>
                <p className="text-[13px] font-semibold text-slate-800">{activeTrip.pickup.name}</p>
                <p className="text-[11px] text-slate-400">{activeTrip.pickup.address}</p>
              </div>
              <div>
                <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-widest">Destination</p>
                <p className="text-[13px] font-semibold text-slate-800">{activeTrip.destination.name}</p>
                <p className="text-[11px] text-slate-400">{activeTrip.destination.address}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100">
            <div className="bg-slate-50 rounded-xl p-2.5">
              <p className="text-[10px] text-slate-400">Distance</p>
              <p className="text-[13px] font-semibold text-slate-800">{activeTrip.distance} km</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-2.5">
              <p className="text-[10px] text-amber-600">Est. Arrival</p>
              <p className="text-[13px] font-semibold text-amber-800">{activeTrip.expectedDelivery}</p>
            </div>
          </div>
        </div>

        {/* Cargo */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
              <span className="text-sm">📦</span>
            </div>
            <h3 className="text-[13px] font-semibold text-slate-900">Cargo</h3>
          </div>
          <div className="space-y-2.5">
            {[
              { label: 'Crop', value: activeTrip.cargo.crop },
              { label: 'Quality', value: activeTrip.cargo.grade },
              { label: 'Quantity', value: `${activeTrip.cargo.quantity.toLocaleString('en-IN')} kg` },
              { label: 'Crates', value: `${activeTrip.cargo.crates}` },
              ...(activeTrip.cargo.batchCode
                ? [{ label: 'Batch QR', value: activeTrip.cargo.batchCode }]
                : []),
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <span className="text-[12px] text-slate-500">{item.label}</span>
                <span className={`text-[13px] font-semibold text-slate-800 ${item.label === 'Batch QR' ? 'font-mono' : ''}`}>{item.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 bg-green-50 border border-green-100 rounded-xl px-3 py-2.5">
            <p className="text-[11px] text-green-700 font-semibold">Aggregated via Agri Setu White Store</p>
            <p className="text-[10px] text-green-600 mt-0.5">From 40+ local farmers · Anekal Region</p>
          </div>
        </div>

        {/* Vehicle + contact */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                <span className="text-sm">🚛</span>
              </div>
              <h3 className="text-[13px] font-semibold text-slate-900">Vehicle</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[12px] text-slate-500">Reg. No.</span>
                <span className="font-mono text-[12px] font-semibold text-slate-800">{activeTrip.vehicle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[12px] text-slate-500">Type</span>
                <span className="text-[12px] font-medium text-slate-700 text-right max-w-[140px]">{activeTrip.vehicleType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[12px] text-slate-500">Driver</span>
                <span className="text-[12px] font-semibold text-slate-800">{activeTrip.driver}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[12px] text-slate-500">Capacity</span>
                <span className="text-[12px] font-semibold text-slate-800">{activeTrip.minCapacity.toLocaleString('en-IN')} kg</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3">Delivery Contact</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-slate-800">{activeTrip.destination.name}</p>
                <p className="text-[12px] text-slate-500 mt-0.5">{activeTrip.buyerContact}</p>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 text-[12.5px] font-semibold rounded-xl transition-colors cursor-pointer border border-green-100">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                Call
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Earnings strip */}
      <div className="bg-green-600 rounded-2xl px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-green-100 text-[12px] font-medium">Earnings for this trip</p>
          <p className="text-white text-[22px] font-semibold mt-0.5">₹{activeTrip.earnings.toLocaleString('en-IN')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-green-200 text-[11px]">{activeTrip.distance} km · ₹{activeTrip.rate}/km</p>
            <p className="text-green-100 text-[12px] font-medium">Credited after delivery</p>
          </div>
          <button
            onClick={() => setShowStatusPanel(true)}
            className="px-5 py-2.5 bg-white hover:bg-green-50 text-green-700 text-[13.5px] font-bold rounded-xl transition-colors cursor-pointer"
          >
            Update Status →
          </button>
        </div>
      </div>

      {/* Status Update Panel */}
      {showStatusPanel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-start justify-between">
              <div>
                <h3 className="text-[15px] font-semibold text-slate-900">Update Delivery Status</h3>
                <p className="text-[12px] text-slate-500 mt-0.5 font-mono">{activeTrip.id}</p>
              </div>
              <button
                onClick={() => setShowStatusPanel(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-2">
              {(error || hint) && (
                <p className={`px-4 text-[12px] ${error ? 'text-red-600' : 'text-slate-500'}`}>{error ?? hint}</p>
              )}
              {statusOptions.map((opt) => {
                const isCurrent = opt.key === status
                const isDelivered = opt.key === 'delivered'
                return (
                  <button
                    key={opt.key}
                    onClick={() => handleStatusUpdate(opt.key)}
                    disabled={pending}
                    className={`w-full flex items-start gap-3 px-4 py-3.5 rounded-xl text-left transition-colors cursor-pointer border disabled:opacity-50 ${
                      isCurrent
                        ? 'bg-amber-50 border-amber-200'
                        : isDelivered
                        ? 'bg-green-50 border-green-200 hover:bg-green-100'
                        : 'bg-slate-50 border-transparent hover:bg-slate-100'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                      isCurrent ? 'border-amber-500 bg-amber-500'
                      : isDelivered ? 'border-green-500'
                      : 'border-slate-300'
                    }`}>
                      {isCurrent && <span className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className={`text-[13px] font-semibold ${isCurrent ? 'text-amber-800' : isDelivered ? 'text-green-800' : 'text-slate-700'}`}>
                        {opt.label}
                      </p>
                      <p className={`text-[11px] mt-0.5 ${isCurrent ? 'text-amber-600' : 'text-slate-400'}`}>
                        {opt.description}
                      </p>
                    </div>
                    {isCurrent && <span className="ml-auto text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full self-start">Current</span>}
                    {isDelivered && !isCurrent && <span className="ml-auto text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full self-start">Completes trip</span>}
                  </button>
                )
              })}
            </div>
            <div className="px-6 pb-6">
              <button
                onClick={() => setShowStatusPanel(false)}
                className="w-full border border-slate-200 text-slate-600 hover:bg-slate-50 text-[13.5px] font-semibold py-3 rounded-xl transition-colors cursor-pointer"
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
