"use client";

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import MatchScore from "../MatchScore"
import type { AppNav } from "../nav"
import { useBuyerData } from "../data-context"
import type { BuyerOrder } from "../types"
import { confirmReceipt } from "@/lib/actions"

interface Props extends AppNav {
  onSelectOrder: (id: string) => void
}

const STATUS_CONFIG: Record<BuyerOrder["status"], { label: string; bg: string; text: string; dot: string }> = {
  placed: { label: "Placed", bg: "bg-gold-pale", text: "text-gold", dot: "bg-gold" },
  confirmed: { label: "Confirmed", bg: "bg-sage-pale", text: "text-sage", dot: "bg-sage" },
  packed: { label: "Packed", bg: "bg-sage-pale", text: "text-sage", dot: "bg-sage" },
  dispatched: { label: "Dispatched", bg: "bg-lime-pale", text: "text-lime-dark", dot: "bg-lime" },
  "out-for-delivery": { label: "Out for delivery", bg: "bg-amber-pale", text: "text-amber", dot: "bg-amber" },
  delivered: { label: "Delivered", bg: "bg-sage-pale", text: "text-forest-mid", dot: "bg-forest-mid" },
  cancelled: { label: "Cancelled", bg: "bg-ivory-deeper", text: "text-sage", dot: "bg-border-dark" },
}

function StatusBadge({ status }: { status: BuyerOrder["status"] }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${status === "out-for-delivery" ? "animate-pulse" : ""}`} />
      {cfg.label}
    </span>
  )
}

function OrderCard({ order, onTrack }: { order: BuyerOrder; onTrack: () => void }) {
  const isActive = !["delivered", "cancelled"].includes(order.status)

  return (
    <div className="bg-white rounded-xl border border-border p-4 md:p-5 transition-all hover:shadow-sm">
      <div className="flex gap-3 md:gap-4">
        <img src={order.image} alt={order.crop} className="w-16 h-16 rounded-xl object-cover bg-ivory-dark shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <p className="text-[11px] font-mono text-sage">#{order.id}</p>
              <h3 className="font-semibold text-forest text-sm md:text-base">{order.crop} — Grade {order.grade}</h3>
              <p className="text-xs text-sage truncate">{order.whiteStore}</p>
            </div>
            <div className="flex items-start gap-2 shrink-0">
              <div className="hidden sm:block">
                <MatchScore score={order.matchScore} size="sm" showLabel={false} interactive={false} />
              </div>
              <StatusBadge status={order.status} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs mb-3">
            <span className="text-sage">
              <span className="font-mono font-medium text-forest">{order.quantity.toLocaleString()} kg</span>
            </span>
            <span className="text-sage">
              <span className="font-mono font-medium text-forest">₹{order.total.toLocaleString()}</span>
            </span>
            <span className="text-sage hidden md:inline">{order.orderDate}</span>
            {order.status === "delivered" && (
              <span className="text-sage">Delivered {order.deliveryDate}</span>
            )}
            {isActive && (
              <span className="text-sage">Expected {order.deliveryDate}</span>
            )}
          </div>

          {isActive && order.status === "out-for-delivery" && (
            <div className="flex items-center gap-1.5 text-xs text-amber mb-3 bg-amber-pale/50 px-2.5 py-1.5 rounded-lg w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
              Out for delivery · expected today
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {isActive && (
              <button
                onClick={onTrack}
                className="px-3 py-1.5 bg-forest-mid text-white text-xs font-medium rounded-lg hover:bg-forest-light transition-colors"
              >
                Track Order →
              </button>
            )}
            <button
              onClick={onTrack}
              className="px-3 py-1.5 border border-border text-forest text-xs font-medium rounded-lg hover:bg-ivory transition-colors"
            >
              View Details
            </button>
            {order.status === "delivered" && (
              <button className="px-3 py-1.5 border border-border text-sage text-xs font-medium rounded-lg hover:bg-ivory transition-colors">
                Reorder
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const TABS = ["All", "Active", "Dispatched", "Delivered", "Cancelled"] as const
type TabType = typeof TABS[number]

export default function MyOrders({ navigate, onSelectOrder }: Props) {
  const { orders } = useBuyerData()
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<TabType>("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [showConfirmModal, setShowConfirmModal] = useState<string | null>(null)
  const [showIssueModal, setShowIssueModal] = useState<string | null>(null)
  const [issueType, setIssueType] = useState("")
  const [confirmedOrders, setConfirmedOrders] = useState<string[]>([])
  const [reportedIssues, setReportedIssues] = useState<string[]>([])

  const tabCounts: Record<TabType, number> = {
    All: orders.length,
    Active: orders.filter((o) => ["placed", "confirmed", "packed"].includes(o.status)).length,
    Dispatched: orders.filter((o) => ["dispatched", "out-for-delivery"].includes(o.status)).length,
    Delivered: orders.filter((o) => o.status === "delivered").length,
    Cancelled: orders.filter((o) => o.status === "cancelled").length,
  }

  const filtered = orders.filter((o) => {
    const matchesTab =
      activeTab === "All" ||
      (activeTab === "Active" && ["placed", "confirmed", "packed"].includes(o.status)) ||
      (activeTab === "Dispatched" && ["dispatched", "out-for-delivery"].includes(o.status)) ||
      (activeTab === "Delivered" && o.status === "delivered") ||
      (activeTab === "Cancelled" && o.status === "cancelled")
    const matchesSearch =
      !searchQuery ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.crop.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const deliveredOrder = showConfirmModal ? orders.find((o) => o.id === showConfirmModal) : null

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-5 md:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-medium text-forest">My Orders</h1>
          <p className="text-sage mt-0.5 text-xs md:text-sm">
            {orders.length} orders · {orders.filter((o) => !["delivered", "cancelled"].includes(o.status)).length} active
          </p>
        </div>
        <button
          onClick={() => navigate("marketplace")}
          className="px-3 py-2 md:px-4 md:py-2.5 bg-forest-mid text-white text-xs md:text-sm font-medium rounded-xl hover:bg-forest-light transition-colors"
        >
          Browse
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-sage">
          <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M11.5 11.5l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          placeholder="Search order ID or crop..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm text-forest placeholder:text-sage outline-none focus:border-forest-mid"
        />
      </div>

      {/* Tabs — horizontal scroll on mobile */}
      <div className="mb-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-1 bg-ivory-dark rounded-xl p-1 w-fit min-w-full md:w-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-lg whitespace-nowrap transition-all flex items-center gap-1 ${
                activeTab === tab ? "bg-white text-forest shadow-sm" : "text-sage hover:text-forest"
              }`}
            >
              {tab}
              <span className={`text-[10px] font-mono ${activeTab === tab ? "text-sage" : "text-sage/50"}`}>
                {tabCounts[tab]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Orders */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-ivory-dark flex items-center justify-center mb-3">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
              <path d="M6 8h16M6 14h10M6 20h8" stroke="#5A7263" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <h3 className="font-serif text-xl font-medium text-forest mb-2">No orders here</h3>
          <p className="text-sage text-sm max-w-xs">
            {activeTab === "All" ? "Browse the marketplace to place your first order." : `No ${activeTab.toLowerCase()} orders.`}
          </p>
          {activeTab === "All" && (
            <button onClick={() => navigate("marketplace")} className="mt-4 px-5 py-2.5 bg-forest-mid text-white text-sm rounded-xl">
              Browse Marketplace
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5 md:space-y-3">
          {filtered.map((order) => (
            <div key={order.id} className="space-y-2">
              <OrderCard
                order={order}
                onTrack={() => onSelectOrder(order.id)}
              />
              {(order.status === "out-for-delivery" || order.status === "delivered") && !confirmedOrders.includes(order.id) && !reportedIssues.includes(order.id) && (
                <div className="ml-4 flex gap-2">
                  <button
                    onClick={() => setShowConfirmModal(order.id)}
                    className="px-3 py-1.5 bg-sage-pale text-forest-mid text-xs font-medium rounded-lg border border-sage-light/50 hover:bg-sage-pale/70"
                  >
                    Confirm Delivery
                  </button>
                  <button
                    onClick={() => setShowIssueModal(order.id)}
                    className="px-3 py-1.5 border border-border text-sage text-xs font-medium rounded-lg hover:bg-ivory"
                  >
                    Report Issue
                  </button>
                </div>
              )}
              {confirmedOrders.includes(order.id) && (
                <div className="ml-4 flex items-center gap-1.5 text-xs text-forest-mid">
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" fill="#1B7A3D" fillOpacity="0.15" />
                    <path d="M4 7l2.5 2.5 3.5-4" stroke="#1B7A3D" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                  Delivery confirmed
                </div>
              )}
              {reportedIssues.includes(order.id) && (
                <div className="ml-4 flex items-center gap-1.5 text-xs text-amber">
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" stroke="#E9A23B" strokeWidth="1.2" />
                    <path d="M7 4v4M7 10h.01" stroke="#E9A23B" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  Issue reported — we will contact you
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Confirm Delivery Modal */}
      {showConfirmModal && deliveredOrder && (
        <>
          <div className="fixed inset-0 bg-forest/40 backdrop-blur-sm z-40" onClick={() => setShowConfirmModal(null)} />
          <div className="fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center p-0 md:p-6 z-50">
            <div className="bg-white rounded-t-2xl md:rounded-2xl border border-border shadow-2xl w-full md:max-w-sm p-5 md:p-6 slide-up">
              <h3 className="font-serif text-xl font-medium text-forest mb-2">Confirm delivery</h3>
              <p className="text-sm text-sage mb-4">
                Confirm that you received{" "}
                <strong className="text-forest">{deliveredOrder.quantity.toLocaleString()} kg of Grade {deliveredOrder.grade} {deliveredOrder.crop}</strong>?
              </p>
              <div className="bg-ivory-dark rounded-xl p-3 mb-5 text-xs space-y-1.5">
                <div className="flex justify-between"><span className="text-sage">Order</span><span className="font-mono text-forest">#{deliveredOrder.id}</span></div>
                <div className="flex justify-between"><span className="text-sage">From</span><span className="text-forest">{deliveredOrder.whiteStore.replace("White Store — ", "")}</span></div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirmModal(null)} className="flex-1 py-3 border border-border text-forest text-sm rounded-xl hover:bg-ivory">Cancel</button>
                <button
                  onClick={() => {
                    const target = orders.find((o) => o.id === showConfirmModal)
                    startTransition(async () => {
                      if (target) await confirmReceipt(target.rawId)
                      setConfirmedOrders((p) => [...p, showConfirmModal!])
                      setShowConfirmModal(null)
                      router.refresh()
                    })
                  }}
                  disabled={pending}
                  className="flex-1 py-3 bg-forest-mid text-white text-sm font-semibold rounded-xl hover:bg-forest-light"
                >
                  Confirm Delivery
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Issue Report Modal */}
      {showIssueModal && (
        <>
          <div className="fixed inset-0 bg-forest/40 backdrop-blur-sm z-40" onClick={() => setShowIssueModal(null)} />
          <div className="fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center p-0 md:p-6 z-50">
            <div className="bg-white rounded-t-2xl md:rounded-2xl border border-border shadow-2xl w-full md:max-w-sm p-5 slide-up">
              <h3 className="font-serif text-xl font-medium text-forest mb-2">Report an issue</h3>
              <div className="space-y-1.5 mb-4">
                {["Quantity mismatch", "Quality issue", "Damaged produce", "Wrong produce", "Late delivery", "Other"].map((type) => (
                  <label key={type} className="flex items-center gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-ivory">
                    <div
                      className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${issueType === type ? "border-forest-mid" : "border-border"}`}
                      onClick={() => setIssueType(type)}
                    >
                      {issueType === type && <div className="w-2 h-2 rounded-full bg-forest-mid" />}
                    </div>
                    <span className="text-sm text-forest">{type}</span>
                  </label>
                ))}
              </div>
              <textarea rows={2} placeholder="Add notes..." className="w-full px-3 py-2.5 bg-ivory border border-border rounded-xl text-sm text-forest outline-none focus:border-forest-mid resize-none mb-4" />
              <div className="flex gap-3">
                <button onClick={() => setShowIssueModal(null)} className="flex-1 py-3 border border-border text-forest text-sm rounded-xl hover:bg-ivory">Cancel</button>
                <button
                  disabled={!issueType}
                  onClick={() => { setReportedIssues((p) => [...p, showIssueModal!]); setShowIssueModal(null); setIssueType("") }}
                  className="flex-1 py-3 bg-amber text-white text-sm font-semibold rounded-xl disabled:opacity-40"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
