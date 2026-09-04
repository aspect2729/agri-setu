"use client";

import { useState } from 'react'
import type { NavigateFn } from '../types'
import { useLogisticsData } from '../data-context'
import { useTripActions } from '../trip-action'
import StatusBadge from '../chrome/StatusBadge'

interface Props {
  navigate: NavigateFn
  tripId?: string
}

export default function TripDetails({ navigate, tripId }: Props) {
  const { trips } = useLogisticsData()
  const trip = trips.find((t) => t.id === tripId || t.rawId === tripId) ?? trips.find((t) => t.status === 'available') ?? trips[0]
  const { pending, error, hint, accept } = useTripActions()
  const [showModal, setShowModal] = useState(false)
  const [checkboxChecked, setCheckboxChecked] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!trip) {
    return (
      <div className="p-10 text-center text-sm text-slate-500">
        No trip selected.{' '}
        <button className="text-green-700 font-semibold" onClick={() => navigate('available-trips')}>Back to trips</button>
      </div>
    )
  }

  const handleConfirm = async () => {
    if (!checkboxChecked) return
    const result = await accept(trip)
    if (result.ok) {
      setSuccess(true)
      setShowModal(false)
    }
  }

  if (success) {
    return (
      <div className="p-6 lg:p-8 max-w-[1440px] mx-auto flex items-start justify-center min-h-[60vh]">
        <div className="w-full max-w-md mt-10">
          {/* Success card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden text-center">
            <div className="bg-green-600 px-6 py-8">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white">Trip Accepted Successfully</h2>
              <p className="text-green-200 text-[13px] mt-1">
                Trip <span className="font-mono font-bold text-white">{trip.id}</span> has been added to your active trips.
              </p>
            </div>
            <div className="p-6 space-y-3">
              {[
                { label: 'Route', value: `${trip.pickup.name} → ${trip.destination.name}` },
                { label: 'Cargo', value: `${trip.cargo.crop} · ${trip.cargo.grade} · ${trip.cargo.quantity.toLocaleString('en-IN')} kg` },
                { label: 'Pickup Window', value: trip.pickupWindow },
                { label: 'Expected Earnings', value: `₹${trip.earnings.toLocaleString('en-IN')}`, green: true },
              ].map((item) => (
                <div key={item.label} className="flex items-start justify-between gap-3 text-[13px] py-2 border-b border-slate-100 last:border-0">
                  <span className="text-slate-500 shrink-0">{item.label}</span>
                  <span className={`font-semibold text-right ${(item as any).green ? 'text-green-700 text-[16px]' : 'text-slate-800'}`}>{item.value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => navigate('active-delivery')}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-[13.5px] font-semibold py-3 rounded-xl transition-colors cursor-pointer"
              >
                View Active Trip
              </button>
              <button
                onClick={() => navigate('dashboard')}
                className="flex-1 border border-slate-200 text-slate-700 hover:bg-slate-50 text-[13.5px] font-semibold py-3 rounded-xl transition-colors cursor-pointer"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1440px] mx-auto">
      {/* Breadcrumb + header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <button
            onClick={() => navigate('available-trips')}
            className="flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-700 mb-2.5 transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Available Trips
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[22px] font-semibold text-slate-900 tracking-tight">Trip {trip.id}</h1>
            <StatusBadge status={trip.status} size="md" />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('available-trips')}
            className="px-4 py-2.5 text-[13.5px] font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
          >
            Back to Trips
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 text-[13.5px] font-semibold bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors cursor-pointer shadow-sm"
          >
            Accept Trip
          </button>
        </div>
      </div>

      {/* Supply chain context */}
      <div className="bg-green-50 border border-green-100 rounded-2xl px-5 py-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-green-900">About this Agri Setu Trip</p>
            <p className="text-[12px] text-green-700 mt-0.5 leading-relaxed">
              This logistics request was created by <strong>Agri Setu</strong> to fulfill a confirmed bulk buyer order.
              Produce was sourced from local farmers and aggregated at <strong>{trip.pickup.name}</strong>.
              The cargo is ready for dispatch.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {['Farmers → White Store', 'Aggregated & Graded', 'Buyer Order Confirmed', '✓ Ready for Logistics'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <span className={`text-[11px] font-semibold px-2 py-1 rounded-lg ${i === 3 ? 'bg-green-600 text-white' : 'bg-white text-green-700 border border-green-200'}`}>{step}</span>
              {i < 3 && <svg className="w-3 h-3 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="xl:col-span-2 space-y-5">
          {/* Route */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-[13px] font-semibold text-slate-900 mb-5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-sm">🗺️</span>
              Route
            </h2>
            <div className="flex items-start gap-5">
              <div className="flex flex-col items-center shrink-0">
                <div className="w-10 h-10 rounded-full bg-green-50 border-2 border-green-400 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="w-px h-14 border-l-2 border-dashed border-slate-200 my-2" />
                <div className="w-10 h-10 rounded-full bg-blue-50 border-2 border-blue-400 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 space-y-5">
                <div className="pb-5 border-b border-slate-100">
                  <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Pickup · White Store</p>
                  <p className="text-[16px] font-semibold text-slate-900 mt-0.5">{trip.pickup.name}</p>
                  <p className="text-[12.5px] text-slate-500 mt-0.5">{trip.pickup.address}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Destination · Bulk Buyer</p>
                  <p className="text-[16px] font-semibold text-slate-900 mt-0.5">{trip.destination.name}</p>
                  <p className="text-[12.5px] text-slate-500 mt-0.5">{trip.destination.address}</p>
                </div>
              </div>
              <div className="text-right space-y-4 pl-4 border-l border-slate-100 shrink-0">
                <div>
                  <p className="text-[11px] text-slate-400">Distance</p>
                  <p className="text-[16px] font-semibold text-slate-800">{trip.distance} km</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">Est. Time</p>
                  <p className="text-[14px] font-semibold text-slate-800">{trip.travelTime}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cargo */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-[13px] font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-sm">📦</span>
              Cargo Details
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Crop', value: trip.cargo.crop },
                { label: 'Quality', value: trip.cargo.grade },
                { label: 'Quantity', value: `${trip.cargo.quantity.toLocaleString('en-IN')} kg` },
                { label: 'Crates', value: `${trip.cargo.crates}` },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 rounded-xl px-4 py-3">
                  <p className="text-[11px] text-slate-500">{item.label}</p>
                  <p className="text-[14px] font-semibold text-slate-800 mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
            {trip.cargo.handling && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-[13px] text-amber-800">
                <span className="text-base shrink-0">⚠️</span>
                <span><strong>Handling:</strong> {trip.cargo.handling}</span>
              </div>
            )}
          </div>

          {/* Pickup + delivery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              {
                title: 'Pickup Details',
                icon: '🏪',
                items: [
                  { label: 'White Store', value: trip.pickup.name },
                  { label: 'Contact', value: trip.storeContact ?? 'Store Manager' },
                  { label: 'Pickup window', value: trip.pickupWindow },
                ],
              },
              {
                title: 'Delivery Details',
                icon: '🏭',
                items: [
                  { label: 'Buyer', value: trip.destination.name },
                  { label: 'Contact', value: trip.buyerContact ?? 'Warehouse Manager' },
                  { label: 'Delivery window', value: trip.deliveryWindow },
                ],
              },
            ].map((section) => (
              <div key={section.title} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h2 className="text-[13px] font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="text-base">{section.icon}</span>
                  {section.title}
                </h2>
                <div className="space-y-2.5">
                  {section.items.map((item) => (
                    <div key={item.label} className="flex items-start justify-between gap-2">
                      <span className="text-[12px] text-slate-500 shrink-0">{item.label}</span>
                      <span className="text-[12.5px] font-semibold text-slate-800 text-right">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Payment */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-green-600 px-5 py-5">
              <p className="text-green-200 text-[11px] font-semibold uppercase tracking-wide">Estimated Earnings</p>
              <p className="text-[32px] font-semibold text-white mt-1">₹{trip.earnings.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-5 space-y-3">
              {[
                { label: 'Distance', value: `${trip.distance} km` },
                { label: 'Rate', value: `₹${trip.rate}/km` },
                { label: 'Payment', value: 'After delivery' },
              ].map((item) => (
                <div key={item.label} className="flex justify-between text-[13px]">
                  <span className="text-slate-500">{item.label}</span>
                  <span className="font-semibold text-slate-800">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="px-5 pb-5">
              <button
                onClick={() => setShowModal(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-[13.5px] font-semibold py-3 rounded-xl transition-colors cursor-pointer"
              >
                Accept Trip
              </button>
            </div>
          </div>

          {/* Vehicle match */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-[13px] font-semibold text-slate-900 mb-3">Vehicle Requirement</h2>
            <div className="space-y-2.5 text-[13px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Min. capacity</span>
                <span className="font-semibold text-slate-800">{trip.minCapacity.toLocaleString('en-IN')} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vehicle type</span>
                <span className="font-semibold text-slate-800">{trip.vehicleRequired}</span>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[12px] font-semibold text-green-700 bg-green-50 border border-green-100 rounded-xl px-3 py-2.5">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              KA-01-AB-1234 meets requirement
            </div>
          </div>
        </div>
      </div>

      {/* Accept Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100">
              <h3 className="text-[16px] font-semibold text-slate-900">Accept this trip?</h3>
              <p className="text-[12.5px] text-slate-500 mt-0.5">Confirm you can handle this cargo safely.</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 space-y-2.5">
                {[
                  { label: 'Trip ID', value: trip.id, mono: true },
                  { label: 'Route', value: `${trip.pickup.name.split('—')[1]?.trim() ?? trip.pickup.name} → ${trip.destination.name}` },
                  { label: 'Cargo', value: `${trip.cargo.crop} · ${trip.cargo.grade}` },
                  { label: 'Quantity', value: `${trip.cargo.quantity.toLocaleString('en-IN')} kg` },
                  { label: 'Earnings', value: `₹${trip.earnings.toLocaleString('en-IN')}`, green: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-start justify-between gap-3 text-[13px]">
                    <span className="text-slate-500 shrink-0">{item.label}</span>
                    <span className={`font-semibold text-right ${item.mono ? 'font-mono text-slate-700' : (item as any).green ? 'text-green-700 text-[15px]' : 'text-slate-800'}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${checkboxChecked ? 'bg-green-600 border-green-600' : 'border-slate-300'}`}
                  onClick={() => setCheckboxChecked(!checkboxChecked)}
                >
                  {checkboxChecked && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-[13px] text-slate-600 leading-snug">
                  I confirm that my vehicle can safely transport this cargo and I will arrive within the pickup window.
                </span>
              </label>
              {(error || hint) && (
                <p className={`text-[12px] ${error ? 'text-red-600' : 'text-slate-500'}`}>{error ?? hint}</p>
              )}
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={handleConfirm}
                disabled={!checkboxChecked || pending}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-[13.5px] font-semibold py-3 rounded-xl transition-colors cursor-pointer"
              >
                {pending ? 'Confirming…' : 'Confirm Trip'}
              </button>
              <button
                onClick={() => { setShowModal(false); setCheckboxChecked(false) }}
                className="flex-1 border border-slate-200 text-slate-700 hover:bg-slate-50 text-[13.5px] font-semibold py-3 rounded-xl transition-colors cursor-pointer"
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
