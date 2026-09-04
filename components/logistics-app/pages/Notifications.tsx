"use client";

import { DemoBadge } from "@/components/demo-badge"
import type { NavigateFn } from '../types'
import { useLogisticsData } from '../data-context'

interface Props {
  navigate: NavigateFn
}

const typeConfig = {
  trip: { label: 'New Trip', color: 'bg-green-500', bg: 'bg-green-50 text-green-700' },
  update: { label: 'Update', color: 'bg-amber-500', bg: 'bg-amber-50 text-amber-700' },
  delivery: { label: 'Delivery', color: 'bg-purple-500', bg: 'bg-purple-50 text-purple-700' },
  payment: { label: 'Payment', color: 'bg-blue-500', bg: 'bg-blue-50 text-blue-700' },
}

export default function Notifications({ navigate }: Props) {
  const { notifications } = useLogisticsData()
  const unread = notifications.filter((n) => !n.read)
  const read = notifications.filter((n) => n.read)

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
            {unread.length > 0 ? `${unread.length} unread notifications` : 'All caught up!'}
            <DemoBadge />
          </p>
        </div>
        <button className="px-4 py-2 text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
          Mark all as read
        </button>
      </div>

      <div className="space-y-4">
        {unread.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">New</h2>
            <div className="space-y-2">
              {unread.map((n) => {
                const tc = typeConfig[n.type]
                return (
                  <div
                    key={n.id}
                    className="bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-4 flex items-start gap-4 hover:bg-slate-50/50 cursor-pointer transition-colors"
                  >
                    <div className={`w-2.5 h-2.5 rounded-full ${tc.color} shrink-0 mt-1.5`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">{n.text}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tc.bg}`}>{tc.label}</span>
                        <span className="text-xs text-slate-400">{n.time}</span>
                      </div>
                    </div>
                    {n.type === 'trip' && (
                      <button
                        onClick={() => navigate('available-trips')}
                        className="shrink-0 px-3 py-1.5 text-xs font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors cursor-pointer"
                      >
                        View Trip
                      </button>
                    )}
                    {n.type === 'payment' && (
                      <button
                        onClick={() => navigate('earnings')}
                        className="shrink-0 px-3 py-1.5 text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                      >
                        View Earnings
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {read.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Earlier</h2>
            <div className="space-y-2">
              {read.map((n) => {
                const tc = typeConfig[n.type]
                return (
                  <div
                    key={n.id}
                    className="bg-white rounded-xl border border-slate-100 px-5 py-4 flex items-start gap-4 hover:bg-slate-50/50 cursor-pointer transition-colors opacity-70"
                  >
                    <div className={`w-2 h-2 rounded-full bg-slate-300 shrink-0 mt-1.5`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700">{n.text}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs font-medium text-slate-400">{tc.label}</span>
                        <span className="text-slate-200">·</span>
                        <span className="text-xs text-slate-400">{n.time}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
