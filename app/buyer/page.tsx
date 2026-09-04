import { DM_Sans, DM_Mono, Fraunces } from "next/font/google";
import { requireProfile } from "@/lib/get-profile";
import { createClient } from "@/lib/supabase/server";
import { BuyerDataProvider } from "@/components/buyer-app/data-context";
import { BuyerApp } from "@/components/buyer-app/buyer-app";
import { mapBuyerData } from "@/components/buyer-app/map-data";

export const dynamic = "force-dynamic";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
});

export default async function BuyerDashboard() {
  const profile = await requireProfile("buyer");
  const supabase = await createClient();

  const [{ data: batches }, { data: orders }, { data: demands }] = await Promise.all([
    supabase
      .from("produce_submissions")
      .select(
        "id, crop, batch_code, quality_grade, quality_notes, remaining_kg, quantity_kg, actual_weight_kg, price_per_kg, expected_price, created_at, paid_at, white_stores(name, village, lat, lng), profiles!produce_submissions_farmer_id_fkey(village)"
      )
      .eq("status", "received")
      .gt("remaining_kg", 0)
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select(
        "id, crop, quantity_kg, agreed_price, status, delivery_location, created_at, white_stores(name, village), deliveries(status), order_items(quantity_kg, submission_id, produce_submissions(batch_code, quality_grade, crop))"
      )
      .eq("buyer_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("demands")
      .select("id, crop, quantity_kg, offered_price, needed_by, location, status, created_at")
      .eq("buyer_id", profile.id)
      .order("created_at", { ascending: false }),
  ]);

  const data = mapBuyerData({
    buyerName: profile.full_name,
    buyerVillage: profile.village,
    buyerPhone: profile.phone,
    buyerLat: profile.lat,
    buyerLng: profile.lng,
    batches: batches ?? [],
    orders: orders ?? [],
    demands: demands ?? [],
  });

  return (
    <div
      className={`${dmSans.variable} ${fraunces.variable} ${dmMono.variable} ${dmSans.className} min-h-dvh`}
    >
      <BuyerDataProvider data={data}>
        <BuyerApp />
      </BuyerDataProvider>
    </div>
  );
}
