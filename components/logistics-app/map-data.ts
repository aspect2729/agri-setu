import { haversineKm } from "@/lib/utils";
import type { LogisticsData, Trip, TripStatus } from "./types";
import {
  FLEET_COVERAGE,
  FLEET_DRIVER,
  FLEET_VEHICLE,
  demoTrips,
  logisticsEarningsChart,
  logisticsEarningsSummary,
  logisticsNotifications,
  logisticsRecentPayments,
  logisticsTripHistory,
  logisticsVehicles,
} from "@/mock-data/adapters/logistics";

type StoreRow = { name: string; village: string; lat: number | null; lng: number | null };
type BuyerRow = { full_name: string; village: string | null; phone: string | null; lat: number | null; lng: number | null };
type SubmissionRow = { batch_code: string | null; quality_grade: string | null; crop: string };
type ItemRow = { quantity_kg: number; produce_submissions: SubmissionRow | SubmissionRow[] | null };

type OrderRow = {
  crop: string;
  quantity_kg: number;
  agreed_price: number | null;
  delivery_location: string | null;
  status: string;
  created_at?: string;
  white_stores: StoreRow | StoreRow[] | null;
  profiles: BuyerRow | BuyerRow[] | null;
  order_items: ItemRow[] | null;
};

export type DeliveryRow = {
  id: string;
  status: string;
  pickup_location: string;
  dropoff_location: string;
  logistics_id: string | null;
  created_at: string;
  order_id?: string;
  orders: OrderRow | OrderRow[] | null;
};

export type LogisticsRaw = {
  operatorName: string;
  operatorVillage: string | null;
  operatorPhone: string | null;
  operatorId: string;
  deliveries: DeliveryRow[];
};

function asOne<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function num(v: unknown, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function shortCode(id: string) {
  return `AS-TRP-${id.replace(/-/g, "").slice(0, 4).toUpperCase()}`;
}

function partnerId(id: string) {
  return `LP-${id.replace(/-/g, "").slice(0, 5).toUpperCase()}`;
}

function fallbackKm(id: string) {
  let n = 0;
  for (const ch of id) n = (n + ch.charCodeAt(0)) % 25;
  return 18 + n;
}

function asUiStatus(s: string): TripStatus {
  if (s === "accepted") return "assigned";
  if (s === "picked_up") return "pickup-completed";
  if (s === "in_transit") return "in-transit";
  if (s === "delivered") return "delivered";
  return "available";
}

function gradeLabel(g: string | null | undefined) {
  if (g === "B") return "Grade B";
  if (g === "C") return "Grade C";
  return "Grade A";
}

function pickupTimeFor(status: TripStatus, createdAt: string) {
  const t = new Date(createdAt).toLocaleString("en-IN", { hour: "numeric", minute: "2-digit" });
  if (status === "available") return `Today, ${t}`;
  return t;
}

function travelTimeFor(km: number) {
  const mins = Math.max(35, Math.round(km * 1.8));
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

function mapLiveTrip(row: DeliveryRow): Trip {
  const order = asOne(row.orders);
  const store = asOne(order?.white_stores);
  const buyer = asOne(order?.profiles);
  const items = order?.order_items ?? [];
  const firstSub = asOne(items[0]?.produce_submissions);
  const crop = order?.crop ?? firstSub?.crop ?? "Produce";
  const kg = num(order?.quantity_kg, 50);
  const status = asUiStatus(row.status);
  const storeLat = store?.lat ?? null;
  const storeLng = store?.lng ?? null;
  const buyerLat = buyer?.lat ?? null;
  const buyerLng = buyer?.lng ?? null;
  const distance =
    storeLat != null && storeLng != null && buyerLat != null && buyerLng != null
      ? Math.max(1, Math.round(haversineKm(storeLat, storeLng, buyerLat, buyerLng)))
      : fallbackKm(row.id);
  const rate = Math.max(45, Math.round(2800 / Math.max(distance, 1)));
  const storeName = store?.name ?? "White Store";
  const village = store?.village ?? "";
  const pickupName = village ? `White Store — ${village}` : storeName;
  const destName = buyer?.full_name ?? order?.delivery_location ?? row.dropoff_location;

  return {
    id: shortCode(row.id),
    rawId: row.id,
    live: true,
    status,
    pickup: { name: pickupName, address: row.pickup_location },
    destination: { name: destName, address: row.dropoff_location },
    cargo: {
      crop,
      grade: gradeLabel(firstSub?.quality_grade),
      quantity: kg,
      crates: Math.max(1, Math.round(kg / 25)),
      handling: "Keep cool and dry",
      batchCode: firstSub?.batch_code ?? null,
    },
    vehicle: FLEET_VEHICLE,
    vehicleType: "Covered Goods Vehicle",
    driver: FLEET_DRIVER,
    pickupWindow: "2:00 PM – 4:00 PM",
    deliveryWindow: "5:00 PM – 7:00 PM",
    pickupTime: pickupTimeFor(status, row.created_at),
    expectedDelivery: status === "delivered" ? "Delivered" : "ETA 40 min",
    distance,
    travelTime: travelTimeFor(distance),
    earnings: rate * distance,
    rate,
    vehicleRequired: "Covered Goods Vehicle",
    minCapacity: Math.max(2000, kg),
    date: row.created_at.slice(0, 10),
    storeContact: `Store Manager — ${storeName}`,
    buyerContact: buyer?.phone ? `${buyer.full_name} · ${buyer.phone}` : buyer?.full_name ?? "Warehouse Manager",
  };
}

export function mapLogisticsData(raw: LogisticsRaw): LogisticsData {
  const live = (raw.deliveries ?? [])
    .filter((d) => d.status === "requested" || d.logistics_id === raw.operatorId)
    .map(mapLiveTrip);

  const liveRaw = new Set(live.map((t) => t.rawId));
  const overlay = demoTrips().filter((t) => !liveRaw.has(t.rawId));
  const trips = [...live, ...overlay];

  return {
    operatorName: raw.operatorName,
    operatorVillage: raw.operatorVillage,
    operatorPhone: raw.operatorPhone,
    partnerId: partnerId(raw.operatorId),
    vehicle: FLEET_VEHICLE,
    driver: FLEET_DRIVER,
    coverage: FLEET_COVERAGE,
    trips,
    notifications: logisticsNotifications(),
    vehicles: logisticsVehicles(),
    tripHistory: logisticsTripHistory(),
    earningsChartData: logisticsEarningsChart(),
    recentPayments: logisticsRecentPayments(),
    earningsSummary: logisticsEarningsSummary(),
  };
}
