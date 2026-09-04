"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addCashEntry, logCounterProduce, receiveProduce, registerFarmer } from "@/lib/actions";
import {
  IcoCheck,
  IcoHome,
  IcoPlus,
  IcoUsers,
  IcoWallet,
  type Grade,
} from "./ui";
import {
  cropMeta,
  emptyLog,
  isToday,
  priceFor,
  type CashForm,
  type EmpFarmer,
  type EmpLot,
  type EmployeeAppData,
  type LogState,
  type NavTab,
  type Screen,
} from "./data";
import {
  DashboardScreen,
  FarmerProfileScreen,
  FarmerSuccessScreen,
  FarmersScreen,
  RegisterScreen,
} from "./home-screens";
import {
  LogStep1,
  LogStep2,
  LogStep3,
  LogStep4,
  LogStep5,
  LogSuccessScreen,
  QRViewScreen,
  QualityDoneScreen,
  QualityHubScreen,
  QualityInspectScreen,
} from "./log-screens";
import {
  CashConfirmScreen,
  CashDoneScreen,
  CashHomeScreen,
  CashLedgerScreen,
  CashRecordScreen,
} from "./cash-screens";

export function EmployeeApp({ data }: { data: EmployeeAppData }) {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [selectedFarmer, setSelectedFarmer] = useState<EmpFarmer | null>(null);
  const [inspectLot, setInspectLot] = useState<EmpLot | null>(null);
  const [log, setLog] = useState<LogState>(emptyLog);
  const [lastBatch, setLastBatch] = useState<{ code: string; paid: number } | null>(null);
  const [newFarmer, setNewFarmer] = useState<{ name: string; village: string } | null>(null);
  const [cashForm, setCashForm] = useState<CashForm>({ type: "payment", farmer: "", amount: "", notes: "" });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const patchLog = (p: Partial<LogState>) => setLog((s) => ({ ...s, ...p }));
  const go = (s: Screen) => {
    setError(null);
    setScreen(s);
  };

  const todayLots = data.lots.filter((l) => isToday(l.createdAt));
  const pendingLots = data.lots.filter((l) => l.status === "submitted");
  const verifiedLots = data.lots.filter((l) => l.status === "received");
  const todayKg = todayLots.reduce((sum, l) => sum + l.kg, 0);
  const todayFarmers = new Set(todayLots.map((l) => l.farmerId)).size;
  const todayPaid = data.cash.filter((c) => c.direction === "out" && isToday(c.createdAt)).reduce((s, c) => s + c.amount, 0);
  const cashIn = data.cash.filter((c) => c.direction === "in").reduce((s, c) => s + c.amount, 0);
  const cashOut = data.cash.filter((c) => c.direction === "out").reduce((s, c) => s + c.amount, 0);

  const activity = useMemo(() => {
    const items: { at: string; label: string; detail: string; type: string }[] = [];
    for (const l of data.lots.slice(0, 12)) {
      items.push({
        at: l.createdAt,
        label: l.status === "received" ? "Quality verified" : "Produce logged",
        detail: `${l.farmerName} · ${l.crop} · ${l.kg} kg`,
        type: l.status === "received" ? "quality" : "produce",
      });
    }
    for (const c of data.cash.slice(0, 8)) {
      items.push({
        at: c.createdAt,
        label: c.direction === "out" ? "Payment recorded" : "Cash in",
        detail: c.description,
        type: "payment",
      });
    }
    return items.sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 6);
  }, [data.lots, data.cash]);

  function navTo(tab: NavTab) {
    const map: Record<NavTab, Screen> = {
      home: "dashboard",
      log: "log-1",
      quality: "quality-hub",
      cash: "cash-home",
      farmers: "farmers",
    };
    go(map[tab]);
  }

  function submitLog() {
    if (!log.farmer || !log.crop || !log.quantity || !log.grade) return;
    const fd = new FormData();
    fd.set("farmer_id", log.farmer.id);
    fd.set("crop", log.crop.name);
    fd.set("quantity_kg", log.quantity);
    fd.set("actual_weight_kg", log.quantity);
    fd.set("quality_grade", log.grade);
    fd.set("price_per_kg", String(priceFor(log.crop.name, log.grade)));
    if (log.notes) fd.set("quality_notes", log.notes);
    startTransition(async () => {
      const res = await logCounterProduce(fd);
      if (res.error) { setError(res.error); return; }
      setLastBatch({ code: res.batchCode ?? "", paid: res.paidAmount ?? 0 });
      go("log-success");
      router.refresh();
    });
  }

  function submitInspection(lot: EmpLot, grade: Grade, notes: string, price: number) {
    const fd = new FormData();
    fd.set("actual_weight_kg", String(lot.kg));
    fd.set("quality_grade", grade);
    fd.set("price_per_kg", String(price));
    if (notes) fd.set("quality_notes", notes);
    startTransition(async () => {
      const res = await receiveProduce(lot.id, fd);
      if (res.error) { setError(res.error); return; }
      setLastBatch({ code: res.batchCode ?? "", paid: res.paidAmount ?? 0 });
      setLog({
        farmer: data.farmers.find((f) => f.id === lot.farmerId) ?? {
          id: lot.farmerId, name: lot.farmerName, village: lot.farmerVillage, phone: null,
          lastAt: lot.createdAt, totalKg: lot.kg, deliveries: 1, totalPaid: 0,
        },
        crop: cropMeta(lot.crop),
        quantity: String(lot.kg),
        grade,
        notes,
      });
      go("quality-done");
      router.refresh();
    });
  }

  function submitRegister(name: string, phone: string, village: string) {
    const fd = new FormData();
    fd.set("full_name", name);
    fd.set("phone", phone);
    if (village) fd.set("village", village);
    startTransition(async () => {
      const res = await registerFarmer(fd);
      if (res.error) { setError(res.error); return; }
      const farmer: EmpFarmer = {
        id: res.farmerId ?? "",
        name: res.farmerName ?? name,
        phone: res.farmerPhone ?? phone,
        village: res.farmerVillage ?? village,
        lastAt: null, totalKg: 0, deliveries: 0, totalPaid: 0,
      };
      setSelectedFarmer(farmer);
      setNewFarmer({ name: farmer.name, village: farmer.village ?? village });
      patchLog({ farmer });
      router.refresh();
      go("farmer-success");
    });
  }

  function submitCash() {
    const amount = Number(cashForm.amount);
    if (!amount) return;
    const fd = new FormData();
    fd.set("direction", cashForm.type === "cashin" ? "in" : "out");
    fd.set("amount", String(amount));
    fd.set(
      "description",
      cashForm.notes ||
        (cashForm.type === "payment"
          ? `Payment${cashForm.farmer ? ` — ${cashForm.farmer}` : ""}`
          : cashForm.type === "cashin" ? "Cash in" : "Cash out")
    );
    startTransition(async () => {
      const res = await addCashEntry(fd);
      if (res.error) { setError(res.error); return; }
      router.refresh();
      go("cash-done");
    });
  }

  const navTab: NavTab =
    screen === "dashboard" ? "home"
    : ["log-1", "log-2", "log-3", "log-4", "log-5", "log-success", "qr-view"].includes(screen) ? "log"
    : ["quality-hub", "quality-inspect", "quality-done"].includes(screen) ? "quality"
    : ["cash-home", "cash-ledger", "cash-record", "cash-confirm", "cash-done"].includes(screen) ? "cash"
    : "farmers";

  return (
    <div className="emp-shell">
      <aside className="hidden md:flex flex-col w-64 shrink-0 h-full bg-white" style={{ borderRight: "1px solid #EEF1EE" }}>
        <div className="px-6 py-6 shrink-0" style={{ borderBottom: "1px solid #EEF1EE" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#1B7A3D" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 3c-2 3-6 5-6 10a6 6 0 0012 0c0-5-4-7-6-10z" fill="white" />
                <path d="M12 8v8M9 12c1.2-1.5 2-2 3-2s1.8.5 3 2" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#1B7A3D" }}>Agri Setu</p>
              <p className="text-sm font-bold leading-tight" style={{ color: "#1A2E1E" }}>White Store</p>
            </div>
          </div>
          <p className="text-xs mt-2 truncate" style={{ color: "#8FA898" }}>{data.storeName}</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {([
            { id: "home" as NavTab, label: "Home", icon: <IcoHome /> },
            { id: "log" as NavTab, label: "Log produce", icon: <IcoPlus /> },
            { id: "quality" as NavTab, label: "Quality", icon: <IcoCheck /> },
            { id: "cash" as NavTab, label: "Cash", icon: <IcoWallet /> },
            { id: "farmers" as NavTab, label: "Farmers", icon: <IcoUsers /> },
          ]).map((item) => {
            const active = navTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navTo(item.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition-all"
                style={{
                  background: active ? "#E8F5EE" : "transparent",
                  color: active ? "#1B7A3D" : "#5A7263",
                }}
              >
                <span className="flex items-center justify-center w-5 h-5">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="px-5 py-4 shrink-0" style={{ borderTop: "1px solid #EEF1EE" }}>
          <p className="text-sm font-semibold truncate" style={{ color: "#1A2E1E" }}>{data.employeeName}</p>
          <p className="text-xs mt-0.5" style={{ color: "#8FA898" }}>Store employee</p>
        </div>
      </aside>

      <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden flex flex-col md:px-8 md:py-6">
          <div className="flex-1 min-h-0 overflow-hidden md:bg-white md:rounded-2xl md:border md:border-[#EEF1EE] md:shadow-sm">
        {screen === "dashboard" && (
          <DashboardScreen data={data} todayKg={todayKg} todayFarmers={todayFarmers} pendingCount={pendingLots.length} todayPaid={todayPaid} activity={activity} go={go} />
        )}
        {screen === "farmers" && (
          <FarmersScreen farmers={data.farmers} go={go} onSelect={(f) => { setSelectedFarmer(f); patchLog({ farmer: f }); go("farmer-profile"); }} />
        )}
        {screen === "farmer-register" && (
          <RegisterScreen farmers={data.farmers} go={go} pending={pending} error={error} onCreate={submitRegister}
            onSelectExisting={(f) => { setSelectedFarmer(f); go("farmer-profile"); }} />
        )}
        {screen === "farmer-success" && newFarmer && (
          <FarmerSuccessScreen name={newFarmer.name} village={newFarmer.village} go={go} />
        )}
        {screen === "farmer-profile" && selectedFarmer && (
          <FarmerProfileScreen farmer={selectedFarmer} lots={data.lots.filter((l) => l.farmerId === selectedFarmer.id)} go={go} />
        )}
        {screen === "log-1" && <LogStep1 farmers={data.farmers} go={go} onPick={(f) => { patchLog({ farmer: f }); go("log-2"); }} />}
        {screen === "log-2" && <LogStep2 log={log} go={go} onPick={(c) => { patchLog({ crop: c }); go("log-3"); }} />}
        {screen === "log-3" && <LogStep3 log={log} setQty={(q) => patchLog({ quantity: q })} go={go} />}
        {screen === "log-4" && <LogStep4 log={log} setGrade={(g) => patchLog({ grade: g })} setNotes={(n) => patchLog({ notes: n })} go={go} />}
        {screen === "log-5" && <LogStep5 log={log} go={go} pending={pending} error={error} onConfirm={submitLog} />}
        {screen === "log-success" && <LogSuccessScreen log={log} paid={lastBatch?.paid ?? 0} go={go} />}
        {screen === "qr-view" && <QRViewScreen log={log} code={lastBatch?.code ?? ""} go={go} />}
        {screen === "quality-hub" && (
          <QualityHubScreen pendingLots={pendingLots} verifiedLots={verifiedLots}
            onInspect={(lot) => { setInspectLot(lot); go("quality-inspect"); }}
            onQr={(lot) => {
              setLog({
                farmer: data.farmers.find((f) => f.id === lot.farmerId) ?? null,
                crop: cropMeta(lot.crop),
                quantity: String(lot.kg),
                grade: lot.grade,
                notes: lot.notes ?? "",
              });
              setLastBatch({ code: lot.batchCode ?? "", paid: lot.paidAmount ?? 0 });
              go("qr-view");
            }}
          />
        )}
        {screen === "quality-inspect" && inspectLot && (
          <QualityInspectScreen lot={inspectLot} go={go} pending={pending} error={error} onConfirm={submitInspection} />
        )}
        {screen === "quality-done" && inspectLot && (
          <QualityDoneScreen lot={inspectLot} grade={log.grade} paid={lastBatch?.paid ?? 0} go={go} />
        )}
        {screen === "cash-home" && <CashHomeScreen cashIn={cashIn} cashOut={cashOut} entries={data.cash} go={go} />}
        {screen === "cash-ledger" && <CashLedgerScreen entries={data.cash} go={go} />}
        {screen === "cash-record" && <CashRecordScreen form={cashForm} setForm={setCashForm} farmers={data.farmers} go={go} />}
        {screen === "cash-confirm" && <CashConfirmScreen form={cashForm} go={go} pending={pending} error={error} onConfirm={submitCash} />}
        {screen === "cash-done" && <CashDoneScreen form={cashForm} go={go} />}
          </div>
        </div>
        <BottomNav active={navTab} onNav={navTo} />
      </div>
    </div>
  );
}

function BottomNav({ active, onNav }: { active: NavTab; onNav: (t: NavTab) => void }) {
  const tabs: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    { id: "home", label: "Home", icon: <IcoHome /> },
    { id: "log", label: "Log", icon: <IcoPlus /> },
    { id: "quality", label: "Quality", icon: <IcoCheck /> },
    { id: "cash", label: "Cash", icon: <IcoWallet /> },
    { id: "farmers", label: "Farmers", icon: <IcoUsers /> },
  ];
  return (
    <div className="md:hidden flex-shrink-0 flex items-center px-3 py-2 border-t bg-white" style={{ borderColor: "#EEF1EE", paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}>
      {tabs.map((t) => {
        const isActive = active === t.id;
        return (
          <button key={t.id} type="button" onClick={() => onNav(t.id)} className="flex-1 flex flex-col items-center gap-0.5 py-1.5"
            style={{ color: isActive ? "#1B7A3D" : "#8FA898" }}>
            {t.id === "log" ? (
              <div className="w-12 h-12 rounded-full -mt-6 flex items-center justify-center shadow-lg"
                style={{ background: "#1B7A3D", color: "#fff", boxShadow: "0 4px 16px rgba(27,122,61,0.35)" }}>
                <IcoPlus />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center" style={{ width: 32, height: 28 }}>{t.icon}</div>
                <span className="text-xs font-medium" style={{ color: isActive ? "#1B7A3D" : "#8FA898" }}>{t.label}</span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
