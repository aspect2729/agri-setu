"use client";

import { useState } from "react";
import { signOut } from "@/lib/actions";
import { useBuyerData } from "./data-context";
import type { AppNav, NavView } from "./nav";
import Marketplace from "./views/Marketplace";
import ProduceDetail from "./views/ProduceDetail";
import PostDemand from "./views/PostDemand";
import MyOrders from "./views/MyOrders";
import OrderTracking from "./views/OrderTracking";
import QRVerify from "./views/QRVerify";
import ClearanceDeals from "./views/ClearanceDeals";
import Account from "./views/Account";
import { BrandLogo } from "@/components/brand-logo";

const NAV_ITEMS: { id: NavView; label: string; icon: React.ReactNode; activeIcon: React.ReactNode }[] = [
  {
    id: "marketplace",
    label: "Market",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 9.5L11 3l8 6.5V19a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M8 20v-7h6v7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    activeIcon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 9.5L11 3l8 6.5V19a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fillOpacity="0.15" />
        <path d="M8 20v-7h6v7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "post-demand",
    label: "Demand",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="4" y="4" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11 8v6M8 11h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    activeIcon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="4" y="4" width="14" height="14" rx="2" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11 8v6M8 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "my-orders",
    label: "Orders",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M4 6h14M4 11h14M4 16h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    activeIcon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M4 6h14M4 11h14M4 16h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "clearance",
    label: "Deals",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 11h6M11 8v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8.5 8.5l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    activeIcon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8.5 8.5l5 5M13.5 8.5l-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "account",
    label: "Account",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 19c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    activeIcon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="8" r="3.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 19c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];

const DESKTOP_NAV: { id: NavView; label: string }[] = [
  { id: "marketplace", label: "Marketplace" },
  { id: "post-demand", label: "Demand" },
  { id: "my-orders", label: "Orders" },
  { id: "clearance", label: "Clearance" },
  { id: "qr-verify", label: "Verify" },
  { id: "account", label: "Account" },
];

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "AS";
}

export function BuyerApp() {
  const { buyerName, buyerVillage, orders, notifications } = useBuyerData();
  const [view, setView] = useState<NavView>("marketplace");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [search, setSearch] = useState("");

  const unreadCount = notifications.filter((n) => n.unread).length;
  const activeOrderCount = orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled").length;
  const mark = initials(buyerName);
  const navHighlight: NavView =
    view === "produce-detail" ? "marketplace" : view === "order-tracking" ? "my-orders" : view;

  const navigate = (targetView: NavView, id?: string) => {
    setView(targetView);
    setSelectedId(id ?? null);
    setShowNotifications(false);
    setShowUserMenu(false);
    setShowMobileSearch(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navProps: AppNav = { navigate, currentView: view };

  return (
    <div className="buyer-shell min-h-dvh bg-ivory flex flex-col overflow-x-hidden">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-8">
          <div className="flex items-center h-14 md:h-[72px] gap-3 md:gap-8">
            <button onClick={() => navigate("marketplace")} className="flex items-center shrink-0">
              <BrandLogo size={44} />
            </button>

            <nav className="hidden md:flex items-center gap-1 flex-1">
              {DESKTOP_NAV.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`relative px-3 lg:px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    navHighlight === item.id
                      ? "bg-forest-mid text-white"
                      : "text-sage hover:text-forest hover:bg-ivory-dark"
                  }`}
                >
                  {item.label}
                  {item.id === "my-orders" && activeOrderCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                      {activeOrderCount}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-1 md:gap-2 ml-auto">
              <button
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="md:hidden p-2 text-sage hover:text-forest rounded-lg transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M13 13l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>

              <div className="relative">
                <button
                  onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
                  className="relative p-2 text-sage hover:text-forest hover:bg-ivory-dark rounded-lg transition-all"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M9 2a5 5 0 0 1 5 5v3l1.5 2H2.5L4 10V7a5 5 0 0 1 5-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M7 13.5a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber rounded-full" />
                  )}
                </button>

                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setShowNotifications(false)} />
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-border shadow-xl z-30 overflow-hidden slide-up">
                      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                        <h3 className="font-medium text-forest text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="text-xs bg-amber text-white px-2 py-0.5 rounded-full font-medium">{unreadCount} new</span>
                        )}
                      </div>
                      <div className="divide-y divide-border max-h-72 overflow-y-auto">
                        {notifications.length === 0 && (
                          <p className="px-4 py-8 text-center text-xs text-sage">No notifications yet.</p>
                        )}
                        {notifications.map((n) => (
                          <div key={n.id} className={`px-4 py-3 flex gap-3 hover:bg-ivory transition-colors ${n.unread ? "bg-sage-pale/30" : ""}`}>
                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.unread ? "bg-forest-mid" : "bg-transparent"}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-forest leading-relaxed">{n.text}</p>
                              <p className="text-[11px] text-sage mt-0.5">{n.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
                  className="flex items-center gap-1.5 pl-1 pr-2 py-1 hover:bg-ivory-dark rounded-lg transition-all"
                >
                  <div className="w-7 h-7 bg-forest-mid rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {mark}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-medium text-forest leading-none">{buyerName}</p>
                    <p className="text-[10px] text-sage leading-none mt-0.5">Buyer</p>
                  </div>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="hidden md:block text-sage">
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-border shadow-xl z-30 overflow-hidden slide-up">
                      <div className="px-4 py-3 border-b border-border md:hidden">
                        <p className="font-medium text-forest text-sm">{buyerName}</p>
                        <p className="text-xs text-sage">Buyer · {buyerVillage ?? "Agri Setu"}</p>
                      </div>
                      {[
                        { label: "My Account", view: "account" as NavView },
                        { label: "My Orders", view: "my-orders" as NavView },
                        { label: "Verify Produce", view: "qr-verify" as NavView },
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={() => { navigate(item.view); setShowUserMenu(false); }}
                          className="w-full px-4 py-2.5 text-sm text-left text-forest hover:bg-ivory transition-colors"
                        >
                          {item.label}
                        </button>
                      ))}
                      <div className="border-t border-border">
                        <form action={signOut}>
                          <button type="submit" className="w-full px-4 py-2.5 text-sm text-left text-error hover:bg-error-light transition-colors">
                            Sign Out
                          </button>
                        </form>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {showMobileSearch && (
          <div className="px-4 pb-3 border-t border-border/50">
            <div className="relative mt-2">
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-sage">
                <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M13 13l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search produce, orders, batches..."
                className="w-full pl-9 pr-3 py-2.5 bg-ivory border border-border rounded-xl text-sm text-forest placeholder:text-sage outline-none focus:border-forest-mid"
              />
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 pb-20 md:pb-8 min-w-0">
        {view === "marketplace" && <Marketplace {...navProps} />}
        {view === "produce-detail" && selectedId && (
          <ProduceDetail {...navProps} produceId={selectedId} />
        )}
        {view === "post-demand" && <PostDemand {...navProps} />}
        {view === "my-orders" && (
          <MyOrders {...navProps} onSelectOrder={(id) => navigate("order-tracking", id)} />
        )}
        {view === "order-tracking" && selectedId && (
          <OrderTracking {...navProps} orderId={selectedId} onVerify={() => navigate("qr-verify")} />
        )}
        {view === "qr-verify" && <QRVerify {...navProps} />}
        {view === "clearance" && <ClearanceDeals {...navProps} />}
        {view === "account" && <Account {...navProps} />}
      </main>

      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-20"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex">
          {NAV_ITEMS.map((item) => {
            const isActive = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors relative ${
                  isActive ? "text-forest-mid" : "text-sage"
                }`}
              >
                {item.id === "my-orders" && activeOrderCount > 0 && (
                  <span className="absolute top-1.5 right-1/2 translate-x-4 w-4 h-4 bg-amber text-white text-[9px] rounded-full flex items-center justify-center font-bold z-10">
                    {activeOrderCount}
                  </span>
                )}
                {isActive ? item.activeIcon : item.icon}
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-forest-mid rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
