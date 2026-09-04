import { addCashEntry, addEmployee, createStore } from "@/lib/actions";
import { requireProfile } from "@/lib/get-profile";
import { createClient } from "@/lib/supabase/server";
import { formatINR } from "@/lib/utils";
import { DashboardShell } from "@/components/dashboard-shell";
import { ActionForm, Field, inputClass } from "@/components/action-form";
import { Card, EmptyState, StatCard, StatusBadge, Table } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function StoreDashboard() {
  const profile = await requireProfile("store");
  const supabase = await createClient();

  const { data: store } = await supabase
    .from("white_stores")
    .select("*")
    .eq("operator_id", profile.id)
    .maybeSingle();

  if (!store) {
    return (
      <DashboardShell
        profile={profile}
        title="Set up your White Store"
        subtitle="Register your collection center so farmers nearby can submit produce to it."
      >
        <Card className="max-w-lg">
          <ActionForm action={createStore} submitLabel="Create White Store">
            <Field label="Store name">
              <input name="name" required placeholder="e.g. Rampur White Store" className={inputClass} />
            </Field>
            <Field label="Village">
              <input name="village" required placeholder="e.g. Rampur" className={inputClass} />
            </Field>
            <Field label="Address (optional)">
              <input name="address" placeholder="Near the panchayat office" className={inputClass} />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Latitude (optional)">
                <input name="lat" type="number" step="any" placeholder="26.45" className={inputClass} />
              </Field>
              <Field label="Longitude (optional)">
                <input name="lng" type="number" step="any" placeholder="80.35" className={inputClass} />
              </Field>
            </div>
          </ActionForm>
        </Card>
      </DashboardShell>
    );
  }

  const [{ data: submissions }, { data: orders }, { data: cash }, { data: employees }] =
    await Promise.all([
      supabase
        .from("produce_submissions")
        .select("*, profiles!produce_submissions_farmer_id_fkey(id, full_name, village, phone)")
        .eq("store_id", store.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("orders")
        .select("*, profiles(full_name), deliveries(status)")
        .eq("store_id", store.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("cash_entries")
        .select("*")
        .eq("store_id", store.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("id, full_name, phone, created_at")
        .eq("store_id", store.id)
        .eq("role", "employee")
        .order("full_name"),
    ]);

  const subs = submissions ?? [];
  const received = subs.filter((s) => s.status === "received");
  const inventoryKg = received.reduce((sum, s) => sum + Number(s.remaining_kg ?? 0), 0);
  const totalPurchases = received.reduce((sum, s) => sum + Number(s.paid_amount ?? 0), 0);

  const allOrders = orders ?? [];
  const completedSales = allOrders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + Number(o.quantity_kg) * Number(o.agreed_price), 0);

  const entries = cash ?? [];
  const cashIn = entries.filter((e) => e.direction === "in").reduce((s, e) => s + Number(e.amount), 0);
  const cashOut = entries.filter((e) => e.direction === "out").reduce((s, e) => s + Number(e.amount), 0);

  // Farmer records: aggregate every farmer who has brought produce here.
  const farmerRecords = new Map<
    string,
    { name: string; village: string | null; phone: string | null; lots: number; kg: number; paid: number }
  >();
  for (const s of subs) {
    const farmer = s.profiles;
    if (!farmer) continue;
    const rec = farmerRecords.get(farmer.id) ?? {
      name: farmer.full_name,
      village: farmer.village,
      phone: farmer.phone,
      lots: 0,
      kg: 0,
      paid: 0,
    };
    rec.lots += 1;
    rec.kg += Number(s.actual_weight_kg ?? s.quantity_kg);
    rec.paid += Number(s.paid_amount ?? 0);
    farmerRecords.set(farmer.id, rec);
  }

  return (
    <DashboardShell
      profile={profile}
      title={`${store.name} — ${store.village}`}
      subtitle="Manager view: sales, purchases, inventory, farmer records, cash and staff."
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Inventory" value={`${inventoryKg} kg`} hint="Available across batches" />
        <StatCard label="Purchases" value={formatINR(totalPurchases)} hint="Paid to farmers" />
        <StatCard label="Sales" value={formatINR(completedSales)} hint="Completed orders" />
        <StatCard label="Orders" value={String(allOrders.length)} />
        <StatCard
          label="Cash balance"
          value={formatINR(cashIn - cashOut)}
          hint={`In ${formatINR(cashIn)} · Out ${formatINR(cashOut)}`}
        />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <Card
          title="Cash in / out"
          subtitle="Every rupee moving through the store."
          className="lg:col-span-2"
        >
          {entries.length === 0 ? (
            <EmptyState message="No cash entries yet. Farmer payments appear here automatically." />
          ) : (
            <Table headers={["Date", "Direction", "Amount", "Description"]}>
              {entries.map((e) => (
                <tr key={e.id}>
                  <td className="py-3 pr-4 text-gray-500">
                    {new Date(e.created_at).toLocaleDateString("en-IN")}
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={e.direction} />
                  </td>
                  <td className={`py-3 pr-4 font-semibold ${e.direction === "in" ? "text-green-700" : "text-red-600"}`}>
                    {e.direction === "in" ? "+" : "−"}{formatINR(Number(e.amount))}
                  </td>
                  <td className="py-3 text-gray-500">{e.description}</td>
                </tr>
              ))}
            </Table>
          )}
        </Card>

        <Card title="Record cash entry" subtitle="Manual entries: rent, float, expenses…" className="h-fit">
          <ActionForm action={addCashEntry} submitLabel="Record entry">
            <Field label="Direction">
              <select name="direction" required className={inputClass} defaultValue="">
                <option value="" disabled>
                  Select
                </option>
                <option value="in">Cash in</option>
                <option value="out">Cash out</option>
              </select>
            </Field>
            <Field label="Amount (₹)">
              <input name="amount" type="number" min="1" step="0.01" required className={inputClass} />
            </Field>
            <Field label="Description">
              <input name="description" required placeholder="e.g. Opening float" className={inputClass} />
            </Field>
          </ActionForm>
        </Card>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card
          title="Purchases from farmers"
          subtitle="Every produce lot received, graded and paid for."
        >
          {received.length === 0 ? (
            <EmptyState message="No purchases yet." />
          ) : (
            <Table headers={["Date", "Farmer", "Crop", "Grade", "Weight", "Paid"]}>
              {received.map((s) => (
                <tr key={s.id}>
                  <td className="py-3 pr-4 text-gray-500">
                    {s.paid_at ? new Date(s.paid_at).toLocaleDateString("en-IN") : "—"}
                  </td>
                  <td className="py-3 pr-4 font-medium text-gray-900">{s.profiles?.full_name}</td>
                  <td className="py-3 pr-4">{s.crop}</td>
                  <td className="py-3 pr-4">
                    {s.quality_grade ? <StatusBadge status={`grade ${s.quality_grade}`} /> : "—"}
                  </td>
                  <td className="py-3 pr-4">{Number(s.actual_weight_kg ?? s.quantity_kg)} kg</td>
                  <td className="py-3 font-semibold text-gray-900">
                    {formatINR(Number(s.paid_amount ?? 0))}
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Card>

        <Card title="Sales to buyers" subtitle="Orders leaving this store.">
          {allOrders.length === 0 ? (
            <EmptyState message="No sales yet." />
          ) : (
            <Table headers={["Date", "Buyer", "Crop", "Quantity", "Value", "Status"]}>
              {allOrders.map((o) => (
                <tr key={o.id}>
                  <td className="py-3 pr-4 text-gray-500">
                    {new Date(o.created_at).toLocaleDateString("en-IN")}
                  </td>
                  <td className="py-3 pr-4 font-medium text-gray-900">
                    {o.profiles?.full_name ?? "—"}
                  </td>
                  <td className="py-3 pr-4">{o.crop}</td>
                  <td className="py-3 pr-4">{Number(o.quantity_kg)} kg</td>
                  <td className="py-3 pr-4 font-semibold text-gray-900">
                    {formatINR(Number(o.quantity_kg) * Number(o.agreed_price))}
                  </td>
                  <td className="py-3">
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card
          title="Farmer records"
          subtitle="Everyone who has brought produce to this store."
          className="lg:col-span-2"
        >
          {farmerRecords.size === 0 ? (
            <EmptyState message="No farmers on record yet." />
          ) : (
            <Table headers={["Farmer", "Village", "Phone", "Lots", "Total produce", "Total paid"]}>
              {[...farmerRecords.values()].map((f) => (
                <tr key={f.name + f.phone}>
                  <td className="py-3 pr-4 font-medium text-gray-900">{f.name}</td>
                  <td className="py-3 pr-4 text-gray-500">{f.village ?? "—"}</td>
                  <td className="py-3 pr-4 text-gray-500">{f.phone ?? "—"}</td>
                  <td className="py-3 pr-4">{f.lots}</td>
                  <td className="py-3 pr-4">{f.kg} kg</td>
                  <td className="py-3 font-semibold text-gray-900">{formatINR(f.paid)}</td>
                </tr>
              ))}
            </Table>
          )}
        </Card>

        <div className="space-y-6">
          <Card title="Employees" subtitle="Counter staff for this store.">
            {(employees ?? []).length === 0 ? (
              <EmptyState message="No employees yet." />
            ) : (
              <ul className="space-y-2">
                {(employees ?? []).map((e) => (
                  <li key={e.id} className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2">
                    <span className="text-sm font-medium text-gray-900">{e.full_name}</span>
                    <span className="text-xs text-gray-400">{e.phone ?? ""}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Add employee" subtitle="Creates a login for the employee interface.">
            <ActionForm action={addEmployee} submitLabel="Create employee account">
              <Field label="Full name">
                <input name="full_name" required placeholder="e.g. Suresh Yadav" className={inputClass} />
              </Field>
              <Field label="Email">
                <input name="email" type="email" required placeholder="suresh@agrisetu.demo" className={inputClass} />
              </Field>
              <Field label="Phone (optional)">
                <input name="phone" placeholder="9876543210" className={inputClass} />
              </Field>
              <Field label="Password (optional, default agrisetu123)">
                <input name="password" placeholder="agrisetu123" className={inputClass} />
              </Field>
            </ActionForm>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
