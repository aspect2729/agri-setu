import { haversineKm } from "@/lib/utils";
import type { MockErr, MockOk, MockResult } from "./types";

/** Locked demo clock so seed timelines stay stable across reloads. */
export const DEMO_NOW = new Date("2026-09-04T10:00:00+05:30");

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function addMinutes(iso: string, minutes: number) {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

export function daysBefore(days: number, hour = 10) {
  const d = new Date(DEMO_NOW);
  d.setDate(d.getDate() - days);
  d.setHours(hour, days % 60, 0, 0);
  return d.toISOString();
}

export function pad(n: number, width = 2) {
  return String(n).padStart(width, "0");
}

export function roundKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  return Math.max(1, Math.round(haversineKm(a.lat, a.lng, b.lat, b.lng)));
}

export function interpolatePoint(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  t: number,
) {
  const clamped = Math.min(1, Math.max(0, t));
  return {
    lat: from.lat + (to.lat - from.lat) * clamped,
    lng: from.lng + (to.lng - from.lng) * clamped,
  };
}

export function headingDegrees(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
) {
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (((Math.atan2(y, x) * 180) / Math.PI + 360) % 360);
}

export function relativeTime(iso: string, now = DEMO_NOW) {
  const diff = now.getTime() - new Date(iso).getTime();
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatChartDay(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function simulateNetwork(min = 180, max = 520) {
  await sleep(min + Math.round(Math.random() * (max - min)));
}

export function ok<T>(data: T): MockOk<T> {
  return { ok: true, data, simulated: true };
}

export function err(error: string): MockErr {
  return { ok: false, error, simulated: true };
}

export async function withSim<T>(
  fn: () => T,
  opts?: { failRate?: number; emptyAsError?: boolean },
): Promise<MockResult<T>> {
  await simulateNetwork();
  if (Math.random() < (opts?.failRate ?? 0.06)) {
    return err("Simulated network error. Retry the request.");
  }
  const data = fn();
  return ok(data);
}
