"use client";

import { useBuyerData } from "../data-context"
import type { AppNav } from "../nav"

interface Props extends AppNav {
  orderId: string
  onVerify: () => void
}

export default function OrderTracking({ navigate, orderId, onVerify }: Props) {
  const { orders } = useBuyerData()
  const order = orders.find((o) => o.id === orderId || o.rawId === orderId)

  if (!order) {
    return (
      <div className="max-w-screen-md mx-auto px-4 py-16 text-center">
        <p className="text-sage text-sm mb-3">No order selected.</p>
        <button onClick={() => navigate("my-orders")} className="text-forest-mid text-sm font-medium">Back to orders</button>
      </div>
    )
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-5 md:py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-sage mb-4 md:mb-6">
        <button onClick={() => navigate("my-orders")} className="hover:text-forest">My Orders</button>
        <span>›</span>
        <span className="font-mono text-forest">#{order.id}</span>
      </div>

      {/* Mobile — stacked. Desktop — 3-col grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Left: Order + timeline */}
        <div className="md:col-span-2 space-y-4">
          {/* Order header */}
          <div className="bg-white rounded-xl border border-border p-4 md:p-5">
            <div className="flex gap-3 items-center">
              <img src={order.image} alt={order.crop} className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover bg-ivory-dark shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-mono text-sage">#{order.id}</p>
                <h2 className="font-serif text-lg md:text-xl font-medium text-forest truncate">
                  {order.crop} — Grade {order.grade}
                </h2>
                <p className="text-xs text-sage truncate">{order.whiteStore}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border">
              <div>
                <p className="text-[11px] text-sage">Quantity</p>
                <p className="font-mono font-semibold text-forest text-base">{order.quantity.toLocaleString()} kg</p>
              </div>
              <div>
                <p className="text-[11px] text-sage">Total</p>
                <p className="font-mono font-semibold text-forest text-base">₹{order.total.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[11px] text-sage">Expected</p>
                <p className="font-semibold text-forest text-sm">{order.deliveryDate}</p>
              </div>
            </div>
          </div>

          {/* Status highlight */}
          {order.status === "out-for-delivery" && (
            <div className="bg-amber-pale border border-amber/20 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber/20 flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M2 10h14M12 6l4 4-4 4" stroke="#E9A23B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-amber text-sm">Out for delivery</p>
                <p className="text-xs text-amber/70">Expected today · {order.deliveryLocation}</p>
              </div>
            </div>
          )}

          {order.status === "delivered" && (
            <div className="bg-sage-pale border border-sage-light/50 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-forest-mid/15 flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10l5 5 8-9" stroke="#1B7A3D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-forest-mid text-sm">Delivered successfully</p>
                <p className="text-xs text-sage">{order.deliveryDate} · {order.deliveryLocation}</p>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-border p-4 md:p-5">
            <h3 className="font-medium text-forest mb-4 text-sm">Order Timeline</h3>
            <div className="space-y-0">
              {order.trackingSteps.map((step, i) => {
                const isLast = i === order.trackingSteps.length - 1
                return (
                  <div key={i} className="flex gap-3 md:gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        step.completed ? "bg-forest-mid" : step.current ? "bg-amber" : "bg-ivory-deeper border-2 border-border"
                      }`}>
                        {step.completed ? (
                          <svg width="12" height="10" viewBox="0 0 14 12" fill="none">
                            <path d="M1.5 6l4 4.5 7-9" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : step.current ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-border-dark" />
                        )}
                      </div>
                      {!isLast && (
                        <div className={`w-px flex-1 my-1 ${step.completed ? "bg-forest-mid" : "bg-border"}`} style={{ minHeight: "20px" }} />
                      )}
                    </div>

                    <div className={`pb-4 flex-1 ${isLast ? "pb-0" : ""}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`font-medium text-sm ${step.current ? "text-amber" : step.completed ? "text-forest" : "text-sage"}`}>
                            {step.step}
                            {step.current && (
                              <span className="ml-1.5 text-[10px] bg-amber/15 text-amber px-1.5 py-0.5 rounded font-normal">Now</span>
                            )}
                          </p>
                          {step.current && order.status === "out-for-delivery" && (
                            <p className="text-xs text-sage mt-0.5">{order.deliveryLocation}</p>
                          )}
                        </div>
                        <p className="text-[11px] text-sage font-mono shrink-0">{step.time}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: Actions + batch info */}
        <div className="space-y-3">
          <div className="bg-white rounded-xl border border-border p-4">
            <h3 className="font-medium text-forest mb-3 text-sm">Actions</h3>
            <div className="space-y-2">
              <button
                onClick={onVerify}
                className="w-full py-2.5 flex items-center justify-center gap-2 bg-forest-mid text-white text-sm font-medium rounded-xl hover:bg-forest-light transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="2" width="5" height="5" rx="0.5" stroke="white" strokeWidth="1.3" />
                  <rect x="9" y="2" width="5" height="5" rx="0.5" stroke="white" strokeWidth="1.3" />
                  <rect x="2" y="9" width="5" height="5" rx="0.5" stroke="white" strokeWidth="1.3" />
                  <rect x="11" y="11" width="3" height="3" rx="0.5" fill="white" />
                </svg>
                Scan QR / Verify
              </button>
              <button onClick={() => navigate("my-orders")} className="w-full py-2.5 border border-border text-forest text-sm rounded-xl hover:bg-ivory transition-colors">
                ← Back to Orders
              </button>
              <button className="w-full py-2.5 border border-border text-sage text-sm rounded-xl hover:bg-ivory transition-colors">
                Download Invoice
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-4">
            <h3 className="font-medium text-forest mb-3 text-sm">Batch</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-sage">Batch ID</span><span className="font-mono font-medium text-forest">#{order.batchId}</span></div>
              <div className="flex justify-between"><span className="text-sage">White Store</span><span className="text-forest text-right">{order.whiteStore.replace("White Store — ", "")}</span></div>
              <div className="flex justify-between"><span className="text-sage">Grade</span><span className="text-forest">Grade {order.grade}</span></div>
              <div className="flex justify-between"><span className="text-sage">Delivering to</span><span className="text-forest text-right leading-tight max-w-24">{order.deliveryLocation}</span></div>
            </div>
          </div>

          <div className="bg-sage-pale/40 border border-sage-light/30 rounded-xl p-4">
            <p className="text-[11px] font-semibold text-sage uppercase tracking-wide mb-3">Supply Chain</p>
            <div className="space-y-2.5">
              {["Farmers", "White Store", `Batch #${order.batchId}`, "Your business"].map((step, i, arr) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="flex flex-col items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-forest-mid mt-0.5 shrink-0" />
                    {i < arr.length - 1 && <div className="w-px flex-1 bg-border my-1" style={{ minHeight: "10px" }} />}
                  </div>
                  <span className="text-xs text-forest pb-2 last:pb-0">{step}</span>
                </div>
              ))}
            </div>
            <button onClick={onVerify} className="mt-2 text-xs text-forest-mid hover:text-forest font-medium">
              Verify with QR →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
