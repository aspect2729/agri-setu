"use client";

import { DemoBadge } from "@/components/demo-badge";
import { useLogisticsData } from "../data-context";
import type { NavigateFn, Page } from "../types";

interface TopBarProps {
  title: string;
  currentPage: Page;
  navigate: NavigateFn;
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  onMenuClick: () => void;
}

const typeConfig = {
  trip: { color: "bg-green-500" },
  update: { color: "bg-amber-500" },
  delivery: { color: "bg-purple-500" },
  payment: { color: "bg-blue-500" },
};

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "ST";
}

export default function TopBar({
  title,
  navigate,
  notificationsOpen,
  setNotificationsOpen,
  onMenuClick,
}: TopBarProps) {
  const { operatorName, operatorVillage, notifications } = useLogisticsData();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const mark = initials(operatorName);

  return (
    <header className="h-14 shrink-0 bg-white border-b border-slate-100 flex items-center justify-between px-5 z-20 relative">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => navigate("dashboard")}
            className="hidden sm:inline text-slate-400 hover:text-slate-600 font-medium transition-colors cursor-pointer"
          >
            Agri Setu
          </button>
          <span className="hidden sm:inline text-slate-200">/</span>
          <span className="font-semibold text-slate-800">{title}</span>
          <DemoBadge className="hidden sm:inline-flex" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full ring-2 ring-white" />}
          </button>

          {notificationsOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotificationsOpen(false)} />
              <div className="absolute right-0 top-11 w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl border border-slate-100 z-30 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[11px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setNotificationsOpen(false);
                      navigate("notifications");
                    }}
                    className="text-xs text-green-600 hover:text-green-700 font-semibold"
                  >
                    View all →
                  </button>
                </div>
                <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-50">
                  {notifications.slice(0, 5).map((n) => {
                    const tc = typeConfig[n.type];
                    return (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => {
                          if (n.type === "trip") navigate("available-trips");
                          else if (n.type === "payment") navigate("earnings");
                          else if (n.tripId) navigate("trip-details", { tripId: n.tripId });
                          setNotificationsOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${!n.read ? "bg-green-50/30" : ""}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full ${tc.color} shrink-0 mt-1.5`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] text-slate-700 leading-snug">{n.text}</p>
                            <p className="text-[11px] text-slate-400 mt-1">{n.time}</p>
                          </div>
                          {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0 mt-1.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="w-px h-5 bg-slate-200 mx-1" />

        <button type="button" className="flex items-center gap-2.5" onClick={() => navigate("profile")}>
          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center cursor-pointer hover:bg-green-700 transition-colors">
            <span className="text-[11px] font-bold text-white">{mark}</span>
          </div>
          <div className="hidden md:block leading-none text-left">
            <div className="text-[13px] font-semibold text-slate-800">{operatorName}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Partner · {operatorVillage ?? "Agri Setu"}</div>
          </div>
        </button>
      </div>
    </header>
  );
}
