import Link from "next/link";
import { headers } from "next/headers";
import QRCode from "qrcode";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatINR } from "@/lib/utils";
import { StatusBadge } from "@/components/ui";
import { PrintLabelButton } from "@/components/qr/PrintLabelButton";
import { BrandLogo } from "@/components/brand-logo";

export const dynamic = "force-dynamic";

type TraceOrder = {
  quantity_kg: number;
  orders: {
    status: string;
    created_at: string;
    delivery_location: string | null;
    profiles: { full_name: string } | null;
    deliveries: { status: string } | null;
  } | null;
};

export default async function TracePage({ params }: PageProps<"/trace/[code]">) {
  const { code } = await params;
  const batchCode = decodeURIComponent(code).toUpperCase();

  // Public verification page: read via the service role so anyone scanning
  // a printed QR code can verify the batch without signing in.
  const admin = createAdminClient();
  const { data: batch } = await admin
    .from("produce_submissions")
    .select(
      `*,
       white_stores(name, village, address),
       farmer:profiles!produce_submissions_farmer_id_fkey(full_name, village),
       receiver:profiles!produce_submissions_received_by_fkey(full_name),
       order_items(quantity_kg, orders(status, created_at, delivery_location, profiles(full_name), deliveries(status)))`
    )
    .eq("batch_code", batchCode)
    .maybeSingle();

  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  const traceUrl = `${proto}://${host}/trace/${batchCode}`;
  const qrDataUrl = batch
    ? await QRCode.toDataURL(traceUrl, {
        width: 280,
        margin: 1,
        color: { dark: "#1B7A3D", light: "#ffffff" },
      })
    : null;

  return (
    <div className="min-h-screen bg-off-white">
      <header className="border-b border-hairline bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center">
            <BrandLogo size={40} />
          </Link>
          <div className="flex items-center gap-3 print:hidden">
            <span className="text-xs font-semibold uppercase tracking-wide text-green-primary">
              Batch verification
            </span>
            {batch && <PrintLabelButton />}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        {!batch ? (
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <p className="text-3xl">❌</p>
            <h1 className="mt-3 text-xl font-bold text-gray-900">Batch not found</h1>
            <p className="mt-2 text-sm text-gray-500">
              No batch with code <span className="font-mono font-semibold">{batchCode}</span>{" "}
              exists in the Agri Setu network. This package could not be verified.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 rounded-2xl border border-green-200 bg-white p-6 text-center shadow-sm">
              <p className="text-3xl">✅</p>
              <h1 className="mt-2 text-xl font-bold text-gray-900">Verified Agri Setu batch</h1>
              <p className="mt-1 font-mono text-lg font-bold tracking-wide text-green-800">
                {batch.batch_code}
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-gray-900">Batch details</h2>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Produce</dt>
                    <dd className="font-semibold text-gray-900">{batch.crop}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Quality grade</dt>
                    <dd>
                      {batch.quality_grade ? (
                        <StatusBadge status={`grade ${batch.quality_grade}`} />
                      ) : (
                        "—"
                      )}
                    </dd>
                  </div>
                  {batch.quality_notes && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500">Inspection notes</dt>
                      <dd className="text-right text-gray-700">{batch.quality_notes}</dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Weighed quantity</dt>
                    <dd className="font-semibold text-gray-900">
                      {Number(batch.actual_weight_kg ?? batch.quantity_kg)} kg
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Grown by</dt>
                    <dd className="text-gray-900">
                      {batch.farmer?.full_name}
                      {batch.farmer?.village ? `, ${batch.farmer.village}` : ""}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Collected at</dt>
                    <dd className="text-right text-gray-900">
                      {batch.white_stores?.name}
                      {batch.white_stores?.village ? `, ${batch.white_stores.village}` : ""}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Received & inspected</dt>
                    <dd className="text-gray-900">
                      {batch.paid_at ? new Date(batch.paid_at).toLocaleDateString("en-IN") : "—"}
                      {batch.receiver?.full_name ? ` by ${batch.receiver.full_name}` : ""}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Farmer paid</dt>
                    <dd className="font-semibold text-green-800">
                      {batch.paid_amount != null ? formatINR(Number(batch.paid_amount)) : "—"}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="flex flex-col items-center justify-center rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
                {qrDataUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrDataUrl} alt={`QR code for batch ${batch.batch_code}`} className="h-56 w-56" />
                )}
                <p className="mt-3 text-center text-xs text-gray-400">
                  Print this QR on the package — scanning it opens this verification page.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-gray-900">Tracking</h2>
              {(batch.order_items as TraceOrder[] | null)?.length ? (
                <ul className="space-y-3">
                  {(batch.order_items as TraceOrder[]).map((item, i) =>
                    item.orders ? (
                      <li
                        key={i}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-100 px-4 py-3 text-sm"
                      >
                        <span className="text-gray-700">
                          {Number(item.quantity_kg)} kg sold to{" "}
                          <span className="font-medium text-gray-900">
                            {item.orders.profiles?.full_name ?? "a buyer"}
                          </span>
                          {item.orders.delivery_location ? ` → ${item.orders.delivery_location}` : ""}
                          <span className="ml-2 text-xs text-gray-400">
                            {new Date(item.orders.created_at).toLocaleDateString("en-IN")}
                          </span>
                        </span>
                        <span className="flex items-center gap-2">
                          <StatusBadge status={item.orders.status} />
                          {item.orders.deliveries && (
                            <StatusBadge status={item.orders.deliveries.status} />
                          )}
                        </span>
                      </li>
                    ) : null
                  )}
                </ul>
              ) : (
                <p className="text-sm text-gray-400">
                  Still in White Store inventory — not yet sold.
                </p>
              )}
            </div>
          </>
        )}

        <p className="mt-8 text-center text-xs text-gray-400">
          Agri Setu — farm-to-buyer traceability for the Smart India Hackathon
        </p>
      </main>
    </div>
  );
}
