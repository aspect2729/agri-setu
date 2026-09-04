import type { ReactNode } from "react";

export function Card({
  title,
  subtitle,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-hairline bg-white p-5 shadow-sm ${className}`}
    >
      {title && (
        <div className="mb-4">
          <h2 className="text-base font-semibold text-text-primary">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-text-muted">{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-hairline bg-white p-5 shadow-sm">
      <p className="text-sm text-text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-green-primary">{value}</p>
      {hint && <p className="mt-1 text-xs text-text-muted">{hint}</p>}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  submitted: "bg-amber-light text-[#8A6020] ring-[#F5D78A]",
  received: "bg-green-light text-green-primary ring-border",
  matched: "bg-green-light text-green-dark ring-border",
  dispatched: "bg-soft text-text-secondary ring-border",
  delivered: "bg-green-light text-green-dark ring-border",
  paid: "bg-green-light text-success ring-border",
  open: "bg-amber-light text-[#8A6020] ring-[#F5D78A]",
  fulfilled: "bg-green-light text-success ring-border",
  pickup_scheduled: "bg-green-light text-green-primary ring-border",
  in_transit: "bg-soft text-text-secondary ring-border",
  completed: "bg-green-light text-success ring-border",
  requested: "bg-amber-light text-[#8A6020] ring-[#F5D78A]",
  accepted: "bg-green-light text-green-primary ring-border",
  picked_up: "bg-green-light text-green-dark ring-border",
  pending: "bg-amber-light text-[#8A6020] ring-[#F5D78A]",
  "grade A": "bg-green-light text-success ring-border",
  "grade B": "bg-soft text-text-secondary ring-border",
  "grade C": "bg-amber-light text-[#8A6020] ring-[#F5D78A]",
  in: "bg-green-light text-success ring-border",
  out: "bg-error-light text-error ring-[#F5C4C4]",
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? "bg-gray-50 text-gray-600 ring-gray-200";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-text-muted">
      {message}
    </div>
  );
}

export function Table({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-hairline text-xs uppercase tracking-wide text-text-muted">
            {headers.map((h) => (
              <th key={h} className="pb-2 pr-4 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">{children}</tbody>
      </table>
    </div>
  );
}
