import { DM_Sans, JetBrains_Mono } from "next/font/google";
import { requireProfile } from "@/lib/get-profile";
import { createClient } from "@/lib/supabase/server";
import { LogisticsDataProvider } from "@/components/logistics-app/data-context";
import { LogisticsApp } from "@/components/logistics-app/logistics-app";
import { mapLogisticsData } from "@/components/logistics-app/map-data";

export const dynamic = "force-dynamic";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export default async function LogisticsDashboard() {
  const profile = await requireProfile("logistics");
  const supabase = await createClient();

  const { data: deliveries } = await supabase
    .from("deliveries")
    .select(
      "id, status, pickup_location, dropoff_location, logistics_id, created_at, order_id, orders(crop, quantity_kg, agreed_price, delivery_location, status, created_at, white_stores(name, village, lat, lng), profiles(full_name, village, phone, lat, lng), order_items(quantity_kg, produce_submissions(batch_code, quality_grade, crop)))"
    )
    .order("created_at", { ascending: false });

  const data = mapLogisticsData({
    operatorName: profile.full_name,
    operatorVillage: profile.village,
    operatorPhone: profile.phone,
    operatorId: profile.id,
    deliveries: deliveries ?? [],
  });

  return (
    <div
      className={`${dmSans.variable} ${jetbrains.variable} ${dmSans.className} h-dvh`}
    >
      <LogisticsDataProvider data={data}>
        <LogisticsApp />
      </LogisticsDataProvider>
    </div>
  );
}
