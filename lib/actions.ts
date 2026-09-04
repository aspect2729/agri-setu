"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveAuthUser } from "@/lib/supabase/auth-user";
import { parseBatchCode, type BatchLookup } from "@/lib/qr";
import { generateBatchCode, salePricePerKg } from "@/lib/utils";

export type ActionResult = {
  error?: string;
  success?: string;
  farmerId?: string;
  farmerName?: string;
  farmerPhone?: string;
  farmerVillage?: string | null;
  submissionId?: string;
  batchCode?: string;
  paidAmount?: number;
  orderId?: string;
};

const DEFAULT_PASSWORD = "agrisetu123";

async function requireUser() {
  const supabase = await createClient();
  const user = await resolveAuthUser(supabase);
  if (!user) redirect("/login");
  return { supabase, user };
}

/** Resolve which White Store the signed-in staff member works at. */
async function getStaffStoreId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<string | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, store_id")
    .eq("id", userId)
    .single();

  if (profile?.role === "employee" && profile.store_id) return profile.store_id;

  const { data: store } = await supabase
    .from("white_stores")
    .select("id")
    .eq("operator_id", userId)
    .maybeSingle();
  return store?.id ?? null;
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// ---------- Farmer ----------
export async function addProduce(formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await requireUser();

  const crop = String(formData.get("crop") ?? "").trim();
  const quantity = Number(formData.get("quantity_kg"));
  const expectedPrice = formData.get("expected_price")
    ? Number(formData.get("expected_price"))
    : null;
  const storeId = String(formData.get("store_id") ?? "");

  if (!crop || !quantity || quantity <= 0 || !storeId) {
    return { error: "Please fill in crop, quantity and White Store." };
  }

  const { error } = await supabase.from("produce_submissions").insert({
    farmer_id: user.id,
    store_id: storeId,
    crop,
    quantity_kg: quantity,
    expected_price: expectedPrice,
  });

  if (error) return { error: error.message };
  revalidatePath("/farmer");
  revalidatePath("/employee");
  return { success: "Produce listed. Bring it to the White Store for weighing and payment." };
}

export async function declareCrop(formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await requireUser();

  const crop = String(formData.get("crop") ?? "").trim();
  const season = String(formData.get("season") ?? "").trim();
  const expectedQty = formData.get("expected_quantity_kg")
    ? Number(formData.get("expected_quantity_kg"))
    : null;
  const expectedHarvest = String(formData.get("expected_harvest") ?? "") || null;

  if (!crop || !season) return { error: "Crop and season are required." };

  const { error } = await supabase.from("crop_declarations").insert({
    farmer_id: user.id,
    crop,
    season,
    expected_quantity_kg: expectedQty,
    expected_harvest: expectedHarvest,
  });

  if (error) return { error: error.message };
  revalidatePath("/farmer");
  return { success: "Upcoming crop declared. Stores can now plan for your harvest." };
}

export async function saveFarmLocation(lat: number, lng: number): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { error: "Invalid coordinates." };
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return { error: "Invalid coordinates." };
  }
  const { error } = await supabase.from("profiles").update({ lat, lng }).eq("id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/farmer");
  return { success: "Farm location saved." };
}

export async function geocodeAndSaveFarm(query: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const trimmed = query.trim();
  if (!trimmed) return { error: "Enter a village, town, or pincode." };

  const { geocodeIndia } = await import("@/lib/weather");
  const geo = await geocodeIndia(trimmed);
  if (!geo) {
    return { error: "Could not find that place in India. Try a nearby town name." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ lat: geo.lat, lng: geo.lng, village: geo.name })
    .eq("id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/farmer");
  return { success: `Farm location set to ${geo.name}${geo.region ? `, ${geo.region}` : ""}.` };
}

export async function loadFarmWeather(
  lat: number,
  lng: number,
  placeLabel: string,
  crops: string[]
) {
  await requireUser();
  const { fetchFarmWeather } = await import("@/lib/weather");
  return fetchFarmWeather({ lat, lng, placeLabel, crops });
}

// ---------- Store manager ----------
export async function createStore(formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  const village = String(formData.get("village") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim() || null;
  const lat = formData.get("lat") ? Number(formData.get("lat")) : null;
  const lng = formData.get("lng") ? Number(formData.get("lng")) : null;

  if (!name || !village) return { error: "Name and village are required." };

  const { error } = await supabase.from("white_stores").insert({
    name,
    village,
    address,
    lat,
    lng,
    operator_id: user.id,
  });

  if (error) return { error: error.message };
  revalidatePath("/store");
  return { success: "White Store created." };
}

export async function addEmployee(formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await requireUser();

  const storeId = await getStaffStoreId(supabase, user.id);
  if (!storeId) return { error: "You don't operate a White Store." };

  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const password = String(formData.get("password") ?? "").trim() || DEFAULT_PASSWORD;

  if (!fullName || !email) return { error: "Name and email are required." };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      phone,
      role: "employee",
      store_id: storeId,
    },
  });

  if (error) return { error: error.message };
  revalidatePath("/store");
  return {
    success: `Employee account created. They can sign in with ${email} / ${password}.`,
  };
}

export async function addCashEntry(formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await requireUser();

  const storeId = await getStaffStoreId(supabase, user.id);
  if (!storeId) return { error: "You are not linked to a White Store." };

  const direction = String(formData.get("direction") ?? "");
  const amount = Number(formData.get("amount"));
  const description = String(formData.get("description") ?? "").trim();

  if (!["in", "out"].includes(direction) || !amount || amount <= 0 || !description) {
    return { error: "Fill in direction, a positive amount and a description." };
  }

  const { error } = await supabase.from("cash_entries").insert({
    store_id: storeId,
    direction,
    amount,
    description,
    created_by: user.id,
  });

  if (error) return { error: error.message };
  revalidatePath("/store");
  revalidatePath("/employee");
  return { success: "Cash entry recorded." };
}

// ---------- Employee ----------
export async function registerFarmer(formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await requireUser();

  const storeId = await getStaffStoreId(supabase, user.id);
  if (!storeId) return { error: "You are not linked to a White Store." };

  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const village = String(formData.get("village") ?? "").trim() || null;

  if (!fullName || !phone) return { error: "Farmer name and phone are required." };

  const { data: existing } = await supabase
    .from("profiles")
    .select("id, full_name, phone, village")
    .eq("role", "farmer")
    .eq("phone", phone)
    .maybeSingle();

  if (existing) {
    return {
      success: "Farmer already registered.",
      farmerId: existing.id,
      farmerName: existing.full_name,
      farmerPhone: existing.phone ?? phone,
      farmerVillage: existing.village,
    };
  }

  const email = `${phone.replace(/\D/g, "")}@farmer.agrisetu.demo`;

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: DEFAULT_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: fullName, phone, village, role: "farmer" },
  });

  if (error) {
    const { data: fallback } = await supabase
      .from("profiles")
      .select("id, full_name, phone, village")
      .eq("role", "farmer")
      .eq("phone", phone)
      .maybeSingle();
    if (fallback) {
      return {
        success: "Farmer already registered.",
        farmerId: fallback.id,
        farmerName: fallback.full_name,
        farmerPhone: fallback.phone ?? phone,
        farmerVillage: fallback.village,
      };
    }
    return { error: error.message };
  }

  const farmerId = data.user?.id;
  if (!farmerId) return { error: "Could not create the farmer account." };

  revalidatePath("/employee");
  revalidatePath("/store");
  return {
    success: `Farmer registered. Login: ${email} / ${DEFAULT_PASSWORD}`,
    farmerId,
    farmerName: fullName,
    farmerPhone: phone,
    farmerVillage: village,
  };
}

export async function recordWalkInProduce(formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await requireUser();

  const storeId = await getStaffStoreId(supabase, user.id);
  if (!storeId) return { error: "You are not linked to a White Store." };

  const farmerId = String(formData.get("farmer_id") ?? "");
  const crop = String(formData.get("crop") ?? "").trim();
  const quantity = Number(formData.get("quantity_kg"));

  if (!farmerId || !crop || !quantity || quantity <= 0) {
    return { error: "Select the farmer and fill in crop and quantity." };
  }

  const { data, error } = await supabase
    .from("produce_submissions")
    .insert({
      farmer_id: farmerId,
      store_id: storeId,
      crop,
      quantity_kg: quantity,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "Could not record produce." };
  revalidatePath("/employee");
  return {
    success: "Produce recorded. It is now in the receiving queue.",
    submissionId: data.id,
  };
}

/** Counter walk-in: log produce, grade it, pay the farmer, and issue a batch QR in one step. */
export async function logCounterProduce(formData: FormData): Promise<ActionResult> {
  const created = await recordWalkInProduce(formData);
  if (created.error || !created.submissionId) return created;

  if (!formData.get("actual_weight_kg")) {
    formData.set("actual_weight_kg", String(formData.get("quantity_kg") ?? ""));
  }

  return receiveProduce(created.submissionId, formData);
}

export async function receiveProduce(submissionId: string, formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await requireUser();

  const actualWeight = Number(formData.get("actual_weight_kg"));
  const grade = String(formData.get("quality_grade") ?? "");
  const pricePerKg = Number(formData.get("price_per_kg"));
  const qualityNotes = String(formData.get("quality_notes") ?? "").trim() || null;
  const id = submissionId || String(formData.get("submission_id") ?? "");

  if (!id) return { error: "Missing produce lot. Refresh the page and try again." };
  if (!actualWeight || actualWeight <= 0) {
    return { error: "Record the weighed quantity." };
  }
  if (!["A", "B", "C"].includes(grade)) return { error: "Assign a quality grade." };
  if (!pricePerKg || pricePerKg <= 0) return { error: "Set the price per kg." };

  const { data: submission, error: lookupErr } = await supabase
    .from("produce_submissions")
    .select("id, crop, status, store_id, farmer_id")
    .eq("id", id)
    .maybeSingle();

  if (lookupErr) return { error: lookupErr.message };
  if (!submission) return { error: "This produce lot is no longer in the queue." };
  if (submission.status !== "submitted") {
    return { error: "This lot was already weighed and paid." };
  }

  const paidAmount = Math.round(actualWeight * pricePerKg * 100) / 100;

  // Batch codes are random; retry on the (unlikely) unique collision.
  let batchCode = generateBatchCode();
  let updated = null;
  for (let attempt = 0; attempt < 3 && !updated; attempt++) {
    const { data, error } = await supabase
      .from("produce_submissions")
      .update({
        status: "received",
        actual_weight_kg: actualWeight,
        remaining_kg: actualWeight,
        quality_grade: grade,
        quality_notes: qualityNotes,
        price_per_kg: pricePerKg,
        paid_amount: paidAmount,
        paid_at: new Date().toISOString(),
        batch_code: batchCode,
        received_by: user.id,
      })
      .eq("id", id)
      .eq("status", "submitted")
      .select("id")
      .maybeSingle();

    if (error?.code === "23505") {
      batchCode = generateBatchCode();
      continue;
    }
    if (error) return { error: error.message };
    updated = data;
  }
  if (!updated) return { error: "Could not receive this submission." };

  const { data: farmer } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", submission.farmer_id)
    .maybeSingle();
  const farmerName = farmer?.full_name ?? "farmer";
  await supabase.from("cash_entries").insert({
    store_id: submission.store_id,
    direction: "out",
    amount: paidAmount,
    description: `Paid ${farmerName} for ${actualWeight} kg ${submission.crop} (${batchCode})`,
    created_by: user.id,
  });

  revalidatePath("/employee");
  revalidatePath("/store");
  revalidatePath("/farmer");
  revalidatePath("/buyer");
  return {
    success: `Batch ${batchCode} created — grade ${grade}, ${actualWeight} kg. Farmer paid ₹${paidAmount.toLocaleString("en-IN")}.`,
    batchCode,
    paidAmount,
    farmerName,
    submissionId: id,
  };
}

function asRel<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

/** In-app verify: look up a crate QR / typed AGS- code without leaving the app. */
export async function lookupBatch(
  raw: string
): Promise<{ error?: string; batch?: BatchLookup }> {
  const { supabase } = await requireUser();
  const code = parseBatchCode(raw) ?? parseBatchCode(`AGS-${raw.trim()}`);
  if (!code) return { error: "Use a batch code like AGS-K7M2QX." };

  const { data, error } = await supabase
    .from("produce_submissions")
    .select(
      `batch_code, crop, quality_grade, quality_notes, actual_weight_kg, quantity_kg, remaining_kg, status, paid_at, paid_amount,
       white_stores(name, village),
       farmer:profiles!produce_submissions_farmer_id_fkey(full_name, village)`
    )
    .eq("batch_code", code)
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data?.batch_code) return { error: `No batch with code ${code} exists.` };

  const store = asRel(
    data.white_stores as { name: string; village: string } | { name: string; village: string }[] | null
  );
  const farmer = asRel(
    data.farmer as { full_name: string; village: string | null } | { full_name: string; village: string | null }[] | null
  );

  return {
    batch: {
      batchCode: data.batch_code,
      crop: data.crop,
      grade: data.quality_grade,
      qualityNotes: data.quality_notes,
      quantityKg: Number(data.actual_weight_kg ?? data.quantity_kg ?? 0),
      remainingKg: Number(data.remaining_kg ?? 0),
      farmerName: farmer?.full_name ?? null,
      farmerVillage: farmer?.village ?? null,
      storeName: store?.name ?? null,
      storeVillage: store?.village ?? null,
      paidAt: data.paid_at,
      paidAmount: data.paid_amount != null ? Number(data.paid_amount) : null,
      status: data.status,
    },
  };
}

export async function acceptOrder(orderId: string): Promise<ActionResult> {
  const { supabase } = await requireUser();

  const { error, data } = await supabase
    .from("orders")
    .update({ status: "accepted" })
    .eq("id", orderId)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (error || !data) return { error: "Order not found or already accepted." };
  revalidatePath("/employee");
  revalidatePath("/buyer");
  return { success: "Order accepted. Prepare it for dispatch." };
}

export async function dispatchOrder(orderId: string): Promise<ActionResult> {
  const { supabase } = await requireUser();

  const { data: order } = await supabase
    .from("orders")
    .select("id, status, delivery_location, white_stores(name, village), deliveries(id)")
    .eq("id", orderId)
    .single();

  if (!order || order.status !== "accepted") {
    return { error: "Order must be accepted before dispatch." };
  }
  if (order.deliveries) return { error: "A delivery has already been requested." };

  const store = order.white_stores as unknown as { name: string; village: string } | null;
  const { error } = await supabase.from("deliveries").insert({
    order_id: order.id,
    pickup_location: store ? `${store.name}, ${store.village}` : "White Store",
    dropoff_location: order.delivery_location ?? "Buyer location",
  });

  if (error) return { error: error.message };
  revalidatePath("/employee");
  revalidatePath("/logistics");
  revalidatePath("/buyer");
  return { success: "Dispatch recorded. Logistics has been requested for pickup." };
}

// ---------- Buyer ----------
export async function placeDirectOrder(formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await requireUser();

  const submissionId = String(formData.get("submission_id") ?? "");
  const quantity = Number(formData.get("quantity_kg"));
  const deliveryLocation = String(formData.get("delivery_location") ?? "").trim() || null;

  if (!submissionId || !quantity || quantity <= 0) {
    return { error: "Enter the quantity you need." };
  }

  const { data: batch } = await supabase
    .from("produce_submissions")
    .select("id, crop, store_id, remaining_kg, price_per_kg, expected_price, status")
    .eq("id", submissionId)
    .single();

  if (!batch || batch.status !== "received") return { error: "Batch not available." };
  const remaining = Number(batch.remaining_kg ?? 0);
  if (quantity > remaining) {
    return { error: `Only ${remaining} kg left in this batch.` };
  }

  const agreedPrice = salePricePerKg(Number(batch.price_per_kg ?? batch.expected_price ?? 20));

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      buyer_id: user.id,
      store_id: batch.store_id,
      crop: batch.crop,
      quantity_kg: quantity,
      agreed_price: agreedPrice,
      delivery_location: deliveryLocation,
      status: "pending",
    })
    .select("id")
    .single();

  if (orderErr || !order) return { error: orderErr?.message ?? "Failed to place order." };

  await supabase.from("order_items").insert({
    order_id: order.id,
    submission_id: batch.id,
    quantity_kg: quantity,
    amount: quantity * agreedPrice,
  });

  await supabase
    .from("produce_submissions")
    .update({ remaining_kg: remaining - quantity })
    .eq("id", batch.id)
    .gte("remaining_kg", quantity);

  revalidatePath("/buyer");
  revalidatePath("/employee");
  revalidatePath("/store");
  return {
    success: `Order placed: ${quantity} kg of ${batch.crop} at ₹${agreedPrice}/kg. The White Store will confirm it.`,
    orderId: order.id,
  };
}

export async function postDemand(formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await requireUser();

  const crop = String(formData.get("crop") ?? "").trim();
  const quantity = Number(formData.get("quantity_kg"));
  const offeredPrice = formData.get("offered_price")
    ? Number(formData.get("offered_price"))
    : null;
  const neededBy = String(formData.get("needed_by") ?? "") || null;
  const location = String(formData.get("location") ?? "").trim() || null;

  if (!crop || !quantity || quantity <= 0) {
    return { error: "Please fill in crop and quantity." };
  }

  const { error } = await supabase.from("demands").insert({
    buyer_id: user.id,
    crop,
    quantity_kg: quantity,
    offered_price: offeredPrice,
    needed_by: neededBy,
    location,
  });

  if (error) return { error: error.message };
  revalidatePath("/buyer");
  revalidatePath("/admin");
  return { success: "Demand posted. The platform will match it with supply." };
}

export async function confirmReceipt(orderId: string): Promise<ActionResult> {
  const { supabase } = await requireUser();

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .update({ status: "completed" })
    .eq("id", orderId)
    .eq("status", "delivered")
    .select("id, demand_id, store_id, crop, quantity_kg, agreed_price")
    .single();

  if (orderErr || !order) return { error: "Order is not in a deliverable state." };

  await supabase.from("cash_entries").insert({
    store_id: order.store_id,
    direction: "in",
    amount: Number(order.quantity_kg) * Number(order.agreed_price),
    description: `Buyer payment for ${order.quantity_kg} kg ${order.crop}`,
  });

  if (order.demand_id) {
    await supabase.from("demands").update({ status: "fulfilled" }).eq("id", order.demand_id);
  }

  revalidatePath("/buyer");
  revalidatePath("/store");
  revalidatePath("/employee");
  revalidatePath("/admin");
  return { success: "Receipt confirmed and payment recorded to the White Store." };
}

// ---------- Matching (admin) ----------
type SupplyBatch = {
  id: string;
  store_id: string;
  remaining_kg: number | null;
  price_per_kg: number | null;
  expected_price: number | null;
};

export async function matchDemand(demandId: string): Promise<ActionResult> {
  const { supabase } = await requireUser();

  const { data: demand } = await supabase
    .from("demands")
    .select("*")
    .eq("id", demandId)
    .eq("status", "open")
    .single();

  if (!demand) return { error: "Demand not found or already matched." };

  // All received batches of this crop with stock remaining, oldest first.
  const { data: supply } = await supabase
    .from("produce_submissions")
    .select("id, store_id, remaining_kg, price_per_kg, expected_price")
    .eq("crop", demand.crop)
    .eq("status", "received")
    .gt("remaining_kg", 0)
    .order("created_at", { ascending: true });

  const batches = (supply ?? []) as SupplyBatch[];

  // Group by store; pick the store with the largest aggregated stock that
  // covers the demand (single-store fulfilment keeps logistics simple).
  const byStore = new Map<string, SupplyBatch[]>();
  for (const b of batches) {
    const list = byStore.get(b.store_id) ?? [];
    list.push(b);
    byStore.set(b.store_id, list);
  }

  let chosenStoreId: string | null = null;
  let chosenTotal = 0;
  for (const [storeId, list] of byStore) {
    const total = list.reduce((sum, b) => sum + Number(b.remaining_kg ?? 0), 0);
    if (total >= Number(demand.quantity_kg) && total > chosenTotal) {
      chosenStoreId = storeId;
      chosenTotal = total;
    }
  }

  if (!chosenStoreId) {
    return {
      error: `Insufficient aggregated supply of ${demand.crop}. No single White Store currently holds ${demand.quantity_kg} kg.`,
    };
  }

  // Allocate FIFO across batches, taking partial quantity from the last one.
  const allocations: { batch: SupplyBatch; qty: number }[] = [];
  let needed = Number(demand.quantity_kg);
  for (const b of byStore.get(chosenStoreId)!) {
    if (needed <= 0) break;
    const take = Math.min(needed, Number(b.remaining_kg ?? 0));
    allocations.push({ batch: b, qty: take });
    needed -= take;
  }

  const agreedPrice =
    demand.offered_price != null
      ? Number(demand.offered_price)
      : Math.round(
          allocations.reduce(
            (sum, a) => sum + salePricePerKg(Number(a.batch.price_per_kg ?? a.batch.expected_price ?? 20)),
            0
          ) / allocations.length
        );

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      demand_id: demand.id,
      buyer_id: demand.buyer_id,
      store_id: chosenStoreId,
      crop: demand.crop,
      quantity_kg: Number(demand.quantity_kg),
      agreed_price: agreedPrice,
      delivery_location: demand.location,
      status: "matched",
    })
    .select("id")
    .single();

  if (orderErr || !order) return { error: orderErr?.message ?? "Failed to create order." };

  const items = allocations.map((a) => ({
    order_id: order.id,
    submission_id: a.batch.id,
    quantity_kg: a.qty,
    amount: a.qty * agreedPrice,
  }));
  const { error: itemsErr } = await supabase.from("order_items").insert(items);
  if (itemsErr) return { error: itemsErr.message };

  for (const a of allocations) {
    await supabase
      .from("produce_submissions")
      .update({ remaining_kg: Number(a.batch.remaining_kg ?? 0) - a.qty })
      .eq("id", a.batch.id);
  }

  await supabase.from("demands").update({ status: "matched" }).eq("id", demand.id);

  const { data: store } = await supabase
    .from("white_stores")
    .select("name, village")
    .eq("id", chosenStoreId)
    .single();

  await supabase.from("deliveries").insert({
    order_id: order.id,
    pickup_location: store ? `${store.name}, ${store.village}` : "White Store",
    dropoff_location: demand.location ?? "Buyer location",
  });

  revalidatePath("/admin");
  revalidatePath("/buyer");
  revalidatePath("/store");
  revalidatePath("/employee");
  revalidatePath("/logistics");
  return {
    success: `Matched ${demand.quantity_kg} kg of ${demand.crop} from one White Store. Delivery request created.`,
  };
}

// ---------- Logistics ----------
export async function acceptDelivery(deliveryId: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser();

  const { data: delivery, error } = await supabase
    .from("deliveries")
    .update({ status: "accepted", logistics_id: user.id })
    .eq("id", deliveryId)
    .eq("status", "requested")
    .select("order_id")
    .single();

  if (error || !delivery) return { error: "Delivery already taken." };

  await supabase
    .from("orders")
    .update({ status: "pickup_scheduled" })
    .eq("id", delivery.order_id);

  revalidatePath("/logistics");
  revalidatePath("/store");
  revalidatePath("/employee");
  revalidatePath("/buyer");
  return { success: "Delivery accepted. Pickup scheduled." };
}

export async function updateDeliveryStatus(
  deliveryId: string,
  next: "picked_up" | "in_transit" | "delivered"
): Promise<ActionResult> {
  const { supabase } = await requireUser();

  const { data: delivery, error } = await supabase
    .from("deliveries")
    .update({ status: next })
    .eq("id", deliveryId)
    .select("order_id")
    .single();

  if (error || !delivery) return { error: "Could not update delivery." };

  const orderStatus = next === "delivered" ? "delivered" : "in_transit";
  await supabase.from("orders").update({ status: orderStatus }).eq("id", delivery.order_id);

  revalidatePath("/logistics");
  revalidatePath("/store");
  revalidatePath("/employee");
  revalidatePath("/buyer");
  revalidatePath("/admin");
  return { success: `Delivery marked ${next.replace("_", " ")}.` };
}
