import type { QualityGrade } from "@/lib/types";

/** Great-circle distance between two coordinates, in km. */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Buyer-facing price: the White Store's margin over the farmer payout. */
export function salePricePerKg(pricePaidPerKg: number): number {
  return Math.round(pricePaidPerKg * 1.15);
}

export const GRADE_WEIGHT: Record<QualityGrade, number> = { A: 1, B: 0.65, C: 0.35 };

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/** Human-readable unique batch code, e.g. AGS-K7M2QX. */
export function generateBatchCode(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `AGS-${suffix}`;
}
