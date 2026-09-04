import type {
  EarningsPoint,
  LogisticsNotification,
  RecentPayment,
  Trip,
  TripHistoryItem,
  TripStatus,
  Vehicle,
} from "@/components/logistics-app/types";
import { FLEET } from "../seed";
import {
  computeAnalytics,
  readBuyers,
  readNotifications,
  readOrders,
  readPayments,
  readProducts,
  readShipments,
} from "../services";
import { formatChartDay, formatDay, relativeTime } from "../util";
import type { Order, Shipment } from "../types";

export const FLEET_VEHICLE = FLEET.vehicle;
export const FLEET_DRIVER = FLEET.driver;
export const FLEET_COVERAGE = FLEET.coverage;

export const ACTIVE_STATUSES: TripStatus[] = [
  "assigned",
  "pickup-started",
  "pickup-completed",
  "in-transit",
  "arrived",
];

export function isActiveStatus(status: TripStatus) {
  return ACTIVE_STATUSES.includes(status);
}

function asTripStatus(status: Shipment["status"]): TripStatus {
  if (status === "pending") return "available";
  if (status === "assigned") return "assigned";
  if (status === "picked_up") return "pickup-completed";
  if (status === "in_transit") return "in-transit";
  return "delivered";
}

function handling(crop: string) {
  if (crop === "Tomato" || crop === "Grapes") return "Handle with care, avoid stacking";
  if (crop === "Onion") return "Keep dry / ventilated";
  return "Keep cool and dry";
}

function toTrip(shipment: Shipment, order: Order): Trip {
  const product = readProducts().find((p) => p.id === order.productId);
  const buyer = readBuyers().find((b) => b.id === order.buyerId);
  const crop = product?.cropName ?? "Produce";
  const grade = product ? `Grade ${product.qualityGrade}` : "Grade A";
  const pickupName = shipment.pickupLocation;
  const destName = buyer?.name ?? shipment.deliveryLocation.split(" · ")[0];
  const pickupWindow = "2:00 PM – 4:00 PM";
  const deliveryWindow = "5:00 PM – 7:00 PM";
  return {
    id: shipment.tripCode,
    rawId: shipment.shipmentId,
    live: false,
    status: asTripStatus(shipment.status),
    pickup: { name: pickupName, address: pickupName.replace("White Store — ", "") + ", Karnataka" },
    destination: { name: destName, address: buyer?.location ?? shipment.deliveryLocation },
    cargo: {
      crop,
      grade,
      quantity: order.quantity,
      crates: Math.max(1, Math.round(order.quantity / 25)),
      handling: handling(crop),
    },
    vehicle: shipment.vehicleNumber ?? FLEET_VEHICLE,
    vehicleType: shipment.vehicleType,
    driver: shipment.assignedDriver ?? FLEET_DRIVER,
    pickupWindow,
    deliveryWindow,
    pickupTime: shipment.pickupTime
      ? new Date(shipment.pickupTime).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })
      : "Today, 3:00 PM",
    expectedDelivery: shipment.status === "delivered" ? "Delivered" : "ETA 40 min",
    distance: shipment.distance,
    travelTime: shipment.distance < 35 ? `${Math.max(40, shipment.distance + 15)} min` : `${Math.round(shipment.distance / 30)} hr ${shipment.distance % 30} min`,
    earnings: shipment.earnings,
    rate: shipment.rate,
    vehicleRequired: shipment.vehicleType.includes("Light") ? "Light Commercial Vehicle" : "Covered Goods Vehicle",
    minCapacity: Math.max(2000, order.quantity),
    date: order.orderDate.slice(0, 10),
    storeContact: `Store Manager — ${pickupName.replace("White Store — ", "")}`,
    buyerContact: buyer ? `${buyer.name} · ${buyer.contact}` : "Warehouse Manager",
  };
}

export function demoTrips(): Trip[] {
  const orderById = new Map(readOrders().map((o) => [o.id, o]));
  const trips = readShipments()
    .map((s) => {
      const order = orderById.get(s.orderId);
      return order ? toTrip(s, order) : null;
    })
    .filter((t): t is Trip => Boolean(t));
  const seen = new Set<string>();
  return trips.filter((t) => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });
}

export function logisticsVehicles(): Vehicle[] {
  const trips = demoTrips();
  const active = trips.find((t) => isActiveStatus(t.status));
  const byReg = new Map<string, Vehicle>();
  for (const driver of FLEET.drivers) {
    const onTrip = trips.find((t) => t.vehicle === driver.vehicle && isActiveStatus(t.status));
    byReg.set(driver.vehicle, {
      id: driver.vehicle,
      type: driver.type.includes("Light") || driver.type.includes("Bolero") ? "Light Commercial Vehicle" : "Covered Goods Vehicle",
      make: driver.type.split(" / ")[0] ?? driver.type,
      capacity: driver.vehicle.endsWith("1234") ? 5000 : 3000,
      status: onTrip || (active && active.vehicle === driver.vehicle) ? "on-trip" : "available",
      currentTrip: onTrip?.id ?? null,
      year: 2023,
      insurance: "Valid until Mar 2027",
      registration: "Valid",
    });
  }
  return [...byReg.values()];
}

export const vehicles = logisticsVehicles();

export function logisticsTripHistory(): TripHistoryItem[] {
  const trips = demoTrips().filter((t) => t.status === "delivered" || t.status === "cancelled");
  const cancelledOrders = readOrders().filter((o) => o.status === "cancelled");
  const items: TripHistoryItem[] = trips.map((t) => ({
    id: t.id,
    date: formatDay(t.date),
    crop: t.cargo.crop,
    quantity: `${t.cargo.quantity.toLocaleString("en-IN")} kg`,
    route: `${t.pickup.name.replace("White Store — ", "")} → ${t.destination.name}`,
    pickup: t.pickup.name,
    destination: t.destination.name,
    status: t.status,
    earnings: t.earnings,
  }));
  for (const order of cancelledOrders) {
    if (order.tripCode && items.some((i) => i.id === order.tripCode)) continue;
    const product = readProducts().find((p) => p.id === order.productId);
    const buyer = readBuyers().find((b) => b.id === order.buyerId);
    items.push({
      id: order.tripCode ?? `AS-TRP-C${order.id.slice(-2)}`,
      date: formatDay(order.orderDate),
      crop: product?.cropName ?? "Produce",
      quantity: `${order.quantity.toLocaleString("en-IN")} kg`,
      route: `Store → ${buyer?.name ?? "Buyer"}`,
      pickup: "White Store",
      destination: buyer?.name ?? "Buyer",
      status: "cancelled",
      earnings: 0,
    });
  }
  return items.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export const tripHistory = logisticsTripHistory();

export function logisticsEarningsChart(): EarningsPoint[] {
  const delivered = demoTrips().filter((t) => t.status === "delivered");
  const byDay = new Map<string, { earnings: number; iso: string }>();
  for (const trip of delivered) {
    const key = formatChartDay(trip.date);
    const cur = byDay.get(key) ?? { earnings: 0, iso: trip.date };
    cur.earnings += trip.earnings;
    byDay.set(key, cur);
  }
  return [...byDay.entries()]
    .sort((a, b) => a[1].iso.localeCompare(b[1].iso))
    .map(([date, v]) => ({ date, earnings: v.earnings }));
}

export const earningsChartData = logisticsEarningsChart();

export function logisticsRecentPayments(): RecentPayment[] {
  const orderById = new Map(readOrders().map((o) => [o.id, o]));
  const tripByOrder = new Map(readShipments().map((s) => [s.orderId, s]));
  return readPayments()
    .filter((p) => tripByOrder.has(p.orderId))
    .slice()
    .sort((a, b) => +new Date(b.transactionDate) - +new Date(a.transactionDate))
    .slice(0, 6)
    .map((p) => {
      const shipment = tripByOrder.get(p.orderId)!;
      const order = orderById.get(p.orderId)!;
      const buyer = readBuyers().find((b) => b.id === order.buyerId);
      return {
        tripId: shipment.tripCode,
        date: formatDay(p.transactionDate),
        route: `${shipment.pickupLocation.replace("White Store — ", "")} → ${buyer?.name ?? "Buyer"}`,
        amount: shipment.earnings,
        status: p.status === "success" ? "paid" : "pending",
      };
    });
}

export const recentPayments = logisticsRecentPayments();

function asLogType(type: string): LogisticsNotification["type"] {
  if (type.includes("payment")) return "payment";
  if (type.includes("delivery") || type === "delivery_completed") return "delivery";
  if (type.startsWith("shipment")) return "update";
  return "trip";
}

export function logisticsNotifications(): LogisticsNotification[] {
  return readNotifications()
    .filter((n) =>
      ["new_order", "shipment_assigned", "shipment_picked_up", "shipment_in_transit", "delivery_completed", "payment_success", "payment_failed"].includes(n.type),
    )
    .slice(0, 10)
    .map((n) => ({
      id: n.id,
      text: n.message,
      time: relativeTime(n.timestamp),
      read: n.read,
      type: asLogType(n.type),
      tripId: readShipments().find((s) => s.shipmentId === n.relatedEntityId || s.orderId === n.relatedEntityId)?.tripCode,
    }));
}

export const demoNotifications = logisticsNotifications();

export function logisticsEarningsSummary() {
  const trips = demoTrips();
  const delivered = trips.filter((t) => t.status === "delivered");
  const pending = trips.find((t) => isActiveStatus(t.status));
  const thisMonth = delivered.filter((t) => t.date.startsWith("2026-09"));
  const total = delivered.reduce((s, t) => s + t.earnings, 0);
  const monthTotal = thisMonth.reduce((s, t) => s + t.earnings, 0);
  const analytics = computeAnalytics();
  return {
    total,
    thisMonth: monthTotal,
    pending: pending?.earnings ?? 0,
    pendingTripId: pending?.id ?? null,
    completedCount: delivered.length,
    onTimePercent: analytics.logisticsPerformance.onTimePercent,
  };
}

export const availableTrips = demoTrips().filter((t) => t.status === "available");
export const myTrips = demoTrips().filter((t) => t.status !== "available");
export const activeTrip = demoTrips().find((t) => t.status === "in-transit") ?? myTrips[0];
