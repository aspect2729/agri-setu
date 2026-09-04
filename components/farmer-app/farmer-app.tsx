"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addProduce, declareCrop, loadFarmWeather, signOut } from "@/lib/actions";
import type { FarmWeather } from "@/lib/weather";
import { MONTHS, t, type Lang } from "./translations";
import { WeatherHomeCard, WeatherScreen } from "./weather-view";
import { BrandLogo } from "@/components/brand-logo";
import {
  IconHome, IconBasket, IconUser, IconStore, IconPayment, IconCalendar,
  IconTrend, IconCheck, IconChevronRight, IconArrowLeft,
  IconLogout, IconHistory, IconGlobe, IconQuality, IconSold, IconPlus,
  CropTomato, CropOnion, CropPotato, CropRice, CropWheat,
  CropChilli, CropBrinjal, CropOther, IllustrationCrate, IllustrationSuccess,
} from "./icons";

// ── Data passed from the server ────────────────────────────────────────────
export type FarmerStore = {
  id: string;
  name: string;
  village: string;
  address: string | null;
  distanceKm: number | null;
  nearest: boolean;
};

export type FarmerListing = {
  id: string;
  crop: string;
  status: "submitted" | "received";
  declaredKg: number;
  weighedKg: number | null;
  soldKg: number;
  grade: string | null;
  batchCode: string | null;
  paidAmount: number | null;
  createdAt: string;
  paidAt: string | null;
  storeName: string;
};

export type FarmerDeclaration = {
  id: string;
  crop: string;
  season: string;
  qty: number | null;
  harvest: string | null;
};

export type FarmerAppData = {
  name: string;
  phone: string | null;
  village: string | null;
  monthEarnings: number;
  stores: FarmerStore[];
  listings: FarmerListing[];
  declarations: FarmerDeclaration[];
  weatherLat: number | null;
  weatherLng: number | null;
  weatherPlace: string;
};

type Screen =
  | "home" | "list-crop" | "list-qty" | "list-store" | "list-success"
  | "my-produce" | "track" | "declare" | "declare-done" | "profile" | "weather";

// ── Crops ──────────────────────────────────────────────────────────────────
type CropIconComponent = (props: { size?: number; className?: string }) => React.ReactElement;

// English names match the crop strings used across the marketplace so that
// buyer demand matching finds these listings.
const CROP_OPTIONS: { id: string; en: string; kn: string; Icon: CropIconComponent }[] = [
  { id: "tomato",  en: "Tomatoes", kn: "ಟೊಮೇಟೊ",     Icon: CropTomato },
  { id: "onion",   en: "Onions",   kn: "ಈರುಳ್ಳಿ",     Icon: CropOnion },
  { id: "potato",  en: "Potatoes", kn: "ಆಲೂಗಡ್ಡೆ",    Icon: CropPotato },
  { id: "rice",    en: "Rice",     kn: "ಅಕ್ಕಿ",        Icon: CropRice },
  { id: "wheat",   en: "Wheat",    kn: "ಗೋಧಿ",        Icon: CropWheat },
  { id: "chilli",  en: "Chilli",   kn: "ಮೆಣಸಿನಕಾಯಿ", Icon: CropChilli },
  { id: "brinjal", en: "Brinjal",  kn: "ಬದನೆ",        Icon: CropBrinjal },
  { id: "other",   en: "Other",    kn: "ಇತರ",         Icon: CropOther },
];

function cropIconFor(crop: string): CropIconComponent {
  const c = crop.toLowerCase();
  if (c.includes("tomato")) return CropTomato;
  if (c.includes("onion")) return CropOnion;
  if (c.includes("potato")) return CropPotato;
  if (c.includes("rice") || c.includes("paddy")) return CropRice;
  if (c.includes("wheat")) return CropWheat;
  if (c.includes("chilli") || c.includes("chili")) return CropChilli;
  if (c.includes("brinjal")) return CropBrinjal;
  return CropOther;
}

function CropMark({ crop, size = 44 }: { crop: string; size?: number }) {
  const Icon = cropIconFor(crop);
  return <Icon size={size} />;
}

// ── Status model ───────────────────────────────────────────────────────────
// Real journey: Submitted → Quality Checked (graded at the counter) → Paid
// (instant payment) → Sold (bought by a buyer).
const STAGES: { key: string; en: string; kn: string; color: string }[] = [
  { key: "submitted", en: "Submitted",       kn: "ಸಲ್ಲಿಸಲಾಗಿದೆ", color: "#5A7263" },
  { key: "quality",   en: "Quality Checked", kn: "ಗುಣಮಟ್ಟ ✓",   color: "#E9A23B" },
  { key: "paid",      en: "Paid",            kn: "ಹಣ ಪಡೆದಿದೆ",  color: "#22A357" },
  { key: "sold",      en: "Sold",            kn: "ಮಾರಲಾಗಿದೆ",   color: "#145C2E" },
];

function stageOf(l: FarmerListing): number {
  if (l.status === "submitted") return 0;
  return l.soldKg > 0 ? 3 : 2;
}

function formatDate(iso: string | null, lang: Lang): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(lang === "kn" ? "kn-IN" : "en-IN", {
    day: "numeric",
    month: "short",
  });
}

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

// ── Shared atoms ───────────────────────────────────────────────────────────
function LangToggle({ lang, onToggle }: { lang: Lang; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
      style={{ background: "rgba(27,122,61,0.1)", color: "#1B7A3D" }}
    >
      <IconGlobe size={13} color="#1B7A3D" />
      {lang === "en" ? "ಕನ್ನಡ" : "English"}
    </button>
  );
}

function PrimaryButton({ label, onClick, disabled = false, amber = false }: {
  label: string; onClick?: () => void; disabled?: boolean; amber?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-4 rounded-2xl text-base font-semibold transition-all active:scale-[0.98] md:w-auto md:min-w-56 md:px-10"
      style={{
        background: disabled ? "#DDE8E1" : amber ? "#E9A23B" : "#1B7A3D",
        color: disabled ? "#8FA898" : amber ? "#1A2E1E" : "#fff",
        boxShadow: disabled ? "none" : amber
          ? "0 4px 14px rgba(233,162,59,0.3)"
          : "0 4px 14px rgba(27,122,61,0.25)",
      }}
    >
      {label}
    </button>
  );
}

function SecondaryButton({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full py-3.5 rounded-2xl text-sm font-medium transition-all md:w-auto md:min-w-56 md:px-10"
      style={{ color: "#1B7A3D", background: "#E8F5EE" }}
    >
      {label}
    </button>
  );
}

function SectionHeader({ title, action, onAction }: {
  title: string; action?: string; onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-semibold" style={{ color: "#1A2E1E" }}>{title}</h3>
      {action && (
        <button
          onClick={onAction}
          className="text-xs font-medium flex items-center gap-1"
          style={{ color: "#1B7A3D" }}
        >
          {action}
          <IconChevronRight size={14} color="#1B7A3D" />
        </button>
      )}
    </div>
  );
}

function StageBadge({ stage, lang }: { stage: number; lang: Lang }) {
  const cfg = STAGES[stage];
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{
        background: stage === 0 ? "#F5F5F5" : stage === 3 ? "#E8F5EE" : "#E8F5EE",
        color: cfg.color,
      }}
    >
      {cfg[lang]}
    </span>
  );
}

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button
      onClick={onBack}
      className="w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-95"
      style={{ background: "#F0F4F1" }}
    >
      <IconArrowLeft size={20} color="#1A2E1E" />
    </button>
  );
}

function ScreenHeader({ title, onBack, lang, onLangToggle }: {
  title: string; onBack?: () => void; lang: Lang; onLangToggle: () => void;
}) {
  return (
    <div
      className="farmer-header"
      style={{ borderBottom: "1px solid #EEF1EE", background: "#fff" }}
    >
      {onBack && <BackButton onBack={onBack} />}
      <h2 className="flex-1 text-base font-semibold md:text-xl" style={{ color: "#1A2E1E" }}>{title}</h2>
      <div className="md:hidden">
        <LangToggle lang={lang} onToggle={onLangToggle} />
      </div>
    </div>
  );
}

function ProgressSteps({ step, lang }: { step: number; lang: Lang }) {
  const steps = [
    { label: { en: "Crop", kn: "ಬೆಳೆ" } },
    { label: { en: "Quantity", kn: "ಪ್ರಮಾಣ" } },
    { label: { en: "Confirm", kn: "ದೃಢೀಕರಿಸಿ" } },
  ];
  return (
    <div className="flex items-center px-5 md:px-10 py-3 gap-2 flex-shrink-0" style={{ borderBottom: "1px solid #EEF1EE", background: "#fff" }}>
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-2 flex-1 last:flex-none">
          <div className="flex items-center gap-1.5">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{
                background: i <= step ? "#1B7A3D" : "#EEF1EE",
                color: i <= step ? "#fff" : "#8FA898",
              }}
            >
              {i < step ? <IconCheck size={13} color="#fff" /> : i + 1}
            </div>
            <span
              className="text-xs font-medium whitespace-nowrap"
              style={{ color: i === step ? "#1A2E1E" : "#8FA898" }}
            >
              {s.label[lang]}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="flex-1 h-px mx-1" style={{ background: i < step ? "#1B7A3D" : "#EEF1EE" }} />
          )}
        </div>
      ))}
    </div>
  );
}

function AppLogo() {
  return <BrandLogo size={48} />;
}

// ── Root component ─────────────────────────────────────────────────────────
export function FarmerApp({ data }: { data: FarmerAppData }) {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>("home");
  const [lang, setLang] = useState<Lang>("en");
  const toggleLang = () => setLang((l) => (l === "en" ? "kn" : "en"));

  // Listing wizard state
  const [cropId, setCropId] = useState<string | null>(null);
  const [customCrop, setCustomCrop] = useState("");
  const [qty, setQty] = useState(20);
  const [expectedPrice, setExpectedPrice] = useState("");
  const [storeId, setStoreId] = useState<string | null>(data.stores[0]?.id ?? null);
  const [storePickerReturn, setStorePickerReturn] = useState<Screen>("list-qty");

  // Declare wizard state
  const [declCropId, setDeclCropId] = useState<string | null>(null);
  const [declCustomCrop, setDeclCustomCrop] = useState("");
  const [declQty, setDeclQty] = useState(200);
  const [declMonth, setDeclMonth] = useState(MONTHS[(new Date().getMonth() + 2) % 12]);

  const [trackId, setTrackId] = useState<string | null>(null);
  const [filter, setFilter] = useState(0);

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [lastListed, setLastListed] = useState<{ crop: string; qty: number; store: string } | null>(null);
  const [weather, setWeather] = useState<FarmWeather | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(
    data.weatherLat != null && data.weatherLng != null
  );

  const cropKey = data.listings.map((l) => l.crop).join("|");
  useEffect(() => {
    if (data.weatherLat == null || data.weatherLng == null) {
      setWeather(null);
      setWeatherLoading(false);
      return;
    }
    let cancelled = false;
    setWeatherLoading(true);
    const crops = cropKey ? cropKey.split("|") : [];
    loadFarmWeather(data.weatherLat, data.weatherLng, data.weatherPlace, crops)
      .then((result) => {
        if (!cancelled) setWeather(result);
      })
      .catch(() => {
        if (!cancelled) setWeather(null);
      })
      .finally(() => {
        if (!cancelled) setWeatherLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [data.weatherLat, data.weatherLng, data.weatherPlace, cropKey]);

  const selectedStore = data.stores.find((s) => s.id === storeId) ?? data.stores[0] ?? null;
  const trackListing = data.listings.find((l) => l.id === trackId) ?? data.listings[0] ?? null;

  const cropName = (id: string | null, custom: string) => {
    if (!id) return "";
    if (id === "other") return custom.trim();
    const opt = CROP_OPTIONS.find((c) => c.id === id);
    return opt?.en ?? "";
  };

  function submitListing() {
    const crop = cropName(cropId, customCrop);
    if (!crop || !selectedStore) return;
    setError(null);
    const fd = new FormData();
    fd.set("crop", crop);
    fd.set("quantity_kg", String(qty));
    if (expectedPrice) fd.set("expected_price", expectedPrice);
    fd.set("store_id", selectedStore.id);
    startTransition(async () => {
      const res = await addProduce(fd);
      if (res.error) {
        setError(res.error);
      } else {
        setLastListed({ crop, qty, store: selectedStore.name });
        router.refresh();
        setScreen("list-success");
      }
    });
  }

  function submitDeclaration() {
    const crop = cropName(declCropId, declCustomCrop);
    if (!crop) return;
    setError(null);
    const now = new Date();
    const monthIdx = MONTHS.indexOf(declMonth);
    const year = monthIdx < now.getMonth() ? now.getFullYear() + 1 : now.getFullYear();
    const fd = new FormData();
    fd.set("crop", crop);
    fd.set("season", `${declMonth} ${year}`);
    fd.set("expected_quantity_kg", String(declQty));
    fd.set("expected_harvest", `${year}-${String(monthIdx + 1).padStart(2, "0")}-01`);
    startTransition(async () => {
      const res = await declareCrop(fd);
      if (res.error) {
        setError(res.error);
      } else {
        router.refresh();
        setScreen("declare-done");
      }
    });
  }

  const navItems = [
    { id: "home" as Screen,       Icon: IconHome,   label: t("home", lang) },
    { id: "list-crop" as Screen,  Icon: IconPlus,   label: t("listProduce", lang), primary: true },
    { id: "my-produce" as Screen, Icon: IconBasket, label: t("myProduce", lang) },
    { id: "profile" as Screen,    Icon: IconUser,   label: t("profileLabel", lang) },
  ];

  const isActive = (id: Screen) => {
    if (id === "home") return ["home", "declare", "declare-done", "weather"].includes(screen);
    if (id === "list-crop") return ["list-crop", "list-qty", "list-store", "list-success"].includes(screen);
    if (id === "my-produce") return ["my-produce", "track"].includes(screen);
    return screen === id;
  };

  const goTab = (id: Screen) => {
    setError(null);
    setScreen(id);
  };

  // ── Screens ──────────────────────────────────────────────────────────────

  const initial = data.name.charAt(0).toUpperCase();

  const home = (
    <div className="farmer-scroll">
      <div className="farmer-page">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <p className="text-sm font-medium" style={{ color: "#8FA898" }}>{t("goodMorning", lang)}</p>
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: "#1A2E1E" }}>{data.name}</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <LangToggle lang={lang} onToggle={toggleLang} />
            </div>
            <button
              onClick={() => goTab("profile")}
              className="w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
              style={{ background: "#1B7A3D", color: "#fff" }}
            >
              {initial}
            </button>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-7 space-y-5">
            <button
              onClick={() => goTab("list-crop")}
              className="w-full rounded-3xl p-5 md:p-7 flex items-center gap-4 md:gap-6 transition-all active:scale-[0.99] text-left"
              style={{ background: "#1B7A3D", boxShadow: "0 6px 20px rgba(27,122,61,0.28)" }}
            >
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
                <IllustrationCrate size={44} />
              </div>
              <div className="flex-1">
                <p className="text-lg md:text-2xl font-bold text-white">{t("listProduce", lang)}</p>
                <p className="text-sm md:text-base" style={{ color: "rgba(255,255,255,0.75)" }}>{t("dropOff", lang)}</p>
              </div>
              <IconChevronRight size={24} color="rgba(255,255,255,0.7)" />
            </button>

            <div>
              <SectionHeader
                title={t("activeListings", lang)}
                action={t("seeAll", lang)}
                onAction={() => goTab("my-produce")}
              />
              <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
                {data.listings.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm" style={{ color: "#8FA898" }}>
                    {t("noListings", lang)}
                  </p>
                ) : (
                  data.listings.slice(0, 6).map((l, i) => {
                    const CropIcon = cropIconFor(l.crop);
                    return (
                      <button
                        key={l.id}
                        onClick={() => { setTrackId(l.id); setScreen("track"); }}
                        className="w-full flex items-center gap-3 px-4 md:px-5 py-3.5 md:py-4 text-left transition-all hover:bg-gray-50"
                        style={{ borderTop: i > 0 ? "1px solid #F7F8F5" : "none" }}
                      >
                        <CropIcon size={36} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm md:text-base font-medium" style={{ color: "#1A2E1E" }}>
                            {l.crop} · {l.weighedKg ?? l.declaredKg} kg
                          </p>
                          <p className="text-xs" style={{ color: "#8FA898" }}>{formatDate(l.createdAt, lang)} · {l.storeName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StageBadge stage={stageOf(l)} lang={lang} />
                          {l.paidAmount != null && (
                            <span className="hidden sm:inline text-sm font-semibold" style={{ color: "#1A2E1E" }}>
                              {inr(l.paidAmount)}
                            </span>
                          )}
                          <IconChevronRight size={14} color="#DDE8E1" />
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-3xl p-5 md:p-6" style={{ background: "#fff", boxShadow: "0 2px 16px rgba(27,122,61,0.08)" }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: "#8FA898" }}>
                    {t("paymentsReceived", lang)} · {t("thisMonth", lang)}
                  </p>
                  <p className="text-3xl md:text-4xl font-bold" style={{ color: "#1A2E1E" }}>{inr(data.monthEarnings)}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#22A357" }} />
                    <span className="text-xs font-medium" style={{ color: "#22A357" }}>
                      {t("instantPay", lang)} ✓
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "#E8F5EE" }}>
                  <IconPayment size={24} color="#1B7A3D" />
                </div>
              </div>
            </div>

            {selectedStore && (
              <div className="rounded-2xl p-4 md:p-5 flex items-center gap-3" style={{ background: "#fff", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#E8F5EE" }}>
                  <IconStore size={20} color="#1B7A3D" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs" style={{ color: "#8FA898" }}>{t("yourStore", lang)}</p>
                  <p className="text-sm font-semibold truncate" style={{ color: "#1A2E1E" }}>{selectedStore.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#22A357" }} />
                    <p className="text-xs" style={{ color: "#5A7263" }}>
                      {t("storeOpen", lang)}
                      {selectedStore.distanceKm != null && ` · ${selectedStore.distanceKm.toFixed(1)} km`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setStorePickerReturn("home"); setScreen("list-store"); }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0"
                  style={{ background: "#E8F5EE", color: "#1B7A3D" }}
                >
                  {t("change", lang)}
                </button>
              </div>
            )}

            <button
              onClick={() => setScreen("declare")}
              className="w-full rounded-2xl p-4 md:p-5 flex items-center gap-3 text-left transition-all hover:brightness-[0.99]"
              style={{ background: "#FEF3E0", border: "1px solid #F5D78A" }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#E9A23B", opacity: 0.85 }}>
                <IconCalendar size={20} color="#fff" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: "#1A2E1E" }}>{t("planCrop", lang)}</p>
                <p className="text-xs" style={{ color: "#8A6020" }}>{t("planCropSub", lang)}</p>
              </div>
              <span className="text-xs font-medium" style={{ color: "#E9A23B" }}>{t("declareCrop", lang)} →</span>
            </button>

            <div>
              <SectionHeader title={t("insights", lang)} />
              <div className="grid grid-cols-2 gap-3">
                <WeatherHomeCard
                  weather={weather}
                  loading={weatherLoading}
                  hasCoords={data.weatherLat != null && data.weatherLng != null}
                  village={data.village}
                  lang={lang}
                  onOpen={() => setScreen("weather")}
                />
                <div className="rounded-2xl p-4" style={{ background: "#fff", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <IconTrend size={20} color="#5A7263" />
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#FEF3E0", color: "#8A6020" }}>
                      {t("beta", lang)}
                    </span>
                  </div>
                  <p className="text-xs font-medium mb-0.5" style={{ color: "#8FA898" }}>{t("cropOutlook", lang)}</p>
                  <p className="text-sm font-semibold" style={{ color: "#1A2E1E" }}>₹18–22 /kg</p>
                  <p className="text-xs mt-0.5" style={{ color: "#8FA898" }}>
                    {lang === "en" ? "Tomatoes · Next 2 weeks" : "ಟೊಮೇಟೊ · ಮುಂದಿನ 2 ವಾರ"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const cropGrid = (selected: string | null, custom: string, onSelect: (id: string) => void, onCustom: (v: string) => void) => (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
        {CROP_OPTIONS.map(({ id, en, kn, Icon }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className="relative flex flex-col items-center gap-2 p-4 rounded-2xl transition-all active:scale-95"
            style={{
              background: selected === id ? "#E8F5EE" : "#fff",
              border: selected === id ? "2px solid #1B7A3D" : "2px solid #EEF1EE",
              boxShadow: selected === id ? "0 4px 12px rgba(27,122,61,0.15)" : "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            {selected === id && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#1B7A3D" }}>
                <IconCheck size={12} color="#fff" />
              </div>
            )}
            <Icon size={44} />
            <span className="text-xs font-medium text-center" style={{ color: selected === id ? "#1B7A3D" : "#5A7263" }}>
              {lang === "en" ? en : kn}
            </span>
          </button>
        ))}
      </div>
      {selected === "other" && (
        <input
          value={custom}
          onChange={(e) => onCustom(e.target.value)}
          placeholder={t("cropName", lang)}
          className="mt-3 w-full px-4 py-3.5 rounded-2xl text-base font-medium outline-none"
          style={{ border: "1.5px solid #DDE8E1", background: "#fff", color: "#1A2E1E" }}
        />
      )}
    </>
  );

  const listCrop = (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ScreenHeader title={t("listProduce", lang)} onBack={() => setScreen("home")} lang={lang} onLangToggle={toggleLang} />
      <ProgressSteps step={0} lang={lang} />
      <div className="farmer-scroll">
        <div className="farmer-page">
          <h3 className="text-lg md:text-xl font-semibold mb-5" style={{ color: "#1A2E1E" }}>{t("whatSelling", lang)}</h3>
          {cropGrid(cropId, customCrop, setCropId, setCustomCrop)}
        </div>
      </div>
      <div className="farmer-footer">
        <PrimaryButton
          label={t("next", lang)}
          onClick={() => setScreen("list-qty")}
          disabled={!cropId || (cropId === "other" && !customCrop.trim())}
        />
      </div>
    </div>
  );

  const listQty = (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ScreenHeader title={t("listProduce", lang)} onBack={() => setScreen("list-crop")} lang={lang} onLangToggle={toggleLang} />
      <ProgressSteps step={1} lang={lang} />

      <div className="farmer-scroll">
      <div className="farmer-page">
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="text-lg md:text-xl font-semibold mb-5" style={{ color: "#1A2E1E" }}>{t("howMuch", lang)}</h3>
          <div className="rounded-3xl p-6 flex items-center justify-between" style={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
            <button
              onClick={() => setQty(Math.max(1, qty - 5))}
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold transition-all active:scale-90"
              style={{ background: "#F0F4F1", color: "#1B7A3D", boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}
            >
              −
            </button>
            <div className="text-center">
              <span className="text-5xl font-bold" style={{ color: "#1A2E1E" }}>{qty}</span>
              <span className="text-lg font-medium ml-2" style={{ color: "#8FA898" }}>kg</span>
            </div>
            <button
              onClick={() => setQty(qty + 5)}
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold transition-all active:scale-90"
              style={{ background: "#1B7A3D", color: "#fff", boxShadow: "0 4px 12px rgba(27,122,61,0.3)" }}
            >
              +
            </button>
          </div>
        </div>

        <div className="space-y-4">
        {/* Expected price (optional) */}
        <div>
          <p className="text-sm font-medium mb-2" style={{ color: "#1A2E1E" }}>{t("expectedPriceOpt", lang)}</p>
          <input
            type="number"
            min="0"
            value={expectedPrice}
            onChange={(e) => setExpectedPrice(e.target.value)}
            placeholder="20"
            className="w-full px-4 py-3.5 rounded-2xl text-base font-medium outline-none"
            style={{ border: "1.5px solid #DDE8E1", background: "#fff", color: "#1A2E1E" }}
          />
        </div>

        {/* Drop-off store */}
        {selectedStore && (
          <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "#fff", border: "1.5px solid #EEF1EE" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#E8F5EE" }}>
              <IconStore size={20} color="#1B7A3D" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs" style={{ color: "#8FA898" }}>{t("dropOffAt", lang)}</p>
              <p className="text-sm font-semibold truncate" style={{ color: "#1A2E1E" }}>{selectedStore.name}</p>
              <p className="text-xs" style={{ color: "#5A7263" }}>
                {selectedStore.village}
                {selectedStore.distanceKm != null && ` · ${selectedStore.distanceKm.toFixed(1)} km`}
              </p>
            </div>
            <button
              onClick={() => { setStorePickerReturn("list-qty"); setScreen("list-store"); }}
              className="text-xs font-medium px-3 py-1.5 rounded-full"
              style={{ background: "#E8F5EE", color: "#1B7A3D" }}
            >
              {t("change", lang)}
            </button>
          </div>
        )}

        {/* Payment trust */}
        <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: "#E8F5EE" }}>
          <IconPayment size={20} color="#1B7A3D" />
          <div>
            <p className="text-sm font-semibold mb-0.5" style={{ color: "#1B7A3D" }}>{t("getPaidInstantly", lang)}</p>
            <p className="text-xs leading-relaxed" style={{ color: "#5A7263" }}>{t("getPaidSub", lang)}</p>
          </div>
        </div>
        </div>

        {error && (
          <p className="rounded-2xl px-4 py-3 text-sm lg:col-span-2" style={{ background: "#FDECEC", color: "#D94F4F" }}>{error}</p>
        )}
      </div>
      </div>
      </div>

      <div className="farmer-footer">
        <p className="hidden md:block mr-auto self-center text-sm" style={{ color: "#8FA898" }}>{t("trackAnytime", lang)}</p>
        <PrimaryButton
          label={pending ? "…" : t("confirmList", lang)}
          onClick={submitListing}
          disabled={pending || !selectedStore}
        />
      </div>
    </div>
  );

  const listStore = (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ScreenHeader title={t("chooseStore", lang)} onBack={() => setScreen(storePickerReturn)} lang={lang} onLangToggle={toggleLang} />

      <div className="farmer-scroll">
        <div className="farmer-page grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl overflow-hidden min-h-48 lg:min-h-[280px]" style={{ background: "#E8F5EE" }}>
        <svg viewBox="0 0 320 140" className="w-full h-full">
          <rect width="320" height="140" fill="#EEF5F0" />
          <path d="M0 70H320" stroke="#fff" strokeWidth="6" />
          <path d="M160 0V140" stroke="#fff" strokeWidth="4" />
          <path d="M0 35H160M200 100H320" stroke="#fff" strokeWidth="3" strokeDasharray="8 4" />
          <circle cx="160" cy="70" r="10" fill="#1B7A3D" />
          <circle cx="160" cy="70" r="4" fill="white" />
          <circle cx="240" cy="45" r="7" fill="#8FA898" />
          <circle cx="240" cy="45" r="3" fill="white" />
          <circle cx="85" cy="100" r="7" fill="#8FA898" />
          <circle cx="85" cy="100" r="3" fill="white" />
          <circle cx="160" cy="70" r="16" fill="none" stroke="#1B7A3D" strokeWidth="2" opacity="0.4" />
          <circle cx="160" cy="70" r="22" fill="none" stroke="#1B7A3D" strokeWidth="1" opacity="0.2" />
        </svg>
          </div>

          <div className="space-y-2">
        {data.stores.map((s) => (
          <button
            key={s.id}
            onClick={() => setStoreId(s.id)}
            className="w-full rounded-2xl p-4 flex items-center gap-3 text-left transition-all"
            style={{
              background: storeId === s.id ? "#E8F5EE" : "#fff",
              border: storeId === s.id ? "2px solid #1B7A3D" : "1.5px solid #EEF1EE",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: storeId === s.id ? "#1B7A3D" : "#F0F4F1" }}>
              <IconStore size={20} color={storeId === s.id ? "#fff" : "#8FA898"} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-semibold truncate" style={{ color: "#1A2E1E" }}>{s.name}</p>
                {s.nearest && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0" style={{ background: "#E9A23B", color: "#1A2E1E" }}>
                    {t("nearestBadge", lang)}
                  </span>
                )}
              </div>
              <p className="text-xs" style={{ color: "#5A7263" }}>{s.address ?? s.village}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#22A357" }} />
                <p className="text-xs" style={{ color: "#22A357" }}>
                  {t("open", lang)}
                  {s.distanceKm != null && ` · ${s.distanceKm.toFixed(1)} km`}
                </p>
              </div>
            </div>
            {storeId === s.id && (
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#1B7A3D" }}>
                <IconCheck size={13} color="#fff" />
              </div>
            )}
          </button>
        ))}
          </div>
        </div>
      </div>

      <div className="farmer-footer">
        <PrimaryButton label={t("useThisStore", lang)} onClick={() => setScreen(storePickerReturn)} />
      </div>
    </div>
  );

  const listSuccess = (
    <div className="farmer-scroll flex flex-col items-center justify-center px-6 text-center gap-6 py-12 md:py-20">
      <IllustrationSuccess size={96} />
      <div className="max-w-md">
        <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: "#1A2E1E" }}>{t("listed", lang)}</h2>
        <p className="text-sm md:text-base leading-relaxed" style={{ color: "#5A7263" }}>{t("dropSuccessSub", lang)}</p>
      </div>
      {lastListed && (
        <div className="w-full max-w-md rounded-2xl p-5 text-left space-y-2.5" style={{ background: "#fff", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
          {[
            { label: t("cropLabel", lang), value: `${lastListed.crop} · ${lastListed.qty} kg` },
            { label: t("storeLabel", lang), value: lastListed.store },
            { label: t("statusLabel", lang), value: STAGES[0][lang], green: true },
          ].map((r, i) => (
            <div key={i} className="flex justify-between gap-3">
              <span className="text-xs" style={{ color: "#8FA898" }}>{r.label}</span>
              <span className="text-xs font-semibold text-right" style={{ color: r.green ? "#22A357" : "#1A2E1E" }}>{r.value}</span>
            </div>
          ))}
        </div>
      )}
      <div className="w-full max-w-md flex flex-col md:flex-row gap-2 md:justify-center">
        <PrimaryButton label={t("myProduce", lang)} onClick={() => { setCropId(null); setCustomCrop(""); setQty(20); setExpectedPrice(""); goTab("my-produce"); }} />
        <SecondaryButton label={t("backHome", lang)} onClick={() => { setCropId(null); setCustomCrop(""); setQty(20); setExpectedPrice(""); goTab("home"); }} />
      </div>
    </div>
  );

  const filteredListings = data.listings.filter((l) => {
    if (filter === 1) return l.status === "submitted";
    if (filter === 2) return l.soldKg > 0;
    if (filter === 3) return l.status === "received";
    return true;
  });

  const myProduce = (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ScreenHeader title={t("myProduce", lang)} lang={lang} onLangToggle={toggleLang} />

      <div className="flex gap-2 px-5 md:px-10 py-3 flex-shrink-0 overflow-x-auto" style={{ borderBottom: "1px solid #EEF1EE", background: "#fff" }}>
        {[t("filterAll", lang), t("filterActive", lang), t("filterSold", lang), t("filterPaid", lang)].map((f, i) => (
          <button
            key={i}
            onClick={() => setFilter(i)}
            className="px-4 py-2 rounded-full text-sm font-medium flex-shrink-0 transition-all"
            style={{ background: filter === i ? "#1B7A3D" : "#F0F4F1", color: filter === i ? "#fff" : "#5A7263" }}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="farmer-scroll">
        <div className="farmer-page grid gap-3 sm:grid-cols-2">
        {filteredListings.length === 0 ? (
          <p className="py-10 text-center text-sm" style={{ color: "#8FA898" }}>{t("noListings", lang)}</p>
        ) : (
          filteredListings.map((l) => {
            const CropIcon = cropIconFor(l.crop);
            const stage = stageOf(l);
            return (
              <button
                key={l.id}
                onClick={() => { setTrackId(l.id); setScreen("track"); }}
                className="w-full rounded-2xl p-4 md:p-5 text-left transition-all hover:shadow-md"
                style={{ background: "#fff", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <CropIcon size={36} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ color: "#1A2E1E" }}>
                      {l.crop} · {l.weighedKg ?? l.declaredKg} kg
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#8FA898" }}>{formatDate(l.createdAt, lang)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StageBadge stage={stage} lang={lang} />
                    <span className="text-sm font-semibold" style={{ color: "#1A2E1E" }}>
                      {l.paidAmount != null ? inr(l.paidAmount) : "—"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  {STAGES.map((_, i) => (
                    <div key={i} className="flex-1 h-1 rounded-full" style={{ background: i <= stage ? STAGES[stage].color : "#EEF1EE" }} />
                  ))}
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs" style={{ color: "#8FA898" }}>{STAGES[0][lang]}</span>
                  <span className="text-xs" style={{ color: "#8FA898" }}>{STAGES[3][lang]}</span>
                </div>
              </button>
            );
          })
        )}
        </div>
      </div>
    </div>
  );

  const trackSteps = trackListing
    ? [
        {
          Icon: IconCheck,
          done: true,
          time: formatDate(trackListing.createdAt, lang),
          desc: lang === "en"
            ? `Listed to ${trackListing.storeName}.`
            : `${trackListing.storeName} ಗೆ ಪಟ್ಟಿ ಮಾಡಲಾಗಿದೆ.`,
        },
        {
          Icon: IconQuality,
          done: !!trackListing.grade,
          time: formatDate(trackListing.paidAt, lang),
          desc: trackListing.grade
            ? lang === "en"
              ? `Graded ${trackListing.grade} at the White Store.`
              : `ವೈಟ್ ಸ್ಟೋರ್‌ನಲ್ಲಿ ಗ್ರೇಡ್ ${trackListing.grade}.`
            : lang === "en"
              ? "Bring your produce to the store for weighing."
              : "ತೂಕಕ್ಕಾಗಿ ಉತ್ಪನ್ನವನ್ನು ಸ್ಟೋರ್‌ಗೆ ತನ್ನಿ.",
        },
        {
          Icon: IconPayment,
          done: trackListing.paidAmount != null,
          time: formatDate(trackListing.paidAt, lang),
          desc: trackListing.paidAmount != null
            ? lang === "en"
              ? `${inr(trackListing.paidAmount)} paid instantly at the counter.`
              : `${inr(trackListing.paidAmount)} ತಕ್ಷಣ ಪಾವತಿಸಲಾಗಿದೆ.`
            : "",
        },
        {
          Icon: IconSold,
          done: trackListing.soldKg > 0,
          time: "",
          desc: trackListing.soldKg > 0
            ? lang === "en"
              ? `${trackListing.soldKg} kg bought by buyers.`
              : `${trackListing.soldKg} ಕೆಜಿ ಖರೀದಿದಾರರು ಖರೀದಿಸಿದ್ದಾರೆ.`
            : "",
        },
      ]
    : [];

  const track = trackListing && (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ScreenHeader title={t("trackProduce", lang)} onBack={() => setScreen("my-produce")} lang={lang} onLangToggle={toggleLang} />

      <div className="farmer-scroll">
        <div className="farmer-page grid gap-8 lg:grid-cols-2 lg:items-start">
        <div className="rounded-2xl p-4 flex items-center gap-4 mb-6" style={{ background: "#fff", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
          <CropMark crop={trackListing.crop} />
          <div className="flex-1 min-w-0">
            <p className="font-bold" style={{ color: "#1A2E1E" }}>
              {trackListing.crop} · {trackListing.weighedKg ?? trackListing.declaredKg} kg
            </p>
            <p className="text-sm truncate" style={{ color: "#5A7263" }}>{trackListing.storeName}</p>
            {trackListing.paidAmount != null && (
              <p className="text-lg font-bold mt-1" style={{ color: "#22A357" }}>
                {inr(trackListing.paidAmount)} {lang === "en" ? "received" : "ಸ್ವೀಕರಿಸಲಾಗಿದೆ"}
              </p>
            )}
          </div>
          {trackListing.batchCode && (
            <Link
              href={`/trace/${trackListing.batchCode}`}
              className="px-3 py-2 rounded-xl text-xs font-semibold flex-shrink-0 text-center"
              style={{ background: "#E8F5EE", color: "#1B7A3D" }}
            >
              {t("viewBatchQr", lang)}
            </Link>
          )}
        </div>

        <div>
          {trackSteps.map((step, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                  style={{
                    background: step.done ? "#1B7A3D" : "#EEF1EE",
                    boxShadow: step.done ? "0 2px 8px rgba(27,122,61,0.2)" : "none",
                  }}
                >
                  <step.Icon size={17} color={step.done ? "#fff" : "#8FA898"} />
                </div>
                {i < trackSteps.length - 1 && (
                  <div className="w-px flex-1 my-1" style={{ background: trackSteps[i + 1].done ? "#1B7A3D" : "#EEF1EE", minHeight: 36 }} />
                )}
              </div>
              <div className="flex-1 pb-6">
                <p className="text-sm font-semibold" style={{ color: step.done ? "#1A2E1E" : "#8FA898" }}>
                  {STAGES[i][lang]}
                </p>
                {step.done && step.time && (
                  <p className="text-xs mt-0.5" style={{ color: "#8FA898" }}>{step.time}</p>
                )}
                {step.desc && (
                  <p className="text-xs mt-1" style={{ color: "#5A7263" }}>{step.desc}</p>
                )}
                {i === 2 && step.done && trackListing.paidAmount != null && (
                  <div className="mt-2 px-3 py-2 rounded-xl inline-flex items-center gap-2" style={{ background: "#E8F5EE" }}>
                    <IconPayment size={16} color="#1B7A3D" />
                    <span className="text-xs font-semibold" style={{ color: "#1B7A3D" }}>
                      {inr(trackListing.paidAmount)} → {lang === "en" ? "paid at the counter" : "ಕೌಂಟರ್‌ನಲ್ಲಿ ಪಾವತಿ"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );

  const declare = (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ScreenHeader title={t("declareCrop", lang)} onBack={() => setScreen("home")} lang={lang} onLangToggle={toggleLang} />

      <div className="farmer-scroll">
        <div className="farmer-page grid gap-8 lg:grid-cols-2 lg:items-start">
        <div>
          <h3 className="text-lg md:text-xl font-semibold mb-1" style={{ color: "#1A2E1E" }}>{t("planningGrow", lang)}</h3>
          <p className="text-xs mb-4" style={{ color: "#8FA898" }}>{t("demandInfo", lang)}</p>
          {cropGrid(declCropId, declCustomCrop, setDeclCropId, setDeclCustomCrop)}
        </div>

        <div className="space-y-6">
        <div>
          <p className="text-sm font-medium mb-3" style={{ color: "#1A2E1E" }}>{t("approxQty", lang)}</p>
          <div className="rounded-2xl p-5 flex items-center justify-between" style={{ background: "#fff", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
            <button
              onClick={() => setDeclQty(Math.max(50, declQty - 50))}
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold"
              style={{ background: "#F0F4F1", color: "#1B7A3D" }}
            >
              −
            </button>
            <div>
              <span className="text-4xl font-bold" style={{ color: "#1A2E1E" }}>{declQty}</span>
              <span className="text-base ml-1" style={{ color: "#8FA898" }}>kg</span>
            </div>
            <button
              onClick={() => setDeclQty(declQty + 50)}
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold"
              style={{ background: "#1B7A3D", color: "#fff" }}
            >
              +
            </button>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-3" style={{ color: "#1A2E1E" }}>{t("expectedHarvest", lang)}</p>
          <div className="grid grid-cols-4 gap-2">
            {MONTHS.map((m) => (
              <button
                key={m}
                onClick={() => setDeclMonth(m)}
                className="py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: declMonth === m ? "#1B7A3D" : "#fff",
                  color: declMonth === m ? "#fff" : "#5A7263",
                  border: declMonth === m ? "2px solid #1B7A3D" : "2px solid #EEF1EE",
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {data.declarations.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-3" style={{ color: "#1A2E1E" }}>{t("myCropPlans", lang)}</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
              {data.declarations.map((d, i) => {
                const CropIcon = cropIconFor(d.crop);
                return (
                  <div key={d.id} className="flex items-center gap-3 px-4 py-3" style={{ borderTop: i > 0 ? "1px solid #F7F8F5" : "none" }}>
                    <CropIcon size={28} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: "#1A2E1E" }}>{d.crop}</p>
                      <p className="text-xs" style={{ color: "#8FA898" }}>{d.season}</p>
                    </div>
                    {d.qty != null && (
                      <span className="text-sm font-semibold" style={{ color: "#5A7263" }}>{d.qty} kg</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {error && (
          <p className="rounded-2xl px-4 py-3 text-sm" style={{ background: "#FDECEC", color: "#D94F4F" }}>{error}</p>
        )}
        </div>
        </div>
      </div>

      <div className="farmer-footer">
        <PrimaryButton
          label={pending ? "…" : t("saveCropPlan", lang)}
          amber
          onClick={submitDeclaration}
          disabled={pending || !declCropId || (declCropId === "other" && !declCustomCrop.trim())}
        />
      </div>
    </div>
  );

  const declareDone = (
    <div className="farmer-scroll flex flex-col items-center justify-center px-6 text-center gap-6 py-16">
      <IllustrationSuccess size={88} />
      <div className="max-w-md">
        <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: "#1A2E1E" }}>{t("planSaved", lang)}</h2>
        <p className="text-sm md:text-base leading-relaxed" style={{ color: "#5A7263" }}>{t("planSavedSub", lang)}</p>
      </div>
      <div className="w-full max-w-sm flex justify-center">
        <PrimaryButton label={t("backHome", lang)} onClick={() => { setDeclCropId(null); setDeclCustomCrop(""); goTab("home"); }} />
      </div>
    </div>
  );

  const profile = (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ScreenHeader title={t("profileLabel", lang)} lang={lang} onLangToggle={toggleLang} />

      <div className="farmer-scroll">
        <div className="farmer-page">
        <div className="rounded-2xl p-5 md:p-6 flex items-center gap-4 mb-6" style={{ background: "#fff", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0" style={{ background: "#1B7A3D", color: "#fff" }}>
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold truncate" style={{ color: "#1A2E1E" }}>{data.name}</p>
            {data.phone && <p className="text-sm" style={{ color: "#5A7263" }}>{data.phone}</p>}
            {data.village && <p className="text-xs mt-0.5" style={{ color: "#8FA898" }}>{data.village}</p>}
          </div>
          <div className="ml-auto px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0" style={{ background: "#E8F5EE", color: "#1B7A3D" }}>
            {t("verified", lang)}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {selectedStore && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#8FA898" }}>
                {t("yourStore", lang)}
              </p>
              <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "#fff", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#E8F5EE" }}>
                  <IconStore size={20} color="#1B7A3D" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "#1A2E1E" }}>{selectedStore.name}</p>
                  <p className="text-xs" style={{ color: "#5A7263" }}>
                    {selectedStore.village}
                    {selectedStore.distanceKm != null && ` · ${selectedStore.distanceKm.toFixed(1)} km`}
                  </p>
                </div>
                <button
                  onClick={() => { setStorePickerReturn("profile"); setScreen("list-store"); }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0"
                  style={{ background: "#E8F5EE", color: "#1B7A3D" }}
                >
                  {t("change", lang)}
                </button>
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#8FA898" }}>
              {t("activity", lang)}
            </p>
            <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
              <button
                onClick={() => { setFilter(3); goTab("my-produce"); }}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all active:bg-gray-50"
              >
                <IconHistory size={20} color="#5A7263" />
                <span className="flex-1 text-sm font-medium" style={{ color: "#1A2E1E" }}>{t("paymentHistory", lang)}</span>
                <IconChevronRight size={16} color="#DDE8E1" />
              </button>
              <button
                onClick={() => setScreen("declare")}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all active:bg-gray-50"
                style={{ borderTop: "1px solid #F7F8F5" }}
              >
                <IconCalendar size={20} color="#5A7263" />
                <span className="flex-1 text-sm font-medium" style={{ color: "#1A2E1E" }}>{t("cropDeclarations", lang)}</span>
                <IconChevronRight size={16} color="#DDE8E1" />
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#8FA898" }}>
              {t("settings", lang)}
            </p>
            <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
              <button
                onClick={toggleLang}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all active:bg-gray-50"
              >
                <IconGlobe size={20} color="#5A7263" />
                <span className="flex-1 text-sm font-medium" style={{ color: "#1A2E1E" }}>{t("language", lang)}</span>
                <span className="text-sm" style={{ color: "#8FA898" }}>{lang === "en" ? "English" : "ಕನ್ನಡ"}</span>
              </button>
              <button
                onClick={() => startTransition(async () => { await signOut(); })}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all active:bg-gray-50"
                style={{ borderTop: "1px solid #F7F8F5" }}
              >
                <IconLogout size={20} color="#D94F4F" />
                <span className="flex-1 text-sm font-medium" style={{ color: "#D94F4F" }}>{t("logout", lang)}</span>
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );

  let screenNode: React.ReactNode = home;
  if (screen === "list-crop") screenNode = listCrop;
  else if (screen === "list-qty") screenNode = listQty;
  else if (screen === "list-store") screenNode = listStore;
  else if (screen === "list-success") screenNode = listSuccess;
  else if (screen === "my-produce") screenNode = myProduce;
  else if (screen === "track") screenNode = track ?? myProduce;
  else if (screen === "declare") screenNode = declare;
  else if (screen === "declare-done") screenNode = declareDone;
  else if (screen === "weather") {
    screenNode = (
      <WeatherScreen
        weather={weather}
        loading={weatherLoading}
        village={data.village}
        lang={lang}
        onBack={() => setScreen("home")}
        onLangToggle={toggleLang}
      />
    );
  }
  else if (screen === "profile") screenNode = profile;

  return (
    <div
      className="h-dvh flex"
      style={{
        background: "#F7F8F5",
        color: "#1A2E1E",
        fontFamily: lang === "kn"
          ? "var(--font-kannada), var(--font-poppins), sans-serif"
          : "var(--font-poppins), sans-serif",
      }}
    >
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col w-72 flex-shrink-0 h-full" style={{ background: "#fff", borderRight: "1px solid #EEF1EE" }}>
        <div className="px-6 py-6 flex-shrink-0" style={{ borderBottom: "1px solid #EEF1EE" }}>
          <div className="flex items-center gap-3">
            <AppLogo />
            <p className="text-xs font-medium" style={{ color: "#8FA898" }}>{lang === "kn" ? t("appName", lang) : "Farmer"}</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ id, Icon, label }) => {
            const active = isActive(id);
            return (
            <button
                key={id}
                onClick={() => goTab(id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left"
                style={{ background: active ? "#E8F5EE" : "transparent", color: active ? "#1B7A3D" : "#5A7263" }}
              >
                <Icon size={20} color={active ? "#1B7A3D" : "#8FA898"} />
                {label}
                {id === "list-crop" && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "#E9A23B" }} />}
              </button>
            );
          })}
        </nav>
        <div className="px-4 py-4 flex-shrink-0 space-y-3" style={{ borderTop: "1px solid #EEF1EE" }}>
          <LangToggle lang={lang} onToggle={toggleLang} />
          <div className="flex items-center gap-3 px-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: "#1B7A3D", color: "#fff" }}>
              {initial}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: "#1A2E1E" }}>{data.name}</p>
              {data.phone && <p className="text-xs" style={{ color: "#8FA898" }}>{data.phone}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 flex flex-col overflow-hidden">
          {screenNode}
        </div>

        {/* Mobile bottom nav */}
        <div
          className="md:hidden flex-shrink-0 flex items-end pt-1"
          style={{ background: "#fff", borderTop: "1px solid #EEF1EE", paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {navItems.map(({ id, Icon, label, primary }) =>
            primary ? (
              <button key={id} onClick={() => goTab(id)} className="flex-1 flex flex-col items-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center -mt-6 mb-0.5 transition-all active:scale-95"
                  style={{ background: "#1B7A3D", boxShadow: "0 4px 16px rgba(27,122,61,0.35)" }}
                >
                  <Icon size={24} color="#fff" />
                </div>
                <span className="pb-1" style={{ color: isActive(id) ? "#1B7A3D" : "#8FA898", fontWeight: isActive(id) ? 600 : 400, fontSize: 10 }}>
                  {label}
                </span>
              </button>
            ) : (
              <button key={id} onClick={() => goTab(id)} className="flex-1 flex flex-col items-center pt-2 pb-1 gap-1">
                <Icon size={22} color={isActive(id) ? "#1B7A3D" : "#B0BEC5"} />
                <span style={{ color: isActive(id) ? "#1B7A3D" : "#8FA898", fontWeight: isActive(id) ? 600 : 400, fontSize: 10 }}>
                  {label}
                </span>
                {isActive(id) && <div className="w-4 h-0.5 rounded-full" style={{ background: "#1B7A3D" }} />}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
