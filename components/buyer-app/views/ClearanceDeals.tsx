"use client";

import { useState } from "react"
import { useBuyerData } from "../data-context"
import type { AppNav } from "../nav"

function UrgencyBadge({ hours }: { hours: number }) {
  if (hours <= 12)
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber bg-amber-pale px-2 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
        {hours}h left
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-sage">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1" />
        <path d="M5 2.5V5l1.5 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      </svg>
      {hours}h
    </span>
  )
}

export default function ClearanceDeals({ navigate }: AppNav) {
  const { deals } = useBuyerData()
  const [sortBy, setSortBy] = useState("discount")

  const sorted = [...deals].sort((a, b) => {
    if (sortBy === "discount") return b.discount - a.discount
    if (sortBy === "price") return a.clearancePrice - b.clearancePrice
    if (sortBy === "expiry") return a.hoursRemaining - b.hoursRemaining
    return 0
  })

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-5 md:py-8">
      {/* Hero banner */}
      <div className="relative rounded-2xl overflow-hidden mb-6 md:mb-8 bg-forest">
        <img
          src="https://images.unsplash.com/photo-1787547286615-171e4320153c?w=1200&h=280&fit=crop&auto=format"
          alt="Agricultural market"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative px-5 py-7 md:px-8 md:py-10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-lime text-[11px] md:text-xs font-semibold uppercase tracking-wider mb-1.5">Limited availability</p>
              <h1 className="font-serif text-2xl md:text-3xl font-medium text-white leading-tight max-w-xs md:max-w-lg">
                Clearance Opportunities
              </h1>
              <p className="text-white/60 mt-1.5 text-xs md:text-sm max-w-xs hidden md:block">
                Fresh produce at exceptional prices from Agri Setu White Stores.
              </p>
            </div>
            <div className="text-right shrink-0 ml-4">
              <p className="font-mono text-3xl font-semibold text-lime">{deals.length}</p>
              <p className="text-white/50 text-xs">active deals</p>
            </div>
          </div>

          <div className="mt-4 md:mt-6 flex items-start gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3.5 py-2.5 w-fit">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
              <path d="M8 1L9.5 5.5H14l-3.7 2.8 1.4 4.5L8 9.8 4.3 12.8l1.4-4.5L2 5.5h4.5z" fill="#22A357" />
            </svg>
            <p className="text-white/70 text-[11px] md:text-xs">
              All clearance produce meets quality standards. Discounts reflect proximity to optimal sale window.
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-forest">{sorted.length} deals</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-sage hidden sm:inline">Sort by</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs border border-border rounded-lg px-3 py-1.5 bg-white text-forest outline-none"
          >
            <option value="discount">Best discount</option>
            <option value="price">Lowest price</option>
            <option value="expiry">Expiring soon</option>
          </select>
        </div>
      </div>

      {/* Cards — 1 col mobile, 2 tablet, 3 desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5 mb-6 md:mb-8">
        {sorted.map((deal) => (
          <div key={deal.id} className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-md transition-all group">
            <div className="relative h-40 md:h-48 bg-ivory-dark overflow-hidden">
              <img
                src={deal.image}
                alt={deal.crop}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/30 to-transparent" />
              <div className="absolute top-3 left-3 bg-amber text-white text-sm font-bold px-2.5 py-1 rounded-xl shadow-sm">
                {deal.discount}% OFF
              </div>
              <div className="absolute top-3 right-3">
                <UrgencyBadge hours={deal.hoursRemaining} />
              </div>
            </div>

            <div className="p-4 md:p-5">
              <div className="flex items-start justify-between mb-2.5">
                <div>
                  <h3 className="font-semibold text-forest text-sm md:text-base">{deal.crop}</h3>
                  <p className="text-xs text-sage">Grade {deal.grade} · {deal.whiteStore.replace("White Store — ", "")}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline gap-0.5 justify-end">
                    <span className="font-mono text-lg md:text-xl font-semibold text-forest">₹{deal.clearancePrice}</span>
                    <span className="text-xs text-sage">/kg</span>
                  </div>
                  <span className="text-xs text-sage line-through font-mono">₹{deal.originalPrice}</span>
                </div>
              </div>

              <div className="space-y-1 mb-3 text-xs text-sage">
                <div className="flex items-center gap-1.5">
                  <svg width="10" height="10" viewBox="0 0 11 11" fill="none">
                    <path d="M5.5 1C3.5 1 2 2.5 2 4.5c0 2.8 3.5 5.5 3.5 5.5S9 7.3 9 4.5C9 2.5 7.5 1 5.5 1z" stroke="currentColor" strokeWidth="1" />
                    <circle cx="5.5" cy="4.5" r="1" fill="currentColor" />
                  </svg>
                  {deal.region} · {deal.distance} km
                </div>
                <div className="flex items-center gap-1.5">
                  <svg width="10" height="10" viewBox="0 0 11 11" fill="none">
                    <rect x="1.5" y="2" width="8" height="7" rx="1" stroke="currentColor" strokeWidth="1" />
                    <path d="M1.5 5h8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                  </svg>
                  {deal.quantity.toLocaleString()} kg · {deal.freshness} freshness
                </div>
              </div>

              <div className="bg-amber-pale/60 border border-amber/15 rounded-lg px-2.5 py-1.5 mb-3 text-xs">
                <span className="text-amber font-medium">
                  Save ₹{((deal.originalPrice - deal.clearancePrice) * deal.quantity).toLocaleString()} on full lot
                </span>
              </div>

              <button
                onClick={() => navigate("produce-detail", deal.produceId)}
                className="w-full py-2.5 bg-forest-mid text-white text-sm font-medium rounded-xl hover:bg-forest-light transition-colors"
              >
                Order at ₹{deal.clearancePrice}/kg
              </button>
            </div>
          </div>
        ))}

        {sorted.length === 0 && (
          <div className="col-span-full text-center py-16">
            <div className="w-14 h-14 rounded-full bg-ivory-dark flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="11" stroke="#5A7263" strokeWidth="1.5" />
                <path d="M10 14h8" stroke="#5A7263" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="font-serif text-xl font-medium text-forest mb-2">No clearance deals right now</h3>
            <p className="text-sage text-sm max-w-xs mx-auto">Check back later or browse the full marketplace.</p>
            <button onClick={() => navigate("marketplace")} className="mt-4 px-5 py-2.5 bg-forest-mid text-white text-sm rounded-xl">
              Browse Marketplace
            </button>
          </div>
        )}
      </div>

      {/* Info footer */}
      <div className="bg-ivory-dark border border-border rounded-xl p-4 md:p-5 flex gap-3">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="shrink-0 mt-0.5 text-sage">
          <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 6v6M10 15h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <div>
          <p className="text-sm font-medium text-forest">About clearance produce</p>
          <p className="text-xs text-sage mt-1 leading-relaxed">
            Clearance deals are surplus or near-end-of-optimal-window produce from Agri Setu White Stores.
            All produce has passed quality inspection. Discounts reflect sale urgency, not quality compromise.
          </p>
        </div>
      </div>
    </div>
  )
}
