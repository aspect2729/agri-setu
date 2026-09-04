import type { ReactNode, CSSProperties } from "react";

export type Grade = "A" | "B" | "C";

export function IcoHome() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  );
}
export function IcoPlus() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}
export function IcoCheck() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20,6 9,17 4,12" />
    </svg>
  );
}
export function IcoWallet() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}
export function IcoUsers() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}
export function IcoSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
export function IcoChevRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="9,18 15,12 9,6" />
    </svg>
  );
}
export function IcoChevLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="15,18 9,12 15,6" />
    </svg>
  );
}
export function IcoArrowUp() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5,12 12,5 19,12" />
    </svg>
  );
}
export function IcoArrowDown() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19,12 12,19 5,12" />
    </svg>
  );
}
export function IcoQr() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="3" height="3" />
      <line x1="14" y1="20" x2="20" y2="20" />
      <line x1="20" y1="14" x2="20" y2="20" />
    </svg>
  );
}
export function IcoClipboard() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="13" y2="16" />
    </svg>
  );
}

export function Btn({
  children,
  onClick,
  disabled,
  variant = "primary",
  size = "lg",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}) {
  const base =
    "rounded-xl font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  const sz = { sm: "py-2 px-4 text-sm", md: "py-3 px-5 text-sm", lg: "py-4 px-6 text-base w-full" }[size];
  const v: Record<string, CSSProperties> = {
    primary: { background: disabled ? "#DDE8E1" : "#1B7A3D", color: disabled ? "#8FA898" : "#fff", boxShadow: disabled ? "none" : "0 4px 14px rgba(27,122,61,0.25)" },
    secondary: { background: "#E8F5EE", color: "#1B7A3D", border: "none" },
    danger: { background: "#FDECEC", color: "#D94F4F" },
    ghost: { background: "transparent", color: "#5A7263" },
  };
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`${base} ${sz}`} style={v[variant]}>
      {children}
    </button>
  );
}

export function Card({
  children,
  className = "",
  onClick,
  style,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  style?: CSSProperties;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl ${onClick ? "cursor-pointer active:scale-[0.99] transition-all" : ""} ${className}`}
      style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #EEF1EE", ...style }}
    >
      {children}
    </div>
  );
}

export function FarmerAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" | "xl" }) {
  const initials = name
    .trim()
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const sz = { sm: "w-9 h-9 text-xs", md: "w-11 h-11 text-sm", lg: "w-14 h-14 text-base", xl: "w-18 h-18 text-xl" }[size];
  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center font-bold flex-shrink-0`}
      style={{
        background: "#E8F5EE",
        color: "#1B7A3D",
        width: size === "xl" ? 72 : undefined,
        height: size === "xl" ? 72 : undefined,
      }}
    >
      {initials}
    </div>
  );
}

export function GradeBadge({ grade }: { grade: Grade }) {
  const cfg = {
    A: { bg: "#E8F5EE", color: "#22A357", label: "Grade A" },
    B: { bg: "#FEF3E0", color: "#8A6020", label: "Grade B" },
    C: { bg: "#FDECEC", color: "#D94F4F", label: "Grade C" },
  }[grade];
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

export function StatusPill({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; color: string }> = {
    "QR Generated": { bg: "#E8F5EE", color: "#1B7A3D" },
    Verified: { bg: "#E8F5EE", color: "#1B7A3D" },
    "In Progress": { bg: "#FEF3E0", color: "#8A6020" },
    Pending: { bg: "#FDECEC", color: "#D94F4F" },
  };
  const s = cfg[status] || { bg: "#F0F4F1", color: "#8FA898" };
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={s}>
      {status}
    </span>
  );
}

export function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-1.5 px-5 pb-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-1 flex-1 rounded-full transition-all"
          style={{ background: i < step ? "#1B7A3D" : "#DDE8E1" }}
        />
      ))}
    </div>
  );
}

export function BackHeader({ title, onBack, right }: { title: string; onBack: () => void; right?: ReactNode }) {
  return (
    <div className="relative flex items-center px-5 pt-5 pb-2 flex-shrink-0">
      <button type="button" onClick={onBack} className="flex items-center gap-0.5 py-1 -ml-1 z-10" style={{ color: "#1A2E1E" }}>
        <IcoChevLeft />
        <span className="text-sm font-medium">Back</span>
      </button>
      <h1 className="text-base font-semibold absolute left-1/2 -translate-x-1/2 whitespace-nowrap">{title}</h1>
      <div className="ml-auto z-10">{right}</div>
    </div>
  );
}

export function FieldInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: "#5A7263" }}>
        {label}
        {required && <span style={{ color: "#D94F4F" }}> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3.5 rounded-xl text-base outline-none"
        style={{ background: "#FFFFFF", border: "1.5px solid #DDE8E1", color: "#1A2E1E" }}
      />
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#8FA898" }}>
      {children}
    </p>
  );
}

export function Divider() {
  return <div style={{ height: 1, background: "#EEF1EE" }} />;
}

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="mx-5 mb-3 p-3 rounded-xl text-sm font-medium" style={{ background: "#FDECEC", color: "#D94F4F" }}>
      {message}
    </div>
  );
}
