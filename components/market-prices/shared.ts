import type { MarketPrice } from "@/mock-data";

export const MANDI_CROPS = [
  "Tomato",
  "Onion",
  "Potato",
  "Cabbage",
  "Ragi",
  "Banana",
  "Chilli",
  "Beans",
  "Mango",
  "Coconut",
  "Grapes",
  "Maize",
] as const;

/** Grade-A White Store counter rate (₹/kg), aligned with employee `CROPS`. */
export const STORE_RS_PER_KG: Record<string, number> = {
  Tomato: 22,
  Onion: 25,
  Potato: 15,
  Cabbage: 12,
  Ragi: 42,
  Banana: 28,
  Chilli: 80,
  Beans: 40,
  Mango: 52,
  Coconut: 28,
  Grapes: 62,
  Maize: 18,
  Groundnut: 70,
  Cauliflower: 26,
  Coriander: 88,
};

export function inr(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export function latestDate(prices: MarketPrice[]) {
  return prices.reduce((max, p) => (p.date > max ? p.date : max), "");
}

export function latestRows(prices: MarketPrice[]) {
  const date = latestDate(prices);
  return prices.filter((p) => p.date === date);
}

export function storeQuintal(crop: string) {
  const kg = STORE_RS_PER_KG[crop];
  return kg != null ? kg * 100 : null;
}
