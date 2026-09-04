"use client";

import type { TripStatus } from "../types";

const config: Record<TripStatus, { label: string; classes: string; dot: string }> = {
  available: { label: "Available", classes: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", dot: "bg-emerald-500" },
  assigned: { label: "Assigned", classes: "bg-blue-50 text-blue-700 ring-1 ring-blue-200", dot: "bg-blue-500" },
  "pickup-started": { label: "Pickup Started", classes: "bg-purple-50 text-purple-700 ring-1 ring-purple-200", dot: "bg-purple-500" },
  "pickup-completed": { label: "Pickup Confirmed", classes: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200", dot: "bg-indigo-500" },
  "in-transit": { label: "In Transit", classes: "bg-amber-50 text-amber-700 ring-1 ring-amber-200", dot: "bg-amber-500" },
  arrived: { label: "Arrived", classes: "bg-teal-50 text-teal-700 ring-1 ring-teal-200", dot: "bg-teal-500" },
  delivered: { label: "Delivered", classes: "bg-slate-100 text-slate-600 ring-1 ring-slate-200", dot: "bg-slate-400" },
  cancelled: { label: "Cancelled", classes: "bg-red-50 text-red-600 ring-1 ring-red-200", dot: "bg-red-500" },
};

export default function StatusBadge({ status, size = "sm" }: { status: TripStatus; size?: "sm" | "md" | "lg" }) {
  const { label, classes, dot } = config[status];

  if (size === "lg") {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full text-[13px] font-semibold px-3 py-1 ${classes}`}>
        <span className={`w-2 h-2 rounded-full ${dot}`} />
        {label.toUpperCase()}
      </span>
    );
  }

  if (size === "md") {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full text-[12px] font-semibold px-2.5 py-0.5 ${classes}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
        {label}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-full text-[11px] font-medium px-2 py-0.5 ${classes}`}>
      {label}
    </span>
  );
}
