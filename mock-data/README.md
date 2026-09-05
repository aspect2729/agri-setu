# Mock / seed data (`/mock-data`)

Central demo layer for Agri Setu surfaces that are **not** backed by a live vendor: logistics overlay, payments, GPS, mandi prices, farmer verification, the mock logistics API, analytics, and notifications.

Live White Store receiving, QR batches, buyer orders, and admin matching still come from **Supabase**. Do not mix those code paths with this folder.

## Where it lives

| File | Role |
|---|---|
| `types.ts` | Shared entity and API result types |
| `seed.ts` | Canonical dataset (`buildDataset()` → `DATASET`) plus integrity checks |
| `runtime.ts` | In-memory overlays for `processPayment()` / `createShipment()` / `sendNotification()` |
| `services.ts` | Async service functions with simulated latency and occasional errors |
| `util.ts` | Seeded RNG, delays, interpolation |
| `adapters/logistics.ts` | Maps shipments → logistics UI trips / vehicles / earnings |
| `index.ts` | Public barrel (`mockDataService`, `getOrders()`, …) |

UI must call **services or adapters**, never invent numbers in components. Earnings, analytics revenue, and payment amounts are derived from the same orders.

## How to modify or regenerate

1. Edit drafts in `seed.ts` (`FARMER_DRAFTS`, `PRODUCT_DRAFTS`, `BUYER_DRAFTS`, `ORDER_SPECS`).
2. Keep IDs stable and referenced: every `farmerId` / `buyerId` / `productId` / `orderId` used in orders, payments, shipments, and notifications must exist.
3. `assertDataset()` runs when the module loads. A broken reference throws immediately.
4. Restart `npm run dev`. There is no separate generate script — the TypeScript module *is* the generator.
5. `totalSales` / `totalSpent` / analytics GMV are computed from **delivered** orders after the drafts are expanded. Do not hardcode those totals.

Previous v1 drafts are stashed in `archive/seed-v1.ts.bak`. Extra rows live in `extra-drafts.ts` and are concatenated in `seed.ts`.

Clock is pinned to `DEMO_NOW` (`2026-09-04`) so timelines stay stable.

## Simulated vs real

| Feature | Source today | Swap later |
|---|---|---|
| Farmer receiving, QR, store cash, buyer orders, matching | Supabase + `lib/actions.ts` | Keep |
| Weather | Open-Meteo via `lib/weather.ts` | Keep |
| Logistics board overlay, vehicles, trip history, partner notifications | `adapters/logistics.ts` ← this folder | Replace adapter with live `deliveries` only |
| Payments (`processPayment`) | Mock, ~2s delay, ~90% success, amount = order `totalAmount` | Same signature → Razorpay / UPI |
| GPS (`getVehicleLocation`) | Interpolated pickup → drop | Same signature → GPS vendor |
| Market prices (`getMarketPrices`) | 6 APMCs × 21 days + hourly jitter | Same signature → Agmarknet / eNAM |
| Farmer verification | Document **labels** only — no ID numbers | Same signature → KYC vendor |
| Logistics API (`createShipment`, `getShipmentStatus`, `trackShipment`) | Mock latency + ~8% timeout | Same signatures → 3PL |
| Analytics (`getAnalytics` / `computeAnalytics`) | Derived from mock orders/shipments | Point at warehouse queries |
| Notifications (`sendNotification`) | In-memory queue | Same signature → FCM / SMS |

Admin **Simulated data** (`/admin` → Simulated data) and logistics screens show a **DEMO DATA** / **SIMULATED** badge. Admin dashboard / reports that read Supabase are live seed data, not this module.

## Service map (UI does not change)

```ts
import { mockDataService } from "@/mock-data";

await mockDataService.getFarmers();
await mockDataService.getOrders();
await mockDataService.getShipmentStatus(id);
await mockDataService.trackShipment(id);
await mockDataService.createShipment({ orderId });
await mockDataService.processPayment(orderId);
await mockDataService.getVehicleLocation(shipmentId);
await mockDataService.getMarketPrices("Tomato");
await mockDataService.getFarmerVerification(farmerId);
await mockDataService.getAnalytics();
await mockDataService.sendNotification({ ... });
```

Each async call returns `{ ok: true, data, simulated: true }` or `{ ok: false, error, simulated: true }`.

Sync readers (`readOrders()`, `readShipments()`, …) exist only for SSR adapters. Prefer the async functions from client UI.
