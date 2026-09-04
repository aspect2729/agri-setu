"use client";

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import MatchScore from "../MatchScore"
import type { AppNav } from "../nav"
import { useBuyerData } from "../data-context"
import { placeDirectOrder } from "@/lib/actions"

interface Props extends AppNav {
  produceId: string
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-border p-4 md:p-6">
      <h3 className="font-serif text-base md:text-lg font-medium text-forest mb-3 md:mb-4">{title}</h3>
      {children}
    </div>
  )
}

function InfoRow({ label, value, mono }: { label: string; value: string | number; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-sage">{label}</span>
      <span className={`text-sm font-medium text-forest ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  )
}

function ScoreBar({ label, score, detail }: { label: string; score: number; detail: string }) {
  const color = score >= 90 ? "#1B7A3D" : score >= 80 ? "#22A357" : score >= 70 ? "#E9A23B" : "#D94F4F"
  return (
    <div className="flex items-start gap-3 md:gap-4 py-2.5 border-b border-border last:border-0">
      <div className="w-20 md:w-28 shrink-0">
        <p className="text-sm font-medium text-forest">{label}</p>
        <p className="text-[11px] text-sage mt-0.5 leading-snug">{detail}</p>
      </div>
      <div className="flex-1 flex items-center gap-2 md:gap-3 mt-1">
        <div className="flex-1 h-1.5 bg-ivory-deeper rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, backgroundColor: color }} />
        </div>
        <span className="font-mono text-sm font-semibold w-6 text-right" style={{ color }}>{score}</span>
      </div>
    </div>
  )
}

export default function ProduceDetail({ navigate, produceId }: Props) {
  const { listings, buyerName, buyerVillage } = useBuyerData()
  const listing = listings.find((p) => p.id === produceId)
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [qty, setQty] = useState(Math.min(50, listing?.available ?? 50))
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [showMobileOrder, setShowMobileOrder] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [deliveryLocation, setDeliveryLocation] = useState(
    [buyerName, buyerVillage].filter(Boolean).join(", ") || "City Market"
  )
  const [activeTab, setActiveTab] = useState<"overview" | "traceability" | "compare">("overview")

  if (!listing) return null

  const subtotal = qty * listing.pricePerKg

  const handlePlaceOrder = () => {
    setOrderError(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.set("submission_id", listing.id)
      fd.set("quantity_kg", String(qty))
      fd.set("delivery_location", deliveryLocation)
      const result = await placeDirectOrder(fd)
      if (result.error) {
        setOrderError(result.error)
        return
      }
      setPlacedOrderId(result.orderId ?? null)
      setShowOrderModal(false)
      setShowMobileOrder(false)
      setOrderPlaced(true)
      router.refresh()
    })
  }

  if (orderPlaced) {
    return (
      <div className="max-w-lg mx-auto px-4 md:px-6 py-12 text-center fade-in">
        <div className="w-20 h-20 rounded-full bg-sage-pale flex items-center justify-center mx-auto mb-6">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path d="M7 18l8 8 14-16" stroke="#1B7A3D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="font-serif text-2xl md:text-3xl font-medium text-forest mb-2">Order placed successfully</h2>
        <p className="text-sage mb-6 text-sm">Your procurement is confirmed and on its way.</p>

        <div className="bg-white border border-border rounded-xl p-5 text-left mb-5">
          <div className="flex items-center gap-3 mb-4">
            <img src={listing.image} alt={listing.crop} className="w-14 h-14 rounded-lg object-cover bg-ivory-dark" />
            <div>
              <p className="font-semibold text-forest">{listing.crop} — Grade {listing.grade}</p>
            <p className="text-xs text-sage">Batch #{listing.batchId} · {listing.whiteStore.replace("White Store — ", "")}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-sage">Quantity</span><span className="font-mono text-forest">{qty.toLocaleString()} kg</span></div>
            <div className="flex justify-between"><span className="text-sage">Total</span><span className="font-mono font-semibold text-forest">₹{subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-sage">Est. delivery</span><span className="text-forest">2–3 days</span></div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-sage">Order <span className="font-mono font-medium text-forest-mid">#{placedOrderId ? placedOrderId.slice(0, 8).toUpperCase() : "placed"}</span></p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("my-orders")}
            className="flex-1 py-3 bg-forest-mid text-white font-medium rounded-xl hover:bg-forest-light transition-colors"
          >
            Track Order
          </button>
          <button
            onClick={() => navigate("marketplace")}
            className="flex-1 py-3 border border-border text-forest font-medium rounded-xl hover:bg-ivory-dark transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  const OrderPanel = ({ compact }: { compact?: boolean }) => (
    <div className={compact ? "" : "bg-white rounded-xl border border-border p-5 shadow-sm"}>
      {!compact && (
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="font-serif text-lg font-medium text-forest">Place Order</h3>
          <div>
            <span className="font-mono text-2xl font-semibold text-forest">₹{listing.pricePerKg}</span>
            <span className="text-xs text-sage">/kg</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-3 p-2.5 bg-sage-pale/40 rounded-lg">
        <span className="text-xs text-sage">Available</span>
        <span className="font-mono text-sm font-semibold text-forest-mid">{listing.available.toLocaleString()} kg</span>
      </div>

      <div className="mb-4">
        <label className="text-xs text-sage mb-1.5 block">Quantity (kg)</label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQty(Math.max(1, qty - 10))}
            className="w-9 h-9 rounded-lg bg-ivory-dark hover:bg-ivory-deeper flex items-center justify-center text-forest text-lg font-medium transition-colors"
          >
            −
          </button>
          <input
            type="number"
            value={qty}
            onChange={(e) => setQty(Math.min(listing.available, Math.max(1, Number(e.target.value))))}
            className="flex-1 text-center font-mono text-base font-semibold text-forest bg-ivory rounded-lg border border-border py-2 outline-none focus:border-forest-mid"
          />
          <button
            onClick={() => setQty(Math.min(listing.available, qty + 10))}
            className="w-9 h-9 rounded-lg bg-ivory-dark hover:bg-ivory-deeper flex items-center justify-center text-forest text-lg font-medium transition-colors"
          >
            +
          </button>
        </div>
      </div>

      <div className="space-y-2 mb-4 pb-4 border-b border-border">
        <div className="flex justify-between text-sm">
          <span className="text-sage">{qty.toLocaleString()} kg × ₹{listing.pricePerKg}</span>
          <span className="font-mono text-forest">₹{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-sage">Delivery</span>
          <span className="text-xs text-forest-mid">Calculated at checkout</span>
        </div>
      </div>

      <div className="flex justify-between items-baseline mb-4">
        <span className="text-sm text-sage">Subtotal</span>
        <span className="font-mono text-xl font-semibold text-forest">₹{subtotal.toLocaleString()}</span>
      </div>

      <p className="text-xs text-sage mb-4 flex items-center gap-1.5">
        <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
          <path d="M2 6.5l3 3 6-6" stroke="#5A7263" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        Estimated delivery: <strong className="text-forest ml-1">2–3 days</strong>
      </p>

      <button
        onClick={() => setShowOrderModal(true)}
        className="w-full py-3 bg-forest-mid hover:bg-forest-light text-white font-semibold rounded-xl transition-colors text-sm"
      >
        Place Order
      </button>
    </div>
  )

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-5 md:py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-sage mb-4 md:mb-6">
        <button onClick={() => navigate("marketplace")} className="hover:text-forest">Marketplace</button>
        <span>›</span>
        <span className="text-forest truncate">{listing.crop} Grade {listing.grade}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left content */}
        <div className="lg:col-span-2 space-y-4 md:space-y-5">
          {/* Hero card */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="relative h-56 md:h-72 bg-ivory-dark">
              <img src={listing.image} alt={listing.crop} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/40 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                <h1 className="font-serif text-2xl md:text-3xl font-medium text-white leading-tight">{listing.crop}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded-lg bg-white/20 backdrop-blur-sm text-white text-xs font-medium">Grade {listing.grade}</span>
                  <span className="px-2 py-0.5 rounded-lg bg-white/20 backdrop-blur-sm text-white text-xs hidden sm:inline">{listing.whiteStore.replace("White Store — ", "")}</span>
                  <span className="px-2 py-0.5 rounded-lg bg-white/20 backdrop-blur-sm text-white text-xs">{listing.distance} km away</span>
                </div>
              </div>
              <div className="absolute top-3 right-3">
                <div className="relative">
                  <MatchScore score={listing.matchScore} size="lg" showLabel breakdown={listing.scoreBreakdown} />
                  <div className="absolute inset-0 -z-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md" style={{ borderRadius: "50%" }} />
                </div>
              </div>
            </div>

            {/* Quick stats strip */}
            <div className="grid grid-cols-4 divide-x divide-border">
              {[
                { label: "Price", value: `₹${listing.pricePerKg}/kg`, mono: true },
                { label: "Available", value: `${(listing.available / 1000).toFixed(1)}t`, mono: true },
                { label: "Freshness", value: listing.freshness },
                { label: "Farmers", value: `${listing.farmersCount}` },
              ].map(({ label, value, mono }) => (
                <div key={label} className="p-2.5 md:p-4 text-center">
                  <p className="text-[10px] text-sage uppercase tracking-wide">{label}</p>
                  <p className={`text-xs md:text-sm font-semibold text-forest mt-0.5 ${mono ? "font-mono" : ""}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile inline order panel */}
          <div className="lg:hidden">
            <OrderPanel />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-ivory-dark rounded-xl p-1 overflow-x-auto scrollbar-hide">
            {(["overview", "traceability", "compare"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 whitespace-nowrap py-2 text-xs md:text-sm font-medium rounded-lg capitalize transition-all min-w-fit px-3 ${
                  activeTab === tab ? "bg-white text-forest shadow-sm" : "text-sage hover:text-forest"
                }`}
              >
                {tab === "compare" ? "Compare" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <div className="space-y-4">
              <Section title="Availability & Pricing">
                <InfoRow label="Available" value={`${listing.available.toLocaleString()} kg`} mono />
                <InfoRow label="Price" value={`₹${listing.pricePerKg}/kg`} mono />
                <InfoRow label="Available From" value={listing.availableFrom} />
                {listing.bulkPrices && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-sage mb-2">Bulk pricing</p>
                    {listing.bulkPrices.map((bp, i) => (
                      <div key={i} className="flex justify-between text-sm py-0.5">
                        <span className="text-sage">{bp.minQty.toLocaleString()}+ kg</span>
                        <span className="font-mono font-medium text-forest">₹{bp.price}/kg</span>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              <Section title="Quality">
                <InfoRow label="Grade" value={`Grade ${listing.grade}`} />
                <InfoRow label="Freshness" value={listing.freshness} />
                <InfoRow label="Inspection" value={listing.inspectionDate} />
                <InfoRow label="Collected" value={`${listing.collectedDaysAgo} days ago`} />
              </Section>

              <Section title="Match Score Breakdown">
                <div className="mb-4 flex items-center gap-3">
                  <MatchScore score={listing.matchScore} size="md" showLabel breakdown={listing.scoreBreakdown} />
                  <div>
                    <p className="font-medium text-forest text-sm">
                      {listing.matchScore >= 90 ? "Excellent match" : listing.matchScore >= 80 ? "Good match" : "Fair match"}
                    </p>
                    <p className="text-xs text-sage">for your active requirement</p>
                  </div>
                </div>
                <ScoreBar label="Price" score={listing.scoreBreakdown.price} detail={`₹${listing.pricePerKg}/kg`} />
                <ScoreBar label="Quality" score={listing.scoreBreakdown.quality} detail={`Grade ${listing.grade}`} />
                <ScoreBar label="Quantity" score={listing.scoreBreakdown.quantity} detail={`${listing.available.toLocaleString()} kg`} />
                <ScoreBar label="Location" score={listing.scoreBreakdown.location} detail={`${listing.distance} km away`} />
              </Section>
            </div>
          )}

          {activeTab === "traceability" && (
            <div className="space-y-4">
              <Section title="Where did this produce come from?">
                <div className="flex flex-col gap-0">
                  {[
                    { icon: "👨‍🌾", label: `${listing.farmersCount} Farmers`, detail: listing.region, desc: "Verified smallholder farms" },
                    { icon: "🏪", label: listing.whiteStore, detail: listing.city, desc: "Collection & inspection facility" },
                    { icon: "📦", label: `Batch #${listing.batchId}`, detail: `Grade ${listing.grade} · ${listing.available.toLocaleString()} kg`, desc: `Inspected ${listing.inspectionDate}` },
                    { icon: "🏢", label: "Your Order", detail: `${buyerName}${buyerVillage ? `, ${buyerVillage}` : ""}`, desc: "Delivered to your location" },
                  ].map((step, i, arr) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-9 h-9 rounded-full bg-sage-pale flex items-center justify-center text-base shrink-0">{step.icon}</div>
                        {i < arr.length - 1 && <div className="w-px flex-1 bg-border my-1" style={{ minHeight: "16px" }} />}
                      </div>
                      <div className="pb-4">
                        <p className="font-medium text-forest text-sm">{step.label}</p>
                        <p className="text-xs text-forest-mid font-mono">{step.detail}</p>
                        <p className="text-xs text-sage">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
              <div className="bg-sage-pale/50 border border-sage-light/50 rounded-xl p-4 flex gap-3">
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" className="shrink-0 mt-0.5 text-forest-mid">
                  <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M9 5v5M9 13h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-forest-mid">Scan QR on delivery</p>
                  <p className="text-xs text-sage mt-0.5">Verify origin and batch details when your order arrives.</p>
                  <button onClick={() => navigate("qr-verify")} className="mt-1.5 text-xs font-medium text-forest-mid">
                    Preview verification →
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "compare" && (
            <Section title="Compare similar listings">
              <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
                <table className="w-full text-sm min-w-[500px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs text-sage font-medium py-2 pr-4">Produce</th>
                      <th className="text-center text-xs text-sage font-medium py-2 px-2">Score</th>
                      <th className="text-center text-xs text-sage font-medium py-2 px-2">Price</th>
                      <th className="text-center text-xs text-sage font-medium py-2 px-2">Grade</th>
                      <th className="text-center text-xs text-sage font-medium py-2 px-2">Qty</th>
                      <th className="text-center text-xs text-sage font-medium py-2 pl-2">Dist.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.filter((p) => p.crop === listing.crop).slice(0, 3).map((p) => (
                      <tr
                        key={p.id}
                        className={`border-b border-border cursor-pointer transition-colors ${p.id === listing.id ? "bg-sage-pale/40" : "hover:bg-ivory"}`}
                        onClick={() => p.id !== listing.id && navigate("produce-detail", p.id)}
                      >
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <img src={p.image} alt={p.crop} className="w-8 h-8 rounded-lg object-cover bg-ivory-dark" />
                            <div>
                              <p className="font-medium text-forest text-sm">{p.crop}</p>
                              <p className="text-[11px] text-sage">{p.city}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-center py-3 px-2">
                          <span className={`font-mono font-semibold text-sm ${p.matchScore >= 90 ? "text-forest-mid" : p.matchScore >= 80 ? "text-lime-dark" : "text-gold"}`}>
                            {p.matchScore}
                          </span>
                        </td>
                        <td className="text-center py-3 px-2 font-mono font-medium text-forest">₹{p.pricePerKg}</td>
                        <td className="text-center py-3 px-2 text-forest">{p.grade}</td>
                        <td className="text-center py-3 px-2 font-mono text-forest text-xs">{(p.available / 1000).toFixed(1)}t</td>
                        <td className="text-center py-3 pl-2 text-forest">{p.distance}km</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}
        </div>

        {/* Desktop sticky order panel */}
        <div className="lg:col-span-1 hidden lg:block">
          <div className="sticky top-24">
            <OrderPanel />
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 z-20 px-4 pb-3"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}>
        <div className="bg-white border border-border rounded-2xl shadow-xl px-5 py-3 flex items-center gap-3">
          <div>
            <p className="text-xs text-sage leading-none">Price</p>
            <div className="flex items-baseline gap-0.5">
              <span className="font-mono text-xl font-semibold text-forest">₹{listing.pricePerKg}</span>
              <span className="text-xs text-sage">/kg</span>
            </div>
          </div>
          <div className="h-8 w-px bg-border mx-1" />
          <div>
            <p className="text-xs text-sage leading-none">Subtotal</p>
            <span className="font-mono text-base font-semibold text-forest">₹{subtotal.toLocaleString()}</span>
          </div>
          <button
            onClick={() => setShowMobileOrder(true)}
            className="flex-1 ml-2 py-3 bg-forest-mid text-white font-semibold rounded-xl text-sm hover:bg-forest-light transition-colors"
          >
            Place Order
          </button>
        </div>
      </div>

      {/* Mobile order sheet */}
      {showMobileOrder && (
        <>
          <div className="fixed inset-0 bg-forest/40 backdrop-blur-sm z-40" onClick={() => setShowMobileOrder(false)} />
          <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl slide-up">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-serif text-lg font-medium text-forest">Place Order</h3>
              <button onClick={() => setShowMobileOrder(false)} className="text-sage hover:text-forest p-1">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="px-5 py-4">
              <OrderPanel compact />
            </div>
          </div>
        </>
      )}

      {/* Desktop Order confirmation modal */}
      {showOrderModal && (
        <>
          <div className="fixed inset-0 bg-forest/40 backdrop-blur-sm z-40" onClick={() => setShowOrderModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl border border-border shadow-2xl w-full max-w-md p-6 slide-up">
              <h3 className="font-serif text-xl font-medium text-forest mb-1">Confirm your order</h3>
              <p className="text-sm text-sage mb-5">Review before placing.</p>
              <div className="bg-ivory-dark rounded-xl p-4 mb-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-sage">Produce</span><span className="font-medium text-forest">{listing.crop} Grade {listing.grade}</span></div>
                <div className="flex justify-between"><span className="text-sage">Quantity</span><span className="font-mono text-forest">{qty.toLocaleString()} kg</span></div>
                <div className="flex justify-between"><span className="text-sage">Price</span><span className="font-mono text-forest">₹{listing.pricePerKg}/kg</span></div>
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="font-medium text-forest">Total</span>
                  <span className="font-mono font-semibold text-forest text-lg">₹{subtotal.toLocaleString()}</span>
                </div>
              </div>
              <div className="mb-4">
                <label className="text-xs text-sage mb-1.5 block">Delivery location</label>
                <input
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-ivory border border-border rounded-lg outline-none focus:border-forest-mid text-forest"
                />
              </div>
              {orderError && <p className="text-sm text-amber mb-3">{orderError}</p>}
              <div className="flex gap-3">
                <button onClick={() => setShowOrderModal(false)} className="flex-1 py-3 border border-border text-forest rounded-xl text-sm font-medium hover:bg-ivory">Cancel</button>
                <button onClick={handlePlaceOrder} disabled={pending} className="flex-1 py-3 bg-forest-mid text-white rounded-xl text-sm font-semibold hover:bg-forest-light disabled:opacity-60">{pending ? "Placing…" : "Confirm Order"}</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
