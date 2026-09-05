"use client";

import { useState, useMemo, memo } from "react"
import MatchScore from "../MatchScore"
import type { AppNav } from "../nav"
import { useBuyerData } from "../data-context"
import type { ProduceListing } from "../types"

function GradeBadge({ grade }: { grade: string }) {
  const styles: Record<string, string> = {
    A: "bg-sage-pale text-forest-mid",
    B: "bg-gold-pale text-gold",
    C: "bg-amber-pale text-amber",
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${styles[grade] ?? "bg-ivory text-sage"}`}>
      Grade {grade}
    </span>
  )
}

function FreshnessBar({ freshness, daysAgo }: { freshness: string; daysAgo: number }) {
  const widths: Record<string, string> = { Excellent: "w-full", Good: "w-2/3", Fair: "w-1/3" }
  const colors: Record<string, string> = { Excellent: "bg-forest-mid", Good: "bg-lime", Fair: "bg-gold" }
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1 bg-ivory-deeper rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${widths[freshness] ?? "w-1/2"} ${colors[freshness] ?? "bg-sage"}`} />
      </div>
      <span className="text-[10px] text-sage">{daysAgo}d ago</span>
    </div>
  )
}

const ProduceCard = memo(function ProduceCard({ listing, onSelect }: { listing: ProduceListing; onSelect: () => void }) {
  return (
    <div
      className="bg-white rounded-xl border border-border overflow-hidden cursor-pointer group transition-all duration-200 hover:-translate-y-0.5"
      style={{ boxShadow: "0 1px 4px rgba(26,46,33,0.06)" }}
      onClick={onSelect}
    >
      <div className="relative h-40 md:h-44 bg-ivory-dark overflow-hidden">
        <img
          src={listing.image}
          alt={listing.crop}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest/20 to-transparent" />
        <div className="absolute top-2.5 right-2.5">
          <div className="relative">
            <MatchScore score={listing.matchScore} size="sm" showLabel interactive={false} breakdown={listing.scoreBreakdown} />
            <div className="absolute inset-0 -z-10 rounded-full bg-white/90 backdrop-blur-sm shadow-sm" />
          </div>
        </div>
        <div className="absolute bottom-2.5 left-2.5">
          <span className="text-[10px] font-medium px-2 py-1 rounded bg-white/90 backdrop-blur-sm text-forest-mid">
            {listing.availableFrom}
          </span>
        </div>
      </div>

      <div className="p-3.5 md:p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-forest text-sm md:text-base leading-tight">{listing.crop}</h3>
            <div className="mt-1"><GradeBadge grade={listing.grade} /></div>
          </div>
          <div className="text-right">
            <span className="font-mono text-lg md:text-xl font-semibold text-forest">₹{listing.pricePerKg}</span>
            <span className="text-xs text-sage">/kg</span>
          </div>
        </div>

        <div className="space-y-1 mb-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-sage">Available</span>
            <span className="font-mono font-medium text-forest">{listing.available.toLocaleString()} kg</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-sage truncate">
            <svg width="10" height="10" viewBox="0 0 11 11" fill="none" className="shrink-0">
              <path d="M5.5 1C3.5 1 2 2.5 2 4.5c0 2.8 3.5 5.5 3.5 5.5S9 7.3 9 4.5C9 2.5 7.5 1 5.5 1z" stroke="currentColor" strokeWidth="1" />
              <circle cx="5.5" cy="4.5" r="1" fill="currentColor" />
            </svg>
            <span className="text-forest-light font-medium truncate">{listing.city} · {listing.distance} km</span>
          </div>
        </div>

        <FreshnessBar freshness={listing.freshness} daysAgo={listing.collectedDaysAgo} />

        <button
          onClick={(e) => { e.stopPropagation(); onSelect() }}
          className="mt-3 w-full py-2 text-xs md:text-sm font-medium bg-ivory-dark hover:bg-forest-mid hover:text-white text-forest rounded-lg transition-all duration-200"
        >
          View Details
        </button>
      </div>
    </div>
  )
})

function KpiCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="bg-white rounded-xl border border-border p-3.5 md:p-5">
      <p className="text-[11px] md:text-xs text-sage mb-1">{label}</p>
      <p className={`font-mono text-xl md:text-2xl font-semibold leading-none ${accent ?? "text-forest"}`}>{value}</p>
      {sub && <p className="text-[10px] md:text-[11px] text-sage mt-1">{sub}</p>}
    </div>
  )
}

function FilterContent({
  selectedCrops, toggleCrop,
  selectedGrades, toggleGrade,
  minMatch, setMinMatch,
  maxDistance, setMaxDistance,
  activeFilters, clearAll,
  crops,
}: {
  selectedCrops: string[]
  toggleCrop: (c: string) => void
  selectedGrades: string[]
  toggleGrade: (g: string) => void
  minMatch: number
  setMinMatch: (v: number) => void
  maxDistance: number
  setMaxDistance: (v: number) => void
  activeFilters: { label: string; remove: () => void }[]
  clearAll: () => void
  crops: string[]
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-forest">Filters</h3>
        {activeFilters.length > 0 && (
          <button className="text-[11px] text-amber" onClick={clearAll}>Clear all</button>
        )}
      </div>

      <div>
        <p className="text-[11px] font-semibold text-sage uppercase tracking-wide mb-2">Crop</p>
        <div className="space-y-2">
          {crops.map((crop) => (
            <label key={crop} className="flex items-center gap-2.5 cursor-pointer group">
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                  selectedCrops.includes(crop) ? "bg-forest-mid border-forest-mid" : "border-border group-hover:border-forest-mid"
                }`}
                onClick={() => toggleCrop(crop)}
              >
                {selectedCrops.includes(crop) && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-forest">{crop}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold text-sage uppercase tracking-wide mb-2">Quality Grade</p>
        <div className="flex gap-2">
          {["A", "B", "C"].map((g) => (
            <button
              key={g}
              onClick={() => toggleGrade(g)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                selectedGrades.includes(g) ? "bg-forest-mid text-white border-forest-mid" : "border-border text-sage hover:border-forest-mid"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between mb-2">
          <p className="text-[11px] font-semibold text-sage uppercase tracking-wide">Distance</p>
          <span className="text-[11px] font-mono text-forest">{maxDistance} km</span>
        </div>
        <input type="range" min={10} max={100} value={maxDistance}
          onChange={(e) => setMaxDistance(Number(e.target.value))}
          className="w-full accent-forest-mid" />
      </div>

      <div>
        <p className="text-[11px] font-semibold text-sage uppercase tracking-wide mb-2">Min Match Score</p>
        <div className="grid grid-cols-4 gap-1.5">
          {[0, 80, 90, 95].map((val) => (
            <button
              key={val}
              onClick={() => setMinMatch(val)}
              className={`py-1.5 text-[11px] font-mono font-medium rounded-lg border transition-all ${
                minMatch === val ? "bg-forest-mid text-white border-forest-mid" : "border-border text-sage hover:border-forest-mid"
              }`}
            >
              {val === 0 ? "Any" : `${val}+`}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Marketplace({ navigate }: AppNav) {
  const { listings, requirements, orders, buyerName, crops } = useBuyerData()
  const ALL_CROPS = crops.length > 0 ? crops : ["Tomatoes", "Potatoes", "Onions"]
  const [selectedCrops, setSelectedCrops] = useState<string[]>([])
  const [selectedGrades, setSelectedGrades] = useState<string[]>([])
  const [minMatch, setMinMatch] = useState(0)
  const [maxDistance, setMaxDistance] = useState(100)
  const [sortBy, setSortBy] = useState("match")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    let list = [...listings]
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (p) =>
          p.crop.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.whiteStore.toLowerCase().includes(q) ||
          p.batchId.toLowerCase().includes(q)
      )
    }
    if (selectedCrops.length > 0) list = list.filter((p) => selectedCrops.includes(p.crop))
    if (selectedGrades.length > 0) list = list.filter((p) => selectedGrades.includes(p.grade))
    list = list.filter((p) => p.matchScore >= minMatch && p.distance <= maxDistance)
    list.sort((a, b) => {
      if (sortBy === "match") return b.matchScore - a.matchScore
      if (sortBy === "price-low") return a.pricePerKg - b.pricePerKg
      if (sortBy === "price-high") return b.pricePerKg - a.pricePerKg
      if (sortBy === "quantity") return b.available - a.available
      if (sortBy === "distance") return a.distance - b.distance
      return 0
    })
    return list
  }, [listings, query, selectedCrops, selectedGrades, minMatch, maxDistance, sortBy])

  const activeFilters: { label: string; remove: () => void }[] = [
    ...selectedCrops.map((c) => ({ label: c, remove: () => setSelectedCrops((p) => p.filter((x) => x !== c)) })),
    ...selectedGrades.map((g) => ({ label: `Grade ${g}`, remove: () => setSelectedGrades((p) => p.filter((x) => x !== g)) })),
    ...(minMatch > 0 ? [{ label: `${minMatch}+ Match`, remove: () => setMinMatch(0) }] : []),
    ...(maxDistance < 100 ? [{ label: `≤${maxDistance} km`, remove: () => setMaxDistance(100) }] : []),
  ]

  const toggleCrop = (c: string) =>
    setSelectedCrops((p) => p.includes(c) ? p.filter((x) => x !== c) : [...p, c])
  const toggleGrade = (g: string) =>
    setSelectedGrades((p) => p.includes(g) ? p.filter((x) => x !== g) : [...p, g])
  const clearAll = () => { setSelectedCrops([]); setSelectedGrades([]); setMinMatch(0); setMaxDistance(100) }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-5 md:py-8">
      {/* Page header */}
      <div className="mb-4 md:mb-6">
        <h1 className="font-serif text-2xl md:text-3xl font-medium text-forest leading-tight">
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, <em>{buyerName}.</em>
        </h1>
        <p className="text-sage mt-1 text-sm">Find the best produce for your requirements.</p>
      </div>

      {/* Search bar */}
      <div className="relative mb-4 md:mb-6">
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sage">
          <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M13 13l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tomatoes, onions, potatoes..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-xl text-sm text-forest placeholder:text-sage outline-none focus:border-forest-mid transition-all"
        />
        <kbd className="hidden md:inline-flex absolute right-3 top-1/2 -translate-y-1/2 items-center px-2 py-0.5 text-[10px] font-mono text-sage bg-ivory-dark border border-border rounded">
          ⌘K
        </kbd>
      </div>

      {/* Active requirements — horizontal scroll on mobile */}
      {requirements.length > 0 && (
        <div className="mb-4 md:mb-6">
          <h2 className="text-xs md:text-sm font-medium text-sage mb-2.5">Active Requirements</h2>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {requirements.map((req) => (
              <div key={req.id} className="bg-white border border-border rounded-xl px-3.5 py-3 flex-shrink-0 min-w-48 md:min-w-56">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-forest text-sm">{req.crop}</p>
                    <p className="text-xs text-sage mt-0.5">{req.quantity.toLocaleString()} kg · Grade {req.grade}</p>
                    <p className="text-xs text-sage">By {req.requiredBy}</p>
                  </div>
                  <span className="text-xs font-semibold text-forest-mid bg-sage-pale px-2 py-0.5 rounded-full shrink-0">
                    {req.matchCount}
                  </span>
                </div>
                <button onClick={() => navigate("post-demand")} className="mt-2 text-xs text-forest-mid font-medium">
                  View Matches →
                </button>
              </div>
            ))}
            <button
              onClick={() => navigate("post-demand")}
              className="border-2 border-dashed border-border rounded-xl px-4 py-3 flex-shrink-0 text-sm text-sage hover:text-forest hover:border-forest-mid transition-colors flex items-center gap-1.5"
            >
              <span className="text-lg leading-none">+</span>
              <span className="whitespace-nowrap">Post Requirement</span>
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards — horizontal scroll on mobile, row on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4 mb-5 md:mb-8">
        <KpiCard label="Produce Types" value={new Set(listings.map(l => l.crop)).size} sub="Available now" />
        <KpiCard label="Total Available" value={listings.reduce((s, l) => s + l.available, 0).toLocaleString()} sub="kg in stock" />
        <KpiCard label="Requirements" value={requirements.length} sub="Active" />
        <KpiCard label="Best Matches" value={listings.filter(l => l.matchScore >= 90).length} sub="Score 90+" accent="text-forest-mid" />
        <KpiCard label="Active Orders" value={orders.filter(o => o.status !== "delivered" && o.status !== "cancelled").length} sub="In progress" accent="text-amber" />
      </div>

      {/* Main layout */}
      <div className="flex gap-6">
        {/* Desktop filter sidebar */}
        <div className="w-56 shrink-0 hidden lg:block">
          <div className="sticky top-24 bg-white rounded-xl border border-border p-4">
            <FilterContent
              selectedCrops={selectedCrops} toggleCrop={toggleCrop}
              selectedGrades={selectedGrades} toggleGrade={toggleGrade}
              minMatch={minMatch} setMinMatch={setMinMatch}
              maxDistance={maxDistance} setMaxDistance={setMaxDistance}
              activeFilters={activeFilters} clearAll={clearAll}
              crops={ALL_CROPS}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Controls bar */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {/* Mobile filter button */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 border border-border bg-white rounded-lg text-xs font-medium text-forest hover:border-forest-mid transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              Filters
              {activeFilters.length > 0 && (
                <span className="bg-forest-mid text-white text-[10px] font-bold px-1.5 rounded-full">
                  {activeFilters.length}
                </span>
              )}
            </button>

            {/* Active filter chips */}
            <div className="flex gap-1.5 flex-wrap flex-1 min-w-0">
              {activeFilters.map((f, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-sage-pale text-forest-mid text-xs font-medium rounded-full border border-sage-light/50">
                  {f.label}
                  <button onClick={f.remove} className="hover:text-forest">×</button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 ml-auto shrink-0">
              <span className="text-xs text-sage hidden md:inline">{filtered.length} results</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs border border-border rounded-lg px-2.5 py-1.5 bg-white text-forest outline-none"
              >
                <option value="match">Best Match</option>
                <option value="price-low">Lowest Price</option>
                <option value="price-high">Highest Price</option>
                <option value="quantity">Most Quantity</option>
                <option value="distance">Closest</option>
              </select>
              <div className="hidden md:flex rounded-lg border border-border overflow-hidden">
                {(["grid", "list"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setViewMode(m)}
                    className={`p-1.5 ${viewMode === m ? "bg-forest-mid text-white" : "bg-white text-sage"}`}
                  >
                    {m === "grid" ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                        <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                        <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                        <rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M1 3h12M1 7h12M1 11h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile result count */}
          <p className="text-xs text-sage mb-3 md:hidden">{filtered.length} results</p>

          {/* Produce grid */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-ivory-dark flex items-center justify-center mb-3">
                <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                  <path d="M14 4C8.5 4 4 8.5 4 14s4.5 10 10 10 10-4.5 10-10S19.5 4 14 4z" stroke="#5A7263" strokeWidth="1.5" />
                  <path d="M10 14h8M14 10v8" stroke="#5A7263" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-medium text-forest mb-2">No produce found</h3>
              <p className="text-sage text-sm max-w-xs">Try adjusting your filters or search for a different crop.</p>
              <button
                onClick={clearAll}
                className="mt-4 px-4 py-2 bg-forest-mid text-white text-sm rounded-lg hover:bg-forest-light transition-colors"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className={
              viewMode === "list"
                ? "flex flex-col gap-3"
                : "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4"
            }>
              {filtered.map((listing) =>
                viewMode === "list" ? (
                  <ListCard
                    key={listing.id}
                    listing={listing}
                    onSelect={() => navigate("produce-detail", listing.id)}
                  />
                ) : (
                  <ProduceCard
                    key={listing.id}
                    listing={listing}
                    onSelect={() => navigate("produce-detail", listing.id)}
                  />
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter bottom sheet */}
      {showMobileFilters && (
        <>
          <div className="fixed inset-0 bg-forest/40 backdrop-blur-sm z-40" onClick={() => setShowMobileFilters(false)} />
          <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col slide-up">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-semibold text-forest">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)} className="p-1 text-sage hover:text-forest">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <FilterContent
                selectedCrops={selectedCrops} toggleCrop={toggleCrop}
                selectedGrades={selectedGrades} toggleGrade={toggleGrade}
                minMatch={minMatch} setMinMatch={setMinMatch}
                maxDistance={maxDistance} setMaxDistance={setMaxDistance}
                activeFilters={activeFilters} clearAll={clearAll}
                crops={ALL_CROPS}
              />
            </div>
            <div className="px-5 py-4 border-t border-border flex gap-3" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}>
              <button onClick={clearAll} className="flex-1 py-3 border border-border text-forest text-sm font-medium rounded-xl hover:bg-ivory transition-colors">
                Clear all
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 py-3 bg-forest-mid text-white text-sm font-semibold rounded-xl hover:bg-forest-light transition-colors"
              >
                Show {filtered.length} results
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function ListCard({ listing, onSelect }: { listing: ProduceListing; onSelect: () => void }) {
  return (
    <div
      onClick={onSelect}
      className="bg-white rounded-xl border border-border p-4 flex gap-4 cursor-pointer hover:border-forest-mid/30 hover:shadow-sm transition-all"
    >
      <img src={listing.image} alt={listing.crop} loading="lazy" decoding="async" className="w-20 h-16 md:w-24 md:h-20 object-cover rounded-lg shrink-0 bg-ivory-dark" />
      <div className="flex-1 min-w-0 flex items-center gap-3 md:gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <h3 className="font-semibold text-forest text-sm truncate">{listing.crop}</h3>
            <GradeBadge grade={listing.grade} />
          </div>
          <p className="text-xs text-sage truncate">{listing.city} · {listing.distance} km</p>
          <p className="text-xs text-sage font-mono mt-0.5">{listing.available.toLocaleString()} kg</p>
        </div>
        <div className="shrink-0 text-right">
          <span className="font-mono text-lg font-semibold text-forest">₹{listing.pricePerKg}</span>
          <p className="text-[10px] text-sage">/kg</p>
        </div>
        <div className="shrink-0 hidden sm:block">
          <MatchScore score={listing.matchScore} size="sm" showLabel breakdown={listing.scoreBreakdown} interactive={false} />
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onSelect() }}
          className="hidden md:block px-3 py-2 bg-forest-mid text-white text-xs rounded-lg hover:bg-forest-light transition-colors shrink-0"
        >
          View
        </button>
      </div>
    </div>
  )
}
