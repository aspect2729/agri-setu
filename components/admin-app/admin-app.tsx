"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard, Store, ArrowLeftRight, Package, Archive,
  Users, BarChart3, Bell, LogOut, Search, X,
  ChevronRight, DollarSign, AlertTriangle, Info, ChevronsRight, Receipt, Radio
} from "lucide-react";
import { signOut } from "@/lib/actions";
import { useAdminData } from "./data-context";
import type { Page, NavContext } from "./nav";
import Dashboard from "./pages/Dashboard";
import WhiteStores from "./pages/WhiteStores";
import Transactions from "./pages/Transactions";
import CashFlow from "./pages/CashFlow";
import Matching from "./pages/Matching";
import Orders from "./pages/Orders";
import Inventory from "./pages/Inventory";
import UsersPage from "./pages/UsersPage";
import Reports from "./pages/Reports";
import SimulatedNetwork from "./pages/SimulatedNetwork";
import { BrandLogo } from "@/components/brand-logo";

const navItems = [
  { id: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
  { id: "stores" as Page, label: "White Stores", icon: Store },
  { id: "transactions" as Page, label: "Transactions", icon: Receipt },
  { id: "cashflow" as Page, label: "Cash Flow", icon: DollarSign },
  { id: "matching" as Page, label: "Matching", icon: ArrowLeftRight },
  { id: "orders" as Page, label: "Orders", icon: Package },
  { id: "inventory" as Page, label: "Inventory", icon: Archive },
  { id: "users" as Page, label: "Users", icon: Users },
  { id: "reports" as Page, label: "Reports", icon: BarChart3 },
  { id: "simulated" as Page, label: "Simulated data", icon: Radio },
];

type SearchResult = {
  category: string;
  icon: string;
  title: string;
  subtitle: string;
  page: Page;
  params?: Record<string, string>;
};

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "AS";
}

function groupBy<T extends Record<string, unknown>>(arr: T[], key: string): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = String(item[key] ?? "");
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

function SearchModal({
  onClose,
  onNavigate,
}: {
  onClose: () => void;
  onNavigate: (page: Page, params?: Record<string, string>) => void;
}) {
  const { farmers, stores, orders, transactions } = useAdminData();
  const [query, setQuery] = useState("");

  const results: SearchResult[] = [];
  if (query.length >= 2) {
    const lower = query.toLowerCase();
    farmers.filter((f) => f.name.toLowerCase().includes(lower) || f.phone.includes(lower)).slice(0, 3).forEach((f) => {
      results.push({
        category: "Farmers",
        icon: "🌾",
        title: f.name,
        subtitle: `${f.village} · Farmer`,
        page: "users",
        params: { tab: "farmers", userId: f.id },
      });
    });
    stores.filter((s) => s.name.toLowerCase().includes(lower) || s.location.toLowerCase().includes(lower)).slice(0, 3).forEach((s) => {
      results.push({
        category: "White Stores",
        icon: "🏪",
        title: s.name,
        subtitle: `${s.location} · ${s.status}`,
        page: "stores",
        params: { storeId: s.id },
      });
    });
    orders.filter((o) => o.id.toLowerCase().includes(lower) || o.buyerName.toLowerCase().includes(lower)).slice(0, 2).forEach((o) => {
      results.push({
        category: "Orders",
        icon: "📦",
        title: o.id,
        subtitle: `${o.buyerName} · ${o.crop} ${o.quantity}kg`,
        page: "orders",
        params: { orderId: o.id },
      });
    });
    transactions.filter((t) => t.id.toLowerCase().includes(lower) || (t.farmerName ?? "").toLowerCase().includes(lower)).slice(0, 2).forEach((t) => {
      results.push({
        category: "Transactions",
        icon: "🔄",
        title: t.id,
        subtitle: `${t.type} · ${t.crop} ${t.quantity}kg · ${t.storeName}`,
        page: "transactions",
        params: { txId: t.id },
      });
    });
  }

  useEffect(() => {
    document.getElementById("global-search-input")?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]" onClick={onClose}>
      <div
        className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden border border-[#DDE8E1]"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.15)" }}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#EEF1EE]">
          <Search size={18} className="text-[#8FA898]" />
          <input
            id="global-search-input"
            className="flex-1 text-[15px] text-[#1A2E1E] placeholder-[#8FA898] bg-transparent outline-none"
            placeholder="Search farmers, stores, orders, QR IDs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="p-1 hover:bg-[#F7F8F5] rounded-lg transition-colors">
            <X size={16} className="text-[#5A7263]" />
          </button>
        </div>

        {query.length < 2 && (
          <div className="px-5 py-4">
            <p className="text-[11px] text-[#8FA898] font-semibold uppercase tracking-wide mb-3">Quick access</p>
            <div className="grid grid-cols-2 gap-2">
              {([
                { label: "View Dashboard", page: "dashboard" as Page },
                { label: "Check Inventory", page: "inventory" as Page },
                { label: "Review Matching", page: "matching" as Page },
                { label: "Cash Flow", page: "cashflow" as Page },
              ]).map((a) => (
                <button
                  key={a.label}
                  onClick={() => { onNavigate(a.page); onClose(); }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#F7F8F5] hover:bg-[#EEF1EE] text-[13px] text-[#5A7263] font-medium transition-colors text-left"
                >
                  <ChevronsRight size={14} className="text-[#22A357]" />
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="max-h-96 overflow-y-auto">
            {Object.entries(groupBy(results, "category")).map(([cat, items]) => (
              <div key={cat} className="px-5 py-3">
                <p className="text-[11px] text-[#8FA898] font-semibold uppercase tracking-wider mb-2">{cat}</p>
                {items.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => { onNavigate(item.page, item.params); onClose(); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F7F8F5] transition-colors text-left"
                  >
                    <span className="w-8 h-8 rounded-lg bg-[#F7F8F5] flex items-center justify-center text-base">
                      {item.icon}
                    </span>
                    <div>
                      <p className="text-[14px] font-medium text-[#1A2E1E]">{item.title}</p>
                      <p className="text-[12px] text-[#5A7263]">{item.subtitle}</p>
                    </div>
                    <ChevronRight size={14} className="ml-auto text-[#DDE8E1]" />
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}

        {query.length >= 2 && results.length === 0 && (
          <div className="px-5 py-10 text-center">
            <p className="text-[14px] text-[#5A7263]">
              No results for &ldquo;<span className="font-medium text-[#1A2E1E]">{query}</span>&rdquo;
            </p>
          </div>
        )}

        <div className="px-5 py-3 border-t border-[#EEF1EE] bg-[#F7F8F5] flex items-center gap-4 text-[12px] text-[#8FA898]">
          <span><kbd className="font-mono bg-white border border-[#DDE8E1] rounded px-1.5 py-0.5 text-[11px]">↵</kbd> select</span>
          <span><kbd className="font-mono bg-white border border-[#DDE8E1] rounded px-1.5 py-0.5 text-[11px]">Esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}

function NotificationPanel({
  onClose,
  onNavigate,
}: {
  onClose: () => void;
  onNavigate: (page: Page, params?: Record<string, string>) => void;
}) {
  const { notifications } = useAdminData();
  const unread = notifications.filter((n) => !n.read);

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div
        className="absolute top-[64px] right-4 w-[400px] bg-white rounded-2xl border border-[#DDE8E1] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.12)" }}
      >
        <div className="px-5 py-4 border-b border-[#EEF1EE] flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-[#1A2E1E]">Notifications</h3>
            {unread.length > 0 && (
              <p className="text-[12px] text-[#5A7263]">{unread.length} unread</p>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#F7F8F5] rounded-lg transition-colors">
            <X size={15} className="text-[#5A7263]" />
          </button>
        </div>

        <div className="max-h-[520px] overflow-y-auto">
          {notifications.length === 0 && (
            <p className="px-5 py-10 text-center text-[13px] text-[#5A7263]">No alerts right now.</p>
          )}
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                onNavigate(n.link as Page, n.storeId ? { storeId: n.storeId } : undefined);
                onClose();
              }}
              className={`w-full px-5 py-4 border-b border-[#EEF1EE] last:border-0 text-left flex items-start gap-3 transition-colors hover:bg-[#F7F8F5] ${!n.read ? "bg-[#F7F8F5]" : ""}`}
            >
              <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                n.type === "Critical" ? "bg-red-50" :
                n.type === "Attention" ? "bg-amber-50" : "bg-blue-50"
              }`}>
                {n.type === "Critical" ? <AlertTriangle size={13} className="text-red-500" /> :
                 n.type === "Attention" ? <AlertTriangle size={13} className="text-amber-500" /> :
                 <Info size={13} className="text-blue-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-[13px] font-semibold leading-snug ${
                    n.type === "Critical" ? "text-red-700" :
                    n.type === "Attention" ? "text-amber-700" : "text-[#1A2E1E]"
                  }`}>{n.title}</p>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-[#22A357] flex-shrink-0 mt-1" />}
                </div>
                <p className="text-[12px] text-[#5A7263] mt-0.5 leading-relaxed">{n.body}</p>
                <p className="text-[11px] text-[#8FA898] mt-1">{n.time}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminApp() {
  const { adminName, notifications } = useAdminData();
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [currentParams, setCurrentParams] = useState<Record<string, string>>({});
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const mark = initials(adminName);
  const todayLabel = new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });

  const navigateTo = useCallback((page: Page, params?: Record<string, string>) => {
    setCurrentPage(page);
    setCurrentParams(params ?? {});
    setSearchOpen(false);
    setNotifOpen(false);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setNotifOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const navCtx: NavContext = { navigateTo, currentParams };

  return (
    <div className="admin-shell flex h-full w-full overflow-hidden">
      <aside
        className="hidden md:flex flex-col h-full flex-shrink-0 select-none bg-white"
        style={{ width: 256, borderRight: "1px solid #EEF1EE" }}
      >
        <div className="flex items-center gap-2.5 px-5 h-[72px] border-b border-[#EEF1EE]">
          <BrandLogo size={44} />
          <p className="text-[10px] text-[#8FA898] font-medium tracking-wide uppercase">
            Admin Console
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-150 ${
                  active
                    ? "bg-[#E8F5EE] text-[#1B7A3D]"
                    : "text-[#5A7263] hover:bg-[#F7F8F5] hover:text-[#1A2E1E]"
                }`}
              >
                <Icon size={17} />
                <span>{item.label}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#E9A23B]" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-3 pb-4 pt-3 border-t border-[#EEF1EE] space-y-0.5">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-[#5A7263] hover:bg-[#F7F8F5] hover:text-[#1A2E1E] transition-all"
          >
            <Bell size={17} />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="ml-auto bg-[#1B7A3D] text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
                {unreadCount}
              </span>
            )}
          </button>

          <form action={signOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 mt-1 rounded-xl hover:bg-[#F7F8F5] transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-[#1B7A3D] flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0">
                {mark}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-[#1A2E1E] truncate">{adminName}</p>
                <p className="text-[11px] text-[#8FA898]">Platform Admin</p>
              </div>
              <LogOut size={14} className="text-[#8FA898] ml-auto flex-shrink-0" />
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center gap-3 md:gap-4 px-4 md:px-6 h-16 flex-shrink-0 bg-white border-b border-[#EEF1EE] z-30 min-w-0">
          <select
            className="md:hidden text-[13px] font-medium bg-[#F7F8F5] rounded-xl px-3 py-2 text-[#1A2E1E] outline-none max-w-[140px]"
            value={currentPage}
            onChange={(e) => navigateTo(e.target.value as Page)}
          >
            {navItems.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2.5 flex-1 max-w-sm px-3.5 py-2 rounded-xl bg-[#F7F8F5] hover:bg-[#EEF1EE] transition-colors text-left"
          >
            <Search size={15} className="text-[#8FA898]" />
            <span className="text-[13px] text-[#8FA898]">Search farmers, stores, orders…</span>
            <span className="ml-auto text-[11px] text-[#DDE8E1] font-mono bg-white border border-[#DDE8E1] rounded px-1.5 py-0.5 hidden sm:inline">
              ⌘K
            </span>
          </button>

          <div className="flex-1" />

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F7F8F5] text-[13px] font-medium text-[#5A7263]">
            <span className="text-[#22A357]">●</span>
            {todayLabel}
          </div>

          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative w-9 h-9 rounded-xl bg-[#F7F8F5] hover:bg-[#EEF1EE] flex items-center justify-center transition-colors"
          >
            <Bell size={16} className="text-[#5A7263]" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D94F4F]" />
            )}
          </button>

          <div className="flex items-center gap-2.5 pl-2">
            <div className="w-8 h-8 rounded-full bg-[#1B7A3D] flex items-center justify-center text-[12px] font-bold text-white">
              {mark}
            </div>
          <div className="hidden md:block">
            <p className="text-[13px] font-semibold text-[#1A2E1E] leading-none">{adminName}</p>
            <p className="text-[11px] text-[#8FA898] leading-none mt-0.5">Platform Admin</p>
          </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#F7F8F5]">
          {currentPage === "dashboard" && <Dashboard navCtx={navCtx} />}
          {currentPage === "stores" && <WhiteStores navCtx={navCtx} />}
          {currentPage === "transactions" && <Transactions navCtx={navCtx} />}
          {currentPage === "cashflow" && <CashFlow navCtx={navCtx} />}
          {currentPage === "matching" && <Matching navCtx={navCtx} />}
          {currentPage === "orders" && <Orders navCtx={navCtx} />}
          {currentPage === "inventory" && <Inventory navCtx={navCtx} />}
          {currentPage === "users" && <UsersPage navCtx={navCtx} />}
          {currentPage === "reports" && <Reports navCtx={navCtx} />}
          {currentPage === "simulated" && <SimulatedNetwork navCtx={navCtx} />}
        </main>
      </div>

      {searchOpen && (
        <SearchModal onClose={() => setSearchOpen(false)} onNavigate={navigateTo} />
      )}
      {notifOpen && (
        <NotificationPanel onClose={() => setNotifOpen(false)} onNavigate={navigateTo} />
      )}
    </div>
  );
}
