"use client";

import { DemoBadge } from "@/components/demo-badge";
import type { NavigateFn } from '../types'
import { isActiveStatus } from '../demo-data'
import { useLogisticsData } from '../data-context'
import StatusBadge from '../chrome/StatusBadge'

interface Props { navigate: NavigateFn }

const steps = ['Assigned', 'Picked Up', 'In Transit', 'Delivered']

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function firstName(name: string) {
  return name.split(' ')[0] || name
}

export default function Dashboard({ navigate }: Props) {
  const { operatorName, trips, notifications, vehicles } = useLogisticsData()
  const availableTrips = trips.filter((t) => t.status === 'available')
  const activeTrip = trips.find((t) => isActiveStatus(t.status)) ?? trips.find((t) => t.status === 'in-transit')
  const completed = trips.filter((t) => t.status === 'delivered')
  const earnings = completed.reduce((s, t) => s + t.earnings, 0)
  const activeStep = activeTrip
    ? activeTrip.status === 'assigned' || activeTrip.status === 'pickup-started'
      ? 0
      : activeTrip.status === 'pickup-completed'
        ? 1
        : activeTrip.status === 'delivered'
          ? 3
          : 2
    : 2
  const todayLabel = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-900 tracking-tight">{greeting()}, {firstName(operatorName)}</h1>
          <p className="text-[13.5px] text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
            Here&apos;s your logistics activity for today — {todayLabel}
            <DemoBadge />
          </p>
        </div>
        <div className="flex items-center gap-2 text-[12px] font-semibold text-green-700 bg-green-50 border border-green-100 px-3 py-2 rounded-xl">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Connected to Agri Setu Supply Chain
        </div>
      </div>

      {/* Supply chain context banner */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm px-5 py-4">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Today's Supply Chain Flow</p>
        <div className="flex items-center gap-0 flex-wrap">
          {[
            { emoji: '🌾', label: 'Farmers', sub: `${trips.length}+ lots moving`, color: 'text-green-700 bg-green-50 border-green-200', active: false },
            null,
            { emoji: '🏪', label: 'White Stores', sub: `${new Set(trips.map((t) => t.pickup.name)).size} pickup points`, color: 'text-blue-700 bg-blue-50 border-blue-200', active: false },
            null,
            { emoji: '📦', label: 'Aggregated Cargo', sub: 'Ready for dispatch', color: 'text-amber-700 bg-amber-50 border-amber-200', active: false },
            null,
            { emoji: '🚛', label: 'Logistics Partner', sub: `You — ${operatorName}`, color: 'text-purple-700 bg-purple-50 border-purple-200', active: true },
            null,
            { emoji: '🏭', label: 'Bulk Buyers', sub: `${new Set(trips.map((t) => t.destination.name)).size} destinations`, color: 'text-slate-700 bg-slate-50 border-slate-200', active: false },
          ].map((item, i) => {
            if (item === null) {
              return (
                <div key={i} className="flex items-center mx-1">
                  <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              )
            }
            return (
              <div
                key={i}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[12px] font-semibold ${item.color} ${item.active ? 'ring-2 ring-purple-300 ring-offset-1' : ''}`}
              >
                <span>{item.emoji}</span>
                <div className="leading-none">
                  <div>{item.label}</div>
                  <div className="font-normal opacity-70 text-[10px] mt-0.5">{item.sub}</div>
                </div>
                {item.active && <span className="ml-1 text-[9px] font-bold bg-purple-500 text-white px-1.5 py-0.5 rounded-full">YOU</span>}
              </div>
            )
          })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: 'Available Trips',
            value: String(availableTrips.length),
            sub: `${availableTrips.filter((t) => t.live).length} live from stores`,
            subColor: 'text-green-600',
            bg: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            ),
          },
          {
            label: 'Active Delivery',
            value: String(trips.filter((t) => isActiveStatus(t.status)).length),
            sub: activeTrip ? 'In progress now' : 'None right now',
            subColor: 'text-amber-600',
            subDot: true,
            bg: 'bg-amber-50',
            iconColor: 'text-amber-600',
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            ),
          },
          {
            label: 'Completed Trips',
            value: String(completed.length),
            sub: 'On this board',
            subColor: 'text-slate-500',
            bg: 'bg-blue-50',
            iconColor: 'text-blue-600',
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },
          {
            label: 'Total Earnings',
            value: `₹${earnings.toLocaleString('en-IN')}`,
            sub: 'Completed trips',
            subColor: 'text-green-600',
            bg: 'bg-green-50',
            iconColor: 'text-green-600',
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
            ),
          },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{card.label}</p>
                <p className="text-[28px] font-semibold text-slate-900 mt-1.5 leading-none tracking-tight">{card.value}</p>
                <p className={`text-[12px] font-medium mt-2 flex items-center gap-1.5 ${card.subColor}`}>
                  {(card as any).subDot && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                  {card.sub}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center ${card.iconColor}`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Active Delivery — 2/3 width */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {!activeTrip ? (
            <div className="p-10 text-center text-sm text-slate-500">No active delivery. Accept a trip to start a run.</div>
          ) : (
          <>
          {/* Card header */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-3">
              <h2 className="text-[14px] font-semibold text-slate-900">Active Delivery</h2>
              <StatusBadge status={activeTrip.status} />
            </div>
            <span className="font-mono text-[11px] text-slate-400 font-medium">{activeTrip.id}</span>
          </div>

          <div className="p-6 space-y-5">
            {/* Route */}
            <div className="flex items-start gap-5">
              <div className="flex flex-col items-center shrink-0 pt-1">
                <div className="w-8 h-8 rounded-full bg-green-50 border-2 border-green-400 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
                <div className="w-px h-12 border-l-2 border-dashed border-slate-200 my-1" />
                <div className="w-8 h-8 rounded-full bg-amber-50 border-2 border-amber-400 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div className="pb-4 border-b border-slate-100">
                  <p className="text-[10px] font-semibold text-green-600 uppercase tracking-widest">Pickup — White Store</p>
                  <p className="text-[15px] font-semibold text-slate-900 mt-0.5">{activeTrip.pickup.name}</p>
                  <p className="text-[12px] text-slate-400 mt-0.5">{activeTrip.pickup.address}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-widest">Destination — Bulk Buyer</p>
                  <p className="text-[15px] font-semibold text-slate-900 mt-0.5">{activeTrip.destination.name}</p>
                  <p className="text-[12px] text-slate-400 mt-0.5">{activeTrip.destination.address}</p>
                </div>
              </div>
              <div className="text-right space-y-3 shrink-0">
                <div>
                  <p className="text-[11px] text-slate-400">Pickup</p>
                  <p className="text-[14px] font-semibold text-slate-800">{activeTrip.pickupTime}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">ETA</p>
                  <p className="text-[14px] font-semibold text-slate-800">{activeTrip.expectedDelivery}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400">Distance</p>
                  <p className="text-[14px] font-semibold text-slate-800">{activeTrip.distance} km</p>
                </div>
              </div>
            </div>

            {/* Cargo row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Crop', value: activeTrip.cargo.crop },
                { label: 'Grade', value: activeTrip.cargo.grade },
                { label: 'Quantity', value: `${activeTrip.cargo.quantity.toLocaleString('en-IN')} kg` },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 rounded-xl px-4 py-3">
                  <p className="text-[11px] text-slate-500">{item.label}</p>
                  <p className="text-[14px] font-semibold text-slate-800 mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Vehicle */}
            <div className="flex items-center gap-3 py-3 border-t border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
              </div>
              <div>
                <span className="font-mono text-[12px] font-semibold text-slate-700">{activeTrip.vehicle}</span>
                <span className="text-[12px] text-slate-400 mx-2">·</span>
                <span className="text-[12px] text-slate-500">{activeTrip.vehicleType}</span>
              </div>
            </div>

            {/* Progress */}
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Delivery Progress</p>
              <div className="flex items-center">
                {steps.map((step, i) => {
                  const done = i < activeStep
                  const active = i === activeStep
                  return (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[11px] font-bold transition-all ${
                            done ? 'bg-green-600 border-green-600 text-white'
                            : active ? 'bg-amber-400 border-amber-400 text-white'
                            : 'bg-white border-slate-200 text-slate-400'
                          }`}
                        >
                          {done ? (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <span className={`w-2 h-2 rounded-full ${active ? 'bg-white' : 'bg-slate-300'}`} />
                          )}
                        </div>
                        <p className={`text-[11px] mt-1.5 font-medium whitespace-nowrap ${active ? 'text-amber-600' : done ? 'text-green-600' : 'text-slate-400'}`}>
                          {step}
                        </p>
                      </div>
                      {i < steps.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 rounded-full ${done ? 'bg-green-400' : 'bg-slate-200'}`} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => navigate('active-delivery', { tripId: activeTrip.id })}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-[13.5px] font-semibold py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                View Trip
              </button>
              <button
                onClick={() => navigate('active-delivery', { tripId: activeTrip.id })}
                className="flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-[13.5px] font-semibold py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Update Status
              </button>
            </div>
          </div>
          </>
          )}
        </div>

        {/* Right column: quick stats + activity */}
        <div className="space-y-5">
          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-[13px] font-semibold text-slate-900 mb-3">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: 'Browse available trips', sub: `${availableTrips.length} trips near you`, icon: '📋', action: () => navigate('available-trips') },
                { label: 'View earnings', sub: `₹${earnings.toLocaleString('en-IN')} completed`, icon: '💰', action: () => navigate('earnings') },
                { label: 'My vehicles', sub: `${vehicles.filter((v) => v.status === 'on-trip').length} on trip · ${vehicles.filter((v) => v.status === 'available').length} available`, icon: '🚛', action: () => navigate('vehicles') },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 text-left transition-colors cursor-pointer border border-transparent hover:border-slate-100"
                >
                  <span className="text-xl shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-[13px] font-semibold text-slate-800">{item.label}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.sub}</p>
                  </div>
                  <svg className="w-4 h-4 text-slate-300 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-[13px] font-semibold text-slate-900 mb-4">Recent Activity</h2>
            <div className="space-y-4 relative">
              <div className="absolute left-3.5 top-3 bottom-3 w-px bg-slate-100" />
              {notifications.slice(0, 4).map((item) => (
                <div key={item.id} className="flex items-start gap-3 pl-0.5">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0 z-10">
                    {item.type === "payment" ? "₹" : item.type === "delivery" ? "✓" : item.type === "update" ? "↑" : "!"}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-[12.5px] font-medium text-slate-700 leading-snug">{item.text}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Available Trips */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-[14px] font-semibold text-slate-900">Available Trips</h2>
            <span className="text-[11px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{availableTrips.length} trips</span>
          </div>
          <button
            onClick={() => navigate('available-trips')}
            className="text-[13px] text-green-600 hover:text-green-700 font-semibold cursor-pointer"
          >
            View all →
          </button>
        </div>

        <div className="divide-y divide-slate-50">
          {availableTrips.slice(0, 6).map((trip) => (
            <div key={trip.id} className="px-6 py-4 hover:bg-slate-50/50 transition-colors group">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="font-mono text-[11px] font-semibold text-slate-500">{trip.id}</span>
                    <StatusBadge status={trip.status} />
                    <span className="text-[11px] text-slate-400">{trip.cargo.crop} · {trip.cargo.grade}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[13.5px] text-slate-700">
                    <span className="font-semibold text-green-700">{trip.pickup.name}</span>
                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <span className="font-semibold text-slate-800">{trip.destination.name}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5">
                    <span className="text-[12px] text-slate-500">{trip.cargo.quantity.toLocaleString('en-IN')} kg</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-[12px] text-slate-500">{trip.pickupTime}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-[12px] text-slate-500">{trip.distance} km</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-[17px] font-semibold text-green-700">₹{trip.earnings.toLocaleString('en-IN')}</p>
                    <p className="text-[11px] text-slate-400">estimated</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate('trip-details', { tripId: trip.id })}
                      className="px-3 py-1.5 text-[12.5px] font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => navigate('trip-details', { tripId: trip.id })}
                      className="px-3 py-1.5 text-[12.5px] font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors cursor-pointer"
                    >
                      Accept Trip
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
