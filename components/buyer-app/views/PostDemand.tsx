"use client";

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import MatchScore from "../MatchScore"
import type { AppNav } from "../nav"
import { useBuyerData } from "../data-context"
import { postDemand } from "@/lib/actions"

function MatchCard({
  rank,
  listing,
  requirement,
  onSelect,
}: {
  rank: number
  listing: ReturnType<typeof useBuyerData>["listings"][number]
  requirement: { quantity: number; grade: string }
  onSelect: () => void
}) {
  const reasons = [
    listing.scoreBreakdown.price >= 85 && "Competitive price",
    listing.scoreBreakdown.quality >= 90 && `Grade ${listing.grade} quality`,
    listing.available >= requirement.quantity && "Meets quantity",
    listing.scoreBreakdown.location >= 80 && "Nearby source",
  ].filter(Boolean) as string[]

  return (
    <div className={`bg-white rounded-xl border overflow-hidden transition-all hover:shadow-md ${rank === 1 ? "border-forest-mid shadow-sm" : "border-border"}`}>
      {rank === 1 && (
        <div className="bg-forest-mid text-white px-4 py-2 text-xs font-semibold flex items-center gap-1.5">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M6 1l1.2 3.5H11l-3 2.2 1.1 3.5L6 8.2l-3.1 2 1.1-3.5-3-2.2h3.8z" fill="white" />
          </svg>
          Best Match for your requirement
        </div>
      )}
      <div className="p-4 flex gap-3">
        <img src={listing.image} alt={listing.crop} className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover bg-ivory-dark shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="min-w-0">
              <p className="text-[10px] text-sage font-mono">#{rank} ranked</p>
              <h3 className="font-semibold text-forest text-sm md:text-base leading-tight">
                {listing.crop} Grade {listing.grade}
              </h3>
              <p className="text-xs text-sage truncate">{listing.city} · {listing.distance} km</p>
            </div>
            <MatchScore score={listing.matchScore} size="sm" showLabel breakdown={listing.scoreBreakdown} />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs mb-2.5">
            <span className="text-sage">₹<span className="font-mono font-medium text-forest">{listing.pricePerKg}</span>/kg</span>
            <span className="text-sage"><span className="font-mono font-medium text-forest">{listing.available.toLocaleString()}</span> kg</span>
            <span className="text-sage">{listing.availableFrom}</span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {reasons.slice(0, 3).map((r, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-[11px] text-forest-mid bg-sage-pale px-2 py-0.5 rounded-full">
                <svg width="9" height="7" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l3 3 5-6" stroke="#1B7A3D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {r}
              </span>
            ))}
          </div>

          <button
            onClick={onSelect}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              rank === 1 ? "bg-forest-mid text-white hover:bg-forest-light" : "border border-border text-forest hover:bg-ivory-dark"
            }`}
          >
            {rank === 1 ? "Order Best Match" : "View & Order"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PostDemand({ navigate }: AppNav) {
  const { listings, crops, buyerVillage } = useBuyerData()
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [postError, setPostError] = useState<string | null>(null)
  const CROPS = crops.length > 0 ? crops : ["Tomatoes", "Potatoes", "Onions", "Carrots"]
  const [step, setStep] = useState<"form" | "results">("form")
  const [showSummary, setShowSummary] = useState(false)
  const [form, setForm] = useState({
    crop: CROPS[0] ?? "Tomatoes",
    quantity: "100",
    requiredBy: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
    location: buyerVillage ?? "City Market",
    grade: "A",
    maxPrice: "24",
    notes: "",
  })

  const matches = listings
    .filter((p) => p.crop === form.crop)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5)

  const estimatedBudget = form.quantity && form.maxPrice
    ? (Number(form.quantity) * Number(form.maxPrice)).toLocaleString()
    : null

  if (step === "results") {
    return (
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-5 md:py-8">
        <div className="flex items-center gap-3 mb-5 md:mb-6">
          <button
            onClick={() => setStep("form")}
            className="p-2 hover:bg-ivory-dark rounded-lg transition-colors text-sage hover:text-forest"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 4l-6 5 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-xl md:text-2xl font-medium text-forest">{matches.length} matches found</h1>
            <p className="text-sage text-xs md:text-sm truncate">
              {form.quantity} kg {form.crop} · Grade {form.grade} · {form.location} · By {form.requiredBy}
            </p>
          </div>
          <select className="hidden md:block text-xs border border-border rounded-lg px-3 py-1.5 bg-white text-forest outline-none">
            <option>Best Match</option>
            <option>Lowest Price</option>
            <option>Closest</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-3 md:gap-4">
          {matches.map((listing, i) => (
            <MatchCard
              key={listing.id}
              rank={i + 1}
              listing={listing}
              requirement={{ quantity: Number(form.quantity), grade: form.grade }}
              onSelect={() => navigate("produce-detail", listing.id)}
            />
          ))}
          {matches.length === 0 && (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-full bg-ivory-dark flex items-center justify-center mx-auto mb-3">
                <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                  <circle cx="14" cy="14" r="11" stroke="#5A7263" strokeWidth="1.5" />
                  <path d="M10 18c1-2 2-3 4-3s3 1 4 3" stroke="#5A7263" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="10" cy="12" r="1.5" fill="#5A7263" />
                  <circle cx="18" cy="12" r="1.5" fill="#5A7263" />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-medium text-forest mb-2">No matches yet</h3>
              <p className="text-sage text-sm max-w-xs mx-auto">We will notify you when matching produce becomes available.</p>
              <button onClick={() => setStep("form")} className="mt-4 px-5 py-2.5 bg-forest-mid text-white text-sm rounded-xl">
                Adjust requirement
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-5 md:py-8">
      <div className="mb-5 md:mb-6">
        <h1 className="font-serif text-2xl md:text-3xl font-medium text-forest">Post a Requirement</h1>
        <p className="text-sage mt-1 text-sm">Tell us what you need and we will find the best matches.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
        {/* Form */}
        <form
          className="lg:col-span-3 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            setPostError(null)
            startTransition(async () => {
              const fd = new FormData()
              fd.set("crop", form.crop)
              fd.set("quantity_kg", form.quantity)
              fd.set("offered_price", form.maxPrice)
              fd.set("needed_by", form.requiredBy)
              fd.set("location", form.location)
              const result = await postDemand(fd)
              if (result.error) {
                setPostError(result.error)
                return
              }
              router.refresh()
              setStep("results")
            })
          }}
        >
          <div className="bg-white rounded-xl border border-border p-4 md:p-6 space-y-4">
            <h2 className="font-medium text-forest text-sm md:text-base">What are you looking for?</h2>

            <div>
              <label className="text-xs text-sage mb-1.5 block">Crop</label>
              <select
                value={form.crop}
                onChange={(e) => setForm({ ...form, crop: e.target.value })}
                className="w-full px-3 py-3 bg-ivory border border-border rounded-xl text-sm text-forest outline-none focus:border-forest-mid"
              >
                {CROPS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-sage mb-1.5 block">Quantity (kg)</label>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  placeholder="e.g. 1000"
                  className="w-full px-3 py-3 bg-ivory border border-border rounded-xl text-sm text-forest outline-none focus:border-forest-mid font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-sage mb-1.5 block">Quality Grade</label>
                <div className="flex gap-2">
                  {["A", "B", "C"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setForm({ ...form, grade: g })}
                      className={`flex-1 py-3 text-sm font-semibold rounded-xl border transition-all ${
                        form.grade === g ? "bg-forest-mid text-white border-forest-mid" : "border-border text-sage hover:border-forest-mid"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-sage mb-1.5 block">Required by</label>
                <input
                  type="date"
                  value={form.requiredBy}
                  onChange={(e) => setForm({ ...form, requiredBy: e.target.value })}
                  placeholder="e.g. Sep 5, 2026"
                  className="w-full px-3 py-3 bg-ivory border border-border rounded-xl text-sm text-forest outline-none focus:border-forest-mid"
                />
              </div>
              <div>
                <label className="text-xs text-sage mb-1.5 block">Delivery location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Bengaluru"
                  className="w-full px-3 py-3 bg-ivory border border-border rounded-xl text-sm text-forest outline-none focus:border-forest-mid"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-sage mb-1.5 block">Max price (₹/kg)</label>
              <input
                type="number"
                value={form.maxPrice}
                onChange={(e) => setForm({ ...form, maxPrice: e.target.value })}
                placeholder="e.g. 42"
                className="w-full px-3 py-3 bg-ivory border border-border rounded-xl text-sm text-forest outline-none focus:border-forest-mid font-mono"
              />
            </div>

            <div>
              <label className="text-xs text-sage mb-1.5 block">Additional notes (optional)</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                placeholder="Any special requirements..."
                className="w-full px-3 py-2.5 bg-ivory border border-border rounded-xl text-sm text-forest outline-none focus:border-forest-mid resize-none"
              />
            </div>
          </div>

          {/* Mobile summary toggle */}
          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => setShowSummary(!showSummary)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white border border-border rounded-xl text-sm"
            >
              <span className="font-medium text-forest">
                {form.crop || "—"} · {form.quantity || "—"} kg · Grade {form.grade}
              </span>
              <div className="flex items-center gap-2">
                {estimatedBudget && <span className="font-mono text-forest-mid font-semibold">₹{estimatedBudget}</span>}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={`text-sage transition-transform ${showSummary ? "rotate-180" : ""}`}>
                  <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </div>
            </button>

            {showSummary && (
              <div className="mt-2 bg-white border border-border rounded-xl p-4 slide-up">
                <SummaryContent form={form} estimatedBudget={estimatedBudget} />
              </div>
            )}
          </div>

          {postError && <p className="text-sm text-amber">{postError}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-full py-3.5 bg-forest-mid hover:bg-forest-light text-white font-semibold rounded-xl transition-colors text-sm disabled:opacity-60"
          >
            {pending ? "Finding matches…" : "Find Matches →"}
          </button>
        </form>

        {/* Desktop live summary */}
        <div className="lg:col-span-2 hidden lg:block">
          <div className="sticky top-24 bg-white rounded-xl border border-border p-5">
            <h3 className="font-medium text-forest mb-4 text-sm">Your Requirement</h3>
            <SummaryContent form={form} estimatedBudget={estimatedBudget} />
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryContent({ form, estimatedBudget }: { form: Record<string, string>; estimatedBudget: string | null }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-3 bg-ivory rounded-xl">
        <span className="text-2xl">🌿</span>
        <div>
          <p className="font-semibold text-forest">{form.crop || "—"}</p>
          <p className="text-xs text-sage">Crop</p>
        </div>
      </div>

      {form.quantity && (
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-ivory rounded-xl">
            <p className="font-mono font-semibold text-forest text-lg">{Number(form.quantity).toLocaleString()} kg</p>
            <p className="text-xs text-sage">Quantity</p>
          </div>
          <div className="p-3 bg-ivory rounded-xl">
            <p className="font-semibold text-forest">Grade {form.grade}</p>
            <p className="text-xs text-sage">Quality</p>
          </div>
        </div>
      )}

      {form.requiredBy && (
        <div className="flex justify-between text-sm py-2 border-b border-border">
          <span className="text-sage">Required by</span>
          <span className="font-medium text-forest">{form.requiredBy}</span>
        </div>
      )}
      {form.location && (
        <div className="flex justify-between text-sm py-2 border-b border-border">
          <span className="text-sage">Delivery</span>
          <span className="font-medium text-forest">{form.location}</span>
        </div>
      )}
      {form.maxPrice && (
        <div className="flex justify-between text-sm py-2">
          <span className="text-sage">Max price</span>
          <span className="font-mono font-medium text-forest">₹{form.maxPrice}/kg</span>
        </div>
      )}

      {estimatedBudget && (
        <div className="p-3 bg-sage-pale/50 rounded-xl border border-sage-light/30 mt-2">
          <p className="text-xs text-sage">Estimated budget</p>
          <p className="font-mono text-xl font-semibold text-forest-mid mt-0.5">₹{estimatedBudget}</p>
        </div>
      )}
    </div>
  )
}
