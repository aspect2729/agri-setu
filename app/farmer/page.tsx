import { requireProfile } from "@/lib/get-profile";
import { createClient } from "@/lib/supabase/server";
import { haversineKm } from "@/lib/utils";
import {
  FarmerApp,
  type FarmerAppData,
  type FarmerListing,
  type FarmerStore,
} from "@/components/farmer-app/farmer-app";

export const dynamic = "force-dynamic";

export default async function FarmerPage() {
  const profile = await requireProfile("farmer");
  const supabase = await createClient();

  const [{ data: stores }, { data: submissions }, { data: declarations }] = await Promise.all([
    supabase.from("white_stores").select("id, name, village, address, lat, lng").order("name"),
    supabase
      .from("produce_submissions")
      .select("*, white_stores(name)")
      .eq("farmer_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("crop_declarations")
      .select("*")
      .eq("farmer_id", profile.id)
      .order("created_at", { ascending: false }),
  ]);

  // Nearest store first: by coordinates when available, else same-village match.
  const rankedStores: FarmerStore[] = (stores ?? [])
    .map((s) => {
      let distanceKm: number | null = null;
      if (profile.lat != null && profile.lng != null && s.lat != null && s.lng != null) {
        distanceKm = haversineKm(profile.lat, profile.lng, s.lat, s.lng);
      }
      const sameVillage = !!profile.village && s.village === profile.village;
      return { id: s.id, name: s.name, village: s.village, address: s.address, distanceKm, sameVillage };
    })
    .sort((a, b) => {
      if (a.distanceKm != null && b.distanceKm != null) return a.distanceKm - b.distanceKm;
      if (a.distanceKm != null) return -1;
      if (b.distanceKm != null) return 1;
      return Number(b.sameVillage) - Number(a.sameVillage);
    })
    .map(({ sameVillage: _sameVillage, ...s }, i) => ({ ...s, nearest: i === 0 }));

  const listings: FarmerListing[] = (submissions ?? []).map((s) => {
    const weighed = s.actual_weight_kg != null ? Number(s.actual_weight_kg) : null;
    const remaining = s.remaining_kg != null ? Number(s.remaining_kg) : null;
    return {
      id: s.id,
      crop: s.crop,
      status: s.status,
      declaredKg: Number(s.quantity_kg),
      weighedKg: weighed,
      soldKg: weighed != null && remaining != null ? Math.max(0, weighed - remaining) : 0,
      grade: s.quality_grade,
      batchCode: s.batch_code,
      paidAmount: s.paid_amount != null ? Number(s.paid_amount) : null,
      createdAt: s.created_at,
      paidAt: s.paid_at,
      storeName: s.white_stores?.name ?? "White Store",
    };
  });

  const now = new Date();
  const monthEarnings = listings
    .filter((l) => {
      if (!l.paidAt || l.paidAmount == null) return false;
      const d = new Date(l.paidAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, l) => sum + (l.paidAmount ?? 0), 0);

  const nearestStore = rankedStores[0];
  const rawNearest = nearestStore ? stores?.find((s) => s.id === nearestStore.id) : null;
  const weatherLat = profile.lat ?? rawNearest?.lat ?? null;
  const weatherLng = profile.lng ?? rawNearest?.lng ?? null;
  const weatherPlace =
    profile.lat != null && profile.lng != null
      ? (profile.village ?? "Your farm")
      : (rawNearest?.village ?? profile.village ?? "Your farm");

  const data: FarmerAppData = {
    name: profile.full_name,
    phone: profile.phone,
    village: profile.village,
    monthEarnings,
    stores: rankedStores,
    listings,
    declarations: (declarations ?? []).map((d) => ({
      id: d.id,
      crop: d.crop,
      season: d.season,
      qty: d.expected_quantity_kg != null ? Number(d.expected_quantity_kg) : null,
      harvest: d.expected_harvest,
    })),
    weatherLat,
    weatherLng,
    weatherPlace,
  };

  return <FarmerApp data={data} />;
}
