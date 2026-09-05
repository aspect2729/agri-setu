import { DATASET, FLEET, MARKET_BY_CROP } from "./seed";
import {
  addMinutes,
  err,
  hashSeed,
  headingDegrees,
  interpolatePoint,
  mulberry32,
  ok,
  roundKm,
  sleep,
  withSim,
} from "./util";
import {
  addShipment,
  liveNotifications,
  mergePayments,
  mergeShipments,
  patchPayment,
  queueNotification,
  runtimeGeneration,
} from "./runtime";
import type {
  AppNotification,
  Farmer,
  MarketplaceAnalytics,
  MarketPrice,
  MockResult,
  Order,
  OrderStatus,
  Payment,
  Product,
  Shipment,
  VehicleLocation,
} from "./types";

function farmers() {
  return DATASET.farmers;
}
function products() {
  return DATASET.products;
}
function buyers() {
  return DATASET.buyers;
}
function orders() {
  return DATASET.orders;
}
function shipments() {
  return mergeShipments(DATASET.shipments);
}
function payments() {
  return mergePayments(DATASET.payments);
}

export function readFarmers() {
  return farmers();
}
export function readProducts() {
  return products();
}
export function readBuyers() {
  return buyers();
}
export function readOrders() {
  return orders();
}
export function readShipments() {
  return shipments();
}
export function readPayments() {
  return payments();
}
export function readNotifications() {
  return liveNotifications(DATASET.notifications);
}
export function readVerifications() {
  return DATASET.verifications;
}
export function readMarketPrices() {
  return DATASET.marketPrices;
}

export async function getFarmers(): Promise<MockResult<Farmer[]>> {
  return withSim(() => farmers());
}

export async function getFarmer(id: string): Promise<MockResult<Farmer>> {
  const row = farmers().find((f) => f.id === id);
  if (!row) return err("Farmer not found");
  return ok(row);
}

export async function getProducts(farmerId?: string): Promise<MockResult<Product[]>> {
  return withSim(() => {
    const rows = products();
    return farmerId ? rows.filter((p) => p.farmerId === farmerId) : rows;
  });
}

export async function getBuyers() {
  return withSim(() => buyers());
}

export async function getOrders(filter?: { buyerId?: string; farmerId?: string; status?: OrderStatus }) {
  return withSim(() =>
    orders().filter((o) => {
      if (filter?.buyerId && o.buyerId !== filter.buyerId) return false;
      if (filter?.farmerId && o.farmerId !== filter.farmerId) return false;
      if (filter?.status && o.status !== filter.status) return false;
      return true;
    }),
  );
}

export async function getOrder(id: string): Promise<MockResult<Order>> {
  const row = orders().find((o) => o.id === id);
  if (!row) return err("Order not found");
  return ok(row);
}

export async function getPayments(orderId?: string) {
  return withSim(() => {
    const rows = payments();
    return orderId ? rows.filter((p) => p.orderId === orderId) : rows;
  });
}

export async function getPaymentByOrder(orderId: string): Promise<MockResult<Payment>> {
  const row = payments().find((p) => p.orderId === orderId);
  if (!row) return err("Payment not found");
  return ok(row);
}

export async function processPayment(orderId: string): Promise<MockResult<Payment>> {
  await sleep(2000);
  const order = orders().find((o) => o.id === orderId);
  if (!order) return err("Order not found");
  const current = payments().find((p) => p.orderId === orderId);
  if (!current) return err("Payment record missing");
  if (Math.random() > 0.9) {
    const failed: Payment = {
      ...current,
      status: "failed",
      transactionDate: new Date().toISOString(),
      transactionReference: `FAIL${orderId.slice(-4).toUpperCase()}`,
    };
    patchPayment(current.paymentId, failed);
    queueNotification({
      userId: order.buyerId,
      type: "payment_failed",
      title: "Payment failed",
      message: `Simulated payment for ${order.id} failed. No live gateway was charged.`,
      timestamp: failed.transactionDate,
      read: false,
      relatedEntityId: failed.paymentId,
    });
    return err("Simulated payment declined. Try again.");
  }
  const paid: Payment = {
    ...current,
    status: "success",
    amount: order.totalAmount,
    transactionDate: new Date().toISOString(),
    transactionReference: `UPI${Date.now().toString().slice(-8)}`,
  };
  patchPayment(current.paymentId, paid);
  queueNotification({
    userId: order.farmerId,
    type: "payment_success",
    title: "Payment received",
    message: `₹${paid.amount.toLocaleString("en-IN")} settled for order ${order.id}.`,
    timestamp: paid.transactionDate,
    read: false,
    relatedEntityId: paid.paymentId,
  });
  return ok(paid);
}

export async function getShipments() {
  return withSim(() => shipments(), { failRate: 0.04, min: 80, max: 180 });
}

export async function getShipmentStatus(id: string): Promise<MockResult<Shipment>> {
  if (Math.random() < 0.04) return err("Simulated logistics API timeout.");
  const row = shipments().find((s) => s.shipmentId === id || s.tripCode === id || s.orderId === id);
  if (!row) return err("Shipment not found");
  return ok(row);
}

export async function trackShipment(id: string) {
  const status = await getShipmentStatus(id);
  if (!status.ok) return status;
  const location = await getVehicleLocation(status.data.shipmentId);
  if (!location.ok) return location;
  return ok({ shipment: status.data, location: location.data });
}

export async function createShipment(input: {
  orderId: string;
  driver?: string;
  vehicleNumber?: string;
}): Promise<MockResult<Shipment>> {
  await sleep(400);
  if (Math.random() < 0.08) return err("Simulated logistics API timeout.");
  const order = orders().find((o) => o.id === input.orderId);
  if (!order) return err("Order not found");
  const existing = shipments().find((s) => s.orderId === order.id);
  if (existing) return ok(existing);
  const farmer = farmers().find((f) => f.id === order.farmerId)!;
  const buyer = buyers().find((b) => b.id === order.buyerId)!;
  const distance = roundKm(farmer, buyer);
  const created: Shipment = {
    shipmentId: `shp-live-${order.id}`,
    orderId: order.id,
    tripCode: `AS-TRP-${order.id.slice(-4).toUpperCase()}`,
    pickupLocation: `White Store — ${farmer.village}`,
    deliveryLocation: `${buyer.name} · ${buyer.location}`,
    pickupLat: farmer.lat,
    pickupLng: farmer.lng,
    deliveryLat: buyer.lat,
    deliveryLng: buyer.lng,
    assignedDriver: input.driver ?? FLEET.driver,
    vehicleNumber: input.vehicleNumber ?? FLEET.vehicle,
    vehicleType: "Covered Goods Vehicle",
    status: "assigned",
    estimatedDelivery: addMinutes(new Date().toISOString(), 240),
    currentLocation: farmer.location,
    distance,
    pickupTime: null,
    deliveryTime: null,
    earnings: order.deliveryFee,
    rate: Math.round(order.deliveryFee / Math.max(distance, 1)),
  };
  addShipment(created);
  queueNotification({
    userId: order.buyerId,
    type: "shipment_assigned",
    title: "Shipment assigned",
    message: `${created.tripCode} assigned to ${created.assignedDriver}.`,
    timestamp: new Date().toISOString(),
    read: false,
    relatedEntityId: created.shipmentId,
  });
  return ok(created);
}

export async function getVehicleLocation(shipmentId: string): Promise<MockResult<VehicleLocation>> {
  const shipment = shipments().find((s) => s.shipmentId === shipmentId || s.tripCode === shipmentId);
  if (!shipment) return err("Shipment not found");
  const from = { lat: shipment.pickupLat, lng: shipment.pickupLng };
  const to = { lat: shipment.deliveryLat, lng: shipment.deliveryLng };
  let t = 0;
  if (shipment.status === "picked_up") t = 0.08;
  else if (shipment.status === "in_transit") {
    const start = shipment.pickupTime ? +new Date(shipment.pickupTime) : Date.now() - 40 * 60_000;
    const end = +new Date(shipment.estimatedDelivery);
    t = Math.min(0.92, Math.max(0.12, (Date.now() - start) / Math.max(end - start, 60_000)));
  } else if (shipment.status === "delivered") t = 1;
  const jitterRng = mulberry32(hashSeed(shipment.shipmentId));
  const offset = (jitterRng() - 0.5) * 0.004;
  const point = interpolatePoint(from, to, t);
  const loc: VehicleLocation = {
    shipmentId: shipment.shipmentId,
    lat: point.lat + offset,
    lng: point.lng - offset / 2,
    heading: headingDegrees(from, to),
    speedKmh: shipment.status === "in_transit" ? 32 + Math.round(jitterRng() * 10) : 0,
    updatedAt: new Date().toISOString(),
    progress: t,
    simulated: true,
  };
  return ok(loc);
}

export async function getMarketPrices(cropName?: string): Promise<MockResult<MarketPrice[]>> {
  const hour = new Date().getHours();
  const source = cropName
    ? MARKET_BY_CROP.get(cropName) ??
      DATASET.marketPrices.filter((row) => row.crop.toLowerCase() === cropName.toLowerCase())
    : DATASET.marketPrices;
  const data = source.map((row) => {
    const rng = mulberry32(hashSeed(`${row.crop}|${row.market}|${row.date}|${hour}`));
    const jitter = Math.round((rng() - 0.5) * 40);
    const modalPrice = Math.max(100, row.modalPrice + jitter);
    return {
      ...row,
      modalPrice,
      minPrice: Math.min(row.minPrice, modalPrice - 40),
      maxPrice: Math.max(row.maxPrice, modalPrice + 40),
    };
  });
  return ok(data);
}

export async function getVerifications() {
  return withSim(() => DATASET.verifications);
}

export async function getFarmerVerification(farmerId: string) {
  const row = DATASET.verifications.find((v) => v.farmerId === farmerId);
  if (!row) return err("Verification record not found");
  return ok(row);
}

export async function getNotifications(userId?: string) {
  return withSim(() => {
    const rows = liveNotifications(DATASET.notifications);
    return userId ? rows.filter((n) => n.userId === userId) : rows;
  });
}

export async function sendNotification(
  input: Omit<AppNotification, "id" | "timestamp" | "read"> & { timestamp?: string },
) {
  queueNotification({
    ...input,
    timestamp: input.timestamp ?? new Date().toISOString(),
    read: false,
  });
  return ok({ queued: true as const });
}

let analyticsCache: MarketplaceAnalytics | null = null;
let analyticsGen = -1;

export function computeAnalytics(): MarketplaceAnalytics {
  const gen = runtimeGeneration();
  if (analyticsCache && analyticsGen === gen) return analyticsCache;
  const allOrders = orders();
  const productById = new Map(products().map((p) => [p.id, p]));
  const delivered = allOrders.filter((o) => o.status === "delivered");
  const cancelled = allOrders.filter((o) => o.status === "cancelled");
  const totalRevenue = delivered.reduce((s, o) => s + o.totalAmount, 0);
  const cropMap = new Map<string, { quantity: number; revenue: number }>();
  for (const order of delivered) {
    const product = productById.get(order.productId);
    const crop = product?.cropName ?? "Unknown";
    const cur = cropMap.get(crop) ?? { quantity: 0, revenue: 0 };
    cur.quantity += order.quantity;
    cur.revenue += order.totalAmount;
    cropMap.set(crop, cur);
  }
  const statuses: OrderStatus[] = [
    "pending",
    "confirmed",
    "processing",
    "ready_for_pickup",
    "in_transit",
    "delivered",
    "cancelled",
  ];
  const statusCount = new Map<OrderStatus, number>();
  for (const order of allOrders) {
    statusCount.set(order.status, (statusCount.get(order.status) ?? 0) + 1);
  }
  const monthMap = new Map<string, { revenue: number; orders: number; sort: string }>();
  for (const order of delivered) {
    const d = new Date(order.orderDate);
    const sort = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const month = d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
    const cur = monthMap.get(month) ?? { revenue: 0, orders: 0, sort };
    cur.revenue += order.totalAmount;
    cur.orders += 1;
    monthMap.set(month, cur);
  }
  const ships = shipments().filter((s) => s.status === "delivered");
  let onTime = 0;
  let delayed = 0;
  for (const s of ships) {
    if (!s.deliveryTime) continue;
    if (+new Date(s.deliveryTime) <= +new Date(s.estimatedDelivery)) onTime += 1;
    else delayed += 1;
  }
  const deliveredCount = onTime + delayed;
  const activeFarmers = new Set(delivered.map((o) => o.farmerId)).size;
  analyticsCache = {
    totalFarmers: farmers().length,
    activeFarmers,
    totalBuyers: buyers().length,
    totalOrders: allOrders.length,
    completedOrders: delivered.length,
    cancelledOrders: cancelled.length,
    totalRevenue,
    averageOrderValue: delivered.length ? Math.round(totalRevenue / delivered.length) : 0,
    topSellingCrops: [...cropMap.entries()]
      .map(([crop, v]) => ({ crop, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6),
    topFarmers: farmers()
      .slice()
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 5)
      .map((f) => ({ farmerId: f.id, name: f.name, totalSales: f.totalSales })),
    monthlyRevenue: [...monthMap.entries()]
      .sort((a, b) => a[1].sort.localeCompare(b[1].sort))
      .map(([month, v]) => ({ month, revenue: v.revenue, orders: v.orders })),
    orderStatusBreakdown: statuses.map((status) => ({
      status,
      count: statusCount.get(status) ?? 0,
    })),
    farmerEarnings: farmers()
      .map((f) => ({ farmerId: f.id, name: f.name, earnings: f.totalSales }))
      .filter((f) => f.earnings > 0)
      .sort((a, b) => b.earnings - a.earnings),
    logisticsPerformance: {
      delivered: deliveredCount,
      onTime,
      delayed,
      onTimePercent: deliveredCount ? Math.round((onTime / deliveredCount) * 100) : 0,
      delayedPercent: deliveredCount ? Math.round((delayed / deliveredCount) * 100) : 0,
      avgDistanceKm: ships.length
        ? Math.round(ships.reduce((s, x) => s + x.distance, 0) / ships.length)
        : 0,
    },
  };
  analyticsGen = gen;
  return analyticsCache;
}

export async function getAnalytics() {
  return ok(computeAnalytics());
}

export const mockDataService = {
  getFarmers,
  getFarmer,
  getProducts,
  getBuyers,
  getOrders,
  getOrder,
  getPayments,
  getPaymentByOrder,
  processPayment,
  getShipments,
  getShipmentStatus,
  trackShipment,
  createShipment,
  getVehicleLocation,
  getMarketPrices,
  getVerifications,
  getFarmerVerification,
  getNotifications,
  sendNotification,
  getAnalytics,
};

export { DATASET, FLEET };
export { formatChartDay, formatDay, relativeTime } from "./util";
