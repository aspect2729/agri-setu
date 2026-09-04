"use client";

import { useState } from "react";
import { formatINR } from "@/lib/utils";
import {
  BackHeader,
  Btn,
  Card,
  Divider,
  ErrorBanner,
  FieldInput,
  IcoArrowDown,
  IcoArrowUp,
  SectionLabel,
} from "./ui";
import { dateLabel, timeLabel, type CashForm, type EmpCash, type EmpFarmer, type Screen } from "./data";

function CashList({ entries }: { entries: EmpCash[] }) {
  if (entries.length === 0) {
    return <p className="p-6 text-sm text-center" style={{ color: "#8FA898" }}>No transactions yet.</p>;
  }
  return (
    <Card>
      {entries.map((t, i) => (
        <div key={t.id}>
          {i > 0 && <Divider />}
          <div className="flex items-center gap-3 p-4">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: t.direction === "in" ? "#E8F5EE" : "#FDECEC" }}>
              {t.direction === "in" ? <IcoArrowDown /> : <IcoArrowUp />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{t.description}</p>
              <p className="text-xs" style={{ color: "#8FA898" }}>{timeLabel(t.createdAt)} · {dateLabel(t.createdAt)}</p>
            </div>
            <p className="text-sm font-bold" style={{ color: t.direction === "in" ? "#22A357" : "#D94F4F" }}>
              {t.direction === "in" ? "+" : "−"}{formatINR(t.amount)}
            </p>
          </div>
        </div>
      ))}
    </Card>
  );
}

export function CashHomeScreen({ cashIn, cashOut, entries, go }: { cashIn: number; cashOut: number; entries: EmpCash[]; go: (s: Screen) => void }) {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-5 pt-6 pb-6" style={{ background: "#1B7A3D" }}>
        <h1 className="text-xl font-bold text-white mb-5">Cash Ledger</h1>
        <p className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.55)" }}>Available Balance</p>
        <p className="text-4xl font-bold text-white mb-1">{formatINR(cashIn - cashOut)}</p>
        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.08)" }}>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>Money In</p>
            <p className="text-base font-bold" style={{ color: "#E8F5EE" }}>{formatINR(cashIn)}</p>
          </div>
          <div className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.08)" }}>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>Money Out</p>
            <p className="text-base font-bold" style={{ color: "#FDECEC" }}>{formatINR(cashOut)}</p>
          </div>
        </div>
      </div>
      <div className="px-5 pt-5 pb-6">
        <div className="grid grid-cols-2 gap-3 mb-5">
          <Btn size="md" onClick={() => go("cash-record")}>Record Payment</Btn>
          <Btn size="md" variant="secondary" onClick={() => go("cash-ledger")}>View Ledger</Btn>
        </div>
        <SectionLabel>Recent Transactions</SectionLabel>
        <CashList entries={entries.slice(0, 5)} />
      </div>
    </div>
  );
}

export function CashLedgerScreen({ entries, go }: { entries: EmpCash[]; go: (s: Screen) => void }) {
  const [filter, setFilter] = useState<"all" | "in" | "out">("all");
  const list = filter === "all" ? entries : entries.filter((t) => t.direction === filter);
  return (
    <div className="flex flex-col h-full">
      <BackHeader title="Cash Ledger" onBack={() => go("cash-home")}
        right={<button type="button" onClick={() => go("cash-record")} className="text-sm font-semibold" style={{ color: "#1B7A3D" }}>+ Record</button>} />
      <div className="px-5 pb-3 flex gap-2">
        {([{ id: "all" as const, label: "All" }, { id: "in" as const, label: "Money In" }, { id: "out" as const, label: "Payments" }]).map((f) => (
          <button key={f.id} type="button" onClick={() => setFilter(f.id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: filter === f.id ? "#1B7A3D" : "#FFFFFF", color: filter === f.id ? "#FFFFFF" : "#5A7263", border: "1.5px solid #DDE8E1" }}>
            {f.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-6"><CashList entries={list} /></div>
    </div>
  );
}

export function CashRecordScreen({
  form, setForm, farmers, go,
}: {
  form: CashForm;
  setForm: (f: CashForm) => void;
  farmers: EmpFarmer[];
  go: (s: Screen) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <BackHeader title="Record Transaction" onBack={() => go("cash-home")} />
      <div className="flex-1 overflow-y-auto px-5 pb-6 flex flex-col gap-4 pt-3">
        <div className="flex gap-2">
          {([{ id: "payment" as const, label: "Farmer Payment" }, { id: "cashin" as const, label: "Cash In" }, { id: "cashout" as const, label: "Cash Out" }]).map((t) => (
            <button key={t.id} type="button" onClick={() => setForm({ ...form, type: t.id })} className="flex-1 py-2 rounded-lg text-xs font-semibold"
              style={{ background: form.type === t.id ? "#1B7A3D" : "#FFFFFF", color: form.type === t.id ? "#FFFFFF" : "#5A7263", border: "1.5px solid #DDE8E1" }}>
              {t.label}
            </button>
          ))}
        </div>
        {form.type === "payment" && (
          <select value={form.farmer} onChange={(e) => setForm({ ...form, farmer: e.target.value })}
            className="w-full px-4 py-3.5 rounded-xl text-sm outline-none" style={{ background: "#FFFFFF", border: "1.5px solid #DDE8E1" }}>
            <option value="">Select farmer (optional)</option>
            {farmers.map((f) => <option key={f.id} value={f.name}>{f.name}</option>)}
          </select>
        )}
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3 text-center" style={{ color: "#8FA898" }}>Amount (₹)</p>
          <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0"
            className="text-5xl font-bold text-center outline-none bg-transparent w-full" style={{ color: "#1B7A3D" }} />
        </Card>
        <FieldInput label="Notes (optional)" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} placeholder="Reason or description" />
        <Btn onClick={() => go("cash-confirm")} disabled={!form.amount || Number(form.amount) <= 0}>Review Transaction</Btn>
      </div>
    </div>
  );
}

export function CashConfirmScreen({
  form, go, pending, error, onConfirm,
}: {
  form: CashForm;
  go: (s: Screen) => void;
  pending: boolean;
  error: string | null;
  onConfirm: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <BackHeader title="Confirm Payment" onBack={() => go("cash-record")} />
      <ErrorBanner message={error} />
      <div className="flex-1 overflow-y-auto px-5 pb-6 flex flex-col gap-4 pt-4">
        <Card className="overflow-hidden">
          <div className="p-4 flex flex-col items-center" style={{ background: "#1B7A3D" }}>
            <p className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.55)" }}>{form.type === "cashin" ? "Cash In" : "Payment"}</p>
            <p className="text-4xl font-bold text-white">{formatINR(Number(form.amount))}</p>
          </div>
          <div className="p-4 text-sm">
            {form.farmer && <p className="mb-2">Farmer: <strong>{form.farmer}</strong></p>}
            {form.notes && <p style={{ color: "#5A7263" }}>{form.notes}</p>}
          </div>
        </Card>
        <div className="p-3.5 rounded-xl" style={{ background: "#FEF3E0" }}>
          <p className="text-sm font-medium" style={{ color: "#8A6020" }}>This action cannot be undone</p>
        </div>
        <Btn onClick={onConfirm} disabled={pending}>{pending ? "Saving…" : `Confirm — ${formatINR(Number(form.amount))}`}</Btn>
      </div>
    </div>
  );
}

export function CashDoneScreen({ form, go }: { form: CashForm; go: (s: Screen) => void }) {
  return (
    <div className="flex flex-col h-full items-center justify-center px-6 text-center gap-5">
      <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "#E8F5EE" }}><span className="text-4xl">✓</span></div>
      <div>
        <h2 className="text-xl font-bold mb-1">Payment Recorded</h2>
        <p className="text-sm" style={{ color: "#8FA898" }}>{formatINR(Number(form.amount))} recorded in the ledger</p>
      </div>
      <div className="w-full flex flex-col gap-3">
        <Btn onClick={() => go("cash-record")}>Record Another</Btn>
        <Btn variant="secondary" onClick={() => go("cash-ledger")}>View Ledger</Btn>
        <Btn variant="ghost" onClick={() => go("cash-home")}>Back to Cash</Btn>
      </div>
    </div>
  );
}
