import { requireProfile } from "@/lib/get-profile";
import { createClient } from "@/lib/supabase/server";
import { EmployeeApp } from "@/components/employee-app/employee-app";
import type { EmpFarmer, EmpLot, EmployeeAppData } from "@/components/employee-app/data";
import type { Grade } from "@/components/employee-app/ui";
import { EmptyState } from "@/components/ui";
import { DashboardShell } from "@/components/dashboard-shell";

export const dynamic = "force-dynamic";

export default async function EmployeePage() {
  const profile = await requireProfile("employee");
  const supabase = await createClient();

  const { data: store } = await supabase
    .from("white_stores")
    .select("*")
    .eq("id", profile.store_id ?? "00000000-0000-0000-0000-000000000000")
    .maybeSingle();

  if (!store) {
    return (
      <DashboardShell
        profile={profile}
        title="No White Store assigned"
        subtitle="Ask your store manager to link your account to a White Store."
      >
        <EmptyState message="Your account is not linked to any White Store yet." />
      </DashboardShell>
    );
  }

  const [{ data: submissions }, { data: farmerRows }, { data: cashRows }] = await Promise.all([
    supabase
      .from("produce_submissions")
      .select("*, profiles!produce_submissions_farmer_id_fkey(id, full_name, village, phone)")
      .eq("store_id", store.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, full_name, village, phone")
      .eq("role", "farmer")
      .order("full_name"),
    supabase
      .from("cash_entries")
      .select("*")
      .eq("store_id", store.id)
      .order("created_at", { ascending: false }),
  ]);

  const lots: EmpLot[] = (submissions ?? []).map((s) => ({
    id: s.id,
    farmerId: s.farmer_id,
    farmerName: s.profiles?.full_name ?? "Farmer",
    farmerVillage: s.profiles?.village ?? null,
    crop: s.crop,
    kg: Number(s.actual_weight_kg ?? s.quantity_kg),
    status: s.status,
    grade: (s.quality_grade as Grade | null) ?? null,
    batchCode: s.batch_code,
    paidAmount: s.paid_amount != null ? Number(s.paid_amount) : null,
    createdAt: s.created_at,
    notes: s.quality_notes,
  }));

  const farmers: EmpFarmer[] = (farmerRows ?? []).map((f) => {
    const theirs = lots.filter((l) => l.farmerId === f.id);
    return {
      id: f.id,
      name: f.full_name,
      village: f.village,
      phone: f.phone,
      lastAt: theirs[0]?.createdAt ?? null,
      totalKg: theirs.reduce((sum, l) => sum + l.kg, 0),
      deliveries: theirs.length,
      totalPaid: theirs.reduce((sum, l) => sum + (l.paidAmount ?? 0), 0),
    };
  });

  const data: EmployeeAppData = {
    employeeName: profile.full_name,
    storeName: store.name,
    storeVillage: store.village,
    farmers,
    lots,
    cash: (cashRows ?? []).map((c) => ({
      id: c.id,
      direction: c.direction,
      amount: Number(c.amount),
      description: c.description,
      createdAt: c.created_at,
    })),
  };

  return <EmployeeApp data={data} />;
}
