"use client";

import { useState } from "react";
import { acceptDelivery, updateDeliveryStatus } from "@/lib/actions";
import { useRouter } from "next/navigation";
import type { Trip, TripStatus } from "./types";

export function toDbStatus(status: TripStatus): "picked_up" | "in_transit" | "delivered" | null {
  if (status === "pickup-started" || status === "pickup-completed") return "picked_up";
  if (status === "in-transit" || status === "arrived") return "in_transit";
  if (status === "delivered") return "delivered";
  return null;
}

export function useTripActions() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  async function accept(trip: Trip) {
    setError(null);
    setHint(null);
    if (!trip.live) {
      setHint("Demo trip accepted in preview. Live White Store loads write to the database.");
      return { ok: true, demo: true };
    }
    setPending(true);
    const result = await acceptDelivery(trip.rawId);
    setPending(false);
    if (result?.error) {
      setError(result.error);
      return { ok: false, demo: false };
    }
    router.refresh();
    return { ok: true, demo: false };
  }

  async function update(trip: Trip, next: TripStatus) {
    setError(null);
    setHint(null);
    const db = toDbStatus(next);
    if (!trip.live || !db) {
      setHint(trip.live ? null : "Demo trip — status is local only.");
      return { ok: true, demo: !trip.live };
    }
    setPending(true);
    const result = await updateDeliveryStatus(trip.rawId, db);
    setPending(false);
    if (result?.error) {
      setError(result.error);
      return { ok: false, demo: false };
    }
    router.refresh();
    return { ok: true, demo: false };
  }

  return { pending, error, hint, accept, update, setHint, setError };
}
