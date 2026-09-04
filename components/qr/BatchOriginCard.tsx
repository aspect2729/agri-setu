import { formatINR } from "@/lib/utils";
import type { BatchLookup } from "@/lib/qr";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function BatchOriginCard({
  batch,
  variant = "buyer",
}: {
  batch: BatchLookup;
  variant?: "buyer" | "logistics";
}) {
  const box = variant === "logistics" ? "bg-slate-50" : "bg-ivory";
  const label = variant === "logistics" ? "text-slate-500" : "text-sage";
  const value = variant === "logistics" ? "text-slate-800" : "text-forest";
  const title = variant === "logistics" ? "text-slate-900" : "text-forest";

  const cells = [
    { label: "Batch ID", value: batch.batchCode, mono: true },
    { label: "Crop", value: batch.crop, mono: false },
    { label: "Quantity", value: `${batch.quantityKg.toLocaleString("en-IN")} kg`, mono: true },
    { label: "Inspection", value: formatDate(batch.paidAt), mono: false },
  ];

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
          {batch.grade ? `Grade ${batch.grade}` : "Graded"}
        </span>
        <span className={`text-xs ${label}`}>Quality verified at the White Store</span>
      </div>
      <div className="mb-4 grid grid-cols-2 gap-2.5">
        {cells.map((cell) => (
          <div key={cell.label} className={`rounded-xl p-3 ${box}`}>
            <p className={`mb-0.5 text-[11px] ${label}`}>{cell.label}</p>
            <p className={`text-sm font-semibold ${value} ${cell.mono ? "font-mono" : ""}`}>{cell.value}</p>
          </div>
        ))}
      </div>
      <div className={`rounded-xl border p-4 ${variant === "logistics" ? "border-slate-100" : "border-border"}`}>
        <h4 className={`mb-3 text-sm font-medium ${title}`}>Origin traceability</h4>
        <div className="flex flex-col">
          {[
            {
              icon: "👨‍🌾",
              label: batch.farmerName ?? "Verified farmer",
              detail: batch.farmerVillage ?? "Village on record",
            },
            {
              icon: "🏪",
              label: batch.storeName ?? "White Store",
              detail: batch.storeVillage ? `${batch.storeVillage} · collection & inspection` : "Collection & inspection",
            },
            {
              icon: "📦",
              label: `Batch ${batch.batchCode}`,
              detail: `${batch.quantityKg.toLocaleString("en-IN")} kg${batch.grade ? ` · Grade ${batch.grade}` : ""}`,
            },
            {
              icon: "₹",
              label: batch.paidAmount != null ? `${formatINR(batch.paidAmount)} paid to farmer` : "Farmer payout recorded",
              detail: formatDate(batch.paidAt),
            },
          ].map((step, i, arr) => (
            <div key={step.label} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-50 text-sm">
                  {step.icon}
                </div>
                {i < arr.length - 1 && <div className="my-1 w-px flex-1 bg-slate-200" style={{ minHeight: 14 }} />}
              </div>
              <div className="pb-3">
                <p className={`text-sm font-medium ${title}`}>{step.label}</p>
                <p className={`text-xs ${label}`}>{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
