import type { AppNotification, Payment, Shipment } from "./types";

const paymentPatch = new Map<string, Partial<Payment>>();
const shipmentPatch = new Map<string, Partial<Shipment>>();
const extraShipments: Shipment[] = [];
const extraNotifications: AppNotification[] = [];
let notificationSeq = 900;
let generation = 1;
let shipmentCache: Shipment[] | null = null;
let shipmentCacheGen = -1;
let paymentCache: Payment[] | null = null;
let paymentCacheGen = -1;
let paymentBase: Payment[] | null = null;
let shipmentBase: Shipment[] | null = null;

export function runtimeGeneration() {
  return generation;
}

function bump() {
  generation += 1;
  shipmentCache = null;
  paymentCache = null;
}

export function getPaymentPatch(id: string) {
  return paymentPatch.get(id);
}

export function patchPayment(id: string, patch: Partial<Payment>) {
  paymentPatch.set(id, { ...paymentPatch.get(id), ...patch });
  bump();
}

export function patchShipment(id: string, patch: Partial<Shipment>) {
  shipmentPatch.set(id, { ...shipmentPatch.get(id), ...patch });
  bump();
}

export function addShipment(shipment: Shipment) {
  extraShipments.push(shipment);
  bump();
}

export function extraShipmentList() {
  return extraShipments;
}

export function mergeShipments(base: Shipment[]) {
  if (shipmentCache && shipmentCacheGen === generation && shipmentBase === base) {
    return shipmentCache;
  }
  const byId = new Map(base.map((s) => [s.shipmentId, s]));
  for (const extra of extraShipments) byId.set(extra.shipmentId, extra);
  const merged = [...byId.values()].map((s) => {
    const patch = shipmentPatch.get(s.shipmentId);
    return patch ? { ...s, ...patch } : s;
  });
  shipmentCache = merged;
  shipmentCacheGen = generation;
  shipmentBase = base;
  return merged;
}

export function mergePayments(base: Payment[]) {
  if (paymentCache && paymentCacheGen === generation && paymentBase === base) {
    return paymentCache;
  }
  const merged =
    paymentPatch.size === 0
      ? base
      : base.map((p) => {
          const patch = paymentPatch.get(p.paymentId);
          return patch ? { ...p, ...patch } : p;
        });
  paymentCache = merged;
  paymentCacheGen = generation;
  paymentBase = base;
  return merged;
}

export function queueNotification(note: Omit<AppNotification, "id">) {
  notificationSeq += 1;
  extraNotifications.unshift({ ...note, id: `ntf-live-${notificationSeq}` });
  bump();
}

export function liveNotifications(base: AppNotification[]) {
  if (extraNotifications.length === 0) return base;
  return [...extraNotifications, ...base];
}
