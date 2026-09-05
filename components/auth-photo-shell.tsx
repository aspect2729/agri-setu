"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { IconArrowLeft, IconGlobe } from "@/components/farmer-app/icons";
import type { Lang } from "@/components/farmer-app/translations";

const GRADIENT =
  "linear-gradient(to bottom, rgba(10,30,15,0.22) 0%, rgba(10,30,15,0.12) 32%, rgba(10,30,15,0.7) 62%, rgba(10,30,15,0.94) 100%)";

export function AuthPhotoShell({
  children,
  lang,
  onLangToggle,
  backHref,
  pin = "absolute",
}: {
  children: ReactNode;
  lang: Lang;
  onLangToggle: () => void;
  backHref?: string;
  pin?: "absolute" | "fixed";
}) {
  return (
    <div
      className={`relative min-h-dvh bg-[#0a1e0f] ${pin === "absolute" ? "overflow-hidden" : ""}`}
      style={{
        fontFamily:
          lang === "kn"
            ? "var(--font-kannada), var(--font-poppins), sans-serif"
            : "var(--font-poppins), sans-serif",
      }}
    >
      <div className={`pointer-events-none inset-0 ${pin === "fixed" ? "fixed" : "absolute"}`}>
        <Image
          src="/farmer-fields.jpg"
          alt="Farmer overlooking green fields at sunrise"
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: "42% 38%" }}
        />
        <div className="absolute inset-0" style={{ background: GRADIENT }} />
      </div>

      <div className="relative z-10 flex min-h-dvh flex-col">
        <div className="flex items-center justify-between px-6 pt-6">
          {backHref ? (
            <Link
              href={backHref}
              className="flex h-10 w-10 items-center justify-center rounded-xl transition-all active:scale-95"
              style={{ background: "rgba(255,255,255,0.15)" }}
              aria-label="Back"
            >
              <IconArrowLeft size={20} color="#fff" />
            </Link>
          ) : (
            <Link
              href="/"
              className="overflow-hidden rounded-2xl bg-white shadow-sm"
              aria-label="Agri Setu home"
            >
              <BrandLogo size={44} priority />
            </Link>
          )}
          <button
            type="button"
            onClick={onLangToggle}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white"
            style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)" }}
          >
            <IconGlobe size={13} color="#fff" />
            {lang === "en" ? "ಕನ್ನಡ" : "English"}
          </button>
        </div>

        <div className="mx-auto mt-auto flex w-full max-w-md flex-col gap-5 px-5 pb-8 pt-10 md:max-w-lg">
          {children}
        </div>
      </div>
    </div>
  );
}

export const frostField: CSSProperties = {
  background: "rgba(255,255,255,0.12)",
  backdropFilter: "blur(16px)",
  border: "1.5px solid rgba(255,255,255,0.2)",
};

export const frostInputClass =
  "auth-frost-input w-full rounded-2xl bg-transparent px-4 py-3.5 text-base font-medium text-white outline-none placeholder:text-white/40";

export const frostCtaStyle: CSSProperties = {
  background: "#1B7A3D",
  color: "#fff",
  boxShadow: "0 6px 20px rgba(27,122,61,0.45)",
};
