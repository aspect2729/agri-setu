"use client";

import { useState } from 'react'
import type { NavigateFn } from '../types'
import { isActiveStatus } from '../demo-data'
import { useLogisticsData } from '../data-context'
import { useTripActions } from '../trip-action'
import { TripBatchScan } from '../trip-batch-scan'

interface Props { navigate: NavigateFn; tripId?: string }

export default function DeliveryCompletion({ navigate, tripId }: Props) {
  const { trips } = useLogisticsData()
  const { pending, error, hint, update } = useTripActions()
  const activeTrip =
    trips.find((t) => t.id === tripId || t.rawId === tripId) ??
    trips.find((t) => isActiveStatus(t.status) || t.status === 'delivered')
  const [checks, setChecks] = useState({ delivered: true, quantity: true, damage: true })
  const [receivedBy, setReceivedBy] = useState(activeTrip?.buyerContact ?? 'Warehouse Manager')
  const [notes, setNotes] = useState('Cargo delivered in good condition.')
  const [submitted, setSubmitted] = useState(false)
  const [scanned, setScanned] = useState(false)

  if (!activeTrip) {
    return (
      <div className="p-10 text-center text-sm text-slate-500">No trip to complete.</div>
    )
  }

  const requiresQr = Boolean(activeTrip.live && activeTrip.cargo.batchCode)
  const canSubmit = checks.delivered && checks.quantity && receivedBy.trim().length > 0 && (!requiresQr || scanned)

  async function confirm() {
    if (!activeTrip) return
    const result = await update(activeTrip, 'delivered')
    if (result.ok) setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="p-6 lg:p-8 max-w-[1440px] mx-auto flex items-start justify-center min-h-[70vh]">
        <div className="w-full max-w-md mt-8">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden text-center">
            <div className="bg-green-600 px-6 py-10">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white">Delivery Completed!</h2>
              <p className="text-green-200 text-[13px] mt-1.5">Your earnings have been added to your account.</p>
            </div>
            <div className="p-6 space-y-3">
              {[
                { label: 'Trip', value: activeTrip.id, mono: true },
                { label: 'Route', value: `${activeTrip.pickup.name} → ${activeTrip.destination.name}` },
                { label: 'Delivered to', value: receivedBy },
              ].map((item) => (
                <div key={item.label} className="flex items-start justify-between gap-3 py-2 border-b border-slate-100 last:border-0 text-[13px]">
                  <span className="text-slate-500 shrink-0">{item.label}</span>
                  <span className={`font-semibold text-slate-800 text-right ${(item as any).mono ? 'font-mono' : ''}`}>{item.value}</span>
                </div>
              ))}
              <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-4 mt-2">
                <p className="text-[12px] text-green-600 font-medium">Earnings credited</p>
                <p className="text-[28px] font-semibold text-green-700 mt-0.5">₹{activeTrip.earnings.toLocaleString('en-IN')}</p>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => navigate('earnings')} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-[13.5px] font-semibold py-3 rounded-xl transition-colors cursor-pointer">
                View Earnings
              </button>
              <button onClick={() => navigate('trip-history')} className="flex-1 border border-slate-200 text-slate-700 hover:bg-slate-50 text-[13.5px] font-semibold py-3 rounded-xl transition-colors cursor-pointer">
                Trip History
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1440px] mx-auto space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold text-slate-900 tracking-tight">Complete Delivery</h1>
        <p className="text-[13.5px] text-slate-500 mt-0.5">
          Confirm delivery for <span className="font-mono font-semibold text-slate-700">{activeTrip.id}</span> · {activeTrip.pickup.name} → {activeTrip.destination.name}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-5">
          {/* Trip summary */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-[13px] font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-base">📋</span> Trip Summary
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Trip ID', value: activeTrip.id, mono: true },
                { label: 'Pickup', value: activeTrip.pickup.name },
                { label: 'Destination', value: activeTrip.destination.name },
                { label: 'Cargo', value: `${activeTrip.cargo.crop} · ${activeTrip.cargo.quantity.toLocaleString('en-IN')} kg · ${activeTrip.cargo.crates} crates` },
                ...(activeTrip.cargo.batchCode
                  ? [{ label: 'Batch QR', value: activeTrip.cargo.batchCode, mono: true }]
                  : []),
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 rounded-xl px-4 py-3">
                  <p className="text-[11px] text-slate-500">{item.label}</p>
                  <p className={`text-[13px] font-semibold text-slate-800 mt-0.5 leading-snug ${(item as any).mono ? 'font-mono' : ''}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {requiresQr && activeTrip.cargo.batchCode && (
            <TripBatchScan
              expectedCode={activeTrip.cargo.batchCode}
              title="Scan crate QR to complete delivery"
              hint="Confirm this is the same batch you picked up at the White Store."
              onMatched={() => setScanned(true)}
            />
          )}

          {/* Checklist */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-[13px] font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-base">✅</span> Delivery Confirmation Checklist
            </h2>
            <div className="space-y-2">
              {[
                { key: 'delivered' as const, label: 'Cargo has been physically delivered to the buyer', required: true },
                { key: 'quantity' as const, label: 'Quantity received confirmed by buyer representative', required: true },
                { key: 'damage' as const, label: 'No major damage or significant loss to cargo', required: false },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-3 cursor-pointer p-3.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                  onClick={() => setChecks((p) => ({ ...p, [item.key]: !p[item.key] }))}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${checks[item.key] ? 'bg-green-600 border-green-600' : 'border-slate-300'}`}>
                    {checks[item.key] && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-[13px] text-slate-700 flex-1">{item.label}</span>
                  {item.required && <span className="text-[11px] text-red-500 font-medium">Required</span>}
                </label>
              ))}
            </div>
          </div>

          {/* Fields */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-[13px] font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-base">📝</span> Delivery Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-slate-600 mb-2">
                  Received by <span className="text-red-500">*</span>
                </label>
                <input
                  value={receivedBy}
                  onChange={(e) => setReceivedBy(e.target.value)}
                  placeholder="Name and designation of receiver"
                  className="w-full px-4 py-2.5 text-[13px] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/25 focus:border-green-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-slate-600 mb-2">
                  Delivery Notes <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Any observations about the delivery…"
                  className="w-full px-4 py-2.5 text-[13px] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/25 focus:border-green-400 transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Proof of delivery */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-[13px] font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-base">📷</span> Proof of Delivery
            </h2>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 hover:border-green-300 hover:bg-green-50/20 transition-colors">
              <div className="text-center mb-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <p className="text-[13px] font-semibold text-slate-700">Upload delivery proof</p>
                <p className="text-[12px] text-slate-400 mt-1">Photo of delivered cargo or signed receipt</p>
              </div>
              {/* Demo uploaded file */}
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[12.5px] font-semibold text-green-800">delivery_receipt.jpg</p>
                    <p className="text-[11px] text-green-600">2.4 MB · Uploaded</p>
                  </div>
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-green-600 px-5 py-5">
              <p className="text-green-200 text-[11px] font-semibold uppercase tracking-widest">Earnings</p>
              <p className="text-[30px] font-semibold text-white mt-1">₹{activeTrip.earnings.toLocaleString('en-IN')}</p>
              <p className="text-green-200 text-[12px] mt-0.5">Credited after delivery confirmation</p>
            </div>
            <div className="p-5 space-y-2.5 text-[13px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Distance</span>
                <span className="font-semibold text-slate-800">{activeTrip.distance} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Rate</span>
                <span className="font-semibold text-slate-800">₹{activeTrip.rate}/km</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-[13px]">
            <h3 className="font-semibold text-slate-900 mb-3">Delivery Address</h3>
            <p className="font-semibold text-slate-800">{activeTrip.destination.name}</p>
            <p className="text-slate-500 mt-0.5">{activeTrip.buyerContact}</p>
            <p className="text-slate-400 text-[12px] mt-0.5">{activeTrip.destination.address}</p>
          </div>

          <button
            onClick={confirm}
            disabled={!canSubmit || pending}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-[14px] font-bold py-4 rounded-2xl transition-colors cursor-pointer shadow-sm"
          >
            {pending ? 'Confirming…' : 'Confirm Delivery'}
          </button>
          {(error || hint) && (
            <p className={`text-[12px] text-center ${error ? 'text-red-600' : 'text-slate-500'}`}>{error ?? hint}</p>
          )}

          {!canSubmit && (
            <p className="text-[12px] text-slate-400 text-center -mt-2">
              {requiresQr && !scanned
                ? 'Scan the crate QR, complete the checklist, and enter the receiver name.'
                : 'Complete the required checklist items and enter receiver name.'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
