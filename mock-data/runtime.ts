import type { AppNotification, Payment, Shipment } from "./types";

const paymentPatch = new Map<string, Partial<Payment>>();
const shipmentPatch = new Map<string, Partial<Shipment>>();
const extraShipments: Shipment[] = [];
const extraNotifications: AppNotification[] = [];
let notificationSeq = 900;

export function getPaymentPatch(id: string) {
  return paymentPatch.get(id);
}

export function patchPayment(id: string, patch: Partial<Payment>) {
  paymentPatch.set(id, { ...paymentPatch.get(id), ...patch });
}

export function patchShipment(id: string, patch: Partial<Shipment>) {
  shipmentPatch.set(id, { ...shipmentPatch.get(id), ...patch });
}

export function addShipment(shipment: Shipment) {
  extraShipments.push(shipment);
}

export function extraShipmentList() {
  return extraShipments;
}

export function mergeShipments(base: Shipment[]) {
  const byId = new Map(base.map((s) => [s.shipmentId, s]));
  for (const extra of extraShipments) byId.set(extra.shipmentId, extra);
  return [...byId.values()].map((s) => ({ ...s, ...shipmentPatch.get(s.shipmentId) }));
}

export function mergePayments(base: Payment[]) {
  return base.map((p) => ({ ...p, ...paymentPatch.get(p.paymentId) }));
}

export function queueNotification(note: Omit<AppNotification, "id">) {
  notificationSeq += 1;
  extraNotifications.unshift({ ...note, id: `ntf-live-${notificationSeq}` });
}

export function liveNotifications(base: AppNotification[]) {
  return [...extraNotifications, ...base];
}
