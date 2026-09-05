/**
 * Seeds demo accounts and data for the Agri Setu SIH demo.
 *
 * Prerequisites:
 *   1. Run supabase/migrations/001_schema.sql AND 002_agri_setu.sql in the
 *      Supabase SQL editor (in that order).
 *   2. Fill NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
 *
 * Run: npm run seed
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Minimal .env.local loader (avoids a dotenv dependency).
try {
  const env = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of env.split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim();
  }
} catch {
  // .env.local missing; rely on process env
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey || url.includes("YOUR_PROJECT") || serviceKey.includes("YOUR_")) {
  console.error(
    "Missing Supabase credentials. Fill NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first."
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PASSWORD = "agrisetu123";
const NIL = "00000000-0000-0000-0000-000000000000";

const salePrice = (paid) => Math.round(paid * 1.15);

function batchCode(tag) {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  const seed = [...String(tag)].reduce((h, ch) => (h * 33 + ch.charCodeAt(0)) >>> 0, 2166136261);
  let n = seed;
  for (let i = 0; i < 6; i++) {
    n = (Math.imul(n, 1664525) + 1013904223) >>> 0;
    s += alphabet[n % alphabet.length];
  }
  return `AGS-${s}`;
}

const daysAgo = (n) => new Date(Date.now() - n * 24 * 3600 * 1000).toISOString();

const USERS = [
  { email: "admin@agrisetu.demo", full_name: "Agri Setu Admin", role: "admin", village: "Head Office" },
  { email: "farmer1@agrisetu.demo", full_name: "Ramesh Kumar", role: "farmer", village: "Rampur", lat: 26.452, lng: 80.351 },
  { email: "farmer2@agrisetu.demo", full_name: "Sita Devi", role: "farmer", village: "Rampur", lat: 26.448, lng: 80.342 },
  { email: "farmer3@agrisetu.demo", full_name: "Mahesh Patil", role: "farmer", village: "Lakshmipur", lat: 26.31, lng: 80.552 },
  { email: "farmer4@agrisetu.demo", full_name: "Lakshmi Gowda", role: "farmer", village: "Rampur", lat: 26.449, lng: 80.348 },
  { email: "farmer5@agrisetu.demo", full_name: "Anand Reddy", role: "farmer", village: "Lakshmipur", lat: 26.305, lng: 80.548 },
  { email: "farmer6@agrisetu.demo", full_name: "Kavitha N", role: "farmer", village: "Rampur", lat: 26.455, lng: 80.357 },
  { email: "store1@agrisetu.demo", full_name: "Rampur Store Manager", role: "store", village: "Rampur" },
  { email: "store2@agrisetu.demo", full_name: "Lakshmipur Store Manager", role: "store", village: "Lakshmipur" },
  { email: "buyer1@agrisetu.demo", full_name: "FreshMart Wholesale", role: "buyer", village: "City Market", lat: 26.47, lng: 80.36 },
  { email: "logistics1@agrisetu.demo", full_name: "Shakti Transport", role: "logistics", village: "District HQ" },
];

// Employees are created after their store exists (metadata carries store_id).
const EMPLOYEES = [
  { email: "employee1@agrisetu.demo", full_name: "Suresh Yadav", store: "Rampur" },
  { email: "employee2@agrisetu.demo", full_name: "Kavita Sharma", store: "Lakshmipur" },
];

async function createUser(u, extraMeta = {}) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: u.email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: {
      full_name: u.full_name,
      role: u.role ?? "employee",
      village: u.village ?? null,
      phone: "9000000000",
      lat: u.lat != null ? String(u.lat) : "",
      lng: u.lng != null ? String(u.lng) : "",
      ...extraMeta,
    },
  });
  if (error) throw new Error(`Failed to create ${u.email}: ${error.message}`);
  return data.user.id;
}

async function main() {
  // Wipe previous demo data so the script is re-runnable.
  console.log("Clearing old demo data…");
  for (const table of [
    "cash_entries",
    "crop_declarations",
    "deliveries",
    "order_items",
    "orders",
    "demands",
    "produce_submissions",
    "white_stores",
  ]) {
    await supabase.from(table).delete().neq("id", NIL);
  }

  console.log("Removing old demo accounts…");
  const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  for (const u of list.users) {
    if (/@(krishi|agrisetu|farmer\.agrisetu)\.demo$/.test(u.email ?? "")) {
      await supabase.auth.admin.deleteUser(u.id);
    }
  }

  console.log("Creating demo users…");
  const ids = {};
  for (const u of USERS) {
    ids[u.email] = await createUser(u);
    console.log(`  ✓ ${u.full_name} (${u.role})`);
  }

  console.log("Creating White Stores…");
  const { data: stores, error: storeErr } = await supabase
    .from("white_stores")
    .insert([
      {
        name: "Rampur White Store",
        village: "Rampur",
        address: "Near the panchayat office",
        operator_id: ids["store1@agrisetu.demo"],
        lat: 26.45,
        lng: 80.35,
      },
      {
        name: "Lakshmipur White Store",
        village: "Lakshmipur",
        address: "Main market road",
        operator_id: ids["store2@agrisetu.demo"],
        lat: 26.3,
        lng: 80.55,
      },
    ])
    .select("id, name");
  if (storeErr) throw storeErr;

  const rampur = stores.find((s) => s.name.startsWith("Rampur")).id;
  const lakshmipur = stores.find((s) => s.name.startsWith("Lakshmipur")).id;
  const storeIdByVillage = { Rampur: rampur, Lakshmipur: lakshmipur };

  console.log("Creating store employees…");
  for (const e of EMPLOYEES) {
    ids[e.email] = await createUser(
      { email: e.email, full_name: e.full_name, role: "employee", village: e.store },
      { store_id: storeIdByVillage[e.store] }
    );
    console.log(`  ✓ ${e.full_name} (employee, ${e.store})`);
  }

  console.log("Creating produce batches…");
  // The tomato storyline: 400 kg already received (graded + paid) at Rampur,
  // Ramesh's 100 kg still pending — receiving it live on stage completes the
  // 500 kg the buyer needs. Do not add extra tomatoes at Rampur.
  const batches = [
    {
      tag: "story-tomato-a", farmer: "farmer2@agrisetu.demo", store: rampur, employee: "employee1@agrisetu.demo",
      crop: "Tomatoes", declared: 250, weighed: 250, remaining: 250, grade: "A", price: 21,
      notes: "Firm, uniform size, no blemishes", when: 2,
    },
    {
      tag: "story-tomato-b", farmer: "farmer3@agrisetu.demo", store: rampur, employee: "employee1@agrisetu.demo",
      crop: "Tomatoes", declared: 150, weighed: 150, remaining: 150, grade: "B", price: 19,
      notes: "Slight size variation, good colour", when: 2,
    },
    {
      tag: "story-onions", farmer: "farmer2@agrisetu.demo", store: rampur, employee: "employee1@agrisetu.demo",
      crop: "Onions", declared: 180, weighed: 180, remaining: 180, grade: "A", price: 25,
      notes: "Well cured, dry outer skin", when: 1,
    },
    {
      tag: "story-potatoes", farmer: "farmer3@agrisetu.demo", store: lakshmipur, employee: "employee2@agrisetu.demo",
      crop: "Potatoes", declared: 300, weighed: 300, remaining: 300, grade: "B", price: 15,
      notes: "Standard table grade", when: 1,
    },
    {
      tag: "live-chilli-r", farmer: "farmer4@agrisetu.demo", store: rampur, employee: "employee1@agrisetu.demo",
      crop: "Chilli", declared: 80, weighed: 80, remaining: 80, grade: "A", price: 80,
      notes: "Bright red, dry", when: 1,
    },
    {
      tag: "live-cabbage-r", farmer: "farmer6@agrisetu.demo", store: rampur, employee: "employee1@agrisetu.demo",
      crop: "Cabbage", declared: 220, weighed: 220, remaining: 220, grade: "A", price: 12,
      notes: "Tight heads, Grade A", when: 1,
    },
    {
      tag: "live-carrot-r", farmer: "farmer4@agrisetu.demo", store: rampur, employee: "employee1@agrisetu.demo",
      crop: "Carrot", declared: 140, weighed: 140, remaining: 140, grade: "A", price: 28,
      notes: "Fresh, uniform colour", when: 0,
    },
    {
      tag: "live-wheat-r", farmer: "farmer1@agrisetu.demo", store: rampur, employee: "employee1@agrisetu.demo",
      crop: "Wheat", declared: 400, weighed: 400, remaining: 400, grade: "A", price: 24,
      notes: "Clean grain, low moisture", when: 3,
    },
    {
      tag: "live-brinjal-l", farmer: "farmer5@agrisetu.demo", store: lakshmipur, employee: "employee2@agrisetu.demo",
      crop: "Brinjal", declared: 90, weighed: 90, remaining: 90, grade: "A", price: 20,
      notes: "Glossy skin, no pest marks", when: 0,
    },
    {
      tag: "live-chilli-l", farmer: "farmer5@agrisetu.demo", store: lakshmipur, employee: "employee2@agrisetu.demo",
      crop: "Chilli", declared: 60, weighed: 60, remaining: 60, grade: "B", price: 68,
      notes: "Slight mix of sizes", when: 1,
    },
    {
      tag: "live-corn-l", farmer: "farmer3@agrisetu.demo", store: lakshmipur, employee: "employee2@agrisetu.demo",
      crop: "Corn", declared: 180, weighed: 180, remaining: 180, grade: "A", price: 18,
      notes: "Sweet corn, same-day harvest", when: 0,
    },
    {
      tag: "live-cabbage-l", farmer: "farmer5@agrisetu.demo", store: lakshmipur, employee: "employee2@agrisetu.demo",
      crop: "Cabbage", declared: 160, weighed: 160, remaining: 160, grade: "A", price: 12,
      notes: "Compact heads", when: 2,
    },
    {
      tag: "sold-wheat", farmer: "farmer4@agrisetu.demo", store: rampur, employee: "employee1@agrisetu.demo",
      crop: "Wheat", declared: 500, weighed: 500, remaining: 0, grade: "A", price: 24,
      notes: "Sold to FreshMart last week", when: 8,
    },
    {
      tag: "sold-cabbage", farmer: "farmer6@agrisetu.demo", store: rampur, employee: "employee1@agrisetu.demo",
      crop: "Cabbage", declared: 200, weighed: 200, remaining: 0, grade: "A", price: 12,
      notes: "Dispatched to City Market", when: 6,
    },
    {
      tag: "sold-potato-r", farmer: "farmer4@agrisetu.demo", store: rampur, employee: "employee1@agrisetu.demo",
      crop: "Potatoes", declared: 250, weighed: 250, remaining: 0, grade: "B", price: 15,
      notes: "Table grade, fully allocated", when: 5,
    },
    {
      tag: "sold-onion-l", farmer: "farmer5@agrisetu.demo", store: lakshmipur, employee: "employee2@agrisetu.demo",
      crop: "Onions", declared: 150, weighed: 150, remaining: 0, grade: "A", price: 25,
      notes: "Cured lot, delivered", when: 4,
    },
    {
      tag: "sold-carrot", farmer: "farmer6@agrisetu.demo", store: rampur, employee: "employee1@agrisetu.demo",
      crop: "Carrot", declared: 110, weighed: 110, remaining: 0, grade: "A", price: 28,
      notes: "Hotel kitchen order", when: 3,
    },
  ];

  const rows = batches.map((b) => ({
    farmer_id: ids[b.farmer],
    store_id: b.store,
    crop: b.crop,
    quantity_kg: b.declared,
    expected_price: b.price,
    status: "received",
    actual_weight_kg: b.weighed,
    remaining_kg: b.remaining,
    quality_grade: b.grade,
    quality_notes: b.notes,
    price_per_kg: b.price,
    paid_amount: b.weighed * b.price,
    paid_at: daysAgo(b.when),
    batch_code: batchCode(b.tag),
    received_by: ids[b.employee],
    created_at: daysAgo(b.when),
  }));

  const { data: inserted, error: subErr } = await supabase
    .from("produce_submissions")
    .insert(rows)
    .select("id, crop, store_id, remaining_kg, price_per_kg, batch_code, paid_amount");
  if (subErr) throw subErr;

  const byTag = {};
  for (const b of batches) {
    const row = inserted.find((r) => r.batch_code === batchCode(b.tag));
    if (!row) throw new Error(`Missing inserted batch ${b.tag}`);
    byTag[b.tag] = { ...b, row };
  }

  // Ramesh's pending lot — received live during the demo.
  const { error: pendingErr } = await supabase.from("produce_submissions").insert({
    farmer_id: ids["farmer1@agrisetu.demo"],
    store_id: rampur,
    crop: "Tomatoes",
    quantity_kg: 100,
    expected_price: 20,
    status: "submitted",
  });
  if (pendingErr) throw pendingErr;

  console.log("Creating cash ledger…");
  const cashRows = [
    { store_id: rampur, direction: "in", amount: 80000, description: "Opening cash float", created_by: ids["store1@agrisetu.demo"], created_at: daysAgo(10) },
    { store_id: lakshmipur, direction: "in", amount: 40000, description: "Opening cash float", created_by: ids["store2@agrisetu.demo"], created_at: daysAgo(10) },
    { store_id: rampur, direction: "in", amount: 20000, description: "Cash top-up from district office", created_by: ids["store1@agrisetu.demo"], created_at: daysAgo(6) },
  ];
  for (const b of batches) {
    cashRows.push({
      store_id: b.store,
      direction: "out",
      amount: b.weighed * b.price,
      description: `Paid farmer for ${b.weighed} kg ${b.crop} (${batchCode(b.tag)})`,
      created_by: ids[b.employee],
      created_at: daysAgo(b.when),
    });
  }

  console.log("Creating a pending direct buyer order (onions)…");
  const onions = byTag["story-onions"].row;
  const onionPrice = salePrice(Number(onions.price_per_kg));
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      buyer_id: ids["buyer1@agrisetu.demo"],
      store_id: rampur,
      crop: "Onions",
      quantity_kg: 100,
      agreed_price: onionPrice,
      delivery_location: "FreshMart warehouse, City Market",
      status: "pending",
      created_at: daysAgo(0),
    })
    .select("id")
    .single();
  if (orderErr) throw orderErr;

  await supabase.from("order_items").insert({
    order_id: order.id,
    submission_id: onions.id,
    quantity_kg: 100,
    amount: 100 * onionPrice,
  });
  await supabase
    .from("produce_submissions")
    .update({ remaining_kg: Number(onions.remaining_kg) - 100 })
    .eq("id", onions.id);

  const soldOrders = [
    { tag: "sold-wheat", qty: 500, status: "delivered", when: 7, location: "FreshMart warehouse, City Market" },
    { tag: "sold-cabbage", qty: 200, status: "delivered", when: 5, location: "FreshMart warehouse, City Market" },
    { tag: "sold-potato-r", qty: 250, status: "completed", when: 4, location: "Neighborhood Mart, City Market" },
    { tag: "sold-onion-l", qty: 150, status: "delivered", when: 3, location: "FreshMart warehouse, City Market" },
    { tag: "sold-carrot", qty: 110, status: "completed", when: 2, location: "Hotel kitchen, MG Road" },
  ];

  console.log("Creating historical delivered orders…");
  for (const spec of soldOrders) {
    const src = byTag[spec.tag];
    const price = salePrice(src.price);
    const { data: hist, error: histErr } = await supabase
      .from("orders")
      .insert({
        buyer_id: ids["buyer1@agrisetu.demo"],
        store_id: src.store,
        crop: src.crop,
        quantity_kg: spec.qty,
        agreed_price: price,
        delivery_location: spec.location,
        status: spec.status,
        created_at: daysAgo(spec.when),
      })
      .select("id")
      .single();
    if (histErr) throw histErr;
    await supabase.from("order_items").insert({
      order_id: hist.id,
      submission_id: src.row.id,
      quantity_kg: spec.qty,
      amount: spec.qty * price,
    });
    await supabase.from("deliveries").insert({
      order_id: hist.id,
      logistics_id: ids["logistics1@agrisetu.demo"],
      pickup_location: src.store === rampur ? "Rampur White Store, Rampur" : "Lakshmipur White Store, Lakshmipur",
      dropoff_location: spec.location,
      status: "delivered",
      created_at: daysAgo(spec.when),
    });
    cashRows.push({
      store_id: src.store,
      direction: "in",
      amount: spec.qty * price,
      description: `Buyer payment for ${spec.qty} kg ${src.crop} (${batchCode(spec.tag)})`,
      created_by: ids[src.store === rampur ? "store1@agrisetu.demo" : "store2@agrisetu.demo"],
      created_at: daysAgo(spec.when - 1),
    });
  }

  const { error: cashErr } = await supabase.from("cash_entries").insert(cashRows);
  if (cashErr) throw cashErr;

  console.log("Creating buyer demands…");
  const { error: demandErr } = await supabase.from("demands").insert([
    {
      buyer_id: ids["buyer1@agrisetu.demo"],
      crop: "Tomatoes",
      quantity_kg: 500,
      offered_price: 24,
      needed_by: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      location: "FreshMart warehouse, City Market",
      status: "open",
    },
    {
      buyer_id: ids["buyer1@agrisetu.demo"],
      crop: "Potatoes",
      quantity_kg: 200,
      offered_price: 18,
      needed_by: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      location: "FreshMart warehouse, City Market",
      status: "open",
    },
    {
      buyer_id: ids["buyer1@agrisetu.demo"],
      crop: "Cabbage",
      quantity_kg: 150,
      offered_price: 16,
      needed_by: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      location: "FreshMart warehouse, City Market",
      status: "open",
    },
  ]);
  if (demandErr) throw demandErr;

  console.log("Creating upcoming crop declarations…");
  const harvest = (days) => new Date(Date.now() + days * 24 * 3600 * 1000).toISOString().slice(0, 10);
  const { error: declErr } = await supabase.from("crop_declarations").insert([
    {
      farmer_id: ids["farmer1@agrisetu.demo"],
      crop: "Wheat",
      season: "Rabi 2026",
      expected_quantity_kg: 500,
      expected_harvest: harvest(120),
    },
    {
      farmer_id: ids["farmer2@agrisetu.demo"],
      crop: "Tomatoes",
      season: "Kharif 2026",
      expected_quantity_kg: 300,
      expected_harvest: harvest(60),
    },
    {
      farmer_id: ids["farmer3@agrisetu.demo"],
      crop: "Potatoes",
      season: "Rabi 2026",
      expected_quantity_kg: 450,
      expected_harvest: harvest(90),
    },
    {
      farmer_id: ids["farmer4@agrisetu.demo"],
      crop: "Chilli",
      season: "Kharif 2026",
      expected_quantity_kg: 120,
      expected_harvest: harvest(45),
    },
    {
      farmer_id: ids["farmer5@agrisetu.demo"],
      crop: "Onions",
      season: "Rabi 2026",
      expected_quantity_kg: 280,
      expected_harvest: harvest(75),
    },
    {
      farmer_id: ids["farmer6@agrisetu.demo"],
      crop: "Cabbage",
      season: "Kharif 2026",
      expected_quantity_kg: 200,
      expected_harvest: harvest(40),
    },
  ]);
  if (declErr) throw declErr;

  console.log(`
Done. Demo accounts (password for all: ${PASSWORD})

  Admin      admin@agrisetu.demo
  Farmer     farmer1@agrisetu.demo    (Ramesh Kumar — 100 kg tomatoes waiting at the counter)
  Farmer     farmer2@agrisetu.demo    (Sita Devi — paid lots at Rampur)
  Farmer     farmer3@agrisetu.demo    (Mahesh Patil — tomatoes + potatoes + corn)
  Farmer     farmer4@agrisetu.demo    (Lakshmi Gowda — chilli, carrot, wheat)
  Farmer     farmer5@agrisetu.demo    (Anand Reddy — Lakshmipur lots)
  Farmer     farmer6@agrisetu.demo    (Kavitha N — cabbage, carrot)
  Manager    store1@agrisetu.demo     (Rampur White Store)
  Manager    store2@agrisetu.demo     (Lakshmipur White Store)
  Employee   employee1@agrisetu.demo  (Suresh Yadav — Rampur counter)
  Employee   employee2@agrisetu.demo  (Kavita Sharma — Lakshmipur counter)
  Buyer      buyer1@agrisetu.demo     (FreshMart — pending onion order + open 500 kg tomato demand)
  Logistics  logistics1@agrisetu.demo (Shakti Transport)

Demo flow:
  employee1 weighs/grades/pays Ramesh's 100 kg (QR batch created) and accepts +
  dispatches FreshMart's onion order → admin matches the 500 kg tomato demand →
  logistics1 delivers → buyer1 scans the QR / confirms receipt → store1 sees
  sales, purchases and cash in/out.
`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
