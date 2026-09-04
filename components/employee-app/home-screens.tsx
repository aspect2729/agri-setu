"use client";

import { useState } from "react";
import { signOut } from "@/lib/actions";
import { formatINR } from "@/lib/utils";
import {
  BackHeader,
  Btn,
  Card,
  Divider,
  ErrorBanner,
  FarmerAvatar,
  FieldInput,
  GradeBadge,
  IcoCheck,
  IcoChevRight,
  IcoClipboard,
  IcoQr,
  IcoSearch,
  IcoUsers,
  ProgressBar,
  SectionLabel,
  StatusPill,
} from "./ui";
import {
  cropMeta,
  dateLabel,
  greeting,
  lotStatus,
  timeLabel,
  type EmpFarmer,
  type EmpLot,
  type EmployeeAppData,
  type Screen,
} from "./data";

export function DashboardScreen({
  data,
  todayKg,
  todayFarmers,
  pendingCount,
  todayPaid,
  activity,
  go,
}: {
  data: EmployeeAppData;
  todayKg: number;
  todayFarmers: number;
  pendingCount: number;
  todayPaid: number;
  activity: { at: string; label: string; detail: string; type: string }[];
  go: (s: Screen) => void;
}) {
  const todayLabel = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="md:hidden px-5 pt-6 pb-5 shrink-0" style={{ background: "#1B7A3D" }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium mb-0.5" style={{ color: "rgba(255,255,255,0.8)" }}>{greeting()}</p>
            <h1 className="text-2xl font-bold text-white">{data.employeeName}</h1>
            <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>{data.storeName}</p>
          </div>
          <form action={signOut}>
            <button type="submit" className="mt-1 text-xs font-medium px-2.5 py-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>
              Sign out
            </button>
          </form>
        </div>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{todayLabel}</p>
      </div>

      <div className="px-4 py-4 md:px-10 md:py-8 max-w-[1440px] w-full mx-auto flex-1">
        <div className="hidden md:flex items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-sm font-medium" style={{ color: "#8FA898" }}>{greeting()}</p>
            <h1 className="text-3xl font-bold tracking-tight mt-0.5">{data.employeeName}</h1>
            <p className="text-sm mt-1" style={{ color: "#8FA898" }}>{data.storeName} · {todayLabel}</p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm font-medium px-4 py-2 rounded-xl border"
              style={{ background: "#fff", color: "#5A7263", borderColor: "#DDE8E1" }}
            >
              Sign out
            </button>
          </form>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { label: "Today's Collection", value: `${todayKg.toLocaleString("en-IN")} kg`, icon: "📦" },
            { label: "Farmers Served", value: String(todayFarmers), icon: "👨‍🌾" },
            { label: "Pending Quality", value: String(pendingCount), icon: "⏳", alert: pendingCount > 0 },
            { label: "Payments Disbursed", value: formatINR(todayPaid), icon: "💰" },
          ].map((m) => (
            <Card key={m.label} className="p-4 md:p-5">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xl md:text-2xl">{m.icon}</span>
                {"alert" in m && m.alert && (
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#FDECEC", color: "#D94F4F" }}>!</span>
                )}
              </div>
              <p className="text-2xl md:text-[28px] font-bold mb-0.5 tracking-tight">{m.value}</p>
              <p className="text-xs md:text-[13px]" style={{ color: "#8FA898" }}>{m.label}</p>
            </Card>
          ))}
        </div>

        <div className="mt-5 md:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-8 items-start">
          <div>
            <SectionLabel>Quick Actions</SectionLabel>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {[
                { label: "Register Farmer", icon: <IcoUsers />, screen: "farmer-register" as Screen },
                { label: "Log Produce", icon: <IcoClipboard />, screen: "log-1" as Screen, dark: true },
                { label: "Quality Check", icon: <IcoCheck />, screen: "quality-hub" as Screen },
                { label: "Generate QR", icon: <IcoQr />, screen: "quality-hub" as Screen },
              ].map((a) => (
                <Card key={a.label} onClick={() => go(a.screen)} className="p-4 md:p-5" style={a.dark ? { background: "#1B7A3D", border: "none" } : {}}>
                  <span
                    className="mb-2 inline-flex h-10 w-10 shrink-0 items-center justify-center [&>svg]:h-6 [&>svg]:w-6"
                    style={{ color: a.dark ? "#FFFFFF" : "#1B7A3D" }}
                  >
                    {a.icon}
                  </span>
                  <p className="text-sm font-semibold md:text-[15px]" style={{ color: a.dark ? "#FFFFFF" : "#1A2E1E" }}>{a.label}</p>
                  {a.dark && <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>Most frequent</p>}
                </Card>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <SectionLabel>Today&apos;s Activity</SectionLabel>
            <Card className="flex-1">
              {activity.length === 0 ? (
                <p className="p-6 text-sm text-center" style={{ color: "#8FA898" }}>No activity yet today.</p>
              ) : (
                activity.map((item, i) => (
                  <div key={`${item.at}-${i}`}>
                    {i > 0 && <Divider />}
                    <div className="flex items-start gap-3 p-4">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: item.type === "produce" || item.type === "quality" ? "#E8F5EE" : "#FEF3E0" }}
                      >
                        <span className="text-sm">{item.type === "produce" ? "📦" : item.type === "quality" ? "✓" : "₹"}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs mt-0.5 truncate" style={{ color: "#8FA898" }}>{item.detail}</p>
                      </div>
                      <span className="text-xs flex-shrink-0 mt-0.5" style={{ color: "#8FA898" }}>{timeLabel(item.at)}</span>
                    </div>
                  </div>
                ))
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FarmersScreen({
  farmers,
  go,
  onSelect,
}: {
  farmers: EmpFarmer[];
  go: (s: Screen) => void;
  onSelect: (f: EmpFarmer) => void;
}) {
  const [query, setQuery] = useState("");
  const list = farmers.filter((f) => {
    const q = query.toLowerCase();
    return f.name.toLowerCase().includes(q) || (f.phone ?? "").includes(query) || (f.village ?? "").toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-6 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Farmers</h1>
          <button type="button" onClick={() => go("farmer-register")}
            className="px-3.5 py-2 rounded-xl text-sm font-semibold" style={{ background: "#1B7A3D", color: "#fff" }}>
            + Register
          </button>
        </div>
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#8FA898" }}><IcoSearch /></div>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, phone or village"
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: "#FFFFFF", border: "1.5px solid #DDE8E1" }} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-6 flex flex-col gap-3 pt-3 md:grid md:grid-cols-2 md:gap-3">
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center py-16 md:col-span-2">
            <p className="font-semibold mb-1.5">No farmers found</p>
            <Btn size="sm" onClick={() => go("farmer-register")}>Register Farmer</Btn>
          </div>
        ) : (
          list.map((f) => (
            <Card key={f.id} onClick={() => onSelect(f)} className="p-4">
              <div className="flex items-center gap-3">
                <FarmerAvatar name={f.name} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{f.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#8FA898" }}>{f.village ?? "—"}{f.phone ? ` · ${f.phone}` : ""}</p>
                  <p className="text-xs mt-1.5 font-semibold" style={{ color: "#1B7A3D" }}>{f.totalKg.toLocaleString("en-IN")} kg total · {dateLabel(f.lastAt)}</p>
                </div>
                <div style={{ color: "#DDE8E1" }}><IcoChevRight /></div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export function RegisterScreen({
  farmers, go, pending, error, onCreate, onSelectExisting,
}: {
  farmers: EmpFarmer[];
  go: (s: Screen) => void;
  pending: boolean;
  error: string | null;
  onCreate: (name: string, phone: string, village: string) => void;
  onSelectExisting: (f: EmpFarmer) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [village, setVillage] = useState("");
  const q = query.toLowerCase().trim();
  const match = farmers.find((f) =>
    q.length > 0 && (f.name.toLowerCase().includes(q) || (f.phone ?? "").replace(/\s/g, "").includes(q.replace(/\s/g, "")))
  );

  return (
    <div className="flex flex-col h-full">
      <BackHeader title="Register Farmer" onBack={() => (step > 1 ? setStep((s) => (s - 1) as 1 | 2 | 3) : go("farmers"))} />
      <ProgressBar step={step} total={3} />
      <ErrorBanner message={error} />
      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-4 flex flex-col gap-4">
        {step === 1 && (
          <>
            <h2 className="text-lg font-semibold">Find Farmer</h2>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#8FA898" }}><IcoSearch /></div>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Phone number or name"
                className="w-full pl-10 pr-4 py-4 rounded-xl text-base outline-none"
                style={{ background: "#FFFFFF", border: "1.5px solid #DDE8E1" }} />
            </div>
            <Btn onClick={() => setStep(2)} disabled={!query}>Search Farmer</Btn>
            <Btn variant="secondary" onClick={() => setStep(3)}>Register New Farmer</Btn>
          </>
        )}
        {step === 2 && match && (
          <>
            <div className="p-4 rounded-2xl" style={{ background: "#E8F5EE" }}>
              <p className="text-sm font-semibold" style={{ color: "#1B7A3D" }}>Farmer already registered</p>
            </div>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <FarmerAvatar name={match.name} size="lg" />
                <div>
                  <p className="font-semibold">{match.name}</p>
                  <p className="text-sm" style={{ color: "#8FA898" }}>{match.village} · {match.phone}</p>
                </div>
              </div>
            </Card>
            <Btn onClick={() => onSelectExisting(match)}>View Farmer Profile</Btn>
            <Btn variant="secondary" onClick={() => setStep(3)}>Register Different Farmer</Btn>
          </>
        )}
        {step === 2 && !match && (
          <>
            <div className="p-3.5 rounded-xl" style={{ background: "#FEF3E0" }}>
              <p className="text-sm font-medium" style={{ color: "#8A6020" }}>No existing farmer found for “{query}”</p>
            </div>
            <Btn onClick={() => { setPhone(query); setStep(3); }}>Register New Farmer</Btn>
            <Btn variant="secondary" onClick={() => setStep(1)}>Search Again</Btn>
          </>
        )}
        {step === 3 && (
          <>
            <h2 className="text-lg font-semibold">Farmer Details</h2>
            <FieldInput label="Full Name" value={name} onChange={setName} placeholder="e.g. Ramesh Kumar" required />
            <FieldInput label="Phone Number" value={phone} onChange={setPhone} placeholder="e.g. 9876543210" type="tel" required />
            <FieldInput label="Village / Town" value={village} onChange={setVillage} placeholder="e.g. Kalaburagi" required />
            <Btn onClick={() => onCreate(name, phone, village)} disabled={!name || !phone || !village || pending}>
              {pending ? "Creating…" : "Create Farmer"}
            </Btn>
          </>
        )}
      </div>
    </div>
  );
}

export function FarmerSuccessScreen({ name, village, go }: { name: string; village: string; go: (s: Screen) => void }) {
  return (
    <div className="flex flex-col h-full items-center justify-center px-6 text-center gap-5">
      <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "#E8F5EE" }}><span className="text-4xl">✓</span></div>
      <div>
        <h2 className="text-xl font-bold mb-1">Farmer Registered</h2>
        <p className="text-sm" style={{ color: "#8FA898" }}>{name} has been added to this collection center</p>
      </div>
      <Card className="p-4 w-full text-left">
        <div className="flex items-center gap-3">
          <FarmerAvatar name={name} size="lg" />
          <div>
            <p className="font-semibold">{name}</p>
            <p className="text-sm" style={{ color: "#8FA898" }}>{village}</p>
          </div>
        </div>
      </Card>
      <div className="w-full flex flex-col gap-3">
        <Btn onClick={() => go("log-1")}>Log Produce Now</Btn>
        <Btn variant="secondary" onClick={() => go("farmers")}>Back to Farmers</Btn>
      </div>
    </div>
  );
}

export function FarmerProfileScreen({ farmer, lots, go }: { farmer: EmpFarmer; lots: EmpLot[]; go: (s: Screen) => void }) {
  return (
    <div className="flex flex-col h-full">
      <BackHeader title="Farmer Profile" onBack={() => go("farmers")} />
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-5 md:px-10 md:py-8" style={{ background: "#1B7A3D" }}>
          <div className="max-w-[1440px] mx-auto w-full">
          <div className="flex items-center gap-4">
            <FarmerAvatar name={farmer.name} size="xl" />
            <div>
              <h2 className="text-xl font-bold text-white">{farmer.name}</h2>
              <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>{farmer.village} · {farmer.phone ?? "—"}</p>
            </div>
          </div>
          <button type="button" onClick={() => go("log-1")} className="w-full md:w-auto md:min-w-64 mt-5 py-3.5 px-6 rounded-2xl text-sm font-semibold" style={{ background: "#fff", color: "#1B7A3D" }}>
            + Log Produce for {farmer.name.split(" ")[0]}
          </button>
          </div>
        </div>
        <div className="px-5 pt-5 pb-6 md:px-10 md:pt-8 md:max-w-[1440px] md:mx-auto">
          <SectionLabel>Collection Summary</SectionLabel>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {[
              { label: "Total Produce", value: `${farmer.totalKg.toLocaleString("en-IN")} kg` },
              { label: "Deliveries", value: String(farmer.deliveries) },
              { label: "Last Collection", value: dateLabel(farmer.lastAt) },
              { label: "Total Payments", value: formatINR(farmer.totalPaid) },
            ].map((s) => (
              <Card key={s.label} className="p-3.5">
                <p className="text-base font-bold">{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color: "#8FA898" }}>{s.label}</p>
              </Card>
            ))}
          </div>
          <SectionLabel>Recent Produce</SectionLabel>
          <Card>
            {lots.length === 0 ? (
              <p className="p-6 text-sm text-center" style={{ color: "#8FA898" }}>No produce logged yet.</p>
            ) : (
              lots.slice(0, 8).map((h, i) => (
                <div key={h.id}>
                  {i > 0 && <Divider />}
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: cropMeta(h.crop).bg }}>{cropMeta(h.crop).emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{h.crop}</p>
                        {h.grade && <GradeBadge grade={h.grade} />}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: "#8FA898" }}>{h.kg} kg · {dateLabel(h.createdAt)}</p>
                    </div>
                    <StatusPill status={lotStatus(h)} />
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
