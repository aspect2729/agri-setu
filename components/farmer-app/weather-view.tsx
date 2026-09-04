"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { geocodeAndSaveFarm, saveFarmLocation } from "@/lib/actions";
import type { FarmWeather, RiskLevel } from "@/lib/weather";
import { t, type Lang } from "./translations";
import {
  IconArrowLeft, IconCloud, IconGlobe, IconRain, IconStorm, IconSun, IconWeather,
} from "./icons";

const RISK_COLOR: Record<RiskLevel, string> = {
  LOW: "#22A357",
  MODERATE: "#E9A23B",
  HIGH: "#D94F4F",
};

const RISK_BG: Record<RiskLevel, string> = {
  LOW: "#E8F5EE",
  MODERATE: "#FEF3E0",
  HIGH: "#FDECEC",
};

function WeatherGlyph({ code, size = 22, color = "#5A7263" }: { code: number; size?: number; color?: string }) {
  if (code === 0) return <IconSun size={size} color={color} />;
  if (code >= 95) return <IconStorm size={size} color={color} />;
  if (code >= 51) return <IconRain size={size} color={color} />;
  if (code <= 3) return <IconSun size={size} color={color} />;
  return <IconCloud size={size} color={color} />;
}

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

function weekday(iso: string, lang: Lang): string {
  return new Date(`${iso}T12:00:00+05:30`).toLocaleDateString(lang === "kn" ? "kn-IN" : "en-IN", {
    weekday: "short",
    timeZone: "Asia/Kolkata",
  });
}

function LocationPicker({ lang }: { lang: Lang }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [gpsPending, setGpsPending] = useState(false);

  function useGps() {
    if (!navigator.geolocation) {
      setError("GPS is not available on this device.");
      return;
    }
    setError(null);
    setGpsPending(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        startTransition(async () => {
          const res = await saveFarmLocation(pos.coords.latitude, pos.coords.longitude);
          setGpsPending(false);
          if (res.error) setError(res.error);
          else router.refresh();
        });
      },
      (err) => {
        setGpsPending(false);
        setError(err.message || "Could not read GPS. Try a village name instead.");
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 30_000 }
    );
  }

  function submitPlace() {
    if (!query.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await geocodeAndSaveFarm(query);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  const busy = pending || gpsPending;

  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ background: "#fff", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
      <p className="text-sm font-semibold" style={{ color: "#1A2E1E" }}>{t("setFarmLocation", lang)}</p>
      <p className="text-xs" style={{ color: "#8FA898" }}>{t("setLocationSub", lang)}</p>
      <button
        type="button"
        onClick={useGps}
        disabled={busy}
        className="w-full py-3 rounded-2xl text-sm font-semibold"
        style={{ background: "#1B7A3D", color: "#fff", opacity: busy ? 0.7 : 1 }}
      >
        {gpsPending ? t("locating", lang) : t("useGps", lang)}
      </button>
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submitPlace(); }}
          placeholder={t("villageOrPin", lang)}
          className="flex-1 rounded-xl px-3 py-2.5 text-sm outline-none"
          style={{ background: "#F7F8F5", color: "#1A2E1E", border: "1px solid #EEF1EE" }}
        />
        <button
          type="button"
          onClick={submitPlace}
          disabled={busy || !query.trim()}
          className="px-3 rounded-xl text-xs font-semibold"
          style={{ background: "#E8F5EE", color: "#1B7A3D" }}
        >
          {t("findPlace", lang)}
        </button>
      </div>
      {error && <p className="text-xs" style={{ color: "#D94F4F" }}>{error}</p>}
    </div>
  );
}

export function WeatherHomeCard({
  weather,
  loading,
  hasCoords,
  village,
  lang,
  onOpen,
}: {
  weather: FarmWeather | null;
  loading?: boolean;
  hasCoords?: boolean;
  village: string | null;
  lang: Lang;
  onOpen: () => void;
}) {
  const val = loading
    ? t("weatherLoading", lang)
    : weather
      ? `${weather.currentTemp}°C · ${weather.currentLabel[lang]}`
      : hasCoords
        ? t("weatherUnavailable", lang)
        : t("setFarmLocation", lang);
  const sub = weather
    ? `${weather.placeLabel || village || ""} · ${weather.risk.level}`
    : village ?? "";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="rounded-2xl p-4 text-left transition-all active:scale-[0.99]"
      style={{ background: "#fff", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
    >
      <div className="flex items-center justify-between mb-3">
        {weather ? (
          <WeatherGlyph code={weather.currentCode} size={20} color="#5A7263" />
        ) : (
          <IconWeather size={20} color="#5A7263" />
        )}
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={
            weather
              ? { background: RISK_BG[weather.risk.level], color: RISK_COLOR[weather.risk.level] }
              : { background: "#FEF3E0", color: "#8A6020" }
          }
        >
          {weather ? weather.risk.level : t("weatherLive", lang)}
        </span>
      </div>
      <p className="text-xs font-medium mb-0.5" style={{ color: "#8FA898" }}>{t("weather", lang)}</p>
      <p className="text-sm font-semibold" style={{ color: "#1A2E1E" }}>{val}</p>
      <p className="text-xs mt-0.5" style={{ color: "#8FA898" }}>{sub}</p>
    </button>
  );
}

export function WeatherScreen({
  weather,
  loading,
  village,
  lang,
  onBack,
  onLangToggle,
}: {
  weather: FarmWeather | null;
  loading?: boolean;
  village: string | null;
  lang: Lang;
  onBack: () => void;
  onLangToggle: () => void;
}) {
  return (
    <div className="farmer-scroll">
      <div
        className="farmer-header"
        style={{ borderBottom: "1px solid #EEF1EE", background: "#fff" }}
      >
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-95"
          style={{ background: "#F0F4F1" }}
        >
          <IconArrowLeft size={20} color="#1A2E1E" />
        </button>
        <h2 className="flex-1 text-base font-semibold md:text-xl" style={{ color: "#1A2E1E" }}>
          {weather ? `${weather.season} ${t("weatherRisk", lang)}` : t("weather", lang)}
        </h2>
        <div className="md:hidden">
          <LangToggle lang={lang} onToggle={onLangToggle} />
        </div>
      </div>

      <div className="farmer-page space-y-4">
        {loading && !weather ? (
          <div className="rounded-2xl p-5" style={{ background: "#fff", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
            <p className="text-sm font-medium" style={{ color: "#5A7263" }}>
              {t("weatherFetching", lang)}
            </p>
          </div>
        ) : weather ? (
          <>
            <div className="rounded-2xl p-5" style={{ background: "#fff", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium" style={{ color: "#8FA898" }}>
                    {weather.placeLabel || village || ""}
                  </p>
                  <p className="text-3xl font-bold mt-1" style={{ color: "#1A2E1E" }}>
                    {weather.currentTemp}°C
                  </p>
                  <p className="text-sm mt-0.5" style={{ color: "#5A7263" }}>
                    {weather.currentLabel[lang]}
                    {weather.humidity != null ? ` · ${t("humidity", lang)} ${Math.round(weather.humidity)}%` : ""}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#E8F5EE" }}>
                  <WeatherGlyph code={weather.currentCode} size={28} color="#1B7A3D" />
                </div>
              </div>
            </div>

            <div
              className="rounded-2xl p-4"
              style={{ background: RISK_BG[weather.risk.level], border: `1px solid ${RISK_COLOR[weather.risk.level]}22` }}
            >
              <p className="text-xs font-bold tracking-wide" style={{ color: RISK_COLOR[weather.risk.level] }}>
                {weather.risk.level}
              </p>
              <p className="text-sm font-medium mt-1" style={{ color: "#1A2E1E" }}>
                {weather.risk.message[lang]}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs" style={{ color: "#5A7263" }}>
                <div>
                  <p>{t("rainNext3", lang)}</p>
                  <p className="text-sm font-semibold" style={{ color: "#1A2E1E" }}>
                    {Math.round(weather.rainNext3DaysMm)} mm
                  </p>
                </div>
                {weather.avgSeasonalRainfallMm != null && (
                  <div>
                    <p>{t("typicalSeasonRain", lang)}</p>
                    <p className="text-sm font-semibold" style={{ color: "#1A2E1E" }}>
                      {weather.avgSeasonalRainfallMm} mm · {weather.season}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold mb-2" style={{ color: "#1A2E1E" }}>{t("farmActions", lang)}</p>
              <div className="space-y-2">
                {weather.risk.actions.map((a) => (
                  <div key={a.en} className="rounded-2xl px-4 py-3 text-sm" style={{ background: "#fff", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", color: "#1A2E1E" }}>
                    {a[lang]}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold mb-2" style={{ color: "#1A2E1E" }}>{t("sevenDay", lang)}</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {weather.days.map((d) => (
                  <div
                    key={d.date}
                    className="flex-shrink-0 w-[4.6rem] rounded-2xl p-3 text-center"
                    style={{ background: "#fff", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
                  >
                    <p className="text-[11px] font-medium" style={{ color: "#8FA898" }}>{weekday(d.date, lang)}</p>
                    <div className="flex justify-center my-2">
                      <WeatherGlyph code={d.weatherCode} size={20} color="#1B7A3D" />
                    </div>
                    <p className="text-xs font-semibold" style={{ color: "#1A2E1E" }}>
                      {Math.round(d.tempMax)}° / {Math.round(d.tempMin)}°
                    </p>
                    <p className="text-[11px] mt-1" style={{ color: d.rainMm >= 5 ? "#1B7A3D" : "#8FA898" }}>
                      {Math.round(d.rainMm)} mm
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-center" style={{ color: "#8FA898" }}>
              {t("weatherSource", lang)}
            </p>

            <LocationPicker lang={lang} />
          </>
        ) : (
          <>
            <p className="text-sm" style={{ color: "#5A7263" }}>{t("weatherUnavailable", lang)}</p>
            <LocationPicker lang={lang} />
          </>
        )}
      </div>
    </div>
  );
}
