import { requireProfile } from "@/lib/get-profile";
import { createClient } from "@/lib/supabase/server";
import { AdminDataProvider } from "@/components/admin-app/data-context";
import { AdminApp } from "@/components/admin-app/admin-app";
import { mapAdminData } from "@/components/admin-app/map-data";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const profile = await requireProfile("admin");
  const supabase = await createClient();

  const [
    { data: profiles },
    { data: stores },
    { data: submissions },
    { data: demands },
    { data: orders },
    { data: cash },
  ] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("white_stores").select("*, profiles(full_name)").order("name"),
    supabase
      .from("produce_submissions")
      .select("*, profiles!produce_submissions_farmer_id_fkey(full_name, village, phone)")
      .order("created_at", { ascending: false }),
    supabase
      .from("demands")
      .select("*, profiles(full_name)")
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("*, white_stores(name), profiles(full_name), deliveries(status)")
      .order("created_at", { ascending: false }),
    supabase.from("cash_entries").select("*").order("created_at", { ascending: false }),
  ]);

  const data = mapAdminData({
    adminName: profile.full_name,
    profiles: profiles ?? [],
    stores: stores ?? [],
    submissions: submissions ?? [],
    demands: demands ?? [],
    orders: orders ?? [],
    cash: cash ?? [],
  });

  return (
    <div className="h-dvh">
      <AdminDataProvider data={data}>
        <AdminApp />
      </AdminDataProvider>
    </div>
  );
}
