import type {
  AdminData,
  AdminNotification,
  Buyer,
  CashEntry,
  DemandItem,
  Employee,
  Farmer,
  InventoryItem,
  InvStatus,
  MatchStatus,
  Order,
  OrderStatus,
  PaymentStatus,
  Store,
  StoreStatus,
  SupplyItem,
  Transaction,
} from "./types";

type ProfileRow = {
  id: string;
  full_name: string;
  phone: string | null;
  village: string | null;
  role: string;
  store_id: string | null;
  created_at: string;
};

type StoreRow = {
  id: string;
  name: string;
  village: string;
  address: string | null;
  operator_id: string | null;
  created_at: string;
  profiles?: { full_name: string } | null;
};

type SubmissionRow = {
  id: string;
  farmer_id: string;
  store_id: string;
  crop: string;
  quantity_kg: number;
  expected_price: number | null;
  status: string;
  actual_weight_kg: number | null;
  remaining_kg: number | null;
  quality_grade: string | null;
  price_per_kg: number | null;
  paid_amount: number | null;
  paid_at: string | null;
  batch_code: string | null;
  created_at: string;
  profiles?: { full_name: string; village: string | null; phone: string | null } | null;
};

type DemandRow = {
  id: string;
  buyer_id: string;
  crop: string;
  quantity_kg: number;
  offered_price: number | null;
  status: string;
  created_at: string;
  profiles?: { full_name: string } | null;
};

type OrderRow = {
  id: string;
  buyer_id: string | null;
  store_id: string;
  crop: string;
  quantity_kg: number;
  agreed_price: number;
  status: string;
  created_at: string;
  white_stores?: { name: string } | null;
  profiles?: { full_name: string } | null;
  deliveries?: { status: string } | null;
};

type CashRow = {
  id: string;
  store_id: string;
  direction: "in" | "out";
  amount: number;
  description: string;
  created_at: string;
};

export type AdminRaw = {
  adminName: string;
  profiles: ProfileRow[];
  stores: StoreRow[];
  submissions: SubmissionRow[];
  demands: DemandRow[];
  orders: OrderRow[];
  cash: CashRow[];
};

function num(v: unknown, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function sameDay(iso: string, ref = new Date()) {
  const d = new Date(iso);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth() && d.getDate() === ref.getDate();
}

function dayKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDayLabel(isoOrKey: string) {
  const d = new Date(isoOrKey.length <= 10 ? `${isoOrKey}T12:00:00` : isoOrKey);
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function relativeTime(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

function ageDays(iso: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
}

function shortCode(id: string, prefix: string) {
  return `${prefix}-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

function freshnessFromAge(days: number) {
  if (days <= 1) return 95;
  if (days <= 2) return 88;
  if (days <= 4) return 74;
  if (days <= 6) return 62;
  return 48;
}

function invStatus(freshness: number): InvStatus {
  if (freshness > 80) return "Fresh";
  if (freshness > 65) return "Aging";
  return "Critical";
}

function mapOrderStatus(status: string, deliveryStatus?: string | null): OrderStatus {
  if (status === "completed") return "Paid";
  if (status === "delivered" || deliveryStatus === "delivered") return "Delivered";
  if (status === "in_transit" || deliveryStatus === "in_transit" || deliveryStatus === "picked_up") return "Fulfilled";
  if (status === "pickup_scheduled" || status === "accepted" || deliveryStatus === "accepted") return "Preparing";
  if (status === "matched") return "Matched";
  return "Placed";
}

function paymentForOrder(status: OrderStatus): PaymentStatus {
  if (status === "Paid") return "Paid";
  if (status === "Delivered") return "Pending";
  return "Pending";
}

function lastNDays(n: number) {
  const days: { key: string; label: string }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = dayKey(d.toISOString());
    days.push({ key, label: formatDayLabel(key) });
  }
  return days;
}

function qualityLabel(grade: string | null) {
  if (grade === "A") return "Grade A";
  if (grade === "B") return "Grade B";
  if (grade === "C") return "Grade C";
  return "Ungraded";
}

export function mapAdminData(raw: AdminRaw): AdminData {
  const profiles = raw.profiles ?? [];
  const storeRows = raw.stores ?? [];
  const submissions = raw.submissions ?? [];
  const demands = raw.demands ?? [];
  const orderRows = raw.orders ?? [];
  const cashRows = raw.cash ?? [];

  const storeName = (id: string) => storeRows.find((s) => s.id === id)?.name ?? "White Store";
  const profileName = (id: string | null | undefined) =>
    profiles.find((p) => p.id === id)?.full_name ?? "—";

  const received = submissions.filter((s) => s.status !== "submitted");

  const stores: Store[] = storeRows.map((s) => {
    const storeSubs = submissions.filter((x) => x.store_id === s.id);
    const storeReceived = storeSubs.filter((x) => x.status !== "submitted");
    const storeCash = cashRows.filter((c) => c.store_id === s.id);
    const cashIn = storeCash.filter((c) => c.direction === "in").reduce((sum, c) => sum + num(c.amount), 0);
    const cashOut = storeCash.filter((c) => c.direction === "out").reduce((sum, c) => sum + num(c.amount), 0);
    const inventory = storeReceived.reduce((sum, x) => sum + num(x.remaining_kg), 0);
    const todayVolume = storeSubs.filter((x) => sameDay(x.created_at)).reduce(
      (sum, x) => sum + num(x.actual_weight_kg ?? x.quantity_kg),
      0
    );
    const todayPurchases = storeCash
      .filter((c) => c.direction === "out" && sameDay(c.created_at))
      .reduce((sum, c) => sum + num(c.amount), 0);
    const todaySales = storeCash
      .filter((c) => c.direction === "in" && sameDay(c.created_at))
      .reduce((sum, c) => sum + num(c.amount), 0);
    const employees = profiles.filter((p) => p.role === "employee" && p.store_id === s.id).length;
    const farmersServed = new Set(storeSubs.map((x) => x.farmer_id)).size;
    const orders = orderRows.filter((o) => o.store_id === s.id).length;
    const aging = storeReceived.some((x) => freshnessFromAge(ageDays(x.created_at)) <= 65);
    const status: StoreStatus = aging ? "Needs Attention" : inventory > 0 || todayVolume > 0 ? "Active" : "Inactive";

    return {
      id: s.id,
      name: s.name,
      location: s.village,
      village: s.village,
      cluster: s.village,
      manager: s.profiles?.full_name ?? profileName(s.operator_id),
      employees,
      farmersServed,
      todayPurchases,
      todaySales,
      todayVolume,
      inventory,
      orders,
      cashBalance: cashIn - cashOut,
      status,
    };
  });

  const farmers: Farmer[] = profiles
    .filter((p) => p.role === "farmer")
    .map((p) => {
      const theirs = submissions.filter((s) => s.farmer_id === p.id);
      const latest = theirs[0];
      const storeId = latest?.store_id ?? p.store_id ?? stores[0]?.id ?? "";
      return {
        id: p.id,
        name: p.full_name,
        phone: p.phone ?? "—",
        village: p.village ?? "—",
        storeId,
        totalProduce: theirs.reduce((sum, s) => sum + num(s.actual_weight_kg ?? s.quantity_kg), 0),
        lastCollection: latest ? formatDate(latest.created_at) : "—",
        totalPayments: theirs.reduce((sum, s) => sum + num(s.paid_amount), 0),
        status: theirs.length > 0 ? "Active" : "Inactive",
        crops: Array.from(new Set(theirs.map((s) => s.crop))),
        joinDate: formatDate(p.created_at),
      };
    });

  const buyers: Buyer[] = profiles
    .filter((p) => p.role === "buyer")
    .map((p) => {
      const theirs = orderRows.filter((o) => o.buyer_id === p.id);
      const latest = theirs[0];
      return {
        id: p.id,
        name: p.full_name,
        company: p.village ?? p.full_name,
        phone: p.phone ?? "—",
        location: p.village ?? "—",
        totalOrders: theirs.length,
        totalPurchases: theirs.reduce((sum, o) => sum + num(o.quantity_kg) * num(o.agreed_price), 0),
        status: theirs.length > 0 ? "Active" : "Inactive",
        lastOrder: latest ? formatDate(latest.created_at) : "—",
      };
    });

  const employees: Employee[] = profiles
    .filter((p) => p.role === "employee" || p.role === "store")
    .map((p) => {
      const storeId =
        p.store_id ?? storeRows.find((s) => s.operator_id === p.id)?.id ?? "";
      return {
        id: p.id,
        name: p.full_name,
        role: p.role === "store" ? "Store Manager" : "Store Employee",
        storeId,
        storeName: storeId ? storeName(storeId) : "Unassigned",
        phone: p.phone ?? "—",
        status: "Active",
        joinDate: formatDate(p.created_at),
        lastActive: relativeTime(p.created_at),
      };
    });

  const purchaseTxns: Transaction[] = received.map((s) => {
    const qty = num(s.actual_weight_kg ?? s.quantity_kg);
    const price = num(s.price_per_kg ?? s.expected_price, 20);
    return {
      id: shortCode(s.id, "TX"),
      date: formatDate(s.created_at),
      time: formatTime(s.created_at),
      type: "Purchase" as const,
      storeId: s.store_id,
      storeName: storeName(s.store_id),
      farmerId: s.farmer_id,
      farmerName: s.profiles?.full_name ?? profileName(s.farmer_id),
      crop: s.crop,
      quantity: qty,
      quality: qualityLabel(s.quality_grade),
      pricePerKg: price,
      amount: num(s.paid_amount, qty * price),
      paymentStatus: s.paid_amount != null ? "Paid" : "Pending",
      qrId: s.batch_code ?? shortCode(s.id, "QR"),
    };
  });

  const saleTxns: Transaction[] = orderRows.map((o) => ({
    id: shortCode(o.id, "SL"),
    date: formatDate(o.created_at),
    time: formatTime(o.created_at),
    type: "Sale" as const,
    storeId: o.store_id,
    storeName: o.white_stores?.name ?? storeName(o.store_id),
    buyerId: o.buyer_id ?? undefined,
    buyerName: o.profiles?.full_name ?? profileName(o.buyer_id),
    crop: o.crop,
    quantity: num(o.quantity_kg),
    quality: "Grade A",
    pricePerKg: num(o.agreed_price),
    amount: num(o.quantity_kg) * num(o.agreed_price),
    paymentStatus: o.status === "completed" ? "Paid" : "Pending",
    orderId: shortCode(o.id, "ORD"),
    qrId: shortCode(o.id, "QR"),
  }));

  const transactions = [...purchaseTxns, ...saleTxns].sort((a, b) =>
    a.date === b.date ? b.time.localeCompare(a.time) : 0
  );

  const orders: Order[] = orderRows.map((o) => {
    const status = mapOrderStatus(o.status, o.deliveries?.status);
    return {
      id: shortCode(o.id, "ORD"),
      date: formatDate(o.created_at),
      buyerId: o.buyer_id ?? "",
      buyerName: o.profiles?.full_name ?? profileName(o.buyer_id),
      crop: o.crop,
      quantity: num(o.quantity_kg),
      quality: "Grade A",
      value: num(o.quantity_kg) * num(o.agreed_price),
      storeId: o.store_id,
      storeName: o.white_stores?.name ?? storeName(o.store_id),
      status,
      paymentStatus: paymentForOrder(status),
      matchedAt: status !== "Placed" ? formatDate(o.created_at) : undefined,
      fulfilledAt: ["Fulfilled", "Delivered", "Paid"].includes(status) ? formatDate(o.created_at) : undefined,
      deliveredAt: ["Delivered", "Paid"].includes(status) ? formatDate(o.created_at) : undefined,
      paidAt: status === "Paid" ? formatDate(o.created_at) : undefined,
    };
  });

  const cashByStoreRunning = new Map<string, number>();
  const cashSorted = [...cashRows].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const cashEntries: CashEntry[] = cashSorted.map((c) => {
    const prev = cashByStoreRunning.get(c.store_id) ?? 0;
    const next = c.direction === "in" ? prev + num(c.amount) : prev - num(c.amount);
    cashByStoreRunning.set(c.store_id, next);
    const isAnomaly = c.direction === "out" && num(c.amount) >= 40000;
    return {
      id: c.id,
      date: formatDate(c.created_at),
      time: formatTime(c.created_at),
      description: c.description,
      type: (c.direction === "in" ? "In" : "Out") as "In" | "Out",
      storeId: c.store_id,
      storeName: storeName(c.store_id),
      partyName: c.description,
      amount: num(c.amount),
      balance: next,
      reference: shortCode(c.id, "CSH"),
      isAnomaly,
      anomalyNote: isAnomaly ? "Large outflow — review against linked purchases." : undefined,
    };
  }).reverse();

  const inventory: InventoryItem[] = [];
  const invKey = new Map<string, InventoryItem>();
  for (const s of received) {
    const remaining = num(s.remaining_kg);
    const total = num(s.actual_weight_kg ?? s.quantity_kg);
    if (total <= 0) continue;
    const key = `${s.store_id}|${s.crop}|${s.quality_grade ?? "U"}`;
    const freshness = freshnessFromAge(ageDays(s.created_at));
    const existing = invKey.get(key);
    if (existing) {
      existing.totalQty += total;
      existing.available += remaining;
      existing.reserved = Math.max(0, existing.totalQty - existing.available);
      existing.avgAge = Math.round((existing.avgAge + ageDays(s.created_at)) / 2);
      existing.freshness = Math.min(existing.freshness, freshness);
      existing.status = invStatus(existing.freshness);
    } else {
      const item: InventoryItem = {
        id: key,
        storeId: s.store_id,
        storeName: storeName(s.store_id),
        crop: s.crop,
        totalQty: total,
        available: remaining,
        reserved: Math.max(0, total - remaining),
        quality: qualityLabel(s.quality_grade),
        avgAge: ageDays(s.created_at),
        freshness,
        status: invStatus(freshness),
      };
      invKey.set(key, item);
      inventory.push(item);
    }
  }

  const supplyByCrop = new Map<string, number>();
  for (const item of inventory) {
    supplyByCrop.set(item.crop, (supplyByCrop.get(item.crop) ?? 0) + item.available);
  }
  const demandByCrop = new Map<string, number>();
  for (const d of demands.filter((x) => x.status === "open")) {
    demandByCrop.set(d.crop, (demandByCrop.get(d.crop) ?? 0) + num(d.quantity_kg));
  }

  function supplyMatchStatus(crop: string, available: number): MatchStatus {
    const demand = demandByCrop.get(crop) ?? 0;
    if (demand <= 0) return "Surplus";
    if (available <= 0) return "Matched";
    if ((supplyByCrop.get(crop) ?? 0) < demand) return "Shortage";
    return "Unmatched";
  }

  function demandMatchStatus(crop: string, requested: number, status: string): MatchStatus {
    if (status === "matched" || status === "fulfilled") return "Matched";
    const supply = supplyByCrop.get(crop) ?? 0;
    if (supply <= 0) return "Shortage";
    if (supply < requested) return "Shortage";
    return "Unmatched";
  }

  const supplyItems: SupplyItem[] = inventory
    .filter((i) => i.available > 0)
    .map((i) => ({
      id: `sup-${i.id}`,
      storeId: i.storeId,
      storeName: i.storeName,
      crop: i.crop,
      available: i.available,
      quality: i.quality,
      freshness: i.freshness,
      matchStatus: supplyMatchStatus(i.crop, i.available),
    }));

  const demandItems: DemandItem[] = demands.map((d) => ({
    id: d.id,
    buyerId: d.buyer_id,
    buyerName: d.profiles?.full_name ?? profileName(d.buyer_id),
    crop: d.crop,
    requested: num(d.quantity_kg),
    quality: "Grade A",
    orderId: shortCode(d.id, "DEM"),
    offeredPrice: d.offered_price != null ? num(d.offered_price) : undefined,
    matchStatus: demandMatchStatus(d.crop, num(d.quantity_kg), d.status),
  }));

  const notifications: AdminNotification[] = [];
  for (const item of inventory.filter((i) => i.status === "Critical" || i.status === "Aging")) {
    notifications.push({
      id: `inv-${item.id}`,
      type: item.status === "Critical" ? "Critical" : "Attention",
      title: `${item.crop} ${item.status.toLowerCase()} — ${item.storeName}`,
      body: `${item.available.toLocaleString()} kg at ${item.freshness}% freshness. Clearance recommended.`,
      time: relativeTime(new Date(Date.now() - item.avgAge * 86400000).toISOString()),
      read: false,
      link: "inventory",
      storeId: item.storeId,
    });
  }
  for (const d of demandItems.filter((x) => x.matchStatus === "Shortage" || x.matchStatus === "Unmatched")) {
    const supply = supplyByCrop.get(d.crop) ?? 0;
    notifications.push({
      id: `dem-${d.id}`,
      type: d.matchStatus === "Shortage" ? "Attention" : "Info",
      title: `${d.crop} demand ${d.matchStatus === "Shortage" ? "shortage" : "unmatched"}`,
      body:
        supply < d.requested
          ? `Demand of ${d.requested.toLocaleString()} kg exceeds supply of ${supply.toLocaleString()} kg.`
          : `${d.buyerName} needs ${d.requested.toLocaleString()} kg ${d.crop}.`,
      time: "Live",
      read: false,
      link: "matching",
    });
  }
  for (const c of cashEntries.filter((x) => x.isAnomaly).slice(0, 3)) {
    notifications.push({
      id: `cash-${c.id}`,
      type: "Critical",
      title: `Cash anomaly — ${c.storeName}`,
      body: `₹${c.amount.toLocaleString()} outflow flagged for review.`,
      time: `${c.date} ${c.time}`,
      read: false,
      link: "cashflow",
      storeId: c.storeId,
    });
  }
  for (const s of stores.filter((st) => st.todaySales === 0 && st.inventory > 0)) {
    notifications.push({
      id: `idle-${s.id}`,
      type: "Attention",
      title: `${s.name}: no sales today`,
      body: `${s.inventory.toLocaleString()} kg inventory with no sales recorded.`,
      time: "Today",
      read: false,
      link: "stores",
      storeId: s.id,
    });
  }

  const days7 = lastNDays(7);
  const supplyDemandChart = days7.map(({ key, label }) => {
    const supply = received
      .filter((s) => dayKey(s.created_at) <= key)
      .reduce((sum, s) => sum + num(s.actual_weight_kg ?? s.quantity_kg), 0);
    const demand = demands
      .filter((d) => dayKey(d.created_at) <= key)
      .reduce((sum, d) => sum + num(d.quantity_kg), 0);
    return { date: label, supply, demand };
  });

  const cashFlowChart = days7.map(({ key, label }) => ({
    date: label,
    inflow: cashRows.filter((c) => c.direction === "in" && dayKey(c.created_at) === key).reduce((sum, c) => sum + num(c.amount), 0),
    outflow: cashRows.filter((c) => c.direction === "out" && dayKey(c.created_at) === key).reduce((sum, c) => sum + num(c.amount), 0),
  }));

  const storeVolumeChart = stores.map((s) => ({
    name: s.name.replace(/ White Store$/i, ""),
    volume: s.inventory || s.todayVolume,
    revenue: s.todaySales || Math.max(0, s.cashBalance),
  }));

  const cropSet = new Set([...supplyByCrop.keys(), ...demandByCrop.keys()]);
  const topCrops = Array.from(cropSet).map((crop) => {
    const supply = supplyByCrop.get(crop) ?? 0;
    const demand = demandByCrop.get(crop) ?? 0;
    return { crop, supply, demand, gap: supply - demand };
  }).sort((a, b) => b.supply + b.demand - (a.supply + a.demand));

  const storeKpiHistory = days7.map(({ key, label }) => ({
    date: label,
    sales: cashRows.filter((c) => c.direction === "in" && dayKey(c.created_at) === key).reduce((sum, c) => sum + num(c.amount), 0),
    purchases: cashRows.filter((c) => c.direction === "out" && dayKey(c.created_at) === key).reduce((sum, c) => sum + num(c.amount), 0),
  }));

  return {
    adminName: raw.adminName,
    stores,
    farmers,
    buyers,
    employees,
    transactions,
    orders,
    cashEntries,
    inventory,
    supplyItems,
    demandItems,
    notifications,
    supplyDemandChart,
    cashFlowChart,
    storeVolumeChart,
    topCrops,
    storeKpiHistory,
  };
}
