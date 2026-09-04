"use client";

import { signOut } from "@/lib/actions";
import { DemoBadge } from "@/components/demo-badge";
import { BrandLogo } from "@/components/brand-logo";
import { useLogisticsData } from "../data-context";
import { isActiveStatus } from "../demo-data";
import type { NavigateFn, Page } from "../types";

interface SidebarProps {
  currentPage: Page;
  navigate: NavigateFn;
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: Page;
  label: string;
  badge?: number;
  badgeAmber?: boolean;
  icon: React.ReactNode;
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "ST";
}

export default function Sidebar({ currentPage, navigate, isOpen, onClose }: SidebarProps) {
  const { operatorName, partnerId, trips } = useLogisticsData();
  const availableCount = trips.filter((t) => t.status === "available").length;
  const activeCount = trips.filter((t) => isActiveStatus(t.status)).length;
  const mark = initials(operatorName);

  const navItems: NavItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      ),
    },
    {
      id: "available-trips",
      label: "Available Trips",
      badge: availableCount,
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      ),
    },
    {
      id: "my-trips",
      label: "My Trips",
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
      ),
    },
    {
      id: "active-delivery",
      label: "Active Delivery",
      badge: activeCount,
      badgeAmber: true,
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
      ),
    },
    {
      id: "earnings",
      label: "Earnings",
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
        </svg>
      ),
    },
    {
      id: "trip-history",
      label: "Trip History",
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: "vehicles",
      label: "Vehicles",
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
      ),
    },
    {
      id: "profile",
      label: "Profile",
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      ),
    },
  ];

  const isActive = (id: Page) =>
    currentPage === id ||
    (id === "available-trips" && currentPage === "trip-details") ||
    (id === "active-delivery" && currentPage === "delivery-completion");

  return (
    <aside
      className={`
        fixed lg:relative inset-y-0 left-0 z-30
        w-[232px] shrink-0 flex flex-col
        bg-white border-r border-slate-100 h-full
        transition-transform duration-200 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
    >
      <div className="px-5 py-5 border-b border-slate-100 shrink-0 flex items-start justify-between gap-2">
        <button onClick={() => navigate("dashboard")} className="flex items-center gap-3 w-full text-left group min-w-0">
          <BrandLogo size={44} />
          <div className="min-w-0">
            <div className="text-[13.5px] font-semibold text-slate-900 leading-tight tracking-tight">Logistics</div>
            <div className="text-[11px] text-slate-400 leading-tight mt-0.5 font-medium flex items-center gap-1.5">
              Partner
              <DemoBadge className="scale-90 origin-left" />
            </div>
          </div>
        </button>
        <button
          type="button"
          onClick={onClose}
          className="lg:hidden w-8 h-8 shrink-0 rounded-lg text-slate-400 hover:bg-slate-100 flex items-center justify-center"
          aria-label="Close menu"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 pt-1 pb-2">Operations</div>
        {navItems.slice(0, 4).map((item) => {
          const active = isActive(item.id);
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-[9px] rounded-lg text-[13.5px] font-medium transition-all cursor-pointer relative group ${
                active ? "bg-green-50 text-green-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              {active && <div className="absolute left-0 top-[6px] bottom-[6px] w-0.5 bg-green-600 rounded-full" />}
              <span className={`transition-colors ${active ? "text-green-600" : "text-slate-400 group-hover:text-slate-500"}`}>
                {item.icon}
              </span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none ${
                    item.badgeAmber ? "bg-amber-100 text-amber-700" : active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 pt-4 pb-2">Reports</div>
        {navItems.slice(4).map((item) => {
          const active = isActive(item.id);
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-[9px] rounded-lg text-[13.5px] font-medium transition-all cursor-pointer relative group ${
                active ? "bg-green-50 text-green-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              {active && <div className="absolute left-0 top-[6px] bottom-[6px] w-0.5 bg-green-600 rounded-full" />}
              <span className={`transition-colors ${active ? "text-green-600" : "text-slate-400 group-hover:text-slate-500"}`}>
                {item.icon}
              </span>
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-4 pt-3 border-t border-slate-100 shrink-0 space-y-0.5">
        <div
          onClick={() => navigate("profile")}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center shrink-0">
            <span className="text-[11px] font-bold text-white">{mark}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-slate-700 truncate leading-snug">{operatorName}</div>
            <div className="text-[11px] text-slate-400 truncate leading-snug font-mono">{partnerId}</div>
          </div>
          <svg className="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </div>

        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Logout
          </button>
        </form>
      </div>
    </aside>
  );
}
