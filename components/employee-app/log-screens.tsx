"use client";

import { useState } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/utils";
import {
  BackHeader,
  Btn,
  Card,
  ErrorBanner,
  FarmerAvatar,
  GradeBadge,
  IcoChevRight,
  IcoQr,
  IcoSearch,
  ProgressBar,
  type Grade,
} from "./ui";
import { BatchQr } from "@/components/qr/BatchQr";
import {
  CROPS,
  cropMeta,
  dateLabel,
  priceFor,
  timeLabel,
  type Crop,
  type EmpFarmer,
  type EmpLot,
  type LogState,
  type Screen,
} from "./data";

export function LogStep1({ farmers, go, onPick }: { farmers: EmpFarmer[]; go: (s: Screen) => void; onPick: (f: EmpFarmer) => void }) {
  const [query, setQuery] = useState("");
  const results = query
    ? farmers.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()) || (f.phone ?? "").includes(query))
    : farmers.slice(0, 5);
  return (
    <div className="flex flex-col h-full">
      <BackHeader title="Select Farmer" onBack={() => go("dashboard")} />
      <ProgressBar step={1} total={5} />
      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-3 flex flex-col gap-4">
        <p className="text-sm" style={{ color: "#8FA898" }}>Who is delivering produce today?</p>
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#8FA898" }}><IcoSearch /></div>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or phone"
            className="w-full pl-10 pr-4 py-3.5 rounded-xl text-sm outline-none"
            style={{ background: "#FFFFFF", border: "1.5px solid #DDE8E1" }} />
        </div>
        {results.map((f) => (
          <Card key={f.id} onClick={() => onPick(f)} className="p-3.5">
            <div className="flex items-center gap-3">
              <FarmerAvatar name={f.name} size="sm" />
              <div className="flex-1">
                <p className="text-sm font-semibold">{f.name}</p>
                <p className="text-xs" style={{ color: "#8FA898" }}>{f.village} · Last: {dateLabel(f.lastAt)}</p>
              </div>
              <div style={{ color: "#DDE8E1" }}><IcoChevRight /></div>
            </div>
          </Card>
        ))}
        <Btn variant="secondary" onClick={() => go("farmer-register")}>Register New Farmer</Btn>
      </div>
    </div>
  );
}

export function LogStep2({ log, go, onPick }: { log: LogState; go: (s: Screen) => void; onPick: (c: Crop) => void }) {
  return (
    <div className="flex flex-col h-full">
      <BackHeader title="Select Crop" onBack={() => go("log-1")} />
      <ProgressBar step={2} total={5} />
      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-3">
        {log.farmer && <p className="text-sm mb-4" style={{ color: "#5A7263" }}>{log.farmer.name}</p>}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CROPS.map((c) => (
            <Card key={c.id} onClick={() => onPick(c)} className="p-4 flex flex-col items-center gap-2"
              style={log.crop?.id === c.id ? { border: "2px solid #1B7A3D", background: "#E8F5EE" } : {}}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: c.bg }}>{c.emoji}</div>
              <p className="text-sm font-semibold">{c.name}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LogStep3({ log, setQty, go }: { log: LogState; setQty: (q: string) => void; go: (s: Screen) => void }) {
  return (
    <div className="flex flex-col h-full">
      <BackHeader title="Enter Quantity" onBack={() => go("log-2")} />
      <ProgressBar step={3} total={5} />
      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-3 flex flex-col gap-6">
        <p className="text-sm" style={{ color: "#5A7263" }}>{log.farmer?.name} · {log.crop?.name}</p>
        <Card className="p-6">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3 text-center" style={{ color: "#8FA898" }}>Quantity Received</p>
          <div className="flex items-end justify-center gap-3">
            <input type="number" value={log.quantity} onChange={(e) => setQty(e.target.value)} placeholder="0"
              className="text-6xl font-bold text-center outline-none bg-transparent w-40" style={{ color: "#1B7A3D" }} />
            <span className="text-2xl font-semibold pb-2" style={{ color: "#8FA898" }}>kg</span>
          </div>
          <div className="flex gap-2 mt-5 justify-center">
            {["50", "100", "200", "500"].map((v) => (
              <button key={v} type="button" onClick={() => setQty(v)} className="px-3.5 py-2 rounded-lg text-sm font-semibold"
                style={{ background: log.quantity === v ? "#1B7A3D" : "#F7F8F5", color: log.quantity === v ? "#FFFFFF" : "#5A7263" }}>
                {v} kg
              </button>
            ))}
          </div>
        </Card>
        <Btn onClick={() => go("log-4")} disabled={!log.quantity || Number(log.quantity) <= 0}>Continue</Btn>
      </div>
    </div>
  );
}

export function LogStep4({ log, setGrade, setNotes, go }: { log: LogState; setGrade: (g: Grade) => void; setNotes: (n: string) => void; go: (s: Screen) => void }) {
  const info: Record<Grade, { label: string; desc: string; color: string; bg: string }> = {
    A: { label: "Excellent", desc: "Premium quality, no visible defects", color: "#22A357", bg: "#E8F5EE" },
    B: { label: "Good", desc: "Minor imperfections, market-ready", color: "#8A6020", bg: "#FEF3E0" },
    C: { label: "Fair", desc: "Notable issues, needs attention", color: "#D94F4F", bg: "#FDECEC" },
  };
  return (
    <div className="flex flex-col h-full">
      <BackHeader title="Quality Check" onBack={() => go("log-3")} />
      <ProgressBar step={4} total={5} />
      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-3 flex flex-col gap-4">
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#E8F5EE" }}>
          <span className="text-2xl">{log.crop?.emoji}</span>
          <p className="text-sm font-semibold">{log.crop?.name} · {log.quantity} kg</p>
        </div>
        {(["A", "B", "C"] as Grade[]).map((g) => {
          const selected = log.grade === g;
          return (
            <Card key={g} onClick={() => setGrade(g)} className="p-4" style={selected ? { border: `2px solid ${info[g].color}`, background: info[g].bg } : {}}>
              <p className="text-sm font-semibold">Grade {g} — {info[g].label}</p>
              <p className="text-xs mt-0.5" style={{ color: "#8FA898" }}>{info[g].desc}</p>
            </Card>
          );
        })}
        <textarea value={log.notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any observations about the produce..."
          rows={3} className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
          style={{ background: "#FFFFFF", border: "1.5px solid #DDE8E1" }} />
        <Btn onClick={() => go("log-5")} disabled={!log.grade}>Continue</Btn>
      </div>
    </div>
  );
}

export function LogStep5({ log, go, pending, error, onConfirm }: { log: LogState; go: (s: Screen) => void; pending: boolean; error: string | null; onConfirm: () => void }) {
  const price = log.crop && log.grade ? priceFor(log.crop.name, log.grade) : 0;
  const payout = Math.round(Number(log.quantity || 0) * price);
  return (
    <div className="flex flex-col h-full">
      <BackHeader title="Review" onBack={() => go("log-4")} />
      <ProgressBar step={5} total={5} />
      <ErrorBanner message={error} />
      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-3 flex flex-col gap-5">
        <Card className="overflow-hidden">
          <div className="p-4" style={{ background: "#1B7A3D" }}>
            <p className="text-white font-bold text-lg">{log.crop?.name}</p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{log.quantity} kg</p>
          </div>
          <div className="p-4 flex flex-col gap-3 text-sm">
            <div className="flex justify-between"><span style={{ color: "#8FA898" }}>Farmer</span><strong>{log.farmer?.name}</strong></div>
            <div className="flex justify-between"><span style={{ color: "#8FA898" }}>Grade</span><strong>{log.grade}</strong></div>
            <div className="flex justify-between"><span style={{ color: "#8FA898" }}>Price</span><strong>₹{price}/kg</strong></div>
            <div className="flex justify-between"><span style={{ color: "#8FA898" }}>Payout</span><strong>{formatINR(payout)}</strong></div>
          </div>
        </Card>
        <Btn onClick={onConfirm} disabled={pending}>{pending ? "Logging…" : "Confirm & Log Produce"}</Btn>
        <Btn variant="secondary" onClick={() => go("log-4")}>Edit Entry</Btn>
      </div>
    </div>
  );
}

export function LogSuccessScreen({ log, paid, go }: { log: LogState; paid: number; go: (s: Screen) => void }) {
  return (
    <div className="flex flex-col h-full items-center justify-center px-6 text-center gap-5">
      <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "#E8F5EE", boxShadow: "0 0 0 8px #E8F5EE" }}>
        <span className="text-4xl">✓</span>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-1">Produce Logged</h2>
        <p className="text-sm" style={{ color: "#8FA898" }}>{log.quantity} kg {log.crop?.name} from {log.farmer?.name}<br />Farmer paid {formatINR(paid)}</p>
      </div>
      <div className="w-full flex flex-col gap-3">
        <Btn onClick={() => go("qr-view")}>Generate QR Code</Btn>
        <Btn variant="secondary" onClick={() => go("log-1")}>Log Another Produce</Btn>
        <Btn variant="ghost" onClick={() => go("dashboard")}>Back to Dashboard</Btn>
      </div>
    </div>
  );
}

export function QRViewScreen({ log, code, go }: { log: LogState; code: string; go: (s: Screen) => void }) {
  return (
    <div className="flex flex-col h-full">
      <BackHeader title="QR Code" onBack={() => go("dashboard")} />
      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-4 flex flex-col items-center gap-4">
        <p className="text-sm font-semibold">{log.crop?.name ?? "Produce"} · {log.quantity} kg</p>
        <p className="text-xs" style={{ color: "#8FA898" }}>{log.farmer?.name} · Grade {log.grade}</p>
        <BatchQr code={code} />
        <p className="text-sm font-bold font-mono" style={{ color: "#1B7A3D" }}>{code || "—"}</p>
        <p className="text-center text-xs" style={{ color: "#8FA898" }}>
          Print or show this QR on the crate. Scanning it in the buyer or logistics app shows origin and grade.
        </p>
        <div className="w-full flex flex-col gap-3">
          {code ? (
            <>
              <Link
                href={`/trace/${code}`}
                className="block w-full rounded-xl py-4 text-center text-base font-semibold"
                style={{ background: "#1B7A3D", color: "#fff" }}
              >
                Open Trace Page
              </Link>
              <Btn
                variant="secondary"
                onClick={() => window.open(`/trace/${code}`, "_blank")}
              >
                Print label
              </Btn>
            </>
          ) : null}
          <Btn variant="secondary" onClick={() => go("dashboard")}>Done</Btn>
        </div>
      </div>
    </div>
  );
}

export function QualityHubScreen({
  pendingLots, verifiedLots, onInspect, onQr,
}: {
  pendingLots: EmpLot[];
  verifiedLots: EmpLot[];
  onInspect: (lot: EmpLot) => void;
  onQr: (lot: EmpLot) => void;
}) {
  const [tab, setTab] = useState<"pending" | "verified" | "qr">("pending");
  const qrLots = verifiedLots.filter((l) => l.batchCode);
  const list = tab === "pending" ? pendingLots : tab === "verified" ? verifiedLots : qrLots;

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-6 pb-3 flex-shrink-0">
        <h1 className="text-xl font-semibold mb-4">Quality & QR</h1>
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: "#EEF1EE" }}>
          {[
            { id: "pending" as const, label: "Pending", count: pendingLots.length },
            { id: "verified" as const, label: "Verified", count: verifiedLots.length },
            { id: "qr" as const, label: "QR Ready", count: qrLots.length },
          ].map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)}
              className="flex-1 py-2 rounded-lg text-xs font-semibold"
              style={{ background: tab === t.id ? "#FFFFFF" : "transparent", color: tab === t.id ? "#1A2E1E" : "#8FA898" }}>
              {t.label} {t.count}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-6 flex flex-col gap-3 pt-1 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-3">
        {list.length === 0 ? (
          <p className="py-16 text-center text-sm md:col-span-2 lg:col-span-3" style={{ color: "#8FA898" }}>Nothing in this list right now.</p>
        ) : (
          list.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl" style={{ background: cropMeta(item.crop).bg }}>
                  {cropMeta(item.crop).emoji}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-semibold">{item.crop}</p>
                    {item.grade ? <GradeBadge grade={item.grade} /> : <span className="text-xs" style={{ color: "#8FA898" }}>{timeLabel(item.createdAt)}</span>}
                  </div>
                  <p className="text-xs mb-2" style={{ color: "#8FA898" }}>{item.farmerName} · {item.kg} kg</p>
                  {tab === "pending" ? (
                    <button type="button" onClick={() => onInspect(item)} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: "#1B7A3D", color: "#FFFFFF" }}>
                      Start Inspection →
                    </button>
                  ) : tab === "qr" ? (
                    <button type="button" onClick={() => onQr(item)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: "#E8F5EE", color: "#1B7A3D" }}>
                      <IcoQr /> View QR
                    </button>
                  ) : (
                    <span className="text-xs font-medium" style={{ color: "#22A357" }}>✓ Quality Verified</span>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export function QualityInspectScreen({
  lot, go, pending, error, onConfirm,
}: {
  lot: EmpLot;
  go: (s: Screen) => void;
  pending: boolean;
  error: string | null;
  onConfirm: (lot: EmpLot, grade: Grade, notes: string, price: number) => void;
}) {
  const [grade, setGrade] = useState<Grade | null>(null);
  const [appearance, setAppearance] = useState("");
  const [freshness, setFreshness] = useState("");
  const [damage, setDamage] = useState("");
  const price = priceFor(lot.crop, grade);

  return (
    <div className="flex flex-col h-full">
      <BackHeader title="Quality Inspection" onBack={() => go("quality-hub")} />
      <ErrorBanner message={error} />
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <Card className="p-4 mb-5" style={{ background: cropMeta(lot.crop).bg, border: "none" }}>
          <p className="font-bold text-lg">{lot.crop}</p>
          <p className="text-sm" style={{ color: "#5A7263" }}>{lot.kg} kg · {lot.farmerName}</p>
        </Card>
        {[
          { label: "Appearance", value: appearance, opts: ["Excellent", "Good", "Fair", "Poor"], set: setAppearance },
          { label: "Freshness", value: freshness, opts: ["Excellent", "Good", "Fair", "Poor"], set: setFreshness },
          { label: "Damage", value: damage, opts: ["None", "Low", "Medium", "High"], set: setDamage },
        ].map((row) => (
          <div key={row.label} className="mb-4">
            <p className="text-sm font-medium mb-2" style={{ color: "#5A7263" }}>{row.label}</p>
            <div className="flex gap-2">
              {row.opts.map((opt) => (
                <button key={opt} type="button" onClick={() => row.set(opt)} className="flex-1 py-2 rounded-lg text-xs font-medium"
                  style={{ background: row.value === opt ? "#1B7A3D" : "#F7F8F5", color: row.value === opt ? "#FFFFFF" : "#5A7263" }}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
        <p className="text-sm font-semibold mb-3">Overall Grade</p>
        <div className="flex flex-col gap-2 mb-6">
          {(["A", "B", "C"] as Grade[]).map((g) => (
            <button key={g} type="button" onClick={() => setGrade(g)} className="flex items-center gap-3 p-3.5 rounded-xl"
              style={{ background: grade === g ? (g === "A" ? "#E8F5EE" : g === "B" ? "#FEF3E0" : "#FDECEC") : "#F7F8F5" }}>
              <span className="font-bold">Grade {g}</span>
              {grade === g && <span className="ml-auto text-sm">₹{priceFor(lot.crop, g)}/kg</span>}
            </button>
          ))}
        </div>
        <Btn
          onClick={() => grade && onConfirm(lot, grade, `Appearance: ${appearance}; Freshness: ${freshness}; Damage: ${damage}`, price)}
          disabled={!grade || !appearance || !freshness || !damage || pending}
        >
          {pending ? "Saving…" : `Confirm Quality · pay ${formatINR(Math.round(lot.kg * price))}`}
        </Btn>
      </div>
    </div>
  );
}

export function QualityDoneScreen({ lot, grade, paid, go }: { lot: EmpLot; grade: Grade | null; paid: number; go: (s: Screen) => void }) {
  return (
    <div className="flex flex-col h-full items-center justify-center px-6 text-center gap-5">
      <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "#E8F5EE" }}><span className="text-4xl">✓</span></div>
      <div>
        <h2 className="text-xl font-bold mb-1">Quality Verified</h2>
        <p className="text-sm" style={{ color: "#8FA898" }}>{lot.crop} graded · farmer paid {formatINR(paid)}</p>
      </div>
      {grade && <GradeBadge grade={grade} />}
      <div className="w-full flex flex-col gap-3">
        <Btn onClick={() => go("qr-view")}>Generate QR Code</Btn>
        <Btn variant="secondary" onClick={() => go("quality-hub")}>Back to Quality Hub</Btn>
      </div>
    </div>
  );
}
