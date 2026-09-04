"use client";

import { useEffect, useMemo, useState } from "react";
import { DemoBadge } from "@/components/demo-badge";
import { getMarketPrices } from "@/mock-data";
import type { MarketPrice } from "@/mock-data";
import { t, type Lang } from "./translations";
import { IconArrowLeft, IconGlobe, IconTrend } from "./icons";
import { inr, latestRows, MANDI_CROPS, STORE_RS_PER_KG } from "@/components/market-prices/shared";

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

export function MandiHomeCard({
  lang,
  onOpen,
}: {
  lang: Lang;
  onOpen: () => void;
}) {
  const [modal, setModal] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMarketPrices("Tomato").then((res) => {
      if (cancelled || !res.ok) return;
      const kr = latestRows(res.data).find((p) => p.market === "K.R. Market");
      if (kr) setModal(kr.modalPrice);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const perKg = modal != null ? Math.round(modal / 100) : null;
  const storeKg = STORE_RS_PER_KG.Tomato;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="rounded-2xl p-4 text-left w-full transition-all hover:brightness-[0.99]"
      style={{ background: "#fff", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <IconTrend size={20} color="#1B7A3D" />
        <DemoBadge label={t("demoMandi", lang)} className="scale-90 origin-right" />
      </div>
      <p className="text-xs font-medium mb-0.5" style={{ color: "#8FA898" }}>{t("mandiPrices", lang)}</p>
      <p className="text-sm font-semibold" style={{ color: "#1A2E1E" }}>
        {perKg != null ? `₹${perKg}/kg` : "…"}
      </p>
      <p className="text-xs mt-0.5" style={{ color: "#8FA898" }}>
        {lang === "en" ? `Tomatoes · store pays ₹${storeKg}/kg` : `ಟೊಮೇಟೊ · ಸ್ಟೋರ್ ₹${storeKg}/ಕೆಜಿ`}
      </p>
    </button>
  );
}

export function MandiPricesScreen({
  lang,
  onBack,
  onLangToggle,
}: {
  lang: Lang;
  onBack: () => void;
  onLangToggle: () => void;
}) {
  const [crop, setCrop] = useState("Tomato");
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMarketPrices(crop).then((res) => {
      if (cancelled) return;
      if (!res.ok) {
        setError(res.error);
        setPrices([]);
        return;
      }
      setError(null);
      setPrices(res.data);
    });
    return () => {
      cancelled = true;
    };
  }, [crop]);

  const today = useMemo(() => latestRows(prices), [prices]);
  const storeKg = STORE_RS_PER_KG[crop];

  return (
    <div className="farmer-scroll">
      <div
        className="farmer-header"
        style={{ borderBottom: "1px solid #EEF1EE", background: "#fff" }}
      >
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-95"
          style={{ background: "#F0F4F1" }}
        >
          <IconArrowLeft size={20} color="#1A2E1E" />
        </button>
        <h2 className="flex-1 text-base font-semibold md:text-xl" style={{ color: "#1A2E1E" }}>
          {t("mandiPrices", lang)}
        </h2>
        <div className="md:hidden">
          <LangToggle lang={lang} onToggle={onLangToggle} />
        </div>
      </div>
        <div className="farmer-page">
        <div className="flex items-center gap-2 mb-1">
          <DemoBadge label={t("demoMandi", lang)} />
        </div>
        <p className="text-sm mb-5" style={{ color: "#8FA898" }}>{t("mandiPricesSub", lang)}</p>

        <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1">
          {MANDI_CROPS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCrop(c)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap"
              style={{
                background: crop === c ? "#1B7A3D" : "#fff",
                color: crop === c ? "#fff" : "#5A7263",
                border: crop === c ? "none" : "1px solid #EEF1EE",
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {storeKg != null && (
          <div className="rounded-2xl p-4 mb-4" style={{ background: "#E8F5EE" }}>
            <p className="text-xs font-medium" style={{ color: "#5A7263" }}>{t("whiteStorePays", lang)}</p>
            <p className="text-2xl font-bold mt-0.5" style={{ color: "#1B7A3D" }}>₹{storeKg}/kg</p>
            <p className="text-xs mt-1" style={{ color: "#5A7263" }}>{crop} · Grade A · {t("instantPay", lang)}</p>
          </div>
        )}

        {error && <p className="text-sm mb-3" style={{ color: "#D94F4F" }}>{error}</p>}

        <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
          {today.map((row, i) => (
            <div
              key={row.market}
              className="flex items-start justify-between gap-3 px-4 py-3.5"
              style={{ borderTop: i > 0 ? "1px solid #F7F8F5" : "none" }}
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold">{row.market}</p>
                <p className="text-xs mt-0.5" style={{ color: "#8FA898" }}>{row.location}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold">{inr(Math.round(row.modalPrice / 100))}/kg</p>
                <p className="text-xs mt-0.5" style={{ color: "#8FA898" }}>
                  {inr(row.minPrice)}–{inr(row.maxPrice)} /q
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
