"use client";

import type { NavigateFn } from '../types'
import { DemoBadge } from "@/components/demo-badge"
import { useLogisticsData } from '../data-context'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'

interface Props { navigate: NavigateFn }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white px-3 py-2 rounded-xl shadow-lg text-[12px]">
        <p className="font-semibold">{label}</p>
        <p className="text-green-400 font-bold">₹{Number(payload[0].value).toLocaleString('en-IN')}</p>
      </div>
    )
  }
  return null
}

export default function Earnings({ navigate }: Props) {
  const { earningsChartData, recentPayments, earningsSummary } = useLogisticsData()
  const maxEarnings = Math.max(...earningsChartData.map((d) => d.earnings), 1)
  const rangeLabel =
    earningsChartData.length > 1
      ? `${earningsChartData[0].date} – ${earningsChartData[earningsChartData.length - 1].date}`
      : "No delivered trips yet"

  return (
    <div className="p-6 lg:p-8 max-w-[1440px] mx-auto space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold text-slate-900 tracking-tight">Earnings</h1>
        <p className="text-[13.5px] text-slate-500 mt-0.5 flex items-center gap-2">
          Your earnings summary and payment history.
          <DemoBadge />
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Earnings', value: `₹${earningsSummary.total.toLocaleString('en-IN')}`, sub: 'Delivered trips', color: 'text-green-700', border: 'border-green-200', bg: 'bg-green-50' },
          { label: 'This Month', value: `₹${earningsSummary.thisMonth.toLocaleString('en-IN')}`, sub: 'Sep 2026', color: 'text-blue-700', border: 'border-blue-200', bg: 'bg-blue-50' },
          { label: 'Pending Payout', value: `₹${earningsSummary.pending.toLocaleString('en-IN')}`, sub: earningsSummary.pendingTripId ?? 'None', color: 'text-amber-700', border: 'border-amber-200', bg: 'bg-amber-50' },
          { label: 'Completed Trips', value: String(earningsSummary.completedCount), sub: 'From mock + live board', color: 'text-slate-700', border: 'border-slate-200', bg: 'bg-slate-50' },
        ].map((card) => (
          <div key={card.label} className={`bg-white rounded-2xl border ${card.border} shadow-sm px-5 py-5`}>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{card.label}</p>
            <p className={`text-[26px] font-semibold mt-2 tracking-tight leading-none ${card.color}`}>{card.value}</p>
            <p className="text-[12px] text-slate-400 mt-2 font-medium">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className="text-[14px] font-semibold text-slate-900">Earnings — Last 30 Days</h2>
            <p className="text-[12.5px] text-slate-500 mt-0.5">Daily trip earnings in Indian Rupees</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
              <div className="w-3 h-3 rounded-sm bg-green-500" />
              Earnings per trip day
            </div>
            <div className="text-[11.5px] text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg font-medium">
              {rangeLabel}
            </div>
          </div>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={earningsChartData} barSize={16} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'DM Sans' }}
                axisLine={false}
                tickLine={false}
                interval={3}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'DM Sans' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', radius: 4 }} />
              <Bar dataKey="earnings" radius={[4, 4, 0, 0]}>
                {earningsChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.earnings === maxEarnings ? '#16a34a' : entry.earnings > 2500 ? '#22c55e' : '#bbf7d0'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent payments */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-slate-900">Recent Payments</h2>
            <button onClick={() => navigate('trip-history')} className="text-[12.5px] text-green-600 hover:text-green-700 font-semibold cursor-pointer">
              View history →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Trip ID', 'Date', 'Route', 'Amount', 'Status'].map((col) => (
                    <th key={col} className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide first:pl-5 last:pr-5">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentPayments.map((p) => (
                  <tr key={p.tripId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="pl-5 pr-4 py-3.5">
                      <span className="font-mono text-[11.5px] font-semibold text-slate-700">{p.tripId}</span>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] text-slate-600">{p.date}</td>
                    <td className="px-4 py-3.5 text-[13px] text-slate-700 font-medium">{p.route}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-[14px] font-semibold text-slate-900">₹{p.amount.toLocaleString('en-IN')}</span>
                    </td>
                    <td className="pl-4 pr-5 py-3.5">
                      <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-full ${p.status === 'paid' ? 'bg-green-50 text-green-700 ring-1 ring-green-200' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'}`}>
                        {p.status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-[14px] font-semibold text-slate-900 mb-5">Payment Breakdown</h2>
          <div className="space-y-1">
            {[
              { label: 'Trip Earnings', value: `₹${earningsSummary.total.toLocaleString('en-IN')}`, sub: `${earningsSummary.completedCount} delivered trips`, color: 'text-slate-900' },
              { label: 'On-time share', value: `${earningsSummary.onTimePercent}%`, sub: 'From mock delivery timestamps', color: 'text-green-600' },
              { label: 'Deductions', value: '₹0', sub: 'None', color: 'text-slate-400' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-3.5 border-b border-slate-100">
                <div>
                  <p className="text-[13px] font-medium text-slate-700">{item.label}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.sub}</p>
                </div>
                <span className={`text-[14px] font-semibold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-4 mt-2">
            <span className="text-[14px] font-bold text-slate-900">Total</span>
            <span className="text-[22px] font-bold text-green-700">₹{earningsSummary.total.toLocaleString('en-IN')}</span>
          </div>

          <div className="mt-5 bg-green-50 border border-green-100 rounded-2xl p-4">
            <p className="text-[11px] font-semibold text-green-700 uppercase tracking-wide">Next Payout</p>
            <p className="text-[20px] font-semibold text-green-800 mt-1">₹{earningsSummary.pending.toLocaleString('en-IN')}</p>
            <p className="text-[12px] text-green-600 mt-0.5">
              {earningsSummary.pendingTripId ? `After ${earningsSummary.pendingTripId} is delivered` : 'No active trip payout'}
            </p>
            <button
              onClick={() => navigate('active-delivery')}
              className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white text-[12.5px] font-semibold py-2 rounded-xl transition-colors cursor-pointer"
            >
              View Active Trip →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
