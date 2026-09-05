import { GRADE_WEIGHT, salePricePerKg } from "@/lib/utils";
import type { QualityGrade } from "@/lib/types";
import type {
  BuyerData,
  BuyerNotification,
  BuyerOrder,
  ClearanceDeal,
  Freshness,
  Grade,
  OrderStatus,
  ProduceListing,
  Requirement,
  ScoreBreakdown,
  TrackingStep,
} from "./types";

const CROP_IMAGES: Record<string, string> = {
  Tomatoes: "https://images.unsplash.com/photo-1631292170835-dd50c1507537?w=480&h=320&fit=crop&auto=format",
  Potatoes: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=480&h=320&fit=crop&auto=format",
  Onions: "https://images.unsplash.com/photo-1642582037312-9b9639be89e6?w=480&h=320&fit=crop&auto=format",
  Carrots: "https://images.unsplash.com/photo-1590868309235-ea34bed7bd7f?w=480&h=320&fit=crop&auto=format",
  Wheat: "https://images.unsplash.com/photo-1535913989690-f90e1c2d4cfa?w=480&h=320&fit=crop&auto=format",
  Chilli: "https://images.unsplash.com/photo-1583119022894-035ad2b3b0c0?w=480&h=320&fit=crop&auto=format",
  Cabbage: "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=480&h=320&fit=crop&auto=format",
  Brinjal: "https://images.unsplash.com/photo-1656423092106-56c2ce44e4d5?w=480&h=320&fit=crop&auto=format",
  Corn: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=480&h=320&fit=crop&auto=format",
  Banana: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=480&h=320&fit=crop&auto=format",
  Bananas: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=480&h=320&fit=crop&auto=format",
};

export function cropImage(crop: string) {
  const exact = CROP_IMAGES[crop];
  if (exact) return exact;
  const lower = crop.toLowerCase();
  const key = Object.keys(CROP_IMAGES).find(
    (k) => lower.includes(k.toLowerCase()) || k.toLowerCase().includes(lower),
  );
  return (key ? CROP_IMAGES[key] : undefined) ?? "https://images.unsplash.com/photo-1542838132-92c53300491e?w=480&h=320&fit=crop&auto=format";
}

type BatchRow = {
  id: string;
  crop: string;
  batch_code: string | null;
  quality_grade: string | null;
  quality_notes: string | null;
  remaining_kg: number | null;
  quantity_kg: number;
  actual_weight_kg: number | null;
  price_per_kg: number | null;
  expected_price: number | null;
  created_at: string;
  paid_at: string | null;
  white_stores:
    | { name: string; village: string; lat: number | null; lng: number | null }
    | { name: string; village: string; lat: number | null; lng: number | null }[]
    | null;
  profiles: { village: string | null } | { village: string | null }[] | null;
};

type OrderRow = {
  id: string;
  crop: string;
  quantity_kg: number;
  agreed_price: number;
  status: string;
  delivery_location: string | null;
  created_at: string;
  white_stores: { name: string; village: string } | { name: string; village: string }[] | null;
  deliveries: { status: string } | { status: string }[] | null;
  order_items?: {
    quantity_kg?: number;
    submission_id?: string;
    produce_submissions?:
      | { batch_code: string | null; quality_grade: string | null; crop: string }
      | { batch_code: string | null; quality_grade: string | null; crop: string }[]
      | null;
  }[] | null;
};

type DemandRow = {
  id: string;
  crop: string;
  quantity_kg: number;
  offered_price: number | null;
  needed_by: string | null;
  location: string | null;
  status: string;
  created_at: string;
};

export type BuyerRaw = {
  buyerName: string;
  buyerVillage: string | null;
  buyerPhone: string | null;
  buyerLat: number | null;
  buyerLng: number | null;
  batches: BatchRow[];
  orders: OrderRow[];
  demands: DemandRow[];
};

function asOne<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function num(v: unknown, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function ageDays(iso: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function shortCode(id: string, prefix: string) {
  return `${prefix}-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

function relativeTime(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

function freshnessFromAge(days: number): Freshness {
  if (days <= 1) return "Excellent";
  if (days <= 3) return "Good";
  return "Fair";
}

function gradeOf(g: string | null): Grade {
  if (g === "B" || g === "C") return g;
  return "A";
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function mapOrderStatus(status: string, delivery?: string | null): OrderStatus {
  if (status === "completed" || status === "delivered" || delivery === "delivered") return "delivered";
  if (delivery === "in_transit" || delivery === "picked_up" || status === "in_transit") return "out-for-delivery";
  if (status === "pickup_scheduled" || delivery === "accepted") return "dispatched";
  if (status === "matched" || status === "accepted") return "packed";
  if (status === "pending") return "placed";
  return "confirmed";
}

function trackingFor(status: OrderStatus, createdAt: string): TrackingStep[] {
  const t = formatTime(createdAt);
  const steps: { key: OrderStatus | "dispatched" | "out-for-delivery" | "delivered"; step: string }[] = [
    { key: "placed", step: "Order Placed" },
    { key: "confirmed", step: "Confirmed" },
    { key: "packed", step: "Packed at White Store" },
    { key: "dispatched", step: "Dispatched" },
    { key: "out-for-delivery", step: "Out for Delivery" },
    { key: "delivered", step: "Delivered" },
  ];
  const order: OrderStatus[] = ["placed", "confirmed", "packed", "dispatched", "out-for-delivery", "delivered"];
  const idx = Math.max(0, order.indexOf(status));
  return steps.map((s, i) => ({
    step: s.step,
    time: i <= idx ? t : i === idx + 1 ? "Expected soon" : "",
    completed: i < idx || status === "delivered",
    current: i === idx && status !== "delivered",
  }));
}

function scoreListings(listings: ProduceListing[]): ProduceListing[] {
  if (listings.length === 0) return listings;
  const prices = listings.map((l) => l.pricePerKg);
  const qtys = listings.map((l) => l.available);
  const dists = listings.map((l) => l.distance);
  const [minP, maxP] = [Math.min(...prices), Math.max(...prices)];
  const maxQ = Math.max(...qtys);
  const maxD = Math.max(...dists, 1);

  return listings.map((l) => {
    const price = maxP === minP ? 1 : 1 - (l.pricePerKg - minP) / (maxP - minP);
    const quality = GRADE_WEIGHT[l.grade as QualityGrade] ?? 0.5;
    const qty = maxQ === 0 ? 0 : l.available / maxQ;
    const loc = 1 - l.distance / maxD;
    const breakdown: ScoreBreakdown = {
      price: Math.round(price * 100),
      quality: Math.round(quality * 100),
      quantity: Math.round(qty * 100),
      location: Math.round(loc * 100),
    };
    const matchScore = Math.round(0.35 * breakdown.price + 0.3 * breakdown.quality + 0.15 * breakdown.quantity + 0.2 * breakdown.location);
    return { ...l, matchScore, scoreBreakdown: breakdown };
  });
}

export function mapBuyerData(raw: BuyerRaw): BuyerData {
  const batches = raw.batches ?? [];
  const orderRows = raw.orders ?? [];
  const demands = raw.demands ?? [];

  let listings: ProduceListing[] = batches.map((b) => {
    const store = asOne(b.white_stores);
    const days = ageDays(b.paid_at ?? b.created_at);
    const available = num(b.remaining_kg);
    const total = num(b.actual_weight_kg ?? b.quantity_kg);
    const price = salePricePerKg(num(b.price_per_kg ?? b.expected_price, 20));
    const distance =
      raw.buyerLat != null && raw.buyerLng != null && store?.lat != null && store?.lng != null
        ? Math.round(haversine(raw.buyerLat, raw.buyerLng, store.lat, store.lng))
        : 12;
    return {
      id: b.id,
      crop: b.crop,
      grade: gradeOf(b.quality_grade),
      quantity: total,
      available,
      reserved: Math.max(0, total - available),
      pricePerKg: price,
      bulkPrices: [
        { minQty: 50, price },
        { minQty: 200, price: Math.max(1, price - 1) },
        { minQty: 500, price: Math.max(1, price - 2) },
      ],
      whiteStore: store?.name ?? "White Store",
      region: store?.village ?? "",
      city: store?.village ?? "",
      distance,
      matchScore: 0,
      scoreBreakdown: { price: 0, quality: 0, quantity: 0, location: 0 },
      image: cropImage(b.crop),
      collectedDaysAgo: days,
      availableFrom: days === 0 ? "Today" : days === 1 ? "Yesterday" : `${days} days ago`,
      farmersCount: 1,
      batchId: b.batch_code ?? shortCode(b.id, "AGS"),
      freshness: freshnessFromAge(days),
      inspectionDate: formatDate(b.paid_at ?? b.created_at),
      category: "Vegetables",
      qualityNotes: b.quality_notes,
    };
  });
  listings = scoreListings(listings.filter((l) => l.available > 0));

  const orders: BuyerOrder[] = orderRows.map((o) => {
    const status = mapOrderStatus(o.status, asOne(o.deliveries)?.status);
    const firstItem = o.order_items?.[0];
    const sub = asOne(firstItem?.produce_submissions);
    const listing =
      listings.find((l) => l.id === firstItem?.submission_id) ??
      listings.find((l) => l.batchId === sub?.batch_code) ??
      listings.find((l) => l.crop === o.crop);
    const produceId = firstItem?.submission_id ?? listing?.id ?? "";
    return {
      id: shortCode(o.id, "ORD"),
      rawId: o.id,
      produceId,
      crop: o.crop,
      grade: gradeOf(sub?.quality_grade ?? listing?.grade ?? null),
      quantity: num(o.quantity_kg),
      pricePerKg: num(o.agreed_price),
      total: num(o.quantity_kg) * num(o.agreed_price),
      whiteStore: asOne(o.white_stores)?.name ?? "White Store",
      orderDate: formatDate(o.created_at),
      deliveryDate: formatDate(o.created_at),
      status,
      matchScore: listing?.matchScore ?? 80,
      batchId: sub?.batch_code ?? listing?.batchId ?? shortCode(o.id, "AGS"),
      deliveryLocation: o.delivery_location ?? raw.buyerVillage ?? "Your warehouse",
      trackingSteps: trackingFor(status, o.created_at),
      image: cropImage(o.crop),
    };
  });

  const deals: ClearanceDeal[] = listings
    .filter((l) => l.freshness !== "Excellent" || l.collectedDaysAgo >= 3)
    .map((l) => {
      const discount = l.freshness === "Fair" ? 30 : 18;
      const clearancePrice = Math.max(1, Math.round(l.pricePerKg * (1 - discount / 100)));
      return {
        id: `deal-${l.id}`,
        produceId: l.id,
        crop: l.crop,
        grade: l.grade,
        quantity: l.available,
        originalPrice: l.pricePerKg,
        clearancePrice,
        discount,
        whiteStore: l.whiteStore,
        region: l.city,
        distance: l.distance,
        freshness: l.freshness,
        image: l.image,
        hoursRemaining: l.freshness === "Fair" ? 12 : 36,
        collectedDaysAgo: l.collectedDaysAgo,
      };
    });

  const requirements: Requirement[] = demands.map((d) => {
    const matchCount = listings.filter((l) => l.crop.toLowerCase() === d.crop.toLowerCase()).length;
    return {
      id: d.id,
      crop: d.crop,
      quantity: num(d.quantity_kg),
      requiredBy: d.needed_by ? formatDate(d.needed_by) : "Flexible",
      location: d.location ?? raw.buyerVillage ?? "—",
      grade: "A",
      maxPrice: d.offered_price != null ? num(d.offered_price) : 0,
      status: d.status === "matched" || d.status === "fulfilled" ? "matched" : d.status === "open" ? "active" : "expired",
      matchCount,
      createdAt: formatDate(d.created_at),
    };
  });

  const notifications: BuyerNotification[] = [];
  for (const o of orders.filter((x) => x.status === "out-for-delivery")) {
    notifications.push({
      id: `ord-${o.rawId}`,
      type: "order",
      text: `Your order #${o.id} is out for delivery`,
      time: relativeTime(new Date().toISOString()),
      unread: true,
    });
  }
  const best = listings.filter((l) => l.matchScore >= 90).slice(0, 2);
  for (const l of best) {
    notifications.push({
      id: `match-${l.id}`,
      type: "match",
      text: `New ${l.matchScore} Match — Grade ${l.grade} ${l.crop} available in ${l.city}`,
      time: l.availableFrom,
      unread: true,
    });
  }
  for (const d of deals.slice(0, 1)) {
    notifications.push({
      id: `deal-${d.id}`,
      type: "deal",
      text: `${d.discount}% off ${d.crop} — Clearance deal expires in ${d.hoursRemaining} hours`,
      time: `${d.hoursRemaining}h left`,
      unread: deals.length > 0,
    });
  }
  for (const o of orders.filter((x) => x.status === "delivered").slice(0, 1)) {
    notifications.push({
      id: `del-${o.rawId}`,
      type: "delivery",
      text: `Order #${o.id} delivered successfully`,
      time: o.deliveryDate,
      unread: false,
    });
  }

  return {
    buyerName: raw.buyerName,
    buyerVillage: raw.buyerVillage,
    buyerPhone: raw.buyerPhone,
    listings,
    orders,
    deals,
    requirements,
    notifications,
    crops: Array.from(new Set(listings.map((l) => l.crop))),
  };
}
