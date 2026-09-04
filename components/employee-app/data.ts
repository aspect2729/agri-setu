import type { Grade } from "./ui";

export type EmpFarmer = {
  id: string;
  name: string;
  village: string | null;
  phone: string | null;
  lastAt: string | null;
  totalKg: number;
  deliveries: number;
  totalPaid: number;
};

export type EmpLot = {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerVillage: string | null;
  crop: string;
  kg: number;
  status: "submitted" | "received";
  grade: Grade | null;
  batchCode: string | null;
  paidAmount: number | null;
  createdAt: string;
  notes: string | null;
};

export type EmpCash = {
  id: string;
  direction: "in" | "out";
  amount: number;
  description: string;
  createdAt: string;
};

export type EmployeeAppData = {
  employeeName: string;
  storeName: string;
  storeVillage: string;
  farmers: EmpFarmer[];
  lots: EmpLot[];
  cash: EmpCash[];
};

export type Screen =
  | "dashboard"
  | "farmers"
  | "farmer-register"
  | "farmer-success"
  | "farmer-profile"
  | "log-1"
  | "log-2"
  | "log-3"
  | "log-4"
  | "log-5"
  | "log-success"
  | "qr-view"
  | "quality-hub"
  | "quality-inspect"
  | "quality-done"
  | "cash-home"
  | "cash-ledger"
  | "cash-record"
  | "cash-confirm"
  | "cash-done";

export type NavTab = "home" | "log" | "quality" | "cash" | "farmers";

export type Crop = { id: string; name: string; emoji: string; bg: string; price: number };

export const CROPS: Crop[] = [
  { id: "tomato", name: "Tomatoes", emoji: "🍅", bg: "#FEE2E2", price: 22 },
  { id: "onion", name: "Onions", emoji: "🧅", bg: "#F3E8FF", price: 25 },
  { id: "potato", name: "Potatoes", emoji: "🥔", bg: "#FEF9C3", price: 15 },
  { id: "chilli", name: "Chilli", emoji: "🌶️", bg: "#FFE4E6", price: 80 },
  { id: "carrot", name: "Carrot", emoji: "🥕", bg: "#FFEDD5", price: 28 },
  { id: "corn", name: "Corn", emoji: "🌽", bg: "#FEF08A", price: 18 },
  { id: "brinjal", name: "Brinjal", emoji: "🍆", bg: "#EDE9FE", price: 20 },
  { id: "cabbage", name: "Cabbage", emoji: "🥬", bg: "#DCFCE7", price: 12 },
];

const GRADE_MULT: Record<Grade, number> = { A: 1, B: 0.85, C: 0.7 };

export function cropMeta(name: string): Crop {
  const n = name.toLowerCase();
  return (
    CROPS.find((c) => n.includes(c.id) || n.includes(c.name.toLowerCase())) ?? {
      id: "other",
      name,
      emoji: "🌿",
      bg: "#F7F8F5",
      price: 20,
    }
  );
}

export function priceFor(crop: string, grade: Grade | null) {
  return Math.round(cropMeta(crop).price * (grade ? GRADE_MULT[grade] : 1));
}

export function isToday(iso: string) {
  const d = new Date(iso);
  const n = new Date();
  return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
}

export function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

export function dateLabel(iso: string | null) {
  if (!iso) return "—";
  if (isToday(iso)) return "Today";
  const y = new Date();
  y.setDate(y.getDate() - 1);
  if (new Date(iso).toDateString() === y.toDateString()) return "Yesterday";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning,";
  if (h < 17) return "Good afternoon,";
  return "Good evening,";
}

export function lotStatus(lot: EmpLot) {
  if (lot.status === "submitted") return "Pending";
  if (lot.batchCode) return "QR Generated";
  return "Verified";
}

export type LogState = {
  farmer: EmpFarmer | null;
  crop: Crop | null;
  quantity: string;
  grade: Grade | null;
  notes: string;
};

export const emptyLog: LogState = { farmer: null, crop: null, quantity: "", grade: null, notes: "" };

export type CashForm = {
  type: "payment" | "cashin" | "cashout";
  farmer: string;
  amount: string;
  notes: string;
};
